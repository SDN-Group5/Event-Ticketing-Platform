import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { LayoutAPI, EventLayout } from '../services/layoutApiService';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContextType';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  event?: EventLayout;
}

export default function AIAssistant({ navigation }: any) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [allEvents, setAllEvents] = useState<EventLayout[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Initial greeting
    setMessages([
      {
        id: '1',
        text: `Xin chào ${user?.firstName || ''}! Tôi là trợ lý ảo Eventix. Tôi có thể giúp bạn tìm kiếm sự kiện và đặt vé nhanh chóng. Bạn muốn tìm sự kiện gì hôm nay?`,
        sender: 'bot',
        timestamp: new Date(),
      }
    ]);

    // Pre-fetch events for faster searching
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await LayoutAPI.listLayouts();
      setAllEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load events for AI:', error);
    }
  }

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input.toLowerCase();
    setInput('');
    setIsTyping(true);

    // Simulate AI Processing
    setTimeout(() => {
      processInput(currentInput);
    }, 1000);
  };

  const processInput = (text: string) => {
    let botResponse: Partial<Message> = {
      id: (Date.now() + 1).toString(),
      sender: 'bot',
      timestamp: new Date(),
    };

    const lowerText = text.toLowerCase();

    // 1. Check for basic greetings
    if (lowerText.includes('xin chào') || lowerText.includes('hello') || lowerText.includes('hi')) {
      botResponse.text = "Chào bạn! Tôi là trợ lý ảo Eventix. Bạn muốn tìm sự kiện âm nhạc, thể thao hay hội thảo nào không?";
      setMessages(prev => [...prev, botResponse as Message]);
      setIsTyping(false);
      return;
    }

    // 2. Search for events in the database
    const foundEvents = allEvents.filter(e => {
      const name = e.eventName?.toLowerCase() || '';
      const loc = e.eventLocation?.toLowerCase() || '';
      return (
        lowerText.includes(name) || 
        name.includes(lowerText) || 
        lowerText.includes(loc) || 
        loc.includes(lowerText) ||
        (lowerText.includes('mu') && name.includes('manchester united')) ||
        (lowerText.includes('mc') && name.includes('manchester city')) ||
        (lowerText.includes('nhạc') && name.includes('music'))
      );
    });

    if (foundEvents.length > 0) {
      const event = foundEvents[0];
      botResponse.text = `Tuyệt vời! Tôi đã tìm thấy sự kiện "${event.eventName}" diễn ra tại ${event.eventLocation}. Bạn có muốn xem chi tiết hoặc đặt vé ngay không?`;
      botResponse.event = event;
    } else {
      if (lowerText.includes('nhạc') || lowerText.includes('âm nhạc') || lowerText.includes('ca nhạc')) {
        botResponse.text = "Hiện tại tôi chưa thấy show âm nhạc nào khớp với mô tả của bạn. Bạn thử nhập tên nghệ sĩ hoặc thể loại nhạc xem sao?";
      } else if (lowerText.includes('đá bóng') || lowerText.includes('bóng đá') || lowerText.includes('mu') || lowerText.includes('mc')) {
        botResponse.text = "Có vẻ bạn đang tìm các trận bóng đá hấp dẫn. Rất tiếc hiện chưa có sự kiện thể thao nào trong danh sách. Hãy quay lại sau nhé!";
      } else if (lowerText.includes('đặt') || lowerText.includes('mua') || lowerText.includes('vé')) {
        botResponse.text = "Để mua vé, bạn vui lòng cho tôi biết tên sự kiện bạn muốn tham gia nhé!";
      } else {
        botResponse.text = "Tôi chưa hiểu ý bạn lắm. Bạn có thể nhập tên sự kiện, nghệ sĩ hoặc địa điểm để tôi hỗ trợ tìm kiếm nhé!";
      }
    }

    setMessages(prev => [...prev, botResponse as Message]);
    setIsTyping(false);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <Animated.View 
      entering={item.sender === 'user' ? SlideInRight : FadeIn}
      style={{ marginBottom: 16, flexDirection: 'row', justifyContent: item.sender === 'user' ? 'flex-end' : 'flex-start' }}
    >
      {item.sender === 'bot' && (
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginRight: 8, alignSelf: 'flex-end' }}>
          <MaterialIcons name="smart-toy" size={18} color="white" />
        </View>
      )}
      <View 
        style={{ 
          maxWidth: '80%', 
          padding: 12, 
          borderRadius: 16, 
          backgroundColor: item.sender === 'user' ? colors.accent : colors.surface,
          borderWidth: item.sender === 'user' ? 0 : 1,
          borderColor: colors.border,
          borderTopRightRadius: item.sender === 'user' ? 0 : 16,
          borderTopLeftRadius: item.sender === 'user' ? 16 : 0
        }}
      >
        <Text style={{ color: item.sender === 'user' ? 'white' : colors.text, fontSize: 14 }}>{item.text}</Text>
        
        {item.event && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('EventDetail', { eventId: item.event?.eventId })}
            style={{ marginTop: 12, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.accentSecondary, borderRadius: 12, overflow: 'hidden' }}
          >
            <Image 
              source={{ uri: item.event.eventImage || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070' }}
              style={{ width: '100%', height: 96 }}
            />
            <View style={{ padding: 8 }}>
              <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: 12 }} numberOfLines={1}>{item.event.eventName}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{item.event.eventLocation}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <Text style={{ color: colors.accentSecondary, fontWeight: 'bold', fontSize: 12 }}>${item.event.minPrice}</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('TicketSelection', { eventId: item.event?.eventId })}
                  style={{ backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 10 }}>Đặt ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: colors.background }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, zIndex: 10 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, backgroundColor: colors.surfaceSecondary, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
          <MaterialIcons name="arrow-back" size={24} color={colors.accent} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>Eventix AI</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accentSecondary, marginRight: 4 }} />
            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Sẵn sàng hỗ trợ</Text>
          </View>
        </View>
        <TouchableOpacity style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
          <MaterialIcons name="more-vert" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={isTyping ? (
          <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 16 }}>
            <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 12, borderRadius: 16, borderTopLeftRadius: 0 }}>
              <ActivityIndicator size="small" color={colors.accent} />
            </View>
          </View>
        ) : null}
      />

      <View style={{ padding: 16, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, borderRadius: 25, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1, borderColor: colors.border }}>
          <TextInput
            placeholder="Bạn muốn tìm sự kiện gì?"
            placeholderTextColor={colors.textSecondary + '80'}
            value={input}
            onChangeText={setInput}
            style={{ flex: 1, color: colors.text, fontSize: 14, height: 40 }}
          />
          <TouchableOpacity 
            onPress={handleSend}
            style={{ width: 40, height: 40, backgroundColor: colors.accent, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialIcons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
