import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function MyTickets({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#f7f5f8] dark:bg-[#1c1022]">
      <View className="flex-row items-center p-4 border-b border-slate-200 dark:border-slate-800">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-12">
          <MaterialIcons name="arrow-back" size={24} color="#a60df2" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white pr-12">My Tickets</Text>
      </View>

      <View className="flex-row p-4 gap-4">
        <TouchableOpacity className="flex-1 pb-2 border-b-2 border-[#a60df2] items-center">
          <Text className="font-bold text-[#a60df2]">Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 pb-2 border-b-2 border-transparent items-center">
          <Text className="font-bold text-slate-500">Past Events</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4">
        <TouchableOpacity 
          onPress={() => navigation.navigate('TicketDetail')}
          className="w-full bg-white dark:bg-[#a60df2]/5 border border-slate-200 dark:border-[#a60df2]/20 rounded-2xl overflow-hidden mb-4 flex-row"
        >
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkIhUb1GjhsjU5Zm-vIxvNnjKmbajJ24V-McNfx348vGoncZi9ncpXfnJsgJhiNVFC-Cgxbet168ociT-x9-whsxZq_X72CPmSSb-ihTE5cdAkW1gi2_iXwi0PPguTGNGvcpdeD6kwnN3yp54tSNgWI4iXSFjYd_eo8jMi1rNfHps8PZJ6L8xQUG0u_pcRSnWiOJvQ8KbgeauEuGjhEjpmWRlDyQRJ2SIHbQGIsYwh-NEVZzcLWLscaEA-PELe2x7qRNANwJuYJUWM' }}
            className="w-24 h-full"
          />
          <View className="flex-1 p-4">
            <Text className="text-xs text-[#a60df2] font-bold mb-1">AUG 15 • 7:00 PM</Text>
            <Text className="text-base font-bold text-slate-900 dark:text-white mb-1" numberOfLines={1}>Summer Music Fest</Text>
            <Text className="text-sm text-slate-500 mb-3">Central Park Arena</Text>
            <View className="flex-row items-center">
              <MaterialIcons name="confirmation-number" size={16} color="#94a3b8" />
              <Text className="text-xs text-slate-500 ml-1">1x General Admission</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="w-full bg-white dark:bg-[#a60df2]/5 border border-slate-200 dark:border-[#a60df2]/20 rounded-2xl overflow-hidden mb-4 flex-row">
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWGt_ADPNCvDvnlKmHJavptgLb1f16RthgnYX-j1OToVH8y-X4TCR6Hr9q7AsO9KVp4O0rqIzrGQBuCf09nKfVB9ordEc9p_oDH0r633T5eGxUJ7HNGqvEV8OQB69sJkHAYNQOJ-Rcne7Y_sDhrH9q4Sd68jNdoPdkmqEA8pESEcBkxOF9IEIAO3ZadJvNyAVMJkMtj1EheaMH3okWfrYTIvEyFBDHPEw_uxjj6bG9Ot3xcb-0NtuoKG1138aHe5ybwx1Hox1U4gyi' }}
            className="w-24 h-full"
          />
          <View className="flex-1 p-4">
            <Text className="text-xs text-[#a60df2] font-bold mb-1">SEP 20 • 9:00 AM</Text>
            <Text className="text-base font-bold text-slate-900 dark:text-white mb-1" numberOfLines={1}>Tech Conference</Text>
            <Text className="text-sm text-slate-500 mb-3">Moscone Center</Text>
            <View className="flex-row items-center">
              <MaterialIcons name="confirmation-number" size={16} color="#94a3b8" />
              <Text className="text-xs text-slate-500 ml-1">2x VIP Pass</Text>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}