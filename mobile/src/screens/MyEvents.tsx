import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function MyEvents({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#f7f5f8] dark:bg-[#1c1022]">
      {/* Top App Bar */}
      <View className="flex-row items-center justify-between bg-[#f7f5f8]/90 p-4 pb-3">
        <TouchableOpacity onPress={() => navigation.navigate('SecuritySettings')} className="h-10 w-10 items-center justify-center">
          <Image
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDvTfc_KT_lUMS2IlDVZ3VYVyDa7l3cC9NGWvdnKPxOhYQ1p5pkVtEl0xLA1IcePlO_vADS_TOKAtT99Pv5gEoSGP1tyxt7h6qJTKip2Xdszm44KvI12JKtoBlB7LWzXMRag8whA1hXpRyFAKdUBvQAxQ8g9xA0tFODOtbWw1RNVRHEewJpKA5xQCajr2P1zPd8F4ViWOEeZDgqxmT_5ANTkhX3hgIES11SYhyyghSPPRH90iygfvy9uDPsYYqRTl28oKpLERdfT5RK' }}
            className="h-8 w-8 rounded-full"
          />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-slate-900 dark:text-white">My Events</Text>
        <View className="h-10 w-10" />
      </View>

      {/* Main Content: Event List */}
      <ScrollView className="flex-1 px-4 py-2">
        {/* Card: Selling */}
        <TouchableOpacity className="w-full rounded-2xl bg-white p-4 dark:bg-white/5 mb-4">
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkIhUb1GjhsjU5Zm-vIxvNnjKmbajJ24V-McNfx348vGoncZi9ncpXfnJsgJhiNVFC-Cgxbet168ociT-x9-whsxZq_X72CPmSSb-ihTE5cdAkW1gi2_iXwi0PPguTGNGvcpdeD6kwnN3yp54tSNgWI4iXSFjYd_eo8jMi1rNfHps8PZJ6L8xQUG0u_pcRSnWiOJvQ8KbgeauEuGjhEjpmWRlDyQRJ2SIHbQGIsYwh-NEVZzcLWLscaEA-PELe2x7qRNANwJuYJUWM' }}
            className="mb-3 w-full h-40 rounded-xl overflow-hidden"
          />
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-bold text-slate-900 dark:text-white">Summer Music Festival 2024</Text>
            <View className="rounded-full bg-[#a60df2]/20 px-3 py-1">
              <Text className="text-xs font-medium text-[#a60df2]">Selling</Text>
            </View>
          </View>
          <Text className="text-sm text-slate-600 dark:text-slate-400">Aug 15, 2024 • 7:00 PM</Text>
        </TouchableOpacity>

        {/* Card: Draft */}
        <TouchableOpacity className="w-full rounded-2xl bg-white p-4 dark:bg-white/5 mb-4">
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCWGt_ADPNCvDvnlKmHJavptgLb1f16RthgnYX-j1OToVH8y-X4TCR6Hr9q7AsO9KVp4O0rqIzrGQBuCf09nKfVB9ordEc9p_oDH0r633T5eGxUJ7HNGqvEV8OQB69sJkHAYNQOJ-Rcne7Y_sDhrH9q4Sd68jNdoPdkmqEA8pESEcBkxOF9IEIAO3ZadJvNyAVMJkMtj1EheaMH3okWfrYTIvEyFBDHPEw_uxjj6bG9Ot3xcb-0NtuoKG1138aHe5ybwx1Hox1U4gyi' }}
            className="mb-3 w-full h-40 rounded-xl overflow-hidden"
          />
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-bold text-slate-900 dark:text-white">Tech Conference 2024</Text>
            <View className="rounded-full bg-slate-200 dark:bg-slate-700 px-3 py-1">
              <Text className="text-xs font-medium text-slate-600 dark:text-slate-300">Draft</Text>
            </View>
          </View>
          <Text className="text-sm text-slate-600 dark:text-slate-400">Sep 20, 2024 • 9:00 AM</Text>
        </TouchableOpacity>

        {/* Card: Ended */}
        <TouchableOpacity className="w-full rounded-2xl bg-white p-4 dark:bg-white/5 mb-24">
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJaL3797ybnCWsEI3i4eBmupBB0Hnd0f4HUOG29VDIaNnb9SzEOywroYK-00Fqv5c-6841bx79Iv5YSZlwemiS4uyOax2DaelstbJ73efIvb-uipeXZ-YPxisJ9HxWddkciuSc0-Ap4RF_e9wsHN2p8UalxQfoHpwYN6jcO03eaIlgq-qtiJSVXklUJYMYNY0ocmEze7LwiukKTIgnUJwJiIkNLqulT2zFJlzV9e3SzaB11Xs7TC4EWgalHcS074zPkZ3pvRLbzkUm' }}
            className="mb-3 w-full h-40 rounded-xl overflow-hidden"
          />
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-lg font-bold text-slate-900 dark:text-white">Community Charity Run</Text>
            <View className="rounded-full bg-red-100 dark:bg-red-900/40 px-3 py-1">
              <Text className="text-xs font-medium text-red-700 dark:text-red-300">Ended</Text>
            </View>
          </View>
          <Text className="text-sm text-slate-600 dark:text-slate-400">Jun 05, 2024 • 8:00 AM</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FAB */}
      <View className="absolute bottom-6 right-6">
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateEvent')}
          className="h-14 w-14 items-center justify-center rounded-full bg-[#a60df2] shadow-lg"
        >
          <MaterialIcons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
