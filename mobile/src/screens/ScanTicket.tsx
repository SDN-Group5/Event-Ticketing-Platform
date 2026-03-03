import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing 
} from 'react-native-reanimated';

export default function ScanTicket({ navigation }: any) {
  const scanLineY = useSharedValue(0);

  useEffect(() => {
    scanLineY.value = withRepeat(
      withTiming(250, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedLineStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: scanLineY.value }],
    };
  });

  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099] z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Scan Ticket QR</Text>
      </View>

      <View className="flex-1 items-center justify-center relative">
        {/* Mock Camera View */}
        <View className="absolute inset-0 bg-black/80" />
        
        {/* Scanner Frame */}
        <View className="w-64 h-64 border-2 border-[#d500f9] rounded-3xl overflow-hidden relative shadow-[0_0_30px_rgba(213,0,249,0.3)] bg-black/50">
          {/* Corner Markers */}
          <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#00e5ff] rounded-tl-3xl" />
          <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#00e5ff] rounded-tr-3xl" />
          <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#00e5ff] rounded-bl-3xl" />
          <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#00e5ff] rounded-br-3xl" />
          
          {/* Animated Scan Line */}
          <Animated.View 
            style={[
              animatedLineStyle, 
              { width: '100%', height: 2, backgroundColor: '#00e5ff', shadowColor: '#00e5ff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10, elevation: 5 }
            ]} 
          />
        </View>

        <Text className="text-white font-bold mt-8 text-center px-8">
          Align the QR code within the frame to scan
        </Text>

        {/* Mock Scan Button (for testing) */}
        <TouchableOpacity 
          className="mt-12 bg-[#1a0033] border border-[#00e5ff] px-6 py-3 rounded-full flex-row items-center shadow-[0_0_15px_rgba(0,229,255,0.3)]"
          onPress={() => {
            // Simulate successful scan
            alert("Ticket Validated Successfully!");
            navigation.goBack();
          }}
        >
          <MaterialIcons name="check-circle" size={20} color="#00e5ff" />
          <Text className="text-[#00e5ff] font-bold ml-2">Simulate Valid Scan</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
