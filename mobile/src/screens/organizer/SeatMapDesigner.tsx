import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SeatAPI, SeatData } from '../../services/seatApiService';

export default function SeatMapDesigner({ navigation, route }: any) {
  const eventId = route?.params?.eventId as string | undefined;
  const zoneId = route?.params?.zoneId as string | undefined;
  const zoneName = route?.params?.zoneName as string | undefined;

  const [seats, setSeats] = useState<SeatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!eventId || !zoneId) {
        setError('Thiếu eventId hoặc zoneId');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const res = await SeatAPI.getSeatsByZone(eventId, zoneId, { limit: 500 });
        if (!isMounted) return;
        setSeats(res.seats || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Không tải được danh sách ghế');
        setSeats([]);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [eventId, zoneId]);

  const seatsByRow = useMemo(() => {
    const rows = new Map<number, SeatData[]>();
    seats.forEach((seat) => {
      const list = rows.get(seat.row) || [];
      list.push(seat);
      rows.set(seat.row, list);
    });
    return Array.from(rows.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([row, list]) => ({
        row,
        seats: list.sort((a, b) => a.seatNumber - b.seatNumber),
      }));
  }, [seats]);

  const toggleSeat = (seat: SeatData) => {
    if (seat.status !== 'available') return;
    setSelectedSeatIds((prev) =>
      prev.includes(seat._id) ? prev.filter((id) => id !== seat._id) : [...prev, seat._id],
    );
  };

  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">
          Seat Map{zoneName ? ` • ${zoneName}` : ''}
        </Text>
      </View>

      <View className="flex-1 items-center justify-center p-6">
        <View className="w-full h-24 bg-[#1a0033] border-b-4 border-[#00e5ff] rounded-t-[100px] items-center justify-center mb-12 shadow-[0_10px_30px_rgba(0,229,255,0.2)]">
          <Text className="text-[#00e5ff] font-black tracking-widest uppercase text-xl">Stage</Text>
        </View>

        {loading ? (
          <View className="items-center justify-center">
            <ActivityIndicator />
            <Text className="text-[#b388ff] mt-3 font-bold">Đang tải sơ đồ ghế...</Text>
          </View>
        ) : error ? (
          <View className="items-center justify-center">
            <Text className="text-red-400 font-bold text-center">{error}</Text>
          </View>
        ) : seats.length === 0 ? (
          <View className="items-center justify-center">
            <Text className="text-[#b388ff] font-bold text-center">Zone này chưa có ghế nào.</Text>
          </View>
        ) : (
          <ScrollView className="w-full" contentContainerStyle={{ paddingVertical: 8 }}>
            {seatsByRow.map(({ row, seats: rowSeats }) => (
              <View key={row} className="flex-row justify-center mb-3">
                {rowSeats.map((seat) => {
                  const isSelected = selectedSeatIds.includes(seat._id);
                  const isTaken =
                    seat.status === 'sold' ||
                    seat.status === 'blocked' ||
                    seat.status === 'reserved';

                  const baseClass = 'w-10 h-10 mx-1 rounded-xl items-center justify-center border';
                  let colorClass = '';
                  if (isSelected) {
                    colorClass =
                      ' bg-[#d500f9] border-[#d500f9] shadow-[0_0_10px_rgba(213,0,249,0.5)]';
                  } else if (isTaken) {
                    colorClass = ' bg-[#2a004d] border-[#4d0099] opacity-60';
                  } else {
                    colorClass = ' bg-[#1a0033] border-[#00e5ff]';
                  }

                  const textClass =
                    isSelected || !isTaken ? ' text-[#00e5ff]' : ' text-[#6a1b9a]';

                  return (
                    <TouchableOpacity
                      key={seat._id}
                      onPress={() => toggleSeat(seat)}
                      disabled={isTaken}
                      className={baseClass + colorClass}
                    >
                      <Text className={'font-bold text-xs' + textClass}>{seat.seatNumber}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View className="p-6 bg-[#1a0033] border-t border-[#4d0099] rounded-t-3xl">
        <View className="flex-row justify-between mb-6">
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-[#1a0033] border border-[#00e5ff] rounded mr-2" />
            <Text className="text-[#b388ff] text-sm">Available</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-[#d500f9] rounded mr-2 shadow-[0_0_5px_rgba(213,0,249,0.5)]" />
            <Text className="text-white text-sm">Selected</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-[#2a004d] border border-[#4d0099] rounded mr-2" />
            <Text className="text-[#6a1b9a] text-sm">Taken</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => {
            if (!eventId || !zoneId) {
              navigation.goBack();
              return;
            }
            const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s._id));
            navigation.navigate('TicketSelection', {
              eventId,
              zoneId,
              zoneName,
              selectedSeats: selectedSeats.map((s) => ({
                seatId: s._id,
                seatLabel: s.seatLabel,
                price: s.price,
                row: s.row,
                seatNumber: s.seatNumber,
                zoneId: s.zoneId,
              })),
            });
          }}
          className="w-full bg-[#d500f9] h-14 rounded-2xl items-center justify-center shadow-[0_0_20px_rgba(213,0,249,0.4)]"
        >
          <Text className="text-white font-bold text-lg tracking-wide">Confirm Selection</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
