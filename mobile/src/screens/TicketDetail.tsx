import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TicketDetail({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#f7f5f8] dark:bg-[#1c1022]">
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full items-center justify-center shadow-sm">
          <MaterialIcons name="close" size={24} color="#0f172a" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-2">
        <View className="bg-white dark:bg-[#a60df2]/5 border border-slate-200 dark:border-[#a60df2]/20 rounded-3xl overflow-hidden shadow-xl shadow-[#a60df2]/10 mb-8">
          <View className="bg-[#a60df2] p-6 items-center">
            <Text className="text-white/80 font-medium text-sm mb-1">EVENT TICKET</Text>
            <Text className="text-white font-bold text-2xl text-center">Summer Music Festival 2024</Text>
          </View>
          
          <View className="p-6 items-center border-b border-dashed border-slate-300 dark:border-slate-700 relative">
            {/* Cutout circles for ticket effect */}
            <View className="absolute -left-4 -bottom-4 w-8 h-8 rounded-full bg-[#f7f5f8] dark:bg-[#1c1022]" />
            <View className="absolute -right-4 -bottom-4 w-8 h-8 rounded-full bg-[#f7f5f8] dark:bg-[#1c1022]" />
            
            <View className="w-48 h-48 bg-white p-2 rounded-xl border border-slate-200 items-center justify-center mb-4">
              <MaterialIcons name="qr-code-2" size={160} color="#0f172a" />
            </View>
            <Text className="text-slate-500 font-mono tracking-widest">EVT-84732-991</Text>
          </View>

          <View className="p-6 bg-white dark:bg-transparent">
            <View className="flex-row justify-between mb-6">
              <View>
                <Text className="text-slate-500 text-xs mb-1">Name</Text>
                <Text className="text-slate-900 dark:text-white font-bold">John Doe</Text>
              </View>
              <View className="items-end">
                <Text className="text-slate-500 text-xs mb-1">Type</Text>
                <Text className="text-[#a60df2] font-bold">General Adm.</Text>
              </View>
            </View>

            <View className="flex-row justify-between mb-6">
              <View>
                <Text className="text-slate-500 text-xs mb-1">Date</Text>
                <Text className="text-slate-900 dark:text-white font-bold">Aug 15, 2024</Text>
              </View>
              <View className="items-end">
                <Text className="text-slate-500 text-xs mb-1">Time</Text>
                <Text className="text-slate-900 dark:text-white font-bold">7:00 PM</Text>
              </View>
            </View>

            <View>
              <Text className="text-slate-500 text-xs mb-1">Location</Text>
              <Text className="text-slate-900 dark:text-white font-bold">Central Park Arena, NY</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
