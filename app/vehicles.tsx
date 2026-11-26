import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('http://172.22.178.173:8080/api/vehicles/all');
      setVehicles(response.data);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderVehicleCard = ({ item }: any) => {
    let imageUrl = 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=800&auto=format&fit=crop'; 
    if (item.image) {
      imageUrl = item.image.startsWith('http') || item.image.startsWith('data:') 
        ? item.image 
        : `data:image/jpeg;base64,${item.image}`; 
    }

    
    const handlePress = () => {
      router.push({ 
        pathname: '/vehicle-details', 
        params: { id: item.id } 
      });
    };

    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={handlePress}
        className="bg-[#151D30] rounded-[30px] mb-6 overflow-hidden border border-white/5 shadow-2xl"
      >
        <Image source={{ uri: imageUrl }} className="w-full h-52" resizeMode="cover" />
        
        <View className="p-6">
          <View className="flex-row justify-between items-start mb-2">
            <View className="flex-1">
              <Text className="text-white text-2xl font-black">{item.brand} {item.model}</Text>
              <Text className="text-slate-400 text-sm font-medium mt-1">
                {item.condition || 'Used'} • {item.mileage ? item.mileage.toLocaleString() : '0'} km
              </Text>
            </View>
            <View className="bg-blue-500/20 px-3 py-1.5 rounded-xl border border-blue-500/30">
              <Text className="text-blue-400 text-xs font-black">{item.year}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center mt-3 mb-5 bg-[#0B101E] p-3 rounded-2xl border border-white/5">
            <View className="flex-row items-center mr-5">
              <MaterialCommunityIcons name="gas-station" size={18} color="#94A3B8" />
              <Text className="text-slate-300 text-xs ml-2 font-medium">{item.fuelType || 'N/A'}</Text>
            </View>
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="car-shift-pattern" size={18} color="#94A3B8" />
              <Text className="text-slate-300 text-xs ml-2 font-medium">{item.transmission || 'N/A'}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center border-t border-white/5 pt-5 mt-2">
            <View>
              <Text className="text-slate-500 text-xs uppercase tracking-widest font-bold mb-1">Asking Price</Text>
              <Text className="text-white text-2xl font-black">A$ {item.price ? item.price.toLocaleString() : 'N/A'}</Text>
            </View>
            <View className="bg-white/5 w-12 h-12 rounded-full items-center justify-center border border-white/5">
              <Ionicons name="chevron-forward" size={24} color="#60A5FA" className="ml-1" />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B101E]">
      <View className="px-5 pt-8 flex-1">
        <View className="flex-row items-center mb-8">
          <TouchableOpacity onPress={() => router.back()} className="bg-[#151D30] w-12 h-12 items-center justify-center rounded-2xl border border-white/10">
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="ml-5">
            <Text className="text-3xl font-black text-white">Inventory</Text>
            <Text className="text-blue-400 text-xs font-bold mt-1 uppercase tracking-widest">{vehicles.length} Vehicles Found</Text>
          </View>
        </View>

        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#60a5fa" />
          </View>
        ) : (
          <FlatList
            data={vehicles}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderVehicleCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}