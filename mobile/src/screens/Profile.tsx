import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Profile({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#f7f5f8] dark:bg-[#1c1022]">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800">
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white">Profile</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="items-center py-8">
          <View className="relative">
            <Image
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvTfc_KT_lUMS2IlDVZ3VYVyDa7l3cC9NGWvdnKPxOhYQ1p5pkVtEl0xLA1IcePlO_vADS_TOKAtT99Pv5gEoSGP1tyxt7h6qJTKip2Xdszm44KvI12JKtoBlB7LWzXMRag8whA1hXpRyFAKdUBvQAxQ8g9xA0tFODOtbWw1RNVRHEewJpKA5xQCajr2P1zPd8F4ViWOEeZDgqxmT_5ANTkhX3hgIES11SYhyyghSPPRH90iygfvy9uDPsYYqRTl28oKpLERdfT5RK' }}
              className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800"
            />
            <TouchableOpacity className="absolute bottom-0 right-0 bg-[#a60df2] w-8 h-8 rounded-full items-center justify-center border-2 border-white dark:border-slate-800">
              <MaterialIcons name="edit" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text className="text-xl font-bold text-slate-900 dark:text-white mt-4">John Doe</Text>
          <Text className="text-slate-500">john.doe@example.com</Text>
        </View>

        <View className="px-4 pb-8">
          <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 ml-2">Account</Text>
          
          <View className="bg-white dark:bg-[#a60df2]/5 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#a60df2]/20 mb-6">
            <TouchableOpacity onPress={() => navigation.navigate('EditProfile')} className="flex-row items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center mr-4">
                <MaterialIcons name="person-outline" size={20} color="#3b82f6" />
              </View>
              <Text className="flex-1 text-base font-medium text-slate-900 dark:text-white">Edit Profile</Text>
              <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('SecuritySettings')} className="flex-row items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <View className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 items-center justify-center mr-4">
                <MaterialIcons name="security" size={20} color="#f97316" />
              </View>
              <Text className="flex-1 text-base font-medium text-slate-900 dark:text-white">Security Settings</Text>
              <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('MyTickets')} className="flex-row items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <View className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 items-center justify-center mr-4">
                <MaterialIcons name="local-activity" size={20} color="#10b981" />
              </View>
              <Text className="flex-1 text-base font-medium text-slate-900 dark:text-white">My Tickets</Text>
              <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <Text className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 ml-2">Preferences</Text>
          
          <View className="bg-white dark:bg-[#a60df2]/5 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#a60df2]/20 mb-6">
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} className="flex-row items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center mr-4">
                <MaterialIcons name="notifications-none" size={20} color="#a855f7" />
              </View>
              <Text className="flex-1 text-base font-medium text-slate-900 dark:text-white">Notifications</Text>
              <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Login')} className="flex-row items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/30">
            <MaterialIcons name="logout" size={20} color="#ef4444" />
            <Text className="text-base font-bold text-red-500 ml-2">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Nav Placeholder */}
      <View className="flex-row bg-white dark:bg-[#1c1022] border-t border-slate-200 dark:border-slate-800 pb-6 pt-2 px-6 justify-between">
        <TouchableOpacity onPress={() => navigation.navigate('Explore')} className="items-center">
          <MaterialIcons name="explore" size={28} color="#94a3b8" />
          <Text className="text-xs text-slate-500 mt-1">Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MyTickets')} className="items-center">
          <MaterialIcons name="local-activity" size={28} color="#94a3b8" />
          <Text className="text-xs text-slate-500 mt-1">Tickets</Text>
        </TouchableOpacity>
        <TouchableOpacity className="items-center">
          <MaterialIcons name="person" size={28} color="#a60df2" />
          <Text className="text-xs text-[#a60df2] font-bold mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
