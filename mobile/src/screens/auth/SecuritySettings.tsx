import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function SecuritySettings({ navigation }: any) {
  return (
    <ScrollView className="flex-1 bg-[#f7f5f8] dark:bg-[#1c1022]">
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-12">
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white pr-12">Security Settings</Text>
      </View>

      <View className="px-4 py-4">
        <View className="bg-white dark:bg-[#a60df2]/5 border border-slate-200 dark:border-[#a60df2]/10 rounded-xl p-6 mb-6">
          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Current Password</Text>
          <View className="flex-row items-center rounded-lg border border-slate-200 dark:border-[#a60df2]/20 bg-slate-50 dark:bg-[#1c1022]/50 h-12 px-3 mb-6">
            <MaterialIcons name="vpn-key" size={20} color="#94a3b8" />
            <TextInput className="flex-1 ml-3 text-slate-900 dark:text-white" placeholder="••••••••" placeholderTextColor="#94a3b8" secureTextEntry />
          </View>

          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">New Password</Text>
          <View className="flex-row items-center rounded-lg border border-slate-200 dark:border-[#a60df2]/20 bg-slate-50 dark:bg-[#1c1022]/50 h-12 px-3 mb-4">
            <MaterialIcons name="lock-outline" size={20} color="#94a3b8" />
            <TextInput className="flex-1 ml-3 text-slate-900 dark:text-white" placeholder="••••••••" placeholderTextColor="#94a3b8" secureTextEntry />
          </View>

          <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Confirm New Password</Text>
          <View className="flex-row items-center rounded-lg border border-slate-200 dark:border-[#a60df2]/20 bg-slate-50 dark:bg-[#1c1022]/50 h-12 px-3 mb-6">
            <MaterialIcons name="verified-user" size={20} color="#94a3b8" />
            <TextInput className="flex-1 ml-3 text-slate-900 dark:text-white" placeholder="••••••••" placeholderTextColor="#94a3b8" secureTextEntry />
          </View>

          <TouchableOpacity className="h-12 bg-[#a60df2] rounded-lg items-center justify-center flex-row">
            <MaterialIcons name="update" size={20} color="white" />
            <Text className="text-white font-bold ml-2">Update Password</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-[#a60df2]/5 border border-[#a60df2]/20 rounded-xl p-6 mb-6">
          <View className="flex-row items-center mb-4">
            <MaterialIcons name="info" size={20} color="#a60df2" />
            <Text className="font-bold text-[#a60df2] ml-2">Password Rules</Text>
          </View>
          <View className="space-y-2">
            <Text className="text-slate-600 dark:text-slate-400 text-sm">• Minimum 8 characters long</Text>
            <Text className="text-slate-600 dark:text-slate-400 text-sm">• Include at least one uppercase letter</Text>
            <Text className="text-slate-600 dark:text-slate-400 text-sm">• Include one special character (!@#)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
