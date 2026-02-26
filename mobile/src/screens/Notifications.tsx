import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Notifications({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#f7f5f8] dark:bg-[#1c1022]">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-12">
          <MaterialIcons name="arrow-back" size={24} color="#a60df2" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white pr-12">Notifications</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-2">
        <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 mt-4 ml-2">Today</Text>
        
        <View className="bg-white dark:bg-[#a60df2]/5 border border-slate-200 dark:border-[#a60df2]/20 rounded-2xl p-4 mb-3 flex-row">
          <View className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-4">
            <MaterialIcons name="check-circle" size={24} color="#10b981" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-slate-900 dark:text-white mb-1">Ticket Confirmed!</Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400 mb-2">Your ticket for Summer Music Festival 2024 has been confirmed.</Text>
            <Text className="text-xs text-slate-400">2 hours ago</Text>
          </View>
        </View>

        <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 mt-4 ml-2">Yesterday</Text>

        <View className="bg-white dark:bg-[#a60df2]/5 border border-slate-200 dark:border-[#a60df2]/20 rounded-2xl p-4 mb-3 flex-row opacity-70">
          <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-4">
            <MaterialIcons name="event" size={24} color="#3b82f6" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-slate-900 dark:text-white mb-1">Upcoming Event Reminder</Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400 mb-2">Community Charity Run starts tomorrow at 8:00 AM.</Text>
            <Text className="text-xs text-slate-400">1 day ago</Text>
          </View>
        </View>

        <View className="bg-white dark:bg-[#a60df2]/5 border border-slate-200 dark:border-[#a60df2]/20 rounded-2xl p-4 mb-3 flex-row opacity-70">
          <View className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-4">
            <MaterialIcons name="local-offer" size={24} color="#f97316" />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-slate-900 dark:text-white mb-1">Special Offer</Text>
            <Text className="text-sm text-slate-600 dark:text-slate-400 mb-2">Get 20% off on Tech Conference 2024 VIP tickets. Limited time only!</Text>
            <Text className="text-xs text-slate-400">1 day ago</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
