import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

export default function Checkout({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Checkout</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="text-lg font-bold text-white mb-4">Order Summary</Text>
        <View className="bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-white font-bold text-base">2x VIP Pass</Text>
            <Text className="text-white font-bold text-base">$198.00</Text>
          </View>
          <View className="flex-row justify-between mb-4">
            <Text className="text-[#b388ff] text-sm">Service Fee</Text>
            <Text className="text-[#b388ff] text-sm">$10.00</Text>
          </View>
          <View className="flex-row justify-between pt-4 border-t border-[#4d0099]">
            <Text className="text-white font-bold text-lg">Total</Text>
            <Text className="text-[#00e5ff] font-black text-xl">$208.00</Text>
          </View>
        </View>

        <Text className="text-lg font-bold text-white mb-4">Payment Method</Text>
        <View className="bg-[#1a0033] border border-[#d500f9] rounded-2xl p-4 mb-4 flex-row items-center shadow-[0_0_15px_rgba(213,0,249,0.2)]">
          <View className="w-12 h-8 bg-[#0a0014] rounded items-center justify-center border border-[#4d0099]">
            <FontAwesome5 name="cc-visa" size={20} color="#00e5ff" />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-white font-bold">•••• •••• •••• 4242</Text>
            <Text className="text-[#b388ff] text-xs">Expires 12/25</Text>
          </View>
          <MaterialIcons name="check-circle" size={24} color="#d500f9" />
        </View>

        <TouchableOpacity className="bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 mb-6 flex-row items-center">
          <View className="w-12 h-8 bg-[#0a0014] rounded items-center justify-center border border-[#4d0099]">
            <FontAwesome5 name="apple-pay" size={24} color="white" />
          </View>
          <Text className="text-white font-bold ml-4 flex-1">Apple Pay</Text>
          <MaterialIcons name="radio-button-unchecked" size={24} color="#6a1b9a" />
        </TouchableOpacity>

        <Text className="text-lg font-bold text-white mb-4">Promo Code</Text>
        <View className="flex-row items-center bg-[#1a0033] border border-[#4d0099] h-14 rounded-2xl px-4 mb-8">
          <MaterialIcons name="local-offer" size={20} color="#b388ff" />
          <TextInput 
            className="flex-1 ml-3 text-base text-white"
            placeholder="Enter code here"
            placeholderTextColor="#6a1b9a"
          />
          <TouchableOpacity>
            <Text className="text-[#00e5ff] font-bold">Apply</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View className="p-6 bg-[#1a0033] border-t border-[#4d0099] rounded-t-3xl">
        <TouchableOpacity 
          onPress={() => navigation.navigate('OrderConfirmation')}
          className="w-full bg-[#d500f9] h-14 rounded-2xl items-center justify-center shadow-[0_0_20px_rgba(213,0,249,0.4)]"
        >
          <Text className="text-white font-bold text-lg tracking-wide">Pay $208.00</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}