import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Checkout({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#f7f5f8] dark:bg-[#1c1022]">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-12">
          <MaterialIcons name="arrow-back" size={24} color="#a60df2" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white pr-12">Checkout</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">Payment Method</Text>
        
        <View className="bg-white dark:bg-[#a60df2]/5 border border-[#a60df2] rounded-2xl p-4 mb-6 flex-row items-center">
          <MaterialIcons name="credit-card" size={28} color="#a60df2" />
          <View className="ml-4 flex-1">
            <Text className="font-bold text-slate-900 dark:text-white">Credit Card</Text>
            <Text className="text-slate-500 text-sm">•••• •••• •••• 4242</Text>
          </View>
          <MaterialIcons name="check-circle" size={24} color="#a60df2" />
        </View>

        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Cardholder Name</Text>
        <View className="flex-row items-center rounded-xl border border-slate-200 dark:border-[#a60df2]/20 bg-white dark:bg-[#a60df2]/5 h-14 px-4 mb-4">
          <TextInput className="flex-1 text-base text-slate-900 dark:text-white" placeholder="John Doe" placeholderTextColor="#94a3b8" defaultValue="John Doe" />
        </View>

        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Card Number</Text>
        <View className="flex-row items-center rounded-xl border border-slate-200 dark:border-[#a60df2]/20 bg-white dark:bg-[#a60df2]/5 h-14 px-4 mb-4">
          <TextInput className="flex-1 text-base text-slate-900 dark:text-white" placeholder="0000 0000 0000 0000" placeholderTextColor="#94a3b8" defaultValue="**** **** **** 4242" keyboardType="numeric" />
          <MaterialIcons name="credit-card" size={20} color="#94a3b8" />
        </View>

        <View className="flex-row gap-4 mb-8">
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Expiry Date</Text>
            <View className="flex-row items-center rounded-xl border border-slate-200 dark:border-[#a60df2]/20 bg-white dark:bg-[#a60df2]/5 h-14 px-4">
              <TextInput className="flex-1 text-base text-slate-900 dark:text-white" placeholder="MM/YY" placeholderTextColor="#94a3b8" defaultValue="12/25" />
            </View>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">CVV</Text>
            <View className="flex-row items-center rounded-xl border border-slate-200 dark:border-[#a60df2]/20 bg-white dark:bg-[#a60df2]/5 h-14 px-4">
              <TextInput className="flex-1 text-base text-slate-900 dark:text-white" placeholder="123" placeholderTextColor="#94a3b8" secureTextEntry defaultValue="123" keyboardType="numeric" />
            </View>
          </View>
        </View>

        <Text className="text-lg font-bold text-slate-900 dark:text-white mb-4">Order Summary</Text>
        <View className="bg-white dark:bg-[#a60df2]/5 border border-slate-200 dark:border-[#a60df2]/20 rounded-2xl p-4 mb-8">
          <View className="flex-row justify-between mb-2">
            <Text className="text-slate-600 dark:text-slate-400">1x General Admission</Text>
            <Text className="text-slate-900 dark:text-white font-medium">$99.00</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-slate-600 dark:text-slate-400">Taxes & Fees</Text>
            <Text className="text-slate-900 dark:text-white font-medium">$12.50</Text>
          </View>
          <View className="flex-row justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
            <Text className="text-slate-900 dark:text-white font-bold text-lg">Total</Text>
            <Text className="text-[#a60df2] font-bold text-lg">$111.50</Text>
          </View>
        </View>
      </ScrollView>

      <View className="p-4 bg-white dark:bg-[#1c1022] border-t border-slate-200 dark:border-slate-800">
        <TouchableOpacity 
          onPress={() => navigation.navigate('OrderConfirmation')}
          className="bg-[#a60df2] h-14 rounded-xl items-center justify-center shadow-lg shadow-[#a60df2]/30"
        >
          <Text className="text-white font-bold text-lg">Pay $111.50</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
