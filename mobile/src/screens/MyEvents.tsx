import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function MyEvents({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="px-4 pt-12 pb-4 bg-[#1a0033] border-b border-[#4d0099]">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">Manage Events</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('CreateEvent')}
            className="w-10 h-10 bg-[#d500f9] rounded-full items-center justify-center shadow-[0_0_10px_#d500f9]"
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="text-lg font-bold text-white mb-4">Active Events</Text>
        
        <TouchableOpacity className="bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 mb-4 flex-row items-center">
          <View className="w-16 h-16 bg-[#2a004d] rounded-xl items-center justify-center border border-[#4d0099]">
            <Text className="text-[#d500f9] font-bold text-lg">15</Text>
            <Text className="text-[#b388ff] text-xs uppercase">Aug</Text>
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-white font-bold text-lg mb-1">Summer Music Fest</Text>
            <Text className="text-[#b388ff] text-sm">Central Park Arena</Text>
            <View className="flex-row items-center mt-2">
              <View className="bg-[#00e5ff]/20 px-2 py-1 rounded-md">
                <Text className="text-[#00e5ff] text-xs font-bold">Published</Text>
              </View>
              <Text className="text-[#b388ff] text-xs ml-3">1,204 Tickets Sold</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#b388ff" />
        </TouchableOpacity>

        <TouchableOpacity className="bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 mb-4 flex-row items-center">
          <View className="w-16 h-16 bg-[#2a004d] rounded-xl items-center justify-center border border-[#4d0099]">
            <Text className="text-[#d500f9] font-bold text-lg">22</Text>
            <Text className="text-[#b388ff] text-xs uppercase">Sep</Text>
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-white font-bold text-lg mb-1">Tech Conference 2024</Text>
            <Text className="text-[#b388ff] text-sm">Convention Center</Text>
            <View className="flex-row items-center mt-2">
              <View className="bg-[#ff9100]/20 px-2 py-1 rounded-md">
                <Text className="text-[#ff9100] text-xs font-bold">Draft</Text>
              </View>
              <Text className="text-[#b388ff] text-xs ml-3">0 Tickets Sold</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#b388ff" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
