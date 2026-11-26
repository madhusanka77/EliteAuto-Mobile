import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, LayoutAnimation, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import * as Speech from 'expo-speech';

export default function AIChatScreen() {
  const initialMessage = { id: '1', text: 'Hello! I am EliteAuto AI. I can check our premium inventory, predict prices, and help you find the best deal. What are you looking for today?', sender: 'ai' };

  const [messages, setMessages] = useState<any[]>([initialMessage]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<any>(null);
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const isPreparingRef = useRef(false); 
  const [isRecording, setIsRecording] = useState(false);
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);

  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    })();
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const handleSpeak = (text: string, messageId: string) => {
    Speech.stop(); 
    if (isSpeaking === messageId) {
      setIsSpeaking(null);
      return;
    }
    setIsSpeaking(messageId);
    Speech.speak(text, {
      language: 'en-US', 
      rate: 0.9,         
      pitch: 1.0,        
      onDone: () => setIsSpeaking(null), 
      onStopped: () => setIsSpeaking(null),
    });
  };

  const deleteMessage = (idToDelete: string) => {
    Speech.stop();
    setIsSpeaking(null);
    setPlayingId(null);
    if (sound) sound.unloadAsync();

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages(prev => prev.filter(msg => msg.id !== idToDelete && msg.linkedId !== idToDelete));
    setActiveMessageId(null); 
  };

  const clearChat = () => {
    Speech.stop();
    setIsSpeaking(null);
    setPlayingId(null);
    if (sound) sound.unloadAsync();

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages([initialMessage]); 
    setActiveMessageId(null);
    setInputText('');
    setAttachedFile(null);
  };

  const startRecording = async () => {
    if (isPreparingRef.current || recordingRef.current) return; 
    try {
      isPreparingRef.current = true; 
      const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = newRecording;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    } finally {
      isPreparingRef.current = false; 
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;
    setIsRecording(false);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      
      if (uri) {
        const userMsgId = Date.now().toString(); 
        setMessages(prev => [...prev, { id: userMsgId, text: "🎤 Voice Message", sender: 'user', audioUri: uri }]);
        const fileBase64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        sendDataToBackend("Voice Message", fileBase64, "audio.m4a", "audio/m4a", userMsgId); 
      }
    } catch (error) {
      console.log("Stop Recording Safety Catch:", error);
      recordingRef.current = null;
    }
  };

  const playAudio = async (uri: string, messageId: string) => {
    if (sound) { await sound.unloadAsync(); }
    if (playingId === messageId) {
      setPlayingId(null);
      setSound(null);
      return;
    }
    const { sound: newSound } = await Audio.Sound.createAsync({ uri });
    setSound(newSound);
    setPlayingId(messageId);
    await newSound.playAsync();
    newSound.setOnPlaybackStatusUpdate((status: any) => {
      if (status.isLoaded && status.didJustFinish) {
        setPlayingId(null);
        newSound.unloadAsync();
      }
    });
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: '*/*' });
      if (!result.canceled) { setAttachedFile(result.assets[0]); }
    } catch (err) { console.error("Error picking file", err); }
  };

  const sendMessage = async () => {
    if (inputText.trim() === '' && !attachedFile) return;
    const userText = inputText || "📎 Sent a file";
    const currentFile = attachedFile;
    const userMsgId = Date.now().toString(); 

    setInputText(''); 
    setAttachedFile(null); 
    setMessages(prev => [...prev, { id: userMsgId, text: userText, sender: 'user' }]);
    
    let fileBase64 = null;
    let mimeType = null;
    if (currentFile) {
      fileBase64 = await FileSystem.readAsStringAsync(currentFile.uri, { encoding: 'base64' });
      mimeType = currentFile.mimeType;
    }
    sendDataToBackend(userText, fileBase64, currentFile ? currentFile.name : null, mimeType, userMsgId); 
  };

  const sendDataToBackend = async (text: string, fileData: any, fileName: any, mimeType: any, userMsgId: string) => {
    setIsTyping(true);
    try {
      const response = await axios.post('http://172.22.178.173:5000/ask-agent', {
        question: text,
        email: "mobile-user@eliteauto.com",
        file: fileData, 
        fileName: fileName,
        mimeType: mimeType
      });
      if (response.data.status === 'success') {
        const newMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: newMessageId, text: response.data.answer, sender: 'ai', linkedId: userMsgId }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "Server connection failed.", sender: 'ai', linkedId: userMsgId }]);
    } finally { setIsTyping(false); }
  };

  const renderMessage = ({ item }: any) => {
    const isUser = item.sender === 'user';
    const isActive = activeMessageId === item.id; 

    return (
      <View className={`mb-4 flex-row ${isUser ? 'justify-end' : 'justify-start'} items-center`}>
        
        {isUser && isActive && (
          <TouchableOpacity onPress={() => deleteMessage(item.id)} className="mr-3 w-9 h-9 bg-red-500/20 rounded-full border border-red-500/30 items-center justify-center">
            <Ionicons name="trash" size={18} color="#F87171" />
          </TouchableOpacity>
        )}

        {!isUser && (
          <View className="bg-blue-500/20 w-8 h-8 rounded-full items-center justify-center mr-2 mt-auto mb-1 border border-blue-500/30">
            <MaterialCommunityIcons name="robot-outline" size={18} color="#60A5FA" />
          </View>
        )}

        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => setActiveMessageId(isActive ? null : item.id)} 
          className={`px-5 py-3.5 max-w-[80%] shadow-lg ${isUser ? 'bg-blue-600 rounded-[24px] rounded-br-[8px]' : 'bg-[#151D30] rounded-[24px] rounded-bl-[8px] border border-white/5'} ${isActive ? 'border border-[#0096ff]/50' : ''}`}
        >
          {item.audioUri ? (
            <View className="flex-row items-center bg-blue-700 p-2 pr-4 rounded-full">
              <TouchableOpacity onPress={() => playAudio(item.audioUri, item.id)} className="w-8 h-8 bg-white rounded-full items-center justify-center mr-3 shadow-sm">
                <Ionicons name={playingId === item.id ? "pause" : "play"} size={16} color="#2563EB" className="ml-0.5" />
              </TouchableOpacity>
              <View className="flex-1 h-1 bg-blue-400/50 rounded-full w-20 overflow-hidden">
                <View className={`h-full bg-white ${playingId === item.id ? 'w-full' : 'w-0'}`} />
              </View>
              <Text className="text-white text-xs ml-3 font-bold">Voice</Text>
            </View>
          ) : (
            <View>
              <Text className={`text-[15px] leading-6 ${isUser ? 'text-white font-medium' : 'text-slate-300'}`}>{item.text}</Text>
              
              {!isUser && (
                <TouchableOpacity 
                  onPress={() => handleSpeak(item.text, item.id)}
                  className={`mt-3 flex-row items-center self-start px-3 py-1.5 rounded-full border ${isSpeaking === item.id ? 'bg-blue-500/30 border-blue-400' : 'bg-blue-500/10 border-blue-500/20'}`}
                >
                  <Ionicons name={isSpeaking === item.id ? "volume-medium" : "volume-high"} size={14} color={isSpeaking === item.id ? "#93C5FD" : "#60A5FA"} />
                  <Text className={`text-[10px] ml-1.5 font-bold uppercase tracking-widest ${isSpeaking === item.id ? 'text-blue-300' : 'text-blue-400'}`}>
                    {isSpeaking === item.id ? "Stop" : "Read Aloud"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>

        {!isUser && isActive && (
          <TouchableOpacity onPress={() => deleteMessage(item.id)} className="ml-3 w-9 h-9 bg-red-500/20 rounded-full border border-red-500/30 items-center justify-center">
            <Ionicons name="trash" size={18} color="#F87171" />
          </TouchableOpacity>
        )}

      </View>
    );
  };

  return (
    
    <SafeAreaView className="flex-1 bg-[#0B101E]">
      
      {/* 🌟 KeyboardAvoidingView එක ඇතුළට ගත්තා. Android වලට padding දීලා offset එකකුත් දුන්නා */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 70} 
        style={{ flex: 1 }}
      >
        <TouchableOpacity activeOpacity={1} onPress={() => setActiveMessageId(null)} className="flex-1">
          
          <View className="px-5 py-5 bg-[#151D30] border-b border-white/5 flex-row items-center justify-between shadow-lg">
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => {
                  Speech.stop(); 
                  router.back();
                }} 
                className="mr-4 p-2 rounded-full bg-white/5"
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <View>
                <Text className="text-white font-black text-xl">EliteAuto AI</Text>
                <Text className="text-emerald-400 text-xs font-bold uppercase mt-1">● Online Voice Agent</Text>
              </View>
            </View>

            <TouchableOpacity 
              onPress={clearChat}
              className="p-2.5 rounded-full bg-white/5 border border-white/10"
            >
              <Ionicons name="refresh" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 20 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
          />

          {isTyping && (
            <View className="px-6 pb-3 flex-row items-center">
              <ActivityIndicator size="small" color="#60a5fa" className="mr-2" />
              <Text className="text-blue-400/80 italic text-xs">AI is typing...</Text>
            </View>
          )}

        </TouchableOpacity>

        
        <View className="px-4 py-2 pb-6 bg-transparent">
          {attachedFile && (
            <View className="flex-row items-center bg-blue-500/20 self-start px-3 py-1.5 rounded-full mb-3 border border-blue-500/30">
              <Ionicons name="document-text" size={14} color="#60A5FA" />
              <Text className="text-blue-400 text-xs ml-2">{attachedFile.name}</Text>
              <TouchableOpacity onPress={() => setAttachedFile(null)} className="ml-2">
                <Ionicons name="close" size={14} color="#93C5FD" />
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row items-center bg-[#151D30] rounded-[30px] pr-2 pl-2 py-1.5 border border-white/10 shadow-lg">
            <TouchableOpacity onPress={handleFilePick} className="w-10 h-10 items-center justify-center rounded-full bg-white/5">
              <Ionicons name="attach" size={22} color="#94A3B8" />
            </TouchableOpacity>

            <TextInput
              className="flex-1 text-white h-12 text-[15px] px-2"
              placeholder={isRecording ? "Recording..." : "Ask anything..."}
              placeholderTextColor={isRecording ? "#F87171" : "#64748B"}
              value={inputText}
              onChangeText={setInputText}
              editable={!isRecording}
            />
            
            {inputText.trim() !== '' || attachedFile ? (
              <TouchableOpacity onPress={sendMessage} className="w-10 h-10 rounded-full items-center justify-center ml-1 bg-blue-600 shadow-md">
                <Ionicons name="send" size={16} color="white" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPressIn={startRecording} 
                onPressOut={stopRecording} 
                className={`w-10 h-10 rounded-full items-center justify-center ml-1 shadow-md ${isRecording ? 'bg-red-500' : 'bg-slate-700'}`}
              >
                <Ionicons name={isRecording ? "stop" : "mic"} size={18} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}