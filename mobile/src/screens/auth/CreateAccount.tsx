import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function CreateAccount({ navigation }: any) {
  return (
    <ScrollView className="flex-1 bg-[#f7f5f8] dark:bg-[#1c1022]">
      <View className="flex-row items-center p-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-12">
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white pr-12">Create Account</Text>
      </View>

      <View className="items-center px-4 pt-6 pb-6">
        <View className="h-20 w-20 bg-[#a60df2]/20 rounded-xl items-center justify-center mb-6">
          <MaterialIcons name="local-activity" size={40} color="#a60df2" />
        </View>
        <Text className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Join EVENTIX</Text>
        <Text className="text-center text-slate-600 dark:text-slate-400">Sign up to discover exclusive events and book tickets instantly.</Text>
      </View>

      <View className="px-6 w-full">
        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Full Name</Text>
        <View className="flex-row items-center rounded-xl border border-slate-200 dark:border-[#a60df2]/20 bg-white dark:bg-[#a60df2]/10 h-14 px-4 mb-4">
          <MaterialIcons name="person" size={20} color="#94a3b8" />
          <TextInput className="flex-1 ml-3 text-base text-slate-900 dark:text-white" placeholder="John Doe" placeholderTextColor="#94a3b8" />
        </View>

        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Email Address</Text>
        <View className="flex-row items-center rounded-xl border border-slate-200 dark:border-[#a60df2]/20 bg-white dark:bg-[#a60df2]/10 h-14 px-4 mb-4">
          <MaterialIcons name="mail" size={20} color="#94a3b8" />
          <TextInput className="flex-1 ml-3 text-base text-slate-900 dark:text-white" placeholder="name@example.com" placeholderTextColor="#94a3b8" />
        </View>

        <Text className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 ml-1">Password</Text>
        <View className="flex-row items-center rounded-xl border border-slate-200 dark:border-[#a60df2]/20 bg-white dark:bg-[#a60df2]/10 h-14 px-4 mb-4">
          <MaterialIcons name="lock" size={20} color="#94a3b8" />
          <TextInput className="flex-1 ml-3 text-base text-slate-900 dark:text-white" placeholder="••••••••" placeholderTextColor="#94a3b8" secureTextEntry />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('MyEvents')} className="w-full bg-[#a60df2] h-14 rounded-xl items-center justify-center mt-2 mb-4">
          <Text className="text-white font-bold text-lg">Create Account</Text>
        </TouchableOpacity>

        <View className="flex-row justify-center pb-8 mt-4">
          <Text className="text-slate-600 dark:text-slate-400">Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-[#a60df2] font-bold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
