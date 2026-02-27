import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function OrderConfirmation({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#0a0014]">
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8M3x8fGVufDB8fHx8fA%3D%3D' }}
        className="flex-1 justify-center items-center px-6"
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(10, 0, 20, 0.8)', '#0a0014', '#0a0014']}
          className="absolute inset-0"
        />
        
        <View className="w-24 h-24 bg-[#d500f9]/20 rounded-full items-center justify-center border-4 border-[#d500f9] shadow-[0_0_30px_rgba(213,0,249,0.6)] mb-6">
          <MaterialIcons name="check" size={48} color="#00e5ff" />
        </View>
        
        <Text className="text-3xl font-black text-white mb-2 tracking-wide text-center" style={{ textShadowColor: '#d500f9', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>Payment Successful!</Text>
        <Text className="text-base text-[#b388ff] text-center mb-10">Your tickets have been sent to your email and added to your wallet.</Text>

        <View className="w-full bg-[#1a0033]/90 border border-[#4d0099] rounded-3xl p-6 mb-8 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <Text className="text-white font-bold text-xl mb-4 text-center">Summer Music Festival 2024</Text>
          <View className="flex-row justify-between mb-3 border-b border-[#4d0099] pb-3">
            <Text className="text-[#b388ff]">Date & Time</Text>
            <Text className="text-white font-bold">Aug 15, 4:00 PM</Text>
          </View>
          <View className="flex-row justify-between mb-3 border-b border-[#4d0099] pb-3">
            <Text className="text-[#b388ff]">Tickets</Text>
            <Text className="text-white font-bold">2x VIP Pass</Text>
          </View>
          <View className="flex-row justify-between pt-1">
            <Text className="text-[#b388ff]">Order ID</Text>
            <Text className="text-[#00e5ff] font-bold">#EVX-982374</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('TicketDetail')}
          className="w-full bg-[#d500f9] h-14 rounded-2xl items-center justify-center mb-4 shadow-[0_0_20px_rgba(213,0,249,0.4)]"
        >
          <Text className="text-white font-bold text-lg tracking-wide">View My Tickets</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('MainTabs')}
          className="w-full bg-[#1a0033] border border-[#4d0099] h-14 rounded-2xl items-center justify-center"
        >
          <Text className="text-[#00e5ff] font-bold text-lg">Back to Home</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}