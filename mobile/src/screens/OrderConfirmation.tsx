import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PaymentAPI } from '../services/paymentApiService';

export default function OrderConfirmation({ navigation, route }: any) {
  const orderCode = route?.params?.orderCode as number | undefined;
  const eventName = (route?.params?.eventName as string | undefined) || 'Event';
  const zoneName = (route?.params?.zoneName as string | undefined) || '';
  const quantity = Number(route?.params?.quantity || 0);

  const [status, setStatus] = useState<string>('processing');
  const [payosStatus, setPayosStatus] = useState<string | undefined>(undefined);
  const [isVerifying, setIsVerifying] = useState(false);

  const paid = useMemo(() => status === 'paid', [status]);

  const verify = async () => {
    try {
      if (!orderCode) {
        Alert.alert('Lỗi', 'Thiếu orderCode');
        return;
      }
      setIsVerifying(true);
      const result = await PaymentAPI.verifyPayment(orderCode);
      setStatus(result.status || 'unknown');
      setPayosStatus(result.payosStatus);
      if (result.status === 'paid') {
        Alert.alert('Thành công', 'Thanh toán đã hoàn tất.');
      }
    } catch (e: any) {
      Alert.alert('Verify thất bại', e?.message || 'Không thể kiểm tra trạng thái');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0a0014]">
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8M3x8fGVufDB8fHx8fA%3D%3D' }}
        className="flex-1 justify-center items-center px-6"
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(10, 0, 20, 0.8)', '#0a0014', '#0a0014']}
          className="absolute inset-0"
        />
        
        <View className="w-24 h-24 bg-[#d500f9]/20 rounded-full items-center justify-center border-4 border-[#d500f9] shadow-[0_0_30px_rgba(213,0,249,0.6)] mb-6">
          <MaterialIcons name={paid ? 'check' : 'hourglass-top'} size={48} color="#00e5ff" />
        </View>
        
        <Text
          className="text-3xl font-black text-white mb-2 tracking-wide text-center"
          style={{ textShadowColor: '#d500f9', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}
        >
          {paid ? 'Payment Successful!' : 'Payment Pending'}
        </Text>
        <Text className="text-base text-[#b388ff] text-center mb-10">
          {paid
            ? 'Vé của bạn đã được ghi nhận trong hệ thống.'
            : 'Sau khi thanh toán trên PayOS, bấm “Kiểm tra thanh toán” để xác nhận.'}
        </Text>

        <View className="w-full bg-[#1a0033]/90 border border-[#4d0099] rounded-3xl p-6 mb-8 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
          <Text className="text-white font-bold text-xl mb-4 text-center">{eventName}</Text>
          <View className="flex-row justify-between mb-3 border-b border-[#4d0099] pb-3">
            <Text className="text-[#b388ff]">Tickets</Text>
            <Text className="text-white font-bold">{quantity ? `${quantity}x ${zoneName}` : zoneName || '--'}</Text>
          </View>
          <View className="flex-row justify-between pt-1">
            <Text className="text-[#b388ff]">Order ID</Text>
            <Text className="text-[#00e5ff] font-bold">{orderCode ? `#${orderCode}` : '--'}</Text>
          </View>
          <View className="flex-row justify-between pt-3">
            <Text className="text-[#b388ff]">Status</Text>
            <Text className="text-white font-bold">{status}{payosStatus ? ` (PayOS: ${payosStatus})` : ''}</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={paid ? () => navigation.navigate('MainTabs', { screen: 'Tickets' }) : verify}
          disabled={isVerifying || (!paid && !orderCode)}
          className={`w-full bg-[#d500f9] h-14 rounded-2xl items-center justify-center mb-4 shadow-[0_0_20px_rgba(213,0,249,0.4)] ${isVerifying || (!paid && !orderCode) ? 'opacity-50' : ''}`}
        >
          {isVerifying ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" />
              <Text className="text-white font-bold text-lg tracking-wide ml-3">Verifying...</Text>
            </View>
          ) : (
            <Text className="text-white font-bold text-lg tracking-wide">
              {paid ? 'View My Tickets' : 'Kiểm tra thanh toán'}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('MainTabs')}
          className="w-full bg-[#1a0033] border border-[#4d0099] h-14 rounded-2xl items-center justify-center"
        >
          <Text className="text-[#00e5ff] font-bold text-lg">Back to Home</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}