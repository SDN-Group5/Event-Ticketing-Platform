import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Login({ navigation }: any) {
  return (
    <ScrollView className="flex-1 bg-[#f7f5f8] dark:bg-[#1c1022]">
      <View className="flex-row items-center justify-center p-6 pb-2">
        <View className="h-10 w-10 bg-[#a60df2] rounded-lg items-center justify-center mr-2">
          <MaterialIcons name="local-activity" size={24} color="white" />
        </View>
        <Text className="text-2xl font-bold text-slate-900 dark:text-white">EVENTIX</Text>
      </View>

      <View className="px-4 py-6">
        <ImageBackground
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUqQetPfqZG2oOvMWpyMlelBbYdb9pXmMSSNV3MhMDUOhvxI6KkWl3Bq91pIkNe24BZNePhyKCGW7AdbwyeWzd1tQbVwDVpF3Jl5BrABa-vtVJM4i01MqvPj5FW7iCmDQGSFNkSJxJqFQHM1wFqQeCCHdOCWjH7TXk8pc2xVfhWnDBgObCj6pEw-cEdqRRtwhegSoqSXQk8ssAn16zNSh5E30jSOTTj0wThln-w3lL7dgqdDCRHW9yYwaxTAY9F_pb1w2PfTZOpmaZ' }}
          className="w-full h-56 rounded-xl overflow-hidden justify-end"
        >
          <View className="absolute inset-0 bg-black/30" />
        </ImageBackground>
      </View>

      <View className="px-6">
        <Text className="text-[32px] font-bold text-center text-slate-900 dark:text-white mb-2">Welcome Back</Text>
        <Text className="text-base text-center text-slate-600 dark:text-slate-400 mb-6">Sign in to discover amazing events near you</Text>
      </View>

      <View className="px-6 w-full">
        <Text className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-2 ml-1">Email Address</Text>
        <View className="flex-row items-center rounded-xl border border-[#a60df2]/20 bg-white dark:bg-[#a60df2]/5 h-14 px-4 mb-4">
          <MaterialIcons name="mail" size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-base text-slate-900 dark:text-white"
            placeholder="name@example.com"
            placeholderTextColor="#94a3b8"
          />
        </View>

        <Text className="text-sm font-medium text-slate-900 dark:text-slate-200 mb-2 ml-1">Password</Text>
        <View className="flex-row items-center rounded-xl border border-[#a60df2]/20 bg-white dark:bg-[#a60df2]/5 h-14 px-4 mb-2">
          <MaterialIcons name="lock" size={20} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-3 text-base text-slate-900 dark:text-white"
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            secureTextEntry
          />
          <MaterialIcons name="visibility" size={20} color="#94a3b8" />
        </View>

        <TouchableOpacity className="items-end mb-4">
          <Text className="text-[#a60df2] text-sm font-semibold">Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('MyEvents')}
          className="w-full bg-[#a60df2] h-14 rounded-xl items-center justify-center mb-6"
        >
          <Text className="text-white font-bold text-lg">Sign In</Text>
        </TouchableOpacity>

        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-[1px] bg-slate-200 dark:bg-[#a60df2]/20" />
          <Text className="mx-4 text-slate-400 text-sm">Or continue with</Text>
          <View className="flex-1 h-[1px] bg-slate-200 dark:bg-[#a60df2]/20" />
        </View>

        <View className="flex-row justify-between mb-8">
          <TouchableOpacity className="flex-1 flex-row items-center justify-center h-12 rounded-xl border border-[#a60df2]/20 bg-white dark:bg-[#a60df2]/5 mr-2">
            <Text className="text-sm font-medium text-slate-900 dark:text-white">Google</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 flex-row items-center justify-center h-12 rounded-xl border border-[#a60df2]/20 bg-white dark:bg-[#a60df2]/5 ml-2">
            <Text className="text-sm font-medium text-slate-900 dark:text-white">Facebook</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center pb-8">
          <Text className="text-slate-600 dark:text-slate-400">Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
            <Text className="text-[#a60df2] font-bold">Create an account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
