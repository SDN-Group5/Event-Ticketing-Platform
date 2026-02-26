import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function MyTickets({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="px-4 pt-12 pb-4 bg-[#1a0033] border-b border-[#4d0099]">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-white">My Tickets</Text>
          <TouchableOpacity className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
            <MaterialIcons name="history" size={24} color="#d500f9" />
          </TouchableOpacity>
        </View>
        
        <View className="flex-row mt-6 bg-[#2a004d] p-1 rounded-xl border border-[#4d0099]">
          <TouchableOpacity className="flex-1 bg-[#d500f9] py-2 rounded-lg items-center shadow-[0_0_10px_#d500f9]">
            <Text className="text-white font-bold">Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 py-2 rounded-lg items-center">
            <Text className="text-[#b388ff] font-bold">Past Events</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <TouchableOpacity 
          onPress={() => navigation.navigate('TicketDetail')}
          className="w-full bg-[#1a0033] border border-[#4d0099] rounded-3xl overflow-hidden mb-6"
        >
          <ImageBackground
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkIhUb1GjhsjU5Zm-vIxvNnjKmbajJ24V-McNfx348vGoncZi9ncpXfnJsgJhiNVFC-Cgxbet168ociT-x9-whsxZq_X72CPmSSb-ihTE5cdAkW1gi2_iXwi0PPguTGNGvcpdeD6kwnN3yp54tSNgWI4iXSFjYd_eo8jMi1rNfHps8PZJ6L8xQUG0u_pcRSnWiOJvQ8KbgeauEuGjhEjpmWRlDyQRJ2SIHbQGIsYwh-NEVZzcLWLscaEA-PELe2x7qRNANwJuYJUWM' }}
            className="w-full h-32 justify-end p-4"
          >
            <View className="bg-[#0a0014]/80 px-3 py-1 rounded-lg self-start border border-[#d500f9]/50">
              <Text className="text-[#d500f9] font-bold text-xs uppercase">Music Festival</Text>
            </View>
          </ImageBackground>
          
          <View className="p-4 relative">
            <View className="absolute -top-6 right-4 w-12 h-12 bg-[#d500f9] rounded-full items-center justify-center border-4 border-[#1a0033] shadow-[0_0_10px_#d500f9]">
              <MaterialIcons name="qr-code-2" size={24} color="white" />
            </View>
            
            <Text className="text-xl font-bold text-white mb-2 pr-12">Summer Music Festival 2024</Text>
            
            <View className="flex-row items-center mb-4">
              <MaterialIcons name="calendar-today" size={16} color="#b388ff" />
              <Text className="text-sm text-[#b388ff] ml-2">Aug 15, 2024 • 4:00 PM</Text>
            </View>
            
            <View className="flex-row items-center mb-4">
              <MaterialIcons name="location-on" size={16} color="#b388ff" />
              <Text className="text-sm text-[#b388ff] ml-2">Central Park Arena, NY</Text>
            </View>

            <View className="border-t border-dashed border-[#4d0099] pt-4 flex-row justify-between">
              <View>
                <Text className="text-xs text-[#b388ff]">Ticket Type</Text>
                <Text className="text-base font-bold text-white">VIP Pass</Text>
              </View>
              <View>
                <Text className="text-xs text-[#b388ff]">Seat</Text>
                <Text className="text-base font-bold text-white">A1, A2</Text>
              </View>
              <View>
                <Text className="text-xs text-[#b388ff]">Quantity</Text>
                <Text className="text-base font-bold text-[#00e5ff]">2 Tickets</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
