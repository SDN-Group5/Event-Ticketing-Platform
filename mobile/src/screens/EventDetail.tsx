import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function EventDetail({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#0a0014]">
      <ScrollView className="flex-1" bounces={false}>
        <ImageBackground
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkIhUb1GjhsjU5Zm-vIxvNnjKmbajJ24V-McNfx348vGoncZi9ncpXfnJsgJhiNVFC-Cgxbet168ociT-x9-whsxZq_X72CPmSSb-ihTE5cdAkW1gi2_iXwi0PPguTGNGvcpdeD6kwnN3yp54tSNgWI4iXSFjYd_eo8jMi1rNfHps8PZJ6L8xQUG0u_pcRSnWiOJvQ8KbgeauEuGjhEjpmWRlDyQRJ2SIHbQGIsYwh-NEVZzcLWLscaEA-PELe2x7qRNANwJuYJUWM' }}
          className="w-full h-80 justify-between pt-12 pb-4 px-4"
        >
          <LinearGradient
            colors={['rgba(10, 0, 20, 0.6)', 'transparent', '#0a0014']}
            className="absolute inset-0"
          />
          <View className="flex-row justify-between items-center z-10">
            <TouchableOpacity onPress={() => navigation.goBack()} className="h-10 w-10 bg-[#1a0033]/80 rounded-full items-center justify-center border border-[#4d0099]">
              <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
            </TouchableOpacity>
            <TouchableOpacity className="h-10 w-10 bg-[#1a0033]/80 rounded-full items-center justify-center border border-[#4d0099]">
              <MaterialIcons name="favorite-border" size={24} color="#d500f9" />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <View className="px-6 py-6 bg-[#0a0014] -mt-6 rounded-t-[40px] border-t border-[#4d0099]/50">
          <View className="flex-row justify-between items-start mb-4">
            <Text className="flex-1 text-2xl font-bold text-white mr-4">Summer Music Festival 2024</Text>
            <View className="bg-[#d500f9]/20 px-3 py-1 rounded-full border border-[#d500f9]/50">
              <Text className="text-[#d500f9] font-bold text-xs uppercase tracking-wider">Music</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4 bg-[#1a0033] p-4 rounded-2xl border border-[#4d0099]">
            <View className="h-12 w-12 bg-[#2a004d] rounded-xl items-center justify-center mr-4 border border-[#4d0099]">
              <MaterialIcons name="calendar-today" size={24} color="#00e5ff" />
            </View>
            <View>
              <Text className="text-base font-bold text-white">August 15, 2024</Text>
              <Text className="text-sm text-[#b388ff]">Thursday, 7:00 PM - 11:00 PM</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-6 bg-[#1a0033] p-4 rounded-2xl border border-[#4d0099]">
            <View className="h-12 w-12 bg-[#2a004d] rounded-xl items-center justify-center mr-4 border border-[#4d0099]">
              <MaterialIcons name="location-on" size={24} color="#d500f9" />
            </View>
            <View>
              <Text className="text-base font-bold text-white">Central Park Arena</Text>
              <Text className="text-sm text-[#b388ff]">New York, NY</Text>
            </View>
          </View>

          <Text className="text-lg font-bold text-white mb-2">About Event</Text>
          <Text className="text-[#b388ff] leading-6 mb-8">
            Join us for the biggest summer music festival of the year! Featuring top artists from around the world, food trucks, art installations, and an unforgettable atmosphere. Don't miss out on the event of the summer.
          </Text>
        </View>
      </ScrollView>

      <View className="p-6 bg-[#1a0033] border-t border-[#4d0099] flex-row items-center justify-between rounded-t-3xl">
        <View>
          <Text className="text-sm text-[#b388ff] uppercase tracking-wider font-bold">Price</Text>
          <Text className="text-3xl font-black text-[#00e5ff]">$99.00</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('TicketSelection')}
          className="bg-[#d500f9] px-8 py-4 rounded-2xl shadow-[0_0_20px_rgba(213,0,249,0.4)]"
        >
          <Text className="text-white font-bold text-lg tracking-wide">Buy Tickets</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}