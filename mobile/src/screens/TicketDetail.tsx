import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Share
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { PaymentAPI } from '../services/paymentApiService';
import QRCode from 'react-native-qrcode-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TicketDetail({ navigation, route }: any) {
  const { orderCode } = route.params || {};
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function loadOrder() {
      if (!orderCode) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Sync with PayOS since webhooks might not work on localhost
        const verifyData = await PaymentAPI.verifyPayment(Number(orderCode));
        if (verifyData.order) {
          setOrder(verifyData.order);
        } else {
          const fallbackData = await PaymentAPI.getOrder(Number(orderCode));
          setOrder(fallbackData);
        }
      } catch (error) {
        try {
          // Verify có thể fail (PayOS không có mã), nhưng DB vẫn có order → fallback nhẹ nhàng
          console.warn('Verify payment failed, fallback to getOrder:', (error as any)?.message || error);
          const fallbackData = await PaymentAPI.getOrder(Number(orderCode));
          setOrder(fallbackData);
        } catch (e) {
          console.error('Error fetching order detail:', e);
        }
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderCode]);

  if (loading) {
    return (
      <View className="flex-1 bg-[#0a0014] items-center justify-center">
        <ActivityIndicator size="large" color="#d500f9" />
        <Text className="text-[#b388ff] mt-4 font-bold">Đang tải thông tin vé...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View className="flex-1 bg-[#0a0014] items-center justify-center p-4">
        <MaterialIcons name="error-outline" size={64} color="#ff1744" />
        <Text className="text-white text-xl font-bold mt-4">Không tìm thấy vé</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-6 bg-[#2a004d] px-6 py-2 rounded-xl border border-[#4d0099]"
        >
          <Text className="text-[#d500f9] font-bold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'paid': return { text: 'Đã thanh toán', color: '#00e5ff' };
      case 'refunded': return { text: 'Đã hoàn tiền', color: '#ff9100' };
      case 'cancelled': return { text: 'Đã hủy', color: '#ff1744' };
      case 'expired': return { text: 'Đã hết hạn', color: '#ff1744' };
      case 'pending':
      case 'processing': return { text: 'Đang xử lý', color: '#d500f9' };
      default: return { text: 'Không xác định', color: '#b388ff' };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  // Map tickets (có QR payload) theo thứ tự để hiển thị
  const tickets = (order as any).tickets || [];

  const webBaseUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://event-ticketing-platform-six.vercel.app';
  const activeTicket = tickets[activeIndex];

  const handleShareTicket = async () => {
    if (!activeTicket?.ticketId) return;
    const url = `${webBaseUrl}/t/${encodeURIComponent(String(activeTicket.ticketId))}`;
    try {
      await Share.share({
        message: `Vé điện tử của bạn: ${url}`,
        url,
      });
    } catch (e) {
      // ignore share cancel/errors
    }
  };

  return (
    <View className="flex-1 bg-[#0a0014]">
      {/* Header */}
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Chi tiết vé</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-6">
          <FlatList
            data={order.items || []}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const contentOffset = e.nativeEvent.contentOffset.x;
              const index = Math.round(contentOffset / SCREEN_WIDTH);
              setActiveIndex(index);
            }}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item, index }) => {
              // Tìm vé tương ứng (ưu tiên cùng seatId, nếu không có thì dùng index)
              const matchingTicket =
                tickets.find(
                  (t: any) =>
                    (t.seatId && item.seatId && t.seatId === item.seatId) ||
                    (t.zoneName && item.zoneName && t.zoneName === item.zoneName)
                ) || tickets[index];
              const qrValue =
                matchingTicket?.qrCodePayload ||
                (matchingTicket?.ticketId ? `ticket:${matchingTicket.ticketId}` : '') ||
                '';

              return (
              <View style={{ width: SCREEN_WIDTH }} className="px-4">
                <View className="bg-[#1a0033] rounded-3xl overflow-hidden border border-[#d500f9] shadow-[0_0_20px_rgba(213,0,249,0.3)] mb-4">
                  <Image
                    source={{ uri: order.eventImage || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070&auto=format&fit=crop' }}
                    className="w-full h-48"
                  />
                  <View className="p-6">
                    <View className="flex-row justify-between items-start mb-4">
                      <View className="flex-1 mr-4">
                        <Text className="text-2xl font-black text-white">{order.eventName}</Text>
                        <Text className="text-[#b388ff] text-xs font-bold uppercase mt-1 tracking-widest">
                          Ticket {index + 1} of {order.items?.length}
                        </Text>
                      </View>
                      <View
                        className="px-3 py-1 rounded-full border"
                        style={{ backgroundColor: `${statusInfo.color}20`, borderColor: `${statusInfo.color}50` }}
                      >
                        <Text
                          className="font-bold text-[10px] uppercase tracking-wider"
                          style={{ color: statusInfo.color }}
                        >
                          {statusInfo.text}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center mb-4">
                      <MaterialIcons name="location-on" size={16} color="#00e5ff" />
                      <Text className="ml-2 text-white font-bold">{order.eventLocation || 'Nhà thi đấu Phú Thọ'}</Text>
                    </View>

                    <View className="border-t border-[#4d0099]/30 my-4" />

                    <View className="mb-6">
                      <Text className="text-[#b388ff] text-[10px] uppercase font-bold tracking-tighter mb-3 opacity-50">Transaction Details</Text>
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-[#b388ff]/70 text-sm">Zone / Seat</Text>
                        <Text className="text-white text-sm font-bold">{item.zoneName}</Text>
                      </View>
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-[#b388ff]/70 text-sm">Order Reference</Text>
                        <View className="flex-row items-center">
                          <Text className="text-white text-sm font-mono">#{order.orderCode}</Text>
                          <TouchableOpacity className="ml-2">
                            <MaterialIcons name="content-copy" size={14} color="#00e5ff" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-[#b388ff]/70 text-sm">Date & Time</Text>
                        <Text className="text-white text-sm">{new Date(order.createdAt).toLocaleString('vi-VN')}</Text>
                      </View>
                      <View className="flex-row justify-between mt-3 pt-3 border-t border-[#4d0099]/20">
                        <Text className="text-white font-bold">Ticket Price</Text>
                        <Text className="text-[#00e5ff] font-black text-xl">${(order.totalAmount / (order.items?.length || 1)).toFixed(2)}</Text>
                      </View>
                    </View>

                    {/* Receipt Dashed Line Effect */}
                    <View className="flex-row items-center justify-center mb-6">
                      <View className="h-[0.5px] flex-1 bg-[#4d0099]/50" />
                      <View className="w-5 h-5 rounded-full bg-[#0a0014] -ml-2.5 border border-[#4d0099]/20" />
                      <View className="h-[0.5px] w-6" />
                      <View className="w-5 h-5 rounded-full bg-[#0a0014] -mr-2.5 border border-[#4d0099]/20" />
                      <View className="h-[0.5px] flex-1 bg-[#4d0099]/50" />
                    </View>

                    <View className="items-center bg-white p-6 rounded-2xl mb-2">
                      <Text className="text-[#0a0014]/40 text-[9px] font-black uppercase mb-4 tracking-[3px]">Official Digital Ticket</Text>
                      {qrValue ? (
                        <View className="w-44 h-44 items-center justify-center">
                          <QRCode value={qrValue} size={176} />
                        </View>
                      ) : (
                        <FontAwesome5 name="qrcode" size={120} color="black" />
                      )}
                      <View className="mt-4 px-6 py-2 bg-[#f0f0f0] rounded-full">
                        <Text className="text-[#0a0014] font-mono text-[9px] font-bold tracking-[2px] uppercase">
                          {item.zoneName} - ID:{index + 101}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            )}}
          />

          {/* Pagination Indicator */}
          {order.items && order.items.length > 1 && (
            <View className="flex-row justify-center mb-8">
              {order.items.map((_: any, i: number) => (
                <View
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full mx-1 ${i === activeIndex ? 'bg-[#00e5ff] w-4' : 'bg-[#4d0099]'}`}
                />
              ))}
            </View>
          )}
        </View>

        <View className="px-4 pb-12">
          <TouchableOpacity
            onPress={handleShareTicket}
            disabled={!activeTicket?.ticketId}
            className={`bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 mb-4 flex-row items-center justify-center ${!activeTicket?.ticketId ? 'opacity-50' : ''}`}
          >
            <MaterialIcons name="share" size={20} color="#00e5ff" />
            <Text className="text-[#00e5ff] font-bold text-lg ml-2">Chia sẻ vé</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-[#2a004d] border border-[#d500f9]/30 rounded-2xl p-4 flex-row items-center justify-center">
            <MaterialIcons name="file-download" size={20} color="#d500f9" />
            <Text className="text-[#d500f9] font-bold text-lg ml-2">Tải PDF (Offline)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}