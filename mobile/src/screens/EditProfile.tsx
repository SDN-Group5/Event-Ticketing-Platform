import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function EditProfile({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#f7f5f8] dark:bg-[#1c1022]">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-12">
          <MaterialIcons name="arrow-back" size={24} color="#a60df2" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white pr-12">Edit Profile</Text>
      </View>

      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Full Name</Text>
        <View className="flex-row items-center rounded-xl border border-slate-200 dark:border-[#a60df2]/20 bg-white dark:bg-[#a60df2]/5 h-14 px-4 mb-4">
          <MaterialIcons name="person" size={20} color="#94a3b8" />
          <TextInput className="flex-1 ml-3 text-base text-slate-900 dark:text-white" defaultValue="John Doe" />
        </View>

        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Email Address</Text>
        <View className="flex-row items-center rounded-xl border border-slate-200 dark:border-[#a60df2]/20 bg-white dark:bg-[#a60df2]/5 h-14 px-4 mb-4">
          <MaterialIcons name="mail" size={20} color="#94a3b8" />
          <TextInput className="flex-1 ml-3 text-base text-slate-900 dark:text-white" defaultValue="john.doe@example.com" keyboardType="email-address" />
        </View>

        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ml-1">Phone Number</Text>
        <View className="flex-row items-center rounded-xl border border-slate-200 dark:border-[#a60df2]/20 bg-white dark:bg-[#a60df2]/5 h-14 px-4 mb-8">
          <MaterialIcons name="phone" size={20} color="#94a3b8" />
          <TextInput className="flex-1 ml-3 text-base text-slate-900 dark:text-white" defaultValue="+1 234 567 8900" keyboardType="phone-pad" />
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} className="w-full bg-[#a60df2] h-14 rounded-xl items-center justify-center shadow-lg shadow-[#a60df2]/20">
          <Text className="text-white font-bold text-lg">Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
