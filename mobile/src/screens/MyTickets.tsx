import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { PaymentAPI } from '../services/paymentApiService';

export default function MyTickets({ navigation }: any) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (authLoading) return;
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        setOrders([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await PaymentAPI.getUserOrders(user.id);
        if (!isMounted) return;
        setOrders(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Không tải được danh sách vé');
        setOrders([]);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated, user?.id]);

  const visibleOrders = useMemo(() => {
    // Hiện tại backend chưa trả eventDate để phân loại upcoming/past,
    // nên tạm thời hiển thị tất cả theo 2 tab (giữ UI).
    return orders;
  }, [orders, tab]);

  const renderStatus = (status: string) => {
    if (status === 'paid') return { text: 'Paid', cls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' };
    if (status === 'refunded') return { text: 'Refunded', cls: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' };
    return { text: status || 'Unknown', cls: 'bg-amber-500/10 text-amber-400 border border-amber-500/20' };
  };

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
          <TouchableOpacity
            onPress={() => setTab('upcoming')}
            className={`flex-1 py-2 rounded-lg items-center ${tab === 'upcoming' ? 'bg-[#d500f9] shadow-[0_0_10px_#d500f9]' : ''}`}
          >
            <Text className={`${tab === 'upcoming' ? 'text-white' : 'text-[#b388ff]'} font-bold`}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab('past')}
            className={`flex-1 py-2 rounded-lg items-center ${tab === 'past' ? 'bg-[#d500f9] shadow-[0_0_10px_#d500f9]' : ''}`}
          >
            <Text className={`${tab === 'past' ? 'text-white' : 'text-[#b388ff]'} font-bold`}>Past Events</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        {authLoading || loading ? (
          <View className="py-10 items-center justify-center">
            <ActivityIndicator />
            <Text className="text-[#b388ff] mt-3 font-bold">Đang tải vé...</Text>
          </View>
        ) : !isAuthenticated ? (
          <View className="py-10 items-center justify-center">
            <Text className="text-[#b388ff] font-bold mb-4 text-center">Bạn cần đăng nhập để xem vé</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="bg-[#d500f9] px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-bold">Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        ) : error ? (
          <View className="py-10 items-center justify-center">
            <Text className="text-red-400 font-bold text-center">{error}</Text>
          </View>
        ) : visibleOrders.length === 0 ? (
          <View className="py-10 items-center justify-center">
            <Text className="text-[#b388ff] font-bold">Chưa có vé nào</Text>
          </View>
        ) : (
          visibleOrders.map((o) => {
            const items = Array.isArray(o.items) ? o.items : [];
            const first = items[0];
            const qty = items.reduce((s: number, it: any) => s + Number(it.quantity || 1), 0);
            const s = renderStatus(String(o.status || ''));
            return (
              <TouchableOpacity
                key={String(o._id || o.orderCode)}
                onPress={() => navigation.navigate('TicketDetail', { orderCode: o.orderCode })}
                className="w-full bg-[#1a0033] border border-[#4d0099] rounded-3xl overflow-hidden mb-6"
              >
                <ImageBackground
                  source={{ uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30' }}
                  className="w-full h-32 justify-end p-4"
                >
                  <View className={`px-3 py-1 rounded-lg self-start ${s.cls}`}>
                    <Text className="font-bold text-xs uppercase">{s.text}</Text>
                  </View>
                </ImageBackground>

                <View className="p-4 relative">
                  <View className="absolute -top-6 right-4 w-12 h-12 bg-[#d500f9] rounded-full items-center justify-center border-4 border-[#1a0033] shadow-[0_0_10px_#d500f9]">
                    <MaterialIcons name="qr-code-2" size={24} color="white" />
                  </View>

                  <Text className="text-xl font-bold text-white mb-2 pr-12">{o.eventName || 'Event'}</Text>

                  <View className="border-t border-dashed border-[#4d0099] pt-4 flex-row justify-between">
                    <View>
                      <Text className="text-xs text-[#b388ff]">Ticket Type</Text>
                      <Text className="text-base font-bold text-white">{first?.zoneName || '--'}</Text>
                    </View>
                    <View>
                      <Text className="text-xs text-[#b388ff]">Order</Text>
                      <Text className="text-base font-bold text-white">#{o.orderCode || '--'}</Text>
                    </View>
                    <View>
                      <Text className="text-xs text-[#b388ff]">Quantity</Text>
                      <Text className="text-base font-bold text-[#00e5ff]">{qty} Tickets</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
