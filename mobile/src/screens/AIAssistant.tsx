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

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  event?: EventLayout;
}

export default function AIAssistant({ navigation }: any) {
  const { user } = useAuth();
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
    // This will match if the user input is contained in the event name/location
    // OR if the event name/location is contained in the user input
    const foundEvents = allEvents.filter(e => {
      const name = e.eventName?.toLowerCase() || '';
      const loc = e.eventLocation?.toLowerCase() || '';
      return (
        lowerText.includes(name) || 
        name.includes(lowerText) || 
        lowerText.includes(loc) || 
        loc.includes(lowerText) ||
        // Fuzzy match for common abbreviations/keywords
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
      // 3. Fallback to category/intent matching if no specific event found
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
      className={`mb-4 flex-row ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {item.sender === 'bot' && (
        <View className="w-8 h-8 rounded-full bg-[#d500f9] items-center justify-center mr-2 self-end">
          <MaterialIcons name="smart-toy" size={18} color="white" />
        </View>
      )}
      <View 
        style={{ maxWidth: '80%' }}
        className={`p-3 rounded-2xl ${
          item.sender === 'user' 
            ? 'bg-[#d500f9] rounded-tr-none' 
            : 'bg-[#1a0033] border border-[#4d0099] rounded-tl-none'
        }`}
      >
        <Text className="text-white text-sm">{item.text}</Text>
        
        {item.event && (
          <TouchableOpacity 
            onPress={() => navigation.navigate('EventDetail', { eventId: item.event?.eventId })}
            className="mt-3 bg-[#0a0014] border border-[#00e5ff] rounded-xl overflow-hidden"
          >
            <Image 
              source={{ uri: item.event.eventImage || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070' }}
              className="w-full h-24"
            />
            <View className="p-2">
              <Text className="text-white font-bold text-xs" numberOfLines={1}>{item.event.eventName}</Text>
              <Text className="text-[#b388ff] text-[10px]">{item.event.eventLocation}</Text>
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-[#00e5ff] font-bold text-xs">${item.event.minPrice}</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('TicketSelection', { eventId: item.event?.eventId })}
                  className="bg-[#d500f9] px-2 py-1 rounded-md"
                >
                  <Text className="text-white font-bold text-[10px]">Đặt ngay</Text>
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
      className="flex-1 bg-[#0a0014]"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099] z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <View className="flex-1 items-center px-4">
          <Text className="text-lg font-bold text-white">Eventix AI</Text>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-[#00e5ff] mr-1" />
            <Text className="text-[#b388ff] text-[10px]">Sẵn sàng hỗ trợ</Text>
          </View>
        </View>
        <TouchableOpacity className="w-10 h-10 items-center justify-center">
          <MaterialIcons name="more-vert" size={24} color="#b388ff" />
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
          <View className="flex-row justify-start mb-4">
            <View className="bg-[#1a0033] border border-[#4d0099] p-3 rounded-2xl rounded-tl-none">
              <ActivityIndicator size="small" color="#d500f9" />
            </View>
          </View>
        ) : null}
      />

      <View className="p-4 bg-[#1a0033] border-t border-[#4d0099]">
        <View className="flex-row items-center bg-[#0a0014] rounded-full px-4 py-2 border border-[#4d0099]">
          <TextInput
            placeholder="Bạn muốn tìm sự kiện gì?"
            placeholderTextColor="#6a1b9a"
            value={input}
            onChangeText={setInput}
            className="flex-1 text-white text-sm"
          />
          <TouchableOpacity 
            onPress={handleSend}
            className="w-10 h-10 bg-[#d500f9] rounded-full items-center justify-center shadow-[0_0_10px_#d500f9]"
          >
            <MaterialIcons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
