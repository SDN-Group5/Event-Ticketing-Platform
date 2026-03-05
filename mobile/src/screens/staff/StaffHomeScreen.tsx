import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function StaffScreen({ navigation }: any) {
  const { logout } = useAuth();

  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center justify-between p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <View>
          <Text className="text-sm text-[#b388ff]">Welcome back,</Text>
          <Text className="text-xl font-bold text-white">Staff Member</Text>
        </View>
        <TouchableOpacity onPress={() => void logout()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="logout" size={20} color="#ff1744" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <View className="bg-[#1a0033] rounded-3xl p-6 border border-[#4d0099] mb-6 shadow-[0_0_15px_rgba(213,0,249,0.2)]">
          <Text className="text-lg font-bold text-white mb-4">Quick Actions</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity 
              onPress={() => navigation.navigate('ScanTicket')}
              className="flex-1 bg-[#d500f9] rounded-2xl p-4 items-center justify-center mr-2 shadow-[0_0_15px_rgba(213,0,249,0.4)]"
            >
              <MaterialIcons name="qr-code-scanner" size={32} color="white" />
              <Text className="text-white font-bold mt-2 text-center">Scan Ticket</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => navigation.navigate('MyEvents')}
              className="flex-1 bg-[#2a004d] border border-[#d500f9] rounded-2xl p-4 items-center justify-center ml-2"
            >
              <MaterialIcons name="event-note" size={32} color="#00e5ff" />
              <Text className="text-[#00e5ff] font-bold mt-2 text-center">Manage Events</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text className="text-lg font-bold text-white mb-4">Today's Event</Text>
        <View className="bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 mb-6">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-white font-bold text-lg">Summer Music Fest</Text>
              <Text className="text-[#b388ff] text-sm">Central Park Arena</Text>
            </View>
            <View className="bg-[#00e5ff]/20 px-2 py-1 rounded-md border border-[#00e5ff]/50">
              <Text className="text-[#00e5ff] text-xs font-bold">LIVE</Text>
            </View>
          </View>
          
          <View className="flex-row justify-between border-t border-[#4d0099] pt-4">
            <View className="items-center">
              <Text className="text-[#b388ff] text-xs mb-1">Checked In</Text>
              <Text className="text-white font-bold text-xl">842</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#b388ff] text-xs mb-1">Total Tickets</Text>
              <Text className="text-white font-bold text-xl">1,200</Text>
            </View>
            <View className="items-center">
              <Text className="text-[#b388ff] text-xs mb-1">Remaining</Text>
              <Text className="text-[#d500f9] font-bold text-xl">358</Text>
            </View>
          </View>
        </View>

        <Text className="text-lg font-bold text-white mb-4">Recent Scans</Text>
        {[1, 2, 3].map((item) => (
          <View key={item} className="bg-[#1a0033] border border-[#4d0099] rounded-xl p-4 mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#00e5ff]/20 rounded-full items-center justify-center mr-3">
                <MaterialIcons name="check" size={20} color="#00e5ff" />
              </View>
              <View>
                <Text className="text-white font-bold">Ticket #EVX-{982374 - item}</Text>
                <Text className="text-[#b388ff] text-xs">VIP Pass • John Doe</Text>
              </View>
            </View>
            <Text className="text-[#6a1b9a] text-xs">Just now</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
