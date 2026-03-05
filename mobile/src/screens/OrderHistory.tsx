import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { PaymentAPI } from '../services/paymentApiService';

type OrderItem = {
  id: string;
  orderCode: string;
  eventName: string;
  eventImage?: string;
  zoneName: string;
  quantity: number;
  totalAmount: number;
  status: 'paid' | 'pending' | 'cancelled' | 'refunded';
  orderDate: string;
  eventDate?: string;
  venue?: string;
};

export default function OrderHistory({ navigation }: any) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await PaymentAPI.getUserOrders(user.id);

      // Đồng bộ trạng thái realtime cho các đơn đang "Đang xử lý" 
      // vì localhost không nhận được Webhook từ PayOS.
      const syncableOrders = data.filter((o: any) => o.status === 'processing' || o.status === 'pending');
      if (syncableOrders.length > 0) {
        console.log(`[OrderHistory] Syncing ${syncableOrders.length} active orders...`);
        await Promise.all(syncableOrders.map((o: any) => PaymentAPI.verifyPayment(o.orderCode)));
        // Load lại lần nữa để lấy status mới
        const updatedData = await PaymentAPI.getUserOrders(user.id);
        setOrders(mapOrders(updatedData));
      } else {
        setOrders(mapOrders(data));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const mapOrders = (data: any[]): OrderItem[] => {
    return data.map((order: any) => ({
      id: order._id,
      orderCode: `#${order.orderCode}`,
      eventName: order.eventName,
      eventImage: order.eventImage,
      zoneName: order.items?.[0]?.zoneName || 'N/A',
      quantity: order.items?.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0) || 1,
      totalAmount: order.totalAmount,
      status: order.status,
      orderDate: order.createdAt,
      eventDate: order.eventDate,
      venue: order.eventLocation,
    }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#00e5ff';
      case 'pending':
      case 'processing': return '#d500f9';
      case 'cancelled':
      case 'expired': return '#ff1744';
      case 'refunded': return '#ff9100';
      default: return '#b388ff';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'pending':
      case 'processing': return 'Đang xử lý';
      case 'cancelled': return 'Đã hủy';
      case 'expired': return 'Đã hết hạn';
      case 'refunded': return 'Đã hoàn tiền';
      default: return 'Không xác định';
    }
  };

  const renderOrderItem = (order: OrderItem) => (
    <TouchableOpacity
      key={order.id}
      onPress={() => navigation.navigate('TicketDetail', { orderCode: order.orderCode.replace('#', '') })}
      className="bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 mb-4 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
    >
      <View className="flex-row">
        {order.eventImage ? (
          <Image
            source={{ uri: order.eventImage }}
            className="w-16 h-16 rounded-xl mr-4"
            resizeMode="cover"
          />
        ) : (
          <View className="w-16 h-16 bg-[#2a004d] rounded-xl mr-4 items-center justify-center">
            <MaterialIcons name="event" size={32} color="#d500f9" />
          </View>
        )}

        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-white font-bold text-base flex-1 pr-2" numberOfLines={2}>
              {order.eventName}
            </Text>
            <View
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: getStatusColor(order.status) }}
              >
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-1">
            <MaterialIcons name="confirmation-number" size={16} color="#b388ff" />
            <Text className="text-[#b388ff] text-sm ml-2">{order.orderCode}</Text>
          </View>

          <View className="flex-row items-center mb-1">
            <MaterialIcons name="location-on" size={16} color="#b388ff" />
            <Text className="text-[#b388ff] text-sm ml-2" numberOfLines={1}>
              {order.zoneName} • {order.quantity} vé
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <Text className="text-[#b388ff] text-sm">
              {formatDate(order.orderDate)}
            </Text>
            <Text className="text-[#00e5ff] font-bold text-base">
              ${order.totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-[#0a0014]">
      {/* Header */}
      <LinearGradient
        colors={['#1a0033', '#0a0014']}
        className="pt-12 pb-4 px-4"
      >
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099] mr-4"
          >
            <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
          </TouchableOpacity>
          <Text className="flex-1 text-xl font-bold text-white">Lịch sử mua vé</Text>
          <TouchableOpacity
            onPress={onRefresh}
            disabled={refreshing}
            className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]"
          >
            <MaterialIcons name="sync" size={24} color={refreshing ? "#4d0099" : "#00e5ff"} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#d500f9"
            colors={['#d500f9']}
          />
        }
      >
        {loading ? (
          <View className="flex-1 items-center justify-center py-20">
            <MaterialIcons name="hourglass-top" size={48} color="#d500f9" />
            <Text className="text-[#b388ff] text-base mt-4">Đang tải lịch sử...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-24 h-24 bg-[#2a004d] rounded-full items-center justify-center border-2 border-[#4d0099] mb-6">
              <MaterialIcons name="receipt-long" size={48} color="#b388ff" />
            </View>
            <Text className="text-white font-bold text-xl mb-2">Chưa có đơn hàng nào</Text>
            <Text className="text-[#b388ff] text-base text-center mb-8 px-8">
              Bạn chưa mua vé nào. Hãy khám phá các sự kiện thú vị và mua vé ngay!
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('MainTabs')}
              className="bg-[#d500f9] px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(213,0,249,0.4)]"
            >
              <Text className="text-white font-bold text-base">Khám phá sự kiện</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View className="bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 mb-6">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-white font-bold text-lg">Tổng quan</Text>
                  <Text className="text-[#b388ff] text-sm mt-1">
                    {orders.length} đơn hàng • {orders.filter(o => o.status === 'paid').length} đã thanh toán
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-[#00e5ff] font-bold text-xl">
                    ${orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
                  </Text>
                  <Text className="text-[#b388ff] text-sm">Tổng chi tiêu</Text>
                </View>
              </View>
            </View>

            {orders.map(renderOrderItem)}

            <View className="h-8" />
          </>
        )}
      </ScrollView>
    </View>
  );
}