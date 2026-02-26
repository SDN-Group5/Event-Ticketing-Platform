import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function OrderConfirmation({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#f7f5f8] dark:bg-[#1c1022] items-center justify-center p-6">
      <View className="h-24 w-24 bg-green-100 dark:bg-green-900/30 rounded-full items-center justify-center mb-8">
        <MaterialIcons name="check-circle" size={64} color="#10b981" />
      </View>
      
      <Text className="text-3xl font-bold text-slate-900 dark:text-white mb-2 text-center">Payment Successful!</Text>
      <Text className="text-slate-500 dark:text-slate-400 text-center mb-8 text-base">
        Your order #EVT-84732 has been confirmed. We've sent the receipt to your email.
      </Text>

      <View className="w-full bg-white dark:bg-[#a60df2]/5 border border-slate-200 dark:border-[#a60df2]/20 rounded-2xl p-6 mb-8 items-center">
        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-1">Summer Music Festival 2024</Text>
        <Text className="text-slate-500 mb-4">August 15, 2024 • 7:00 PM</Text>
        <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg">
          <MaterialIcons name="confirmation-number" size={20} color="#a60df2" />
          <Text className="ml-2 font-bold text-slate-900 dark:text-white">1x General Admission</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => navigation.navigate('TicketDetail')}
        className="w-full bg-[#a60df2] h-14 rounded-xl items-center justify-center shadow-lg shadow-[#a60df2]/30 mb-4"
      >
        <Text className="text-white font-bold text-lg">View Ticket</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => navigation.navigate('Explore')}
        className="w-full h-14 rounded-xl items-center justify-center border border-slate-300 dark:border-slate-700"
      >
        <Text className="text-slate-700 dark:text-slate-300 font-bold text-lg">Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}
