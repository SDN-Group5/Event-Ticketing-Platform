import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { PaymentAPI } from '../services/paymentApiService';
import { SeatAPI } from '../services/seatApiService';
import { usePaymentTimer } from '../context/PaymentTimerContext';

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
  const [agreed, setAgreed] = useState(false);
  const { isTimerActive, startTimer } = usePaymentTimer();

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

      if (isTimerActive) {
        Alert.alert('Thất bại', 'Bạn đang có một đơn hàng chưa thanh toán! Vui lòng huỷ đơn hàng cũ trước khi đặt đơn mới.');
        return;
      }

      setIsPaying(true);

      const isSelectSeatMode = orderDraft.selectedSeats && orderDraft.selectedSeats.length > 0;
      const items = isSelectSeatMode
        ? orderDraft.selectedSeats!.map((s) => ({
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

      // Reserve seats if needed
      const reservedSeatIds: string[] = [];
      if (isSelectSeatMode) {
        let lockFailed = false;
        for (const s of orderDraft.selectedSeats!) {
          try {
            await SeatAPI.reserveSeat(orderDraft.eventId, s.zoneId, s.row, s.seatNumber);
            reservedSeatIds.push(s.seatId);
          } catch (e: any) {
            console.error('Failed to reserve seat:', s.seatId, e?.message);
            lockFailed = true;
          }
        }

        if (lockFailed) {
          // Rollback
          for (const sid of reservedSeatIds) {
            await SeatAPI.releaseReservation(orderDraft.eventId, sid).catch(() => {});
          }
          Alert.alert('Thất bại', 'Một số ghế đã bị người khác chọn. Vui lòng thử lại.');
          setIsPaying(false);
          return;
        }
      }

      let result;
      try {
        result = await PaymentAPI.createPayment({
          userId: user.id,
          eventId: orderDraft.eventId,
          eventName: displayName,
          organizerId: orderDraft.organizerId,
          items,
          channel: 'mobile',
          voucherCode: promoCode.trim() ? promoCode.trim() : undefined,
        });
      } catch (e: any) {
        // Rollback seats if payment creation fails
        for (const sid of reservedSeatIds) {
          await SeatAPI.releaseReservation(orderDraft.eventId, sid).catch(() => {});
        }
        throw e;
      }

      // Start global timer
      startTimer(
        5 * 60,
        result.checkoutUrl,
        result.orderCode,
        { eventId: orderDraft.eventId, title: displayName },
        totalAmount,
        orderDraft.quantity || (orderDraft.selectedSeats?.length || 1)
      );

      // Open PayOS checkout URL
      if (result.checkoutUrl) {
        await WebBrowser.openBrowserAsync(result.checkoutUrl);
      }
      
      navigation.popToTop();

    } catch (e: any) {
      Alert.alert('Thanh toán thất bại', e?.message || 'Không thể tạo thanh toán');
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <View className="flex-1 bg-[#151022]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1e1a29] border-b border-white/10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Checkout</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="text-lg font-bold text-white mb-4">Order Summary</Text>
        <View className="bg-[#1e1a29] border border-[#3b3158] rounded-2xl p-4 mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-white font-bold text-base">
              {orderDraft ? `${orderDraft.quantity}x ${orderDraft.zoneName}` : '--'}
            </Text>
            <Text className="text-white font-bold text-base">${totalAmount.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between pt-4 border-t border-[#3b3158]">
            <Text className="text-white font-bold text-lg">Total</Text>
            <Text className="text-[#00e5ff] font-black text-xl">${totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        <Text className="text-lg font-bold text-white mb-4">Hình thức thanh toán</Text>
        <View className="bg-[#1e1a29] border border-[#8655f6] rounded-2xl p-4 mb-6 flex-row items-center shadow-[0_0_15px_rgba(134,85,246,0.3)]">
          <View className="w-12 h-12 bg-white/5 rounded-xl items-center justify-center border border-white/10">
            <MaterialIcons name="payment" size={28} color="#00e5ff" />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-white font-bold text-base">PayOS</Text>
            <Text className="text-[#a59cba] text-sm mt-0.5">Thẻ, ví điện tử — chuyển sang trang thanh toán PayOS</Text>
          </View>
          <MaterialIcons name="check-circle" size={24} color="#d500f9" />
        </View>

        <Text className="text-lg font-bold text-white mb-4">Promo Code</Text>
        <View className="flex-row items-center bg-[#201936] border border-[#3b3158] h-14 rounded-2xl px-4 mb-8">
          <MaterialIcons name="local-offer" size={20} color="#a59cba" />
          <TextInput
            className="flex-1 ml-3 text-base text-white"
            placeholder="Enter code here"
            placeholderTextColor="#6a1b9a"
            value={promoCode}
            onChangeText={setPromoCode}
          />
          <TouchableOpacity onPress={() => { }}>
            <Text className="text-[#00e5ff] font-bold">Apply</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={() => setAgreed(!agreed)} 
          className="flex-row items-center mb-8 pl-1"
        >
          <View className={`w-6 h-6 rounded border ${agreed ? 'bg-[#8655f6] border-[#8655f6]' : 'border-[#3b3158]'} items-center justify-center mr-3`}>
            {agreed && <MaterialIcons name="check" size={16} color="white" />}
          </View>
          <Text className="text-[#a59cba] flex-1">Tôi đã đọc và đồng ý với điều khoản dịch vụ và chính sách hoàn tiền</Text>
        </TouchableOpacity>
      </ScrollView>

      <View className="p-6 bg-[#1e1a29]/95 border-t border-white/10 rounded-t-3xl">
        <TouchableOpacity
          onPress={pay}
          disabled={isPaying || !orderDraft || !agreed}
          className={`rounded-2xl shadow-[0_0_20px_rgba(134,85,246,0.4)] overflow-hidden ${isPaying || !orderDraft || !agreed ? 'opacity-50' : ''}`}
        >
          <LinearGradient
            colors={['#8655f6', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-full h-14 items-center justify-center"
          >
            {isPaying ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" />
                <Text className="text-white font-bold text-lg tracking-wide ml-3">Creating payment...</Text>
              </View>
            ) : (
              <Text className="text-white font-bold text-lg tracking-wide">Pay ${totalAmount.toFixed(2)}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}