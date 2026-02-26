import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Explore({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="px-4 pt-12 pb-4 bg-[#1a0033] border-b border-[#4d0099]">
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-sm text-[#b388ff]">Current Location</Text>
            <View className="flex-row items-center">
              <Text className="text-lg font-bold text-white mr-1">New York, USA</Text>
              <MaterialIcons name="keyboard-arrow-down" size={20} color="#d500f9" />
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
            <MaterialIcons name="notifications-none" size={24} color="#d500f9" />
            <View className="absolute top-2 right-2 w-2 h-2 bg-[#00e5ff] rounded-full shadow-[0_0_8px_#00e5ff]" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center bg-[#2a004d] border border-[#4d0099] h-12 rounded-xl px-4">
          <MaterialIcons name="search" size={24} color="#b388ff" />
          <TextInput 
            className="flex-1 ml-2 text-base text-white"
            placeholder="Search events, artists, venues..."
            placeholderTextColor="#b388ff"
          />
          <TouchableOpacity className="bg-[#d500f9] p-1 rounded-lg">
            <MaterialIcons name="tune" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-white">Categories</Text>
          <Text className="text-sm font-bold text-[#d500f9]">See All</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <TouchableOpacity className="bg-[#d500f9] px-6 py-3 rounded-full mr-3 shadow-[0_0_10px_#d500f9]">
            <Text className="text-white font-bold">All</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#1a0033] border border-[#4d0099] px-6 py-3 rounded-full mr-3">
            <Text className="text-[#b388ff] font-bold">Music</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#1a0033] border border-[#4d0099] px-6 py-3 rounded-full mr-3">
            <Text className="text-[#b388ff] font-bold">Tech</Text>
          </TouchableOpacity>
          <TouchableOpacity className="bg-[#1a0033] border border-[#4d0099] px-6 py-3 rounded-full mr-3">
            <Text className="text-[#b388ff] font-bold">Sports</Text>
          </TouchableOpacity>
        </ScrollView>

        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-white">Trending Events</Text>
          <Text className="text-sm font-bold text-[#d500f9]">See All</Text>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('EventDetail')}
          className="w-full bg-[#1a0033] border border-[#4d0099] rounded-3xl overflow-hidden mb-6"
        >
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkIhUb1GjhsjU5Zm-vIxvNnjKmbajJ24V-McNfx348vGoncZi9ncpXfnJsgJhiNVFC-Cgxbet168ociT-x9-whsxZq_X72CPmSSb-ihTE5cdAkW1gi2_iXwi0PPguTGNGvcpdeD6kwnN3yp54tSNgWI4iXSFjYd_eo8jMi1rNfHps8PZJ6L8xQUG0u_pcRSnWiOJvQ8KbgeauEuGjhEjpmWRlDyQRJ2SIHbQGIsYwh-NEVZzcLWLscaEA-PELe2x7qRNANwJuYJUWM' }}
            className="w-full h-48 justify-between p-4"
          >
            <View className="flex-row justify-between">
              <View className="bg-[#0a0014]/80 px-3 py-2 rounded-xl items-center justify-center border border-[#d500f9]/50">
                <Text className="text-[#d500f9] font-bold text-lg leading-5">15</Text>
                <Text className="text-white text-xs font-bold uppercase">Aug</Text>
              </View>
              <View className="bg-[#0a0014]/80 w-10 h-10 rounded-full items-center justify-center border border-[#d500f9]/50">
                <MaterialIcons name="favorite-border" size={20} color="#d500f9" />
              </View>
            </View>
          </ImageBackground>
          <View className="p-4">
            <Text className="text-xl font-bold text-white mb-2">Summer Music Festival 2024</Text>
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="location-on" size={16} color="#b388ff" />
              <Text className="text-sm text-[#b388ff] ml-1">Central Park Arena, NY</Text>
            </View>
            <View className="flex-row justify-between items-center mt-2">
              <View className="flex-row -space-x-2">
                <View className="w-8 h-8 rounded-full bg-[#d500f9] border-2 border-[#1a0033]" />
                <View className="w-8 h-8 rounded-full bg-[#00e5ff] border-2 border-[#1a0033]" />
                <View className="w-8 h-8 rounded-full bg-[#7c4dff] border-2 border-[#1a0033]" />
                <View className="w-8 h-8 rounded-full bg-[#2a004d] border-2 border-[#1a0033] items-center justify-center">
                  <Text className="text-xs font-bold text-white">+2k</Text>
                </View>
              </View>
              <Text className="text-lg font-bold text-[#00e5ff]">$99.00</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}