import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function EventDetail({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#f7f5f8] dark:bg-[#1c1022]">
      <ScrollView className="flex-1" bounces={false}>
        <ImageBackground
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkIhUb1GjhsjU5Zm-vIxvNnjKmbajJ24V-McNfx348vGoncZi9ncpXfnJsgJhiNVFC-Cgxbet168ociT-x9-whsxZq_X72CPmSSb-ihTE5cdAkW1gi2_iXwi0PPguTGNGvcpdeD6kwnN3yp54tSNgWI4iXSFjYd_eo8jMi1rNfHps8PZJ6L8xQUG0u_pcRSnWiOJvQ8KbgeauEuGjhEjpmWRlDyQRJ2SIHbQGIsYwh-NEVZzcLWLscaEA-PELe2x7qRNANwJuYJUWM' }}
          className="w-full h-72 justify-between pt-12 pb-4 px-4"
        >
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="h-10 w-10 bg-black/40 rounded-full items-center justify-center backdrop-blur-md">
              <MaterialIcons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity className="h-10 w-10 bg-black/40 rounded-full items-center justify-center backdrop-blur-md">
              <MaterialIcons name="favorite-border" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <View className="px-6 py-6 bg-[#f7f5f8] dark:bg-[#1c1022] -mt-6 rounded-t-3xl">
          <View className="flex-row justify-between items-start mb-4">
            <Text className="flex-1 text-2xl font-bold text-slate-900 dark:text-white mr-4">Summer Music Festival 2024</Text>
            <View className="bg-[#a60df2]/20 px-3 py-1 rounded-full">
              <Text className="text-[#a60df2] font-bold">Music</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="h-12 w-12 bg-[#a60df2]/10 rounded-full items-center justify-center mr-4">
              <MaterialIcons name="calendar-today" size={24} color="#a60df2" />
            </View>
            <View>
              <Text className="text-base font-bold text-slate-900 dark:text-white">August 15, 2024</Text>
              <Text className="text-sm text-slate-500">Thursday, 7:00 PM - 11:00 PM</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-6">
            <View className="h-12 w-12 bg-[#a60df2]/10 rounded-full items-center justify-center mr-4">
              <MaterialIcons name="location-on" size={24} color="#a60df2" />
            </View>
            <View>
              <Text className="text-base font-bold text-slate-900 dark:text-white">Central Park Arena</Text>
              <Text className="text-sm text-slate-500">New York, NY</Text>
            </View>
          </View>

          <Text className="text-lg font-bold text-slate-900 dark:text-white mb-2">About Event</Text>
          <Text className="text-slate-600 dark:text-slate-400 leading-6 mb-8">
            Join us for the biggest summer music festival of the year! Featuring top artists from around the world, food trucks, art installations, and an unforgettable atmosphere. Don't miss out on the event of the summer.
          </Text>
        </View>
      </ScrollView>

      <View className="p-4 bg-white dark:bg-[#1c1022] border-t border-slate-200 dark:border-slate-800 flex-row items-center justify-between">
        <View>
          <Text className="text-sm text-slate-500 dark:text-slate-400">Price</Text>
          <Text className="text-2xl font-bold text-[#a60df2]">$99.00</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('TicketSelection')}
          className="bg-[#a60df2] px-8 py-4 rounded-xl shadow-lg shadow-[#a60df2]/30"
        >
          <Text className="text-white font-bold text-lg">Buy Tickets</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
