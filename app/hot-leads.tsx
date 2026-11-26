import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Linking, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HotLeadsScreen() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

 
  useFocusEffect(
    useCallback(() => {
      fetchLeads();
    }, [])
  );

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://172.22.178.173:8080/api/leads/all');
      
     
      const reversedLeads = response.data.reverse(); 
      setLeads(reversedLeads);
      
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const LeadCard = ({ lead }: any) => (
    <View className="bg-[#151D30] rounded-3xl p-5 mb-5 border border-red-500/10 shadow-lg relative overflow-hidden">
      <View className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/5 rounded-full blur-2xl"></View>

      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <Text className="text-white text-lg font-black mr-2">{lead.customerName || 'Unknown Customer'}</Text>
            <View className="bg-red-500/20 px-2 py-0.5 rounded-md border border-red-500/30">
                <Text className="text-red-400 text-[9px] font-black uppercase tracking-widest">{lead.intent || 'Hot'}</Text>
            </View>
          </View>
          <Text className="text-slate-400 text-xs font-medium">Recently added</Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleCall(lead.phoneNumber)}
          className="w-10 h-10 bg-green-500/10 rounded-full items-center justify-center border border-green-500/20"
        >
          <Ionicons name="call" size={18} color="#22C55E" />
        </TouchableOpacity>
      </View>

      <View className="bg-[#0B101E] p-4 rounded-2xl border border-white/5">
        <View className="flex-row items-center mb-3">
          <MaterialCommunityIcons name="car" size={16} color="#60A5FA" />
          <Text className="text-slate-300 text-xs ml-2 font-medium flex-1">Looking for: <Text className="text-white font-bold">{lead.interestedVehicle || 'Any Vehicle'}</Text></Text>
        </View>
        <View className="flex-row items-center border-t border-white/5 pt-3">
          <MaterialCommunityIcons name="wallet" size={16} color="#34D399" />
          <Text className="text-slate-300 text-xs ml-2 font-medium flex-1">Budget: <Text className="text-white font-bold">{lead.budget || 'Not specified'}</Text></Text>
        </View>
      </View>

      <View className="flex-row gap-3 mt-4">
        <TouchableOpacity className="flex-1 bg-blue-600/20 py-2.5 rounded-xl border border-blue-500/30 items-center justify-center">
          <Text className="text-blue-400 text-xs font-bold uppercase tracking-widest">Message</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-white/5 py-2.5 rounded-xl border border-white/10 items-center justify-center">
          <Text className="text-slate-300 text-xs font-bold uppercase tracking-widest">Mark Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0B101E]">
      <View className="px-5 pt-8 flex-1">
        
        <View className="flex-row items-center mb-8">
          <TouchableOpacity onPress={() => router.navigate('/')} className="bg-[#151D30] w-12 h-12 items-center justify-center rounded-2xl border border-white/10">
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="ml-5">
            <View className="flex-row items-center">
              <Text className="text-3xl font-black text-white mr-3">Hot Leads</Text>
              <MaterialCommunityIcons name="fire" size={28} color="#EF4444" />
            </View>
            <Text className="text-red-400 text-xs font-bold mt-1 uppercase tracking-widest">
              {leads.length} AI Identified Buyers
            </Text>
          </View>
        </View>

        <Text className="text-slate-400 text-xs font-medium leading-5 mb-6">
          These customers showed high purchase intent during their chat with the AI Agent. Contact them immediately to close the deal.
        </Text>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
             <ActivityIndicator size="large" color="#EF4444" />
             <Text className="text-slate-400 mt-4 text-xs font-bold tracking-widest uppercase">Fetching Leads...</Text>
          </View>
        ) : leads.length === 0 ? (
          <View className="flex-1 justify-center items-center">
             <MaterialCommunityIcons name="account-search-outline" size={64} color="#334155" />
             <Text className="text-slate-400 mt-4 font-bold tracking-widest uppercase">No hot leads yet</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
            {leads.map((lead, index) => (
              <LeadCard key={lead.id || index} lead={lead} />
            ))}
          </ScrollView>
        )}

      </View>
    </SafeAreaView>
  );
}