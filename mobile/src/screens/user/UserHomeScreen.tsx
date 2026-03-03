import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function UserScreen({ navigation }: any) {
  const { signOut } = useAuth();

  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center justify-between p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full border-2 border-[#d500f9] overflow-hidden mr-3">
            <ImageBackground 
              source={{ uri: 'https://i.pravatar.cc/150?img=68' }} 
              className="w-full h-full"
            />
          </View>
          <View>
            <Text className="text-sm text-[#b388ff]">Hello,</Text>
            <Text className="text-xl font-bold text-white">Alex Johnson</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="notifications-none" size={24} color="#d500f9" />
          <View className="absolute top-2 right-2 w-2 h-2 bg-[#00e5ff] rounded-full shadow-[0_0_8px_#00e5ff]" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {/* Quick Actions */}
        <View className="flex-row justify-between mb-8">
          <TouchableOpacity 
            onPress={() => navigation.navigate('Explore')}
            className="flex-1 bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 items-center justify-center mr-2 shadow-[0_0_15px_rgba(213,0,249,0.2)]"
          >
            <MaterialIcons name="explore" size={32} color="#d500f9" />
            <Text className="text-white font-bold mt-2">Discover</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('MyTickets')}
            className="flex-1 bg-[#2a004d] border border-[#00e5ff]/50 rounded-2xl p-4 items-center justify-center ml-2 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
          >
            <MaterialIcons name="local-activity" size={32} color="#00e5ff" />
            <Text className="text-white font-bold mt-2">My Tickets</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Event */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold text-white">Up Next</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyTickets')}>
            <Text className="text-sm font-bold text-[#d500f9]">View All</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => navigation.navigate('TicketDetail')}
          className="w-full bg-[#1a0033] border border-[#d500f9] rounded-3xl overflow-hidden mb-8 shadow-[0_0_20px_rgba(213,0,249,0.3)]"
        >
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070&auto=format&fit=crop' }}
            className="w-full h-32 justify-end p-4"
          >
            <View className="bg-[#0a0014]/80 px-3 py-1 rounded-lg self-start border border-[#d500f9]/50">
              <Text className="text-[#d500f9] font-bold text-xs uppercase tracking-wider">Tomorrow</Text>
            </View>
          </ImageBackground>
          
          <View className="p-4 relative">
            <View className="absolute -top-6 right-4 w-12 h-12 bg-[#00e5ff] rounded-full items-center justify-center border-4 border-[#1a0033] shadow-[0_0_10px_#00e5ff]">
              <MaterialIcons name="qr-code-2" size={24} color="#0a0014" />
            </View>
            
            <Text className="text-xl font-bold text-white mb-2 pr-12">Summer Music Festival</Text>
            
            <View className="flex-row items-center mb-2">
              <MaterialIcons name="access-time" size={16} color="#b388ff" />
              <Text className="text-sm text-[#b388ff] ml-2">7:00 PM</Text>
            </View>
            
            <View className="flex-row items-center">
              <MaterialIcons name="location-on" size={16} color="#b388ff" />
              <Text className="text-sm text-[#b388ff] ml-2">Central Park Arena, NY</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Recommended for You */}
        <Text className="text-lg font-bold text-white mb-4">Recommended</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8">
          {[1, 2, 3].map((item) => (
            <TouchableOpacity 
              key={item}
              onPress={() => navigation.navigate('EventDetail')}
              className="w-48 bg-[#1a0033] border border-[#4d0099] rounded-2xl overflow-hidden mr-4"
            >
              <ImageBackground
                source={{ uri: item === 1 ? 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1974&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop' }}
                className="w-full h-32 justify-between p-3"
              >
                <View className="bg-[#0a0014]/80 w-8 h-8 rounded-full items-center justify-center border border-[#d500f9]/50 self-end">
                  <MaterialIcons name="favorite-border" size={16} color="#d500f9" />
                </View>
              </ImageBackground>
              <View className="p-3">
                <Text className="text-white font-bold mb-1" numberOfLines={1}>Neon Nights Party</Text>
                <Text className="text-[#00e5ff] font-bold text-sm">$45.00</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}
