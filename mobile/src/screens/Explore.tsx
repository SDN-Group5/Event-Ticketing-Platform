import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Explore({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#f7f5f8] dark:bg-[#1c1022]">
      <View className="px-4 pt-12 pb-4 bg-white dark:bg-[#1c1022] border-b border-slate-200 dark:border-slate-800">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-sm text-slate-500 dark:text-slate-400">Current Location</Text>
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-slate-900 dark:text-white mr-1">New York, USA</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color="#a60df2" />
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center">
            <MaterialIcons name="notifications-none" size={24} color="#0f172a" />
            <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-800" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-slate-100 dark:bg-[#a60df2]/10 h-12 rounded-xl px-4">
          <MaterialIcons name="search" size={24} color="#94a3b8" />
          <TextInput 
            className="flex-1 ml-2 text-base text-slate-900 dark:text-white"
            placeholder="Search events, artists, venues..."
            placeholderTextColor="#94a3b8"
          />
          <TouchableOpacity className="bg-[#a60df2] p-1 rounded-lg">
            <MaterialIcons name="tune" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-slate-900 dark:text-white">Categories</Text>
          <Text className="text-sm font-bold text-[#a60df2]">See All</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <TouchableOpacity className="bg-[#a60df2] px-6 py-3 rounded-full mr-3 shadow-sm">
            <Text className="text-white font-bold">All</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-full mr-3">
            <Text className="text-slate-700 dark:text-slate-300 font-bold">Music</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-full mr-3">
            <Text className="text-slate-700 dark:text-slate-300 font-bold">Tech</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-full mr-3">
            <Text className="text-slate-700 dark:text-slate-300 font-bold">Sports</Text>
          </TouchableOpacity>
        </ScrollView>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-slate-900 dark:text-white">Trending Events</Text>
          <Text className="text-sm font-bold text-[#a60df2]">See All</Text>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('EventDetail')}
          className="w-full bg-white dark:bg-[#a60df2]/5 border border-slate-200 dark:border-[#a60df2]/20 rounded-3xl overflow-hidden mb-6 shadow-sm"
        >
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkIhUb1GjhsjU5Zm-vIxvNnjKmbajJ24V-McNfx348vGoncZi9ncpXfnJsgJhiNVFC-Cgxbet168ociT-x9-whsxZq_X72CPmSSb-ihTE5cdAkW1gi2_iXwi0PPguTGNGvcpdeD6kwnN3yp54tSNgWI4iXSFjYd_eo8jMi1rNfHps8PZJ6L8xQUG0u_pcRSnWiOJvQ8KbgeauEuGjhEjpmWRlDyQRJ2SIHbQGIsYwh-NEVZzcLWLscaEA-PELe2x7qRNANwJuYJUWM' }}
            className="w-full h-48 justify-between p-4"
          >
            <View className="flex-row justify-between">
              <View className="bg-white/90 dark:bg-black/60 px-3 py-2 rounded-xl items-center justify-center backdrop-blur-md">
                <Text className="text-[#a60df2] font-bold text-lg leading-5">15</Text>
                <Text className="text-slate-900 dark:text-white text-xs font-bold uppercase">Aug</Text>
              </View>
              <View className="bg-white/90 dark:bg-black/60 w-10 h-10 rounded-full items-center justify-center backdrop-blur-md">
                <MaterialIcons name="favorite-border" size={20} color="#a60df2" />
              </View>
            </View>
          </ImageBackground>
          <View className="p-4">
            <Text className="text-xl font-bold text-slate-900 dark:text-white mb-2">Summer Music Festival 2024</Text>
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="location-on" size={16} color="#94a3b8" />
              <Text className="text-sm text-slate-500 ml-1">Central Park Arena, NY</Text>
            </View>
            <View className="flex-row justify-between items-center mt-2">
              <View className="flex-row -space-x-2">
                <View className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white dark:border-slate-800" />
                <View className="w-8 h-8 rounded-full bg-red-200 border-2 border-white dark:border-slate-800" />
                <View className="w-8 h-8 rounded-full bg-green-200 border-2 border-white dark:border-slate-800" />
                <View className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white dark:border-slate-800 items-center justify-center">
                  <Text className="text-xs font-bold text-slate-600">+2k</Text>
                </View>
              </View>
              <Text className="text-lg font-bold text-[#a60df2]">$99.00</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Nav */}
      <View className="flex-row bg-white dark:bg-[#1c1022] border-t border-slate-200 dark:border-slate-800 pb-6 pt-2 px-6 justify-between">
        <TouchableOpacity className="items-center">
          <MaterialIcons name="explore" size={28} color="#a60df2" />
          <Text className="text-xs text-[#a60df2] font-bold mt-1">Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MyTickets')} className="items-center">
          <MaterialIcons name="local-activity" size={28} color="#94a3b8" />
          <Text className="text-xs text-slate-500 mt-1">Tickets</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} className="items-center">
          <MaterialIcons name="person" size={28} color="#94a3b8" />
          <Text className="text-xs text-slate-500 mt-1">Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
