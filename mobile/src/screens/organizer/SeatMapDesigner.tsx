import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function SeatMapDesigner({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Seat Map</Text>
      </View>

      <View className="flex-1 items-center justify-center p-6">
        <View className="w-full h-24 bg-[#1a0033] border-b-4 border-[#00e5ff] rounded-t-[100px] items-center justify-center mb-12 shadow-[0_10px_30px_rgba(0,229,255,0.2)]">
          <Text className="text-[#00e5ff] font-black tracking-widest uppercase text-xl">Stage</Text>
        </View>

        <View className="flex-row flex-wrap justify-center gap-4">
          {/* Mock seats */}
          {[...Array(20)].map((_, i) => (
            <TouchableOpacity 
              key={i} 
              className={`w-12 h-12 rounded-xl items-center justify-center border ${
                i % 5 === 0 ? 'bg-[#d500f9] border-[#d500f9] shadow-[0_0_10px_rgba(213,0,249,0.5)]' : 
                i % 3 === 0 ? 'bg-[#2a004d] border-[#4d0099] opacity-50' : 
                'bg-[#1a0033] border-[#00e5ff]'
              }`}
            >
              <Text className={`font-bold text-xs ${i % 5 === 0 ? 'text-white' : i % 3 === 0 ? 'text-[#6a1b9a]' : 'text-[#00e5ff]'}`}>
                {i + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="p-6 bg-[#1a0033] border-t border-[#4d0099] rounded-t-3xl">
        <View className="flex-row justify-between mb-6">
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-[#1a0033] border border-[#00e5ff] rounded mr-2" />
            <Text className="text-[#b388ff] text-sm">Available</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-[#d500f9] rounded mr-2 shadow-[0_0_5px_rgba(213,0,249,0.5)]" />
            <Text className="text-white text-sm">Selected</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-[#2a004d] border border-[#4d0099] rounded mr-2" />
            <Text className="text-[#6a1b9a] text-sm">Taken</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-full bg-[#d500f9] h-14 rounded-2xl items-center justify-center shadow-[0_0_20px_rgba(213,0,249,0.4)]"
        >
          <Text className="text-white font-bold text-lg tracking-wide">Confirm Selection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
