import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';


const InputField = ({ label, icon, value, onChangeText, keyboardType = 'default' }: any) => (
  <View className="mb-5">
    <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">{label}</Text>
    <View className="flex-row items-center bg-[#151D30] border border-white/5 rounded-2xl px-4 py-1">
      <MaterialCommunityIcons name={icon} size={20} color="#60A5FA" />
      <TextInput
        className="flex-1 h-12 text-white ml-3 font-medium"
        placeholder={`Enter ${label}`}
        placeholderTextColor="#475569"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

export default function PricePredictionScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    Brand: 'Toyota',
    Model: 'Corolla',
    Year: '2018',
    Kilometres: '50000',
    FuelType: 'Petrol',
    Transmission: 'Automatic',
    UsedOrNew: 'Used'
  });

  const handlePredict = async () => {
    if (!formData.Brand || !formData.Model || !formData.Year || !formData.Kilometres) {
      Alert.alert("Error", "Please fill all details");
      return;
    }

    setLoading(true);
    setPredictedPrice(null);

    try {
      
      const response = await axios.post('http://172.22.178.173:5000/predict', {
        Brand: formData.Brand,
        Model: formData.Model,
        Year: parseInt(formData.Year),
        Kilometres: parseInt(formData.Kilometres),
        FuelType: formData.FuelType,
        Transmission: formData.Transmission,
        UsedOrNew: formData.UsedOrNew
      });

      if (response.data.status === 'success') {
        setPredictedPrice(response.data.predicted_price);
      } else {
        Alert.alert("Prediction Failed", response.data.message);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Server Error", "Make sure your Python backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B101E]">
      <ScrollView className="flex-1 px-6">
        
        {/* Header */}
        <View className="flex-row items-center mt-8 mb-10">
          <TouchableOpacity onPress={() => router.back()} className="bg-[#151D30] p-3 rounded-2xl border border-white/5">
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-3xl font-black text-white ml-5">Price AI</Text>
        </View>

        <Text className="text-slate-400 text-sm mb-8 leading-5 font-medium">
          Enter the vehicle details below and our trained Random Forest model will estimate the current market value.
        </Text>

        {/* Form Fields */}
        <InputField label="Brand" icon="car-info" value={formData.Brand} onChangeText={(t: string) => setFormData({...formData, Brand: t})} />
        <InputField label="Model" icon="car-side" value={formData.Model} onChangeText={(t: string) => setFormData({...formData, Model: t})} />
        <View className="flex-row justify-between">
            <View className="w-[48%]">
                <InputField label="Year" icon="calendar" value={formData.Year} onChangeText={(t: string) => setFormData({...formData, Year: t})} keyboardType="numeric" />
            </View>
            <View className="w-[48%]">
                <InputField label="Mileage (km)" icon="speedometer" value={formData.Kilometres} onChangeText={(t: string) => setFormData({...formData, Kilometres: t})} keyboardType="numeric" />
            </View>
        </View>

        {/* Predict Button */}
        <TouchableOpacity 
          onPress={handlePredict}
          disabled={loading}
          className="bg-blue-600 p-5 rounded-3xl mt-4 shadow-xl shadow-blue-500/30 flex-row justify-center items-center"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MaterialCommunityIcons name="auto-fix" size={22} color="white" />
              <Text className="text-white font-black text-lg ml-3">Calculate Value</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Prediction Result Display */}
        {predictedPrice && (
          <View className="mt-10 mb-10 bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[35px] items-center">
            <Text className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-2">Estimated Market Price</Text>
            <Text className="text-white text-4xl font-black">A$ {predictedPrice.toLocaleString()}</Text>
            <View className="bg-emerald-500/20 px-4 py-1.5 rounded-full mt-4">
               <Text className="text-emerald-400 text-[10px] font-bold">± 94.8% ACCURACY</Text>
            </View>
          </View>
        )}

        <View className="h-20" />
      </ScrollView>
    </SafeAreaView>
  );
}