import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { State, GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withDecay } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { EventLayout, LayoutAPI, LayoutZone } from '../services/layoutApiService';
import { LinearGradient } from 'expo-linear-gradient';

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

  // Nhận selectedSeats + zoneId từ SeatMapDesigner (sau khi Confirm) — giữ zone đã chọn để không phải bấm lại
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
    const zoneIdFromMap = route?.params?.zoneId as string | undefined;

    if (incoming && incoming.length > 0) {
      setSelectedSeats(incoming);
      setQuantity(incoming.length);
      if (zoneIdFromMap) setSelectedZoneId(zoneIdFromMap);
    }
  }, [route?.params?.selectedSeats, route?.params?.zoneId]);

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

  const mapDimensions = useMemo(() => {
    const zones = layout?.zones || [];
    if (zones.length === 0) return { width: 400, height: 400 };
    let maxX = 0, maxY = 0;
    zones.forEach((zone: any) => {
        const x = zone.position?.x || 0;
        const y = zone.position?.y || 0;
        const w = zone.size?.width || 200;
        const h = zone.size?.height || 150;
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
    });
    return { width: Math.max(Dimensions.get('window').width, maxX + 200), height: Math.max(Dimensions.get('window').height - 250, maxY + 200) };
  }, [layout?.zones]);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      if (scale.value < 0.5) {
        scale.value = withSpring(0.5);
        savedScale.value = 0.5;
      } else if (scale.value > 3) {
        scale.value = withSpring(3);
        savedScale.value = 3;
      } else {
        savedScale.value = scale.value;
      }
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd((event) => {
        translateX.value = withDecay({
            velocity: event.velocityX,
            clamp: [-mapDimensions.width, mapDimensions.width],
        });
        translateY.value = withDecay({
            velocity: event.velocityY,
            clamp: [-mapDimensions.height, mapDimensions.height],
        });
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  const handleZonePress = (z: LayoutZone) => {
    if (z.type === 'seats') {
      if (!eventId) return;
      navigation.navigate('SeatMapDesigner', {
        eventId,
        zoneId: z.id,
        zoneName: z.name,
      });
    } else if (z.type === 'standing') {
      setSelectedZoneId(z.id);
      setSelectedSeats([]);
      setQuantity(1);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className="flex-1 bg-[#151022]">
        <View className="flex-row items-center p-4 pt-12 bg-[#1e1a29] border-b border-white/10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Select Tickets</Text>
      </View>

      <View className="flex-1">
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <Text className="text-[#a59cba] mt-3 font-bold">Đang tải sơ đồ...</Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-red-400 font-bold text-center">{error}</Text>
          </View>
        ) : (layout?.zones || []).length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-[#a59cba] font-bold">Sự kiện chưa có sơ đồ</Text>
          </View>
        ) : (
          <GestureDetector gesture={composedGesture}>
            <Animated.View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }, animatedStyle]}>
              <View 
                className="relative overflow-hidden" 
                style={{ width: mapDimensions.width, height: mapDimensions.height }}
              >
                {(layout?.zones || []).map((zone: any) => {
                  const x = zone.position?.x ?? 50;
                  const y = zone.position?.y ?? 150;
                  const w = zone.size?.width ?? 150;
                  const h = zone.size?.height ?? 150;
                  const isSelectable = zone.type === 'seats' || zone.type === 'standing';
                  const isSelected = zone.id === selectedZoneId;
                  const zColor = zone.color || '#8655f6';

                  return (
                    <TouchableOpacity
                      key={zone.id}
                      activeOpacity={0.8}
                      onPress={() => isSelectable ? handleZonePress(zone) : {}}
                      disabled={!isSelectable}
                      className="absolute items-center justify-center border-2 border-dashed"
                      style={{
                        left: x,
                        top: y,
                        width: w,
                        height: h,
                        transform: [{ rotate: `${zone.rotation || 0}deg` }],
                        borderColor: zColor,
                        backgroundColor: `${zColor}${isSelected ? '40' : '15'}`,
                        borderStyle: zone.type === 'barrier' ? 'dashed' : 'solid',
                        zIndex: isSelected ? 10 : 1
                      }}
                    >
                      {/* Cảnh nền sân khấu */}
                      {zone.type === 'stage' && !zone.hideScreen && (
                          <View
                              className="absolute top-1.5 w-3/4 h-1 opacity-50 rounded-full"
                              style={{ backgroundColor: zColor }}
                          />
                      )}
                      
                      <Text className="font-bold text-sm text-center px-1 leading-tight" style={{ color: zColor }}>
                        {zone.name}
                      </Text>
                      
                      {isSelectable && zone.type === 'seats' ? (
                        <Text className="text-[10px] text-white/50 mt-1">Select Seats</Text>
                      ) : isSelectable && zone.type === 'standing' ? (
                        <Text className="text-[10px] text-white/50 mt-1">Standing</Text>
                      ) : zone.type === 'stage' ? (
                        <Text className="text-[10px] text-white/50 mt-1">Stage</Text>
                      ) : null}

                      {/* Hiển thị giá và số lượng ghế chọn (nếu là ghế có select) */}
                      {zone.price > 0 && isSelectable && (
                        <View 
                          className="absolute bottom-1 right-1 rounded px-1 py-0.5"
                          style={{ backgroundColor: `${zColor}30` }}
                        >
                          <Text className="text-[10px] font-bold" style={{ color: zColor }}>
                            ${zone.price}
                          </Text>
                        </View>
                      )}
                      
                      {selectedSeats.length > 0 && selectedSeats[0]?.zoneId === zone.id && (
                        <View 
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full items-center justify-center border border-black"
                          style={{ backgroundColor: zColor }}
                        >
                          <Text className="text-[10px] font-bold text-white">
                            {selectedSeats.length}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          </GestureDetector>
        )}
      </View>

      <View className="p-6 bg-[#1e1a29]/95 border-t border-white/10 rounded-t-3xl">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-[#a59cba] font-bold text-lg">Total ({quantity} tickets)</Text>
          <Text className="text-3xl font-black text-[#00e5ff]">${total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => {
            if (!layout || !eventId || !selectedZone) return;
            const organizerId = layout.createdBy || 'unknown';
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
          className={`rounded-2xl shadow-[0_0_20px_rgba(134,85,246,0.4)] overflow-hidden ${!selectedZone || loading || !!error ? 'opacity-50' : ''}`}
        >
          <LinearGradient
            colors={['#8655f6', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-full h-14 items-center justify-center"
          >
            <Text className="text-white font-bold text-lg tracking-wide">Continue to Checkout</Text>
          </LinearGradient>
        </TouchableOpacity>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}