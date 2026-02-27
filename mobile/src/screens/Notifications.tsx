import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Notifications({ navigation }: any) {
  const notifications = [
    { id: 1, title: 'Ticket Confirmed', message: 'Your VIP pass for Summer Music Fest is ready.', time: '2h ago', icon: 'check-circle', color: '#00e5ff', read: false },
    { id: 2, title: 'Event Reminder', message: 'Tech Conference 2024 starts tomorrow at 9 AM.', time: '1d ago', icon: 'event', color: '#d500f9', read: true },
    { id: 3, title: 'Special Offer', message: 'Get 20% off your next booking with code NEON20.', time: '2d ago', icon: 'local-offer', color: '#ff007f', read: true },
    { id: 4, title: 'Venue Changed', message: 'The venue for Jazz Night has been updated.', time: '3d ago', icon: 'location-on', color: '#ffea00', read: true },
  ];

  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Notifications</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4">
        {notifications.map((notif) => (
          <TouchableOpacity 
            key={notif.id} 
            className={`flex-row items-start p-4 mb-3 rounded-2xl border ${notif.read ? 'bg-[#1a0033] border-[#4d0099]' : 'bg-[#2a004d] border-[#d500f9] shadow-[0_0_10px_rgba(213,0,249,0.2)]'}`}
          >
            <View className={`w-12 h-12 rounded-full items-center justify-center mr-4`} style={{ backgroundColor: `${notif.color}20` }}>
              <MaterialIcons name={notif.icon as any} size={24} color={notif.color} />
            </View>
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1">
                <Text className={`font-bold text-base ${notif.read ? 'text-white' : 'text-[#d500f9]'}`}>{notif.title}</Text>
                <Text className="text-xs text-[#6a1b9a]">{notif.time}</Text>
              </View>
              <Text className="text-sm text-[#b388ff] leading-5">{notif.message}</Text>
            </View>
            {!notif.read && (
              <View className="w-3 h-3 bg-[#00e5ff] rounded-full absolute top-4 right-4 shadow-[0_0_8px_#00e5ff]" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}