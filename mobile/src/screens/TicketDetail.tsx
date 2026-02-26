import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function TicketDetail({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Ticket Details</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <View className="bg-[#1a0033] rounded-3xl overflow-hidden border border-[#d500f9] shadow-[0_0_20px_rgba(213,0,249,0.3)] mb-8">
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070&auto=format&fit=crop' }} 
            className="w-full h-48"
          />
          <View className="p-6">
            <View className="flex-row justify-between items-start mb-4">
              <Text className="flex-1 text-2xl font-black text-white mr-4">Summer Music Festival 2024</Text>
              <View className="bg-[#d500f9]/20 px-3 py-1 rounded-full border border-[#d500f9]/50">
                <Text className="text-[#d500f9] font-bold text-xs uppercase tracking-wider">VIP</Text>
              </View>
            </View>

            <View className="flex-row items-center mb-4">
              <MaterialIcons name="calendar-today" size={20} color="#00e5ff" />
              <Text className="ml-3 text-base font-bold text-white">Aug 15, 2024 • 7:00 PM</Text>
            </View>

            <View className="flex-row items-center mb-6">
              <MaterialIcons name="location-on" size={20} color="#00e5ff" />
              <Text className="ml-3 text-base font-bold text-white">Central Park Arena, NY</Text>
            </View>

            <View className="border-t border-dashed border-[#4d0099] my-4 relative">
              <View className="absolute -left-8 -top-4 w-8 h-8 bg-[#0a0014] rounded-full border-r border-[#4d0099]" />
              <View className="absolute -right-8 -top-4 w-8 h-8 bg-[#0a0014] rounded-full border-l border-[#4d0099]" />
            </View>

            <View className="flex-row justify-between mb-6 pt-4">
              <View>
                <Text className="text-sm text-[#b388ff] mb-1">Name</Text>
                <Text className="font-bold text-white text-lg">John Doe</Text>
              </View>
              <View>
                <Text className="text-sm text-[#b388ff] mb-1">Seat</Text>
                <Text className="font-bold text-white text-lg">A-12</Text>
              </View>
              <View>
                <Text className="text-sm text-[#b388ff] mb-1">Gate</Text>
                <Text className="font-bold text-white text-lg">4</Text>
              </View>
            </View>

            <View className="items-center justify-center bg-white p-4 rounded-2xl">
              <FontAwesome5 name="qrcode" size={120} color="black" />
              <Text className="mt-2 text-black font-mono tracking-widest">EVX-982374</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity className="bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 mb-4 flex-row items-center justify-center">
          <MaterialIcons name="share" size={20} color="#00e5ff" />
          <Text className="text-[#00e5ff] font-bold text-lg ml-2">Share Ticket</Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="bg-[#2a004d] border border-[#d500f9]/50 rounded-2xl p-4 mb-8 flex-row items-center justify-center">
          <MaterialIcons name="file-download" size={20} color="#d500f9" />
          <Text className="text-[#d500f9] font-bold text-lg ml-2">Download PDF</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}