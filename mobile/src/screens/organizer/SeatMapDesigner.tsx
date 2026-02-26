import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function SeatMapDesigner({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#f6f7f8] dark:bg-[#101822]">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-[#f6f7f8] dark:bg-[#101822]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10">
          <MaterialIcons name="arrow-back-ios" size={20} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white">Seat Map Designer</Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 items-center justify-center p-4">
        <MaterialIcons name="add-box" size={48} color="#cbd5e1" />
        <Text className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4">Canvas is Empty</Text>
        <Text className="text-center text-slate-500 mt-2">Drag a shape from the toolbar to start designing your layout.</Text>
        
        {/* Mock element */}
        <View className="absolute top-1/3 left-1/4 w-48 items-center justify-center rounded-lg border-2 border-[#136dec] bg-[#136dec]/20 p-4">
          <Text className="font-bold text-[#136dec]">VIP Zone A</Text>
          <Text className="text-[#136dec]/80">150 Seats</Text>
        </View>
      </View>

      <View className="bg-white dark:bg-[#101822] rounded-t-2xl shadow-lg p-4 border-t border-slate-200 dark:border-slate-800">
        <View className="items-center mb-4">
          <View className="h-1 w-10 bg-slate-300 rounded-full" />
        </View>
        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">Block Properties</Text>
        <View className="h-12 rounded-lg border border-slate-300 dark:border-slate-700 px-3 justify-center mb-4">
          <Text className="text-slate-900 dark:text-white">VIP Zone A</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} className="h-12 items-center justify-center rounded-lg bg-[#136dec]">
          <Text className="font-bold text-white">Save Layout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
