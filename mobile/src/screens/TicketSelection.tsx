import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { EventLayout, LayoutAPI, LayoutZone } from '../services/layoutApiService';

function getZoneCapacityText(z: LayoutZone): string | null {
  if (z.type === 'seats') {
    const total = z.seatMetadata?.totalSeats;
    if (Number.isFinite(Number(total)) && Number(total) > 0) return `${total} seats`;
    const rows = Number(z.rows || 0);
    const cols = Number(z.seatsPerRow || 0);
    if (rows > 0 && cols > 0) return `${rows * cols} seats`;
  }
  return null;
}

export default function TicketSelection({ navigation, route }: any) {
  const eventId = route?.params?.eventId as string | undefined;
  const [quantity, setQuantity] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<
    {
      seatId: string;
      seatLabel: string;
      price: number;
      row: number;
      seatNumber: number;
      zoneId: string;
    }[]
  >([]);
  const [layout, setLayout] = useState<EventLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!eventId) {
        setError('Thiếu eventId');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await LayoutAPI.getLayoutByEvent(eventId);
        if (!isMounted) return;
        setLayout(data);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Không tải được layout');
        setLayout(null);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }
    void load();
    return () => {
      isMounted = false;
    };
  }, [eventId]);

  // Nhận selectedSeats từ SeatMapDesigner
  useEffect(() => {
    const incoming = route?.params?.selectedSeats as
      | {
          seatId: string;
          seatLabel: string;
          price: number;
          row: number;
          seatNumber: number;
          zoneId: string;
        }[]
      | undefined;

    if (incoming && incoming.length > 0) {
      setSelectedSeats(incoming);
      setQuantity(incoming.length);
    }
  }, [route?.params?.selectedSeats]);

  const sellableZones = useMemo(() => {
    const zones = layout?.zones || [];
    return zones.filter((z) => (z.type === 'seats' || z.type === 'standing') && Number(z.price || 0) > 0);
  }, [layout?.zones]);

  const selectedZone = useMemo(() => sellableZones.find((z) => z.id === selectedZoneId) || null, [sellableZones, selectedZoneId]);

  const total = useMemo(() => {
    if (selectedSeats.length > 0) {
      return selectedSeats.reduce((sum, s) => sum + Number(s.price || 0), 0);
    }
    const price = Number(selectedZone?.price || 0);
    return price * quantity;
  }, [selectedZone?.price, quantity, selectedSeats]);

  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Select Tickets</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {loading ? (
          <View className="py-10 items-center justify-center">
            <ActivityIndicator />
            <Text className="text-[#b388ff] mt-3 font-bold">Đang tải khu vực vé...</Text>
          </View>
        ) : error ? (
          <View className="py-10 items-center justify-center">
            <Text className="text-red-400 font-bold text-center">{error}</Text>
          </View>
        ) : sellableZones.length === 0 ? (
          <View className="py-10 items-center justify-center">
            <Text className="text-[#b388ff] font-bold">Sự kiện chưa có zone bán vé</Text>
          </View>
        ) : (
          sellableZones.map((z) => {
            const isSelected = z.id === selectedZoneId;
            const cap = getZoneCapacityText(z);
            return (
              <TouchableOpacity
                key={z.id}
                onPress={() => {
                  setSelectedZoneId(z.id);
                  setSelectedSeats([]);
                }}
                className={`bg-[#1a0033] border rounded-3xl p-5 mb-4 ${isSelected ? 'border-[#d500f9]' : 'border-[#4d0099]'} ${isSelected ? 'shadow-[0_0_15px_rgba(213,0,249,0.2)]' : ''}`}
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 mr-4">
                    <Text className="text-xl font-bold text-white">{z.name}</Text>
                    <Text className="text-sm text-[#b388ff]">
                      {z.type === 'seats' ? 'Seated zone' : 'Standing zone'}
                      {cap ? ` • ${cap}` : ''}
                    </Text>
                  </View>
                  <Text className="text-2xl font-bold text-[#00e5ff]">${Number(z.price || 0).toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        
        <TouchableOpacity 
          onPress={() => {
            if (!eventId || !selectedZone) return;
            navigation.navigate('SeatMapDesigner', {
              eventId,
              zoneId: selectedZone.id,
              zoneName: selectedZone.name,
            });
          }}
          className="bg-[#2a004d] border border-[#d500f9]/50 rounded-2xl p-4 mt-4 flex-row items-center justify-center"
        >
          <MaterialIcons name="event-seat" size={24} color="#00e5ff" />
          <Text className="text-[#00e5ff] font-bold text-lg ml-2">Choose on Map</Text>
        </TouchableOpacity>
      </ScrollView>

      <View className="p-6 bg-[#1a0033] border-t border-[#4d0099] rounded-t-3xl">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[#b388ff] font-bold text-lg">Total ({quantity} tickets)</Text>
          <Text className="text-3xl font-black text-[#00e5ff]">${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => {
            if (!layout || !eventId || !selectedZone) return;
            const organizerId = layout.createdBy;
            if (!organizerId) {
              setError('Sự kiện thiếu organizerId (createdBy)');
              return;
            }
            navigation.navigate('Checkout', {
              orderDraft: {
                eventId,
                eventName: layout.eventName,
                organizerId,
                zoneId: selectedZone.id,
                zoneName: selectedZone.name,
                price: Number(selectedZone.price || 0),
                quantity,
                selectedSeats,
              },
            });
          }}
          disabled={!selectedZone || loading || !!error}
          className={`w-full bg-[#d500f9] h-14 rounded-2xl items-center justify-center shadow-[0_0_20px_rgba(213,0,249,0.4)] ${!selectedZone || loading || !!error ? 'opacity-50' : ''}`}
        >
          <Text className="text-white font-bold text-lg tracking-wide">Continue to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}