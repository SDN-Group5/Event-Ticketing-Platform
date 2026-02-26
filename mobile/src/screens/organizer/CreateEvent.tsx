import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function CreateEvent({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#f6f7f8] dark:bg-[#101822]">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-[#f6f7f8] dark:bg-[#101822]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10">
          <MaterialIcons name="arrow-back" size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white">Create Event</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 pt-4 pb-24">
        <View className="items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 py-10 mb-6">
          <View className="h-12 w-12 rounded-full bg-[#136dec]/10 items-center justify-center mb-2">
            <MaterialIcons name="file-upload" size={24} color="#136dec" />
          </View>
          <Text className="font-bold text-slate-900 dark:text-white">Upload Cover Image</Text>
          <Text className="text-sm text-slate-500">Tap to upload a photo</Text>
        </View>

        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Event Name</Text>
        <TextInput className="h-12 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 mb-4 text-slate-900 dark:text-white" placeholder="Enter event name" placeholderTextColor="#94a3b8" />

        <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</Text>
        <TextInput className="h-32 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-3 mb-4 text-slate-900 dark:text-white" placeholder="Tell us more" placeholderTextColor="#94a3b8" multiline textAlignVertical="top" />

        <View className="flex-row justify-between items-center mt-4 mb-4">
          <Text className="text-lg font-bold text-slate-900 dark:text-white">Tickets</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SeatMapDesigner')} className="flex-row items-center">
            <MaterialIcons name="map" size={18} color="#136dec" />
            <Text className="text-[#136dec] font-medium ml-1">Seat Map</Text>
          </TouchableOpacity>
        </View>

        <View className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-4 mb-4">
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ticket Name</Text>
          <TextInput className="h-12 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 mb-4 text-slate-900 dark:text-white" value="VIP" />
          
          <View className="flex-row gap-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Price</Text>
              <TextInput className="h-12 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 text-slate-900 dark:text-white" value="99.00" keyboardType="numeric" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Quantity</Text>
              <TextInput className="h-12 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 text-slate-900 dark:text-white" value="50" keyboardType="numeric" />
            </View>
          </View>
        </View>
        
        <TouchableOpacity className="h-12 flex-row items-center justify-center rounded-lg bg-[#136dec]/10 mb-8">
          <MaterialIcons name="add-circle" size={20} color="#136dec" />
          <Text className="text-[#136dec] font-bold ml-2">Add New Ticket Type</Text>
        </TouchableOpacity>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 flex-row p-4 bg-white dark:bg-[#101822] border-t border-slate-200 dark:border-slate-800">
        <TouchableOpacity className="flex-1 h-12 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 mr-2">
          <Text className="font-bold text-slate-800 dark:text-white">Save Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('MyEvents')} className="flex-1 h-12 items-center justify-center rounded-lg bg-[#136dec] ml-2">
          <Text className="font-bold text-white">Publish Event</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
