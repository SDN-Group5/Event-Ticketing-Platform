import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../context/AuthContext';
import { PaymentAPI } from '../services/paymentApiService';

type OrderDraft = {
  eventId: string;
  eventName?: string;
  organizerId: string;
  zoneId: string;
  zoneName: string;
  price: number;
  quantity: number;
  selectedSeats?: {
    seatId: string;
    seatLabel: string;
    price: number;
    row: number;
    seatNumber: number;
    zoneId: string;
  }[];
};

export default function Checkout({ navigation, route }: any) {
  const { user, isAuthenticated } = useAuth();
  const orderDraft = route?.params?.orderDraft as OrderDraft | undefined;
  const [promoCode, setPromoCode] = useState('');
  const [isPaying, setIsPaying] = useState(false);

  const totalAmount = useMemo(() => {
    if (!orderDraft) return 0;
    if (orderDraft.selectedSeats && orderDraft.selectedSeats.length > 0) {
      return orderDraft.selectedSeats.reduce(
        (sum, s) => sum + Number(s.price || 0),
        0,
      );
    }
    return Number(orderDraft.price || 0) * Number(orderDraft.quantity || 0);
  }, [orderDraft]);

  const displayName = orderDraft?.eventName || 'Event';

  const pay = async () => {
    try {
      if (!isAuthenticated || !user?.id) {
        Alert.alert('Login', 'Bạn cần đăng nhập để mua vé.');
        navigation.navigate('Login');
        return;
      }

      if (!orderDraft) {
        Alert.alert('Lỗi', 'Thiếu dữ liệu đơn hàng');
        return;
      }

      if (!orderDraft.eventId || !orderDraft.organizerId || !orderDraft.zoneName) {
        Alert.alert('Lỗi', 'Thiếu thông tin sự kiện/organizer/zone');
        return;
      }

      setIsPaying(true);

      const items =
        orderDraft.selectedSeats && orderDraft.selectedSeats.length > 0
          ? orderDraft.selectedSeats.map((s) => ({
              zoneName: orderDraft.zoneName,
              seatId: s.seatId,
              price: Number(s.price || 0),
              quantity: 1,
            }))
          : [
              {
                zoneName: orderDraft.zoneName,
                price: Number(orderDraft.price || 0),
                quantity: Number(orderDraft.quantity || 1),
              },
            ];

      const result = await PaymentAPI.createPayment({
        userId: user.id,
        eventId: orderDraft.eventId,
        eventName: displayName,
        organizerId: orderDraft.organizerId,
        items,
        channel: 'mobile',
        voucherCode: promoCode.trim() ? promoCode.trim() : undefined,
      });

      // Mở PayOS checkout URL và chờ kết quả
      if (result.checkoutUrl) {
        const browserResult = await WebBrowser.openBrowserAsync(result.checkoutUrl);
        
        // Nếu người dùng đóng browser sau khi thanh toán, chuyển đến trang xác nhận
        if (browserResult.type === 'dismiss' || browserResult.type === 'cancel') {
          // Chuyển đến trang xác nhận đơn hàng với trạng thái pending
          navigation.navigate('OrderConfirmation', {
            orderCode: result.orderCode,
            eventName: displayName,
            quantity: orderDraft.quantity,
            zoneName: orderDraft.zoneName,
            paymentStatus: 'pending'
          });
        }
      } else {
        // Nếu không có checkout URL, chuyển trực tiếp đến trang xác nhận
        navigation.navigate('OrderConfirmation', {
          orderCode: result.orderCode,
          eventName: displayName,
          quantity: orderDraft.quantity,
          zoneName: orderDraft.zoneName,
          paymentStatus: 'pending'
        });
      }
    } catch (e: any) {
      Alert.alert('Thanh toán thất bại', e?.message || 'Không thể tạo thanh toán');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Checkout</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="text-lg font-bold text-white mb-4">Order Summary</Text>
        <View className="bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-white font-bold text-base">
              {orderDraft ? `${orderDraft.quantity}x ${orderDraft.zoneName}` : '--'}
            </Text>
            <Text className="text-white font-bold text-base">${totalAmount.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between pt-4 border-t border-[#4d0099]">
            <Text className="text-white font-bold text-lg">Total</Text>
            <Text className="text-[#00e5ff] font-black text-xl">${totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <Text className="text-lg font-bold text-white mb-4">Hình thức thanh toán</Text>
        <View className="bg-[#1a0033] border border-[#d500f9] rounded-2xl p-4 mb-6 flex-row items-center shadow-[0_0_15px_rgba(213,0,249,0.2)]">
          <View className="w-12 h-12 bg-[#2a004d] rounded-xl items-center justify-center border border-[#4d0099]">
            <MaterialIcons name="payment" size={28} color="#00e5ff" />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-white font-bold text-base">PayOS</Text>
            <Text className="text-[#b388ff] text-sm mt-0.5">Thẻ, ví điện tử — chuyển sang trang thanh toán PayOS</Text>
          </View>
          <MaterialIcons name="check-circle" size={24} color="#d500f9" />
        </View>

        <Text className="text-lg font-bold text-white mb-4">Promo Code</Text>
        <View className="flex-row items-center bg-[#1a0033] border border-[#4d0099] h-14 rounded-2xl px-4 mb-8">
          <MaterialIcons name="local-offer" size={20} color="#b388ff" />
          <TextInput 
            className="flex-1 ml-3 text-base text-white"
            placeholder="Enter code here"
            placeholderTextColor="#6a1b9a"
            value={promoCode}
            onChangeText={setPromoCode}
          />
          <TouchableOpacity onPress={() => {}}>
            <Text className="text-[#00e5ff] font-bold">Apply</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View className="p-6 bg-[#1a0033] border-t border-[#4d0099] rounded-t-3xl">
        <TouchableOpacity 
          onPress={pay}
          disabled={isPaying || !orderDraft}
          className={`w-full bg-[#d500f9] h-14 rounded-2xl items-center justify-center shadow-[0_0_20px_rgba(213,0,249,0.4)] ${isPaying || !orderDraft ? 'opacity-50' : ''}`}
        >
          {isPaying ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" />
              <Text className="text-white font-bold text-lg tracking-wide ml-3">Creating payment...</Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-lg tracking-wide">Pay ${totalAmount.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}