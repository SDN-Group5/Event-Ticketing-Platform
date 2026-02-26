import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function SecuritySettings({ navigation }: any) {
  const [faceId, setFaceId] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Security</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="text-sm font-bold text-[#b388ff] uppercase tracking-wider mb-4 ml-2">Authentication</Text>
        
        <View className="bg-[#1a0033] border border-[#4d0099] rounded-3xl overflow-hidden mb-8">
          <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-[#4d0099]">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center mr-4">
                <MaterialIcons name="lock" size={20} color="#00e5ff" />
              </View>
              <Text className="text-base font-bold text-white">Change Password</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#6a1b9a" />
          </TouchableOpacity>

          <View className="flex-row items-center justify-between p-5 border-b border-[#4d0099]">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center mr-4">
                <MaterialIcons name="face" size={20} color="#d500f9" />
              </View>
              <Text className="text-base font-bold text-white">Face ID / Biometrics</Text>
            </View>
            <Switch
              value={faceId}
              onValueChange={setFaceId}
              trackColor={{ false: '#4d0099', true: '#d500f9' }}
              thumbColor={faceId ? '#fff' : '#b388ff'}
            />
          </View>

          <View className="flex-row items-center justify-between p-5">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center mr-4">
                <MaterialIcons name="security" size={20} color="#00e5ff" />
              </View>
              <Text className="text-base font-bold text-white">Two-Factor Auth</Text>
            </View>
            <Switch
              value={twoFactor}
              onValueChange={setTwoFactor}
              trackColor={{ false: '#4d0099', true: '#d500f9' }}
              thumbColor={twoFactor ? '#fff' : '#b388ff'}
            />
          </View>
        </View>

        <Text className="text-sm font-bold text-[#b388ff] uppercase tracking-wider mb-4 ml-2">Devices</Text>
        
        <View className="bg-[#1a0033] border border-[#4d0099] rounded-3xl overflow-hidden mb-8">
          <View className="flex-row items-center justify-between p-5 border-b border-[#4d0099]">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center mr-4">
                <MaterialIcons name="smartphone" size={20} color="#d500f9" />
              </View>
              <View>
                <Text className="text-base font-bold text-white">iPhone 14 Pro</Text>
                <Text className="text-xs text-[#00e5ff] mt-1">Current Device</Text>
              </View>
            </View>
          </View>
          <View className="flex-row items-center justify-between p-5">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center mr-4">
                <MaterialIcons name="laptop-mac" size={20} color="#6a1b9a" />
              </View>
              <View>
                <Text className="text-base font-bold text-white">MacBook Pro</Text>
                <Text className="text-xs text-[#b388ff] mt-1">Last active: 2 days ago</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Text className="text-red-500 font-bold">Log out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
