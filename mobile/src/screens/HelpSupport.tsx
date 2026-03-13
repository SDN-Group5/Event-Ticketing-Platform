import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const FAQ_DATA = [
  {
    q: "Làm thế nào để đổi vé?",
    a: "Bạn có thể vào lịch sử mua vé, chọn vé cần đổi và chọn phương thức hỗ trợ. Lưu ý vé chỉ được đổi trước 24h sự kiện diễn ra."
  },
  {
    q: "Tôi có được hoàn tiền khi hủy vé không?",
    a: "Tùy thuộc vào chính sách của ban tổ chức. Thông thường, bạn sẽ được hoàn 70-90% nếu hủy sớm."
  },
  {
    q: "Làm sao để liên hệ ban tổ chức?",
    a: "Trong trang chi tiết sự kiện, bạn sẽ tìm thấy nút 'Liên hệ ban tổ chức' ở phía dưới cùng."
  }
];

export default function HelpSupport({ navigation }: any) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Hỗ trợ</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="text-sm font-bold text-[#b388ff] uppercase tracking-wider mb-4 ml-2">Câu hỏi thường gặp (FAQ)</Text>
        
        <View className="bg-[#1a0033] border border-[#4d0099] rounded-3xl overflow-hidden mb-8">
          {FAQ_DATA.map((item, index) => (
            <View key={index} className={index !== FAQ_DATA.length - 1 ? "border-b border-[#4d0099]" : ""}>
              <TouchableOpacity 
                onPress={() => setExpanded(expanded === index ? null : index)}
                className="flex-row items-center justify-between p-5"
              >
                <Text className="flex-1 text-white font-bold mr-2">{item.q}</Text>
                <MaterialIcons name={expanded === index ? "expand-less" : "expand-more"} size={24} color="#d500f9" />
              </TouchableOpacity>
              {expanded === index && (
                <View className="px-5 pb-5 pt-0">
                  <Text className="text-[#b388ff] leading-5">{item.a}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <Text className="text-sm font-bold text-[#b388ff] uppercase tracking-wider mb-4 ml-2">Gửi phản hồi</Text>
        <View className="bg-[#1a0033] border border-[#4d0099] rounded-3xl p-5 mb-8">
          <Text className="text-white text-xs mb-2 ml-1">Vấn đề của bạn</Text>
          <View className="bg-[#0a0014] border border-[#4d0099] rounded-2xl px-4 py-3 mb-4 min-h-[120px]">
            <TextInput
              multiline
              textAlignVertical="top"
              className="text-white text-sm"
              placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
              placeholderTextColor="#4d0099"
            />
          </View>
          <TouchableOpacity 
            onPress={() => Alert.alert('Gửi thành công', 'Cảm ơn phản hồi của bạn, chúng tôi sẽ sớm liên hệ lại.')}
            className="bg-[#00e5ff] h-12 rounded-xl items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)]"
          >
            <Text className="text-[#0a0014] font-bold">Gửi yêu cầu hỗ trợ</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-sm font-bold text-[#b388ff] uppercase tracking-wider mb-4 ml-2">Liên hệ trực tiếp</Text>
        <View className="flex-row gap-4 mb-10">
          <TouchableOpacity className="flex-1 bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 items-center">
            <MaterialIcons name="email" size={24} color="#d500f9" />
            <Text className="text-white font-bold mt-2">Email</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 items-center">
            <MaterialIcons name="phone" size={24} color="#00e5ff" />
            <Text className="text-white font-bold mt-2">Hotline</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-[#1a0033] border border-[#4d0099] rounded-2xl p-4 items-center">
            <MaterialIcons name="chat" size={24} color="#7c4dff" />
            <Text className="text-white font-bold mt-2">Live Chat</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
