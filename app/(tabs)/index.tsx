import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const [vehicleCount, setVehicleCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchVehicleCount();
  }, []);

  const fetchVehicleCount = async () => {
    try {
      
      const response = await axios.get('http://172.22.178.173:8080/api/vehicles/all');
      setVehicleCount(response.data.length); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#0B101E]"> 
      
      {/* 🌟 Premium Header Section */}
      <View className="pt-20 pb-10 px-6 bg-[#151D30] rounded-b-[45px] border-b border-white/5 shadow-2xl">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-4xl font-black text-white tracking-tight">EliteAuto</Text>
            <Text className="text-blue-400 text-xs font-bold mt-2 uppercase tracking-widest">
              AI Dealership System
            </Text>
          </View>
          {/* Logo Icon */}
          <View className="bg-blue-500/20 p-4 rounded-full border border-blue-500/30">
            <Ionicons name="car-sport" size={28} color="#60A5FA" />
          </View>
        </View>
      </View>

      {/* 🌟 Main Actions */}
      <View className="px-6 mt-10">
        <Text className="text-white text-xl font-extrabold mb-5 tracking-wide">Quick Actions</Text>
        
        {/* AI Agent Button */}
        <TouchableOpacity 
          onPress={() => router.push('/ai-chat')}
          className="bg-blue-600 p-5 rounded-3xl mb-4 flex-row items-center shadow-blue-500/30 shadow-xl"
        >
          <View className="bg-white/20 p-4 rounded-2xl mr-4">
            <Ionicons name="chatbubbles" size={24} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-lg font-bold">Talk to AI Agent</Text>
            <Text className="text-blue-100 text-xs mt-1 font-medium">Get price predictions & support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        {/* Browse Vehicles Button */}
        <TouchableOpacity 
          onPress={() => router.push('/vehicles')} 
          className="bg-[#1A2235] p-5 rounded-3xl border border-white/10 flex-row items-center mb-4"
        >
          <View className="bg-white/5 p-4 rounded-2xl mr-4 border border-white/5">
            <Ionicons name="list" size={24} color="#94A3B8" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-lg font-bold">Browse Inventory</Text>
            <Text className="text-slate-400 text-xs mt-1 font-medium">View and manage vehicles</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.2)" />
        </TouchableOpacity>

        {/* 🌟 Price Prediction Button */}
        <TouchableOpacity 
          onPress={() => router.push('/price-prediction')} 
          className="bg-[#1A2235] p-5 rounded-3xl border border-white/10 flex-row items-center mb-4"
        >
          <View className="bg-emerald-500/10 p-4 rounded-2xl mr-4 border border-emerald-500/20">
            <MaterialCommunityIcons name="calculator" size={24} color="#34D399" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-lg font-bold">Price Predictor</Text>
            <Text className="text-slate-400 text-xs mt-1 font-medium">AI-powered market value estimation</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.2)" />
        </TouchableOpacity>

      </View>

      {/* 🌟 Live Stats */}
      <View className="px-6 mt-6 flex-row justify-between pb-10">
        {/* Total Vehicles Card */}
        <View className="bg-[#151D30] p-6 rounded-3xl w-[48%] border border-white/5 shadow-lg">
          <View className="bg-blue-500/10 w-10 h-10 rounded-full items-center justify-center mb-3">
            <Ionicons name="car" size={18} color="#60A5FA" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Cars</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#60a5fa" className="mt-2" />
          ) : (
            <Text className="text-white text-4xl font-black mt-1">{vehicleCount}</Text>
          )}
        </View>

        
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => router.push('/hot-leads')}
          className="bg-[#151D30] p-6 rounded-3xl w-[48%] border border-red-500/20 shadow-lg shadow-red-500/10"
        >
          <View className="bg-red-500/10 w-10 h-10 rounded-full items-center justify-center mb-3 border border-red-500/20">
            <Ionicons name="flame" size={18} color="#F87171" />
          </View>
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">Hot Leads</Text>
          <View className="flex-row items-baseline mt-1">
            <Text className="text-white text-4xl font-black">3</Text>
            <Text className="text-red-400 text-[10px] font-bold ml-2 uppercase tracking-widest">New</Text>
          </View>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}