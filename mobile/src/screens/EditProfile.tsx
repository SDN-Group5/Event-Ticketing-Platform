import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function EditProfile({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Edit Profile</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <View className="items-center mb-8">
          <View className="relative">
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop' }} 
              className="w-28 h-28 rounded-full border-4 border-[#d500f9] shadow-[0_0_20px_rgba(213,0,249,0.5)]"
            />
            <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 bg-[#00e5ff] rounded-full items-center justify-center border-2 border-[#0a0014]">
              <MaterialIcons name="camera-alt" size={16} color="#0a0014" />
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-sm font-bold text-[#b388ff] uppercase tracking-wider mb-2 ml-2">Full Name</Text>
        <View className="flex-row items-center bg-[#1a0033] border border-[#4d0099] h-14 rounded-2xl px-4 mb-6">
          <MaterialIcons name="person" size={20} color="#d500f9" />
          <TextInput 
            className="flex-1 ml-3 text-base text-white"
            defaultValue="Jane Doe"
            placeholderTextColor="#6a1b9a"
          />
        </View>

        <Text className="text-sm font-bold text-[#b388ff] uppercase tracking-wider mb-2 ml-2">Email</Text>
        <View className="flex-row items-center bg-[#1a0033] border border-[#4d0099] h-14 rounded-2xl px-4 mb-6">
          <MaterialIcons name="email" size={20} color="#d500f9" />
          <TextInput 
            className="flex-1 ml-3 text-base text-white"
            defaultValue="jane.doe@example.com"
            keyboardType="email-address"
            placeholderTextColor="#6a1b9a"
          />
        </View>

        <Text className="text-sm font-bold text-[#b388ff] uppercase tracking-wider mb-2 ml-2">Phone</Text>
        <View className="flex-row items-center bg-[#1a0033] border border-[#4d0099] h-14 rounded-2xl px-4 mb-8">
          <MaterialIcons name="phone" size={20} color="#d500f9" />
          <TextInput 
            className="flex-1 ml-3 text-base text-white"
            defaultValue="+1 234 567 8900"
            keyboardType="phone-pad"
            placeholderTextColor="#6a1b9a"
          />
        </View>

        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-full bg-[#d500f9] h-14 rounded-2xl items-center justify-center shadow-[0_0_20px_rgba(213,0,249,0.4)]"
        >
          <Text className="text-white font-bold text-lg tracking-wide">Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}