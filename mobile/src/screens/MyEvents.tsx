import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LayoutAPI, EventLayout } from '../services/layoutApiService';
import { useAuth } from '../context/AuthContext';

export default function MyEvents({ navigation }: any) {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventLayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await LayoutAPI.listLayouts();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('MyEvents load error:', err);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return { day: '--', month: '---' };
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { day: '--', month: '---' };
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      day: date.getDate().toString(),
      month: months[date.getMonth()].toUpperCase(),
    };
  };

  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="px-4 pt-12 pb-4 bg-[#1a0033] border-b border-[#4d0099]">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099] mr-3"
            >
              <MaterialIcons name="arrow-back" size={22} color="#d500f9" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-white">Manage Events</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('CreateEvent')}
            className="w-10 h-10 bg-[#d500f9] rounded-full items-center justify-center shadow-[0_0_10px_#d500f9]"
          >
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
          <Text className="flex-1 text-2xl font-bold text-white">Manage Events</Text>
          {user?.role === 'organizer' || user?.role === 'admin' ? (
            <TouchableOpacity 
              onPress={() => navigation.navigate('CreateEvent')}
              className="w-10 h-10 bg-[#d500f9] rounded-full items-center justify-center shadow-[0_0_10px_#d500f9]"
            >
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          ) : (
            <View className="w-10" /> // Spacer to keep title centered if needed, or just leave empty
          )}
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="text-lg font-bold text-white mb-4">Active Events</Text>
        
        {loading ? (
          <ActivityIndicator color="#d500f9" className="mt-10" />
        ) : events.length === 0 ? (
          <View className="items-center mt-10">
            <Text className="text-[#b388ff]">No events found</Text>
          </View>
        ) : (
          events.map((event) => {
            const { day, month } = formatDate(event.eventDate);
            return (
              <TouchableOpacity 
                key={event.eventId} 
                className="bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 mb-4 flex-row items-center"
              >
                <View className="w-16 h-16 bg-[#2a004d] rounded-xl items-center justify-center border border-[#4d0099]">
                  <Text className="text-[#d500f9] font-bold text-lg">{day}</Text>
                  <Text className="text-[#b388ff] text-xs uppercase">{month}</Text>
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>{event.eventName}</Text>
                  <Text className="text-[#b388ff] text-sm" numberOfLines={1}>{event.eventLocation}</Text>
                  <View className="flex-row items-center mt-2">
                    <View className="bg-[#00e5ff]/20 px-2 py-1 rounded-md">
                      <Text className="text-[#00e5ff] text-xs font-bold">Active</Text>
                    </View>
                    <Text className="text-[#b388ff] text-xs ml-3">{event.zones?.length || 0} Zones</Text>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#b388ff" />
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
