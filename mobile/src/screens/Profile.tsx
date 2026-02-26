import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function Profile({ navigation }: any) {
  const { signOut } = useAuth();

  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 border-b border-[#4d0099] bg-[#1a0033]">
        <Text className="flex-1 text-center text-lg font-bold text-white">Profile</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="items-center py-8">
          <View className="relative">
            <Image 
              source={{ uri: 'https://i.pravatar.cc/150?img=68' }} 
              className="w-24 h-24 rounded-full border-4 border-[#d500f9]"
            />
            <TouchableOpacity className="absolute bottom-0 right-0 bg-[#d500f9] w-8 h-8 rounded-full items-center justify-center border-2 border-[#0a0014]">
              <MaterialIcons name="edit" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-2xl font-bold text-white mt-4">Alex Johnson</Text>
          <Text className="text-base text-[#b388ff] mt-1">alex.johnson@example.com</Text>
        </View>

        <View className="px-4 pb-8">
          <View className="bg-[#1a0033] rounded-2xl border border-[#4d0099] overflow-hidden mb-6">
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} className="flex-row items-center p-4 border-b border-[#4d0099]">
              <View className="w-10 h-10 rounded-full bg-[#d500f9]/20 items-center justify-center mr-4">
                <MaterialIcons name="person-outline" size={24} color="#d500f9" />
              </View>
              <Text className="flex-1 text-base font-bold text-white">Edit Profile</Text>
              <MaterialIcons name="chevron-right" size={24} color="#b388ff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('SecuritySettings')} className="flex-row items-center p-4 border-b border-[#4d0099]">
              <View className="w-10 h-10 rounded-full bg-[#00e5ff]/20 items-center justify-center mr-4">
                <MaterialIcons name="security" size={24} color="#00e5ff" />
              </View>
              <Text className="flex-1 text-base font-bold text-white">Security & Password</Text>
              <MaterialIcons name="chevron-right" size={24} color="#b388ff" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-full bg-[#7c4dff]/20 items-center justify-center mr-4">
                <MaterialIcons name="notifications-none" size={24} color="#7c4dff" />
              </View>
              <Text className="flex-1 text-base font-bold text-white">Notifications</Text>
              <MaterialIcons name="chevron-right" size={24} color="#b388ff" />
            </TouchableOpacity>
          </View>

          <View className="bg-[#1a0033] rounded-2xl border border-[#4d0099] overflow-hidden mb-8">
            <TouchableOpacity className="flex-row items-center p-4 border-b border-[#4d0099]">
              <View className="w-10 h-10 rounded-full bg-[#b388ff]/20 items-center justify-center mr-4">
                <MaterialIcons name="help-outline" size={24} color="#b388ff" />
              </View>
              <Text className="flex-1 text-base font-bold text-white">Help & Support</Text>
              <MaterialIcons name="chevron-right" size={24} color="#b388ff" />
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center p-4">
              <View className="w-10 h-10 rounded-full bg-[#b388ff]/20 items-center justify-center mr-4">
                <MaterialIcons name="info-outline" size={24} color="#b388ff" />
              </View>
              <Text className="flex-1 text-base font-bold text-white">About Eventix</Text>
              <MaterialIcons name="chevron-right" size={24} color="#b388ff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={signOut} className="flex-row items-center justify-center p-4 bg-[#ff1744]/10 rounded-2xl border border-[#ff1744]/30">
            <MaterialIcons name="logout" size={20} color="#ff1744" />
            <Text className="text-base font-bold text-[#ff1744] ml-2">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
