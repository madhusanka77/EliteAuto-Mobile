import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function VehicleDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  
  const [vehicle, setVehicle] = useState<any>(null);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const [aiPrice, setAiPrice] = useState<number | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (id) {
      axios.get(`http://172.22.178.173:8080/api/vehicles/${id}`)
        .then(res => {
          setVehicle(res.data);
          setIsPageLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsPageLoading(false);
        });
    }
  }, [id]);

  if (isPageLoading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B101E] justify-center items-center">
        <ActivityIndicator size="large" color="#0096ff" />
        <Text className="text-slate-400 mt-4 font-bold tracking-widest uppercase text-xs">Loading Details...</Text>
      </SafeAreaView>
    );
  }

  if (!vehicle) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B101E] justify-center items-center">
        <Text className="text-white text-lg font-bold">Failed to load vehicle.</Text>
        <TouchableOpacity onPress={() => router.navigate('/vehicles')} className="mt-4 bg-blue-600 px-6 py-3 rounded-xl">
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  let imageUrl = 'https://via.placeholder.com/400x300?text=No+Image';
  if (vehicle.image) {
    imageUrl = vehicle.image.startsWith('http') || vehicle.image.startsWith('data:')
      ? vehicle.image
      : `data:image/jpeg;base64,${vehicle.image}`;
  }

  const getConditionStyle = (condition: string) => {
    if (condition === 'Brand New') return 'text-[#0096ff] bg-[#0096ff]/15 border-[#0096ff]/30';
    if (condition === 'Reconditioned') return 'text-yellow-400 bg-yellow-400/15 border-yellow-400/30';
    return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
  };

  const handlePredict = async () => {
    setIsAILoading(true);
    try {
      const vehicleData = {
        Brand: vehicle.brand || "Toyota",
        Model: vehicle.model || "Unknown",
        Year: parseInt(vehicle.year) || 2015,
        UsedOrNew: vehicle.condition ? vehicle.condition.toUpperCase() : "USED",
        Transmission: vehicle.transmission || "Automatic",
        FuelType: vehicle.fuelType || "Petrol",
        Kilometres: vehicle.mileage ? parseInt(vehicle.mileage) : 50000 
      };

      const res = await axios.post('http://172.22.178.173:5000/predict', vehicleData);

      if (res?.data?.status === 'success') {
        setAiPrice(res.data.predicted_price);
      } else {
        Alert.alert('AI Error', res.data?.message || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Connection Failed', 'Failed to connect to AI Server!');
    } finally {
      setIsAILoading(false);
    }
  };

  
  const handleDownloadBrochure = async () => {
    setIsDownloading(true);
    try {
      const safeBrand = (vehicle.brand || 'Car').replace(/\s+/g, '_');
      const safeModel = (vehicle.model || '').replace(/\s+/g, '_');
      const fileName = `EliteAuto_${safeBrand}_${safeModel}_Brochure.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;

      const response = await fetch('http://172.22.178.173:5000/generate-brochure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicle })
      });

      if (!response.ok) throw new Error("Failed to generate brochure");

      const blob = await response.blob();
      const base64data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); 
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      await FileSystem.writeAsStringAsync(fileUri, base64data, {
        encoding: 'base64' 
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Download Vehicle Brochure'
        });
      } else {
        Alert.alert("Success", "Brochure saved internally!");
      }

    } catch (error) {
      console.error(error);
      Alert.alert('Download Failed', 'Make sure your Python backend is running.');
    } finally {
      setIsDownloading(false);
    }
  };

  const SpecCard = ({ icon, label, value }: any) => (
    <View className="bg-[#151D30] w-[48%] p-4 rounded-2xl mb-4 border border-white/5 shadow-sm">
      <View className="flex-row items-center mb-2">
        <MaterialCommunityIcons name={icon} size={16} color="#60A5FA" />
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</Text>
      </View>
      <Text className="text-sm font-black text-white">{value}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0B101E]">
      
      <View className="px-5 py-4 flex-row items-center justify-between z-10 bg-[#0B101E]">
        <TouchableOpacity onPress={() => router.navigate('/vehicles')} className="bg-[#151D30] p-3 rounded-full border border-white/5">
          <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View className="flex-row gap-3">
          <TouchableOpacity onPress={() => setIsSaved(!isSaved)} className={`p-2.5 rounded-full border ${isSaved ? 'bg-yellow-500/20 border-yellow-500/30' : 'bg-[#151D30] border-white/5'}`}>
            <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? "#EAB308" : "white"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        
        <View className="w-full h-64 bg-[#151D30] rounded-3xl overflow-hidden border border-white/5 mb-6">
          <Image source={{ uri: imageUrl }} className="w-full h-full object-cover" />
        </View>

        <View className="mb-8">
          <View className="flex-row items-center gap-3 mb-3">
            <Text className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg tracking-widest border ${getConditionStyle(vehicle.condition)}`}>
              {vehicle.condition || 'N/A'}
            </Text>
            <Text className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{vehicle.year}</Text>
          </View>
          
          <Text className="text-4xl font-black text-white uppercase tracking-tighter">
            {vehicle.brand} <Text className="text-[#0096ff]">{vehicle.model}</Text>
          </Text>

          <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4 mb-1">Asking Price</Text>
          <Text className="text-3xl font-black text-white tracking-tighter">
            <Text className="text-lg text-slate-400 mr-1">A$ </Text>
            {vehicle.price?.toLocaleString()}
          </Text>
        </View>

        <View className="mb-8">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-8 h-8 rounded-lg bg-[#0096ff]/10 border border-[#0096ff]/20 flex items-center justify-center">
              <Ionicons name="car-sport" size={16} color="#0096ff" />
            </View>
            <Text className="text-xs font-black uppercase tracking-widest text-white">Specifications</Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
            <SpecCard icon="speedometer" label="Mileage" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : '0 km'} />
            <SpecCard icon="engine" label="Engine" value={vehicle.engine ? `${vehicle.engine} cc` : 'N/A'} />
            <SpecCard icon="gas-station" label="Fuel Type" value={vehicle.fuelType || 'N/A'} />
            <SpecCard icon="cogs" label="Transmission" value={vehicle.transmission || 'N/A'} />
          </View>
        </View>

        {/* Buttons Row */}
        <View className="flex-row gap-4 mb-8">
          <TouchableOpacity 
            onPress={() => Linking.openURL(`tel:${vehicle.contact || ''}`)}
            className="flex-1 bg-[#0096ff] py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-[#0096ff]/30"
          >
            <Ionicons name="call" size={18} color="white" />
            <Text className="text-white font-black uppercase tracking-widest text-xs ml-2">Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleDownloadBrochure}
            disabled={isDownloading}
            className="flex-1 bg-[#151D30] border border-[#0096ff]/30 py-4 rounded-2xl flex-row items-center justify-center shadow-sm"
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#0096ff" />
            ) : (
              <MaterialCommunityIcons name="file-pdf-box" size={24} color="#0096ff" />
            )}
            <Text className="text-[#0096ff] font-black uppercase tracking-widest text-[10px] ml-2">
              {isDownloading ? "Generating..." : "Brochure"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Valuation Section */}
        <View className="bg-[#151D30] border border-white/5 rounded-3xl p-6 mb-10 overflow-hidden relative">
          <View className="absolute -top-10 -right-10 w-32 h-32 bg-[#0096ff]/10 rounded-full blur-2xl"></View>
          
          <View className="flex-row items-center gap-3 mb-4 pb-4 border-b border-white/5">
            <View className="w-10 h-10 rounded-xl bg-[#0096ff]/10 border border-[#0096ff]/20 flex items-center justify-center">
              <MaterialCommunityIcons name="robot-outline" size={22} color="#0096ff" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-black uppercase tracking-widest text-white">AI Market Valuation</Text>
              <Text className="text-[9px] text-slate-400 mt-0.5">Powered by ML model</Text>
            </View>
          </View>

          <Text className="text-xs text-slate-400 mb-5 leading-relaxed">
            Our Machine Learning model analyzes current market trends to determine the true value of this vehicle.
          </Text>

          {!aiPrice && !isAILoading && (
            <TouchableOpacity onPress={handlePredict} className="w-full bg-blue-600/20 border border-blue-500/30 py-4 rounded-xl flex-row items-center justify-center">
              <Ionicons name="sparkles" size={16} color="#60A5FA" />
              <Text className="text-blue-400 font-black uppercase tracking-widest text-xs ml-2">Generate Valuation</Text>
            </TouchableOpacity>
          )}

          {isAILoading && (
            <View className="w-full bg-[#0B101E] border border-white/5 py-4 rounded-xl flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#0096ff" />
            </View>
          )}

          {aiPrice && (
            <View className="bg-[#0B101E] border border-white/5 p-5 rounded-2xl mt-2">
              <Text className="text-3xl font-black text-white tracking-tighter mb-2">
                <Text className="text-lg text-slate-500 mr-1">A$ </Text>
                {aiPrice.toLocaleString()}
              </Text>
            </View>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}