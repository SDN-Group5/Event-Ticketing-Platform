import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TicketSelection({ navigation }: any) {
  const [quantity, setQuantity] = useState(1);

  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Select Tickets</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <View className="bg-[#1a0033] border border-[#d500f9] rounded-3xl p-5 mb-4 shadow-[0_0_15px_rgba(213,0,249,0.2)]">
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className="text-xl font-bold text-white">VIP Pass</Text>
              <Text className="text-sm text-[#b388ff]">Front row access, free drinks</Text>
            </View>
            <Text className="text-2xl font-bold text-[#00e5ff]">$99.00</Text>
          </View>
          
          <View className="flex-row items-center justify-between mt-6 pt-4 border-t border-[#4d0099]">
            <Text className="text-white font-bold">Quantity</Text>
            <View className="flex-row items-center bg-[#0a0014] rounded-full border border-[#4d0099]">
              <TouchableOpacity 
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 items-center justify-center"
              >
                <MaterialIcons name="remove" size={20} color="#d500f9" />
              </TouchableOpacity>
              <Text className="text-lg font-bold text-white w-8 text-center">{quantity}</Text>
              <TouchableOpacity 
                onPress={() => setQuantity(quantity + 1)}
                className="w-10 h-10 items-center justify-center"
              >
                <MaterialIcons name="add" size={20} color="#d500f9" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <TouchableOpacity className="bg-[#1a0033] border border-[#4d0099] rounded-3xl p-5 mb-4 opacity-70">
          <View className="flex-row justify-between items-start mb-2">
            <View>
              <Text className="text-xl font-bold text-white">General Admission</Text>
              <Text className="text-sm text-[#b388ff]">Standard entry</Text>
            </View>
            <Text className="text-2xl font-bold text-[#00e5ff]">$49.00</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('SeatMapDesigner')}
          className="bg-[#2a004d] border border-[#d500f9]/50 rounded-2xl p-4 mt-4 flex-row items-center justify-center"
        >
          <MaterialIcons name="event-seat" size={24} color="#00e5ff" />
          <Text className="text-[#00e5ff] font-bold text-lg ml-2">Choose on Map</Text>
        </TouchableOpacity>
      </ScrollView>

      <View className="p-6 bg-[#1a0033] border-t border-[#4d0099] rounded-t-3xl">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[#b388ff] font-bold text-lg">Total ({quantity} tickets)</Text>
          <Text className="text-3xl font-black text-[#00e5ff]">${(99 * quantity).toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Checkout')}
          className="w-full bg-[#d500f9] h-14 rounded-2xl items-center justify-center shadow-[0_0_20px_rgba(213,0,249,0.4)]"
        >
          <Text className="text-white font-bold text-lg tracking-wide">Continue to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}