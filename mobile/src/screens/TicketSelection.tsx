import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TicketSelection({ navigation }: any) {
  const [vipCount, setVipCount] = useState(0);
  const [gaCount, setGaCount] = useState(1);

  const vipPrice = 150;
  const gaPrice = 99;
  const total = (vipCount * vipPrice) + (gaCount * gaPrice);

  return (
    <View className="flex-1 bg-[#f7f5f8] dark:bg-[#1c1022]">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-12">
          <MaterialIcons name="arrow-back" size={24} color="#a60df2" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white pr-12">Select Tickets</Text>
      </View>

      <ScrollView className="flex-1 p-4">
        <Text className="text-xl font-bold text-slate-900 dark:text-white mb-6">Summer Music Festival 2024</Text>

        {/* VIP Ticket */}
        <View className="bg-white dark:bg-[#a60df2]/5 border border-slate-200 dark:border-[#a60df2]/20 rounded-2xl p-4 mb-4">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-lg font-bold text-slate-900 dark:text-white">VIP Pass</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">Front row access, free drinks</Text>
            </View>
            <Text className="text-xl font-bold text-[#a60df2]">${vipPrice}</Text>
          </View>
          <View className="flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
            <Text className="text-slate-700 dark:text-slate-300 font-medium">Quantity</Text>
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => setVipCount(Math.max(0, vipCount - 1))}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
              >
                <MaterialIcons name="remove" size={20} color={vipCount > 0 ? "#a60df2" : "#94a3b8"} />
              </TouchableOpacity>
              <Text className="w-10 text-center font-bold text-lg text-slate-900 dark:text-white">{vipCount}</Text>
              <TouchableOpacity 
                onPress={() => setVipCount(vipCount + 1)}
                className="h-8 w-8 rounded-full bg-[#a60df2]/10 items-center justify-center"
              >
                <MaterialIcons name="add" size={20} color="#a60df2" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* General Admission */}
        <View className="bg-white dark:bg-[#a60df2]/5 border border-slate-200 dark:border-[#a60df2]/20 rounded-2xl p-4 mb-4">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-lg font-bold text-slate-900 dark:text-white">General Admission</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-sm mt-1">Standard entry</Text>
            </View>
            <Text className="text-xl font-bold text-[#a60df2]">${gaPrice}</Text>
          </View>
          <View className="flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
            <Text className="text-slate-700 dark:text-slate-300 font-medium">Quantity</Text>
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => setGaCount(Math.max(0, gaCount - 1))}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center"
              >
                <MaterialIcons name="remove" size={20} color={gaCount > 0 ? "#a60df2" : "#94a3b8"} />
              </TouchableOpacity>
              <Text className="w-10 text-center font-bold text-lg text-slate-900 dark:text-white">{gaCount}</Text>
              <TouchableOpacity 
                onPress={() => setGaCount(gaCount + 1)}
                className="h-8 w-8 rounded-full bg-[#a60df2]/10 items-center justify-center"
              >
                <MaterialIcons name="add" size={20} color="#a60df2" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="p-4 bg-white dark:bg-[#1c1022] border-t border-slate-200 dark:border-slate-800">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-slate-500 dark:text-slate-400">Total ({vipCount + gaCount} tickets)</Text>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Checkout')}
          disabled={total === 0}
          className={`h-14 rounded-xl items-center justify-center ${total > 0 ? 'bg-[#a60df2] shadow-lg shadow-[#a60df2]/30' : 'bg-slate-300 dark:bg-slate-800'}`}
        >
          <Text className={`font-bold text-lg ${total > 0 ? 'text-white' : 'text-slate-500'}`}>Continue to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
