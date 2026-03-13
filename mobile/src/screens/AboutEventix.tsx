import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

export default function AboutEventix({ navigation }: any) {
  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Về Eventix</Text>
      </View>

      <ScrollView className="flex-1 px-4">
        <View className="items-center py-10">
          <View className="w-24 h-24 bg-[#d500f9] rounded-3xl items-center justify-center shadow-[0_0_20px_#d500f9]">
            <MaterialIcons name="confirmation-number" size={50} color="white" />
          </View>
          <Text className="text-3xl font-extrabold text-white mt-6">Eventix</Text>
          <Text className="text-[#b388ff] mt-1 font-medium italic">Version 1.0.0 (Beta)</Text>
        </View>

        <View className="bg-[#1a0033] border border-[#4d0099] rounded-3xl p-6 mb-8">
          <Text className="text-xl font-bold text-white mb-4">Sứ mệnh của chúng tôi</Text>
          <Text className="text-[#b388ff] leading-6">
            Eventix là nền tảng quản lý và phân phối vé sự kiện hàng đầu, được xây dựng để mang lại trải nghiệm mua vé mượt mà, bảo mật và hiện đại cho mọi người yêu thích nghệ thuật và giải trí.
          </Text>
          <Text className="text-[#b388ff] leading-6 mt-4">
            Chúng tôi tin rằng việc tiếp cận các sự kiện văn hóa, âm nhạc và thể thao nên thật đơn giản - chỉ với vài bước chạm trên điện thoại của bạn.
          </Text>
        </View>

        <View className="bg-[#1a0033] border border-[#4d0099] rounded-3xl p-6 mb-8">
          <Text className="text-xl font-bold text-white mb-6">Kết nối với chúng tôi</Text>
          <View className="flex-row justify-around">
            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 bg-[#3b5998] rounded-full items-center justify-center mb-2">
                <FontAwesome name="facebook" size={24} color="white" />
              </View>
              <Text className="text-white text-xs">Facebook</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 bg-[#000000] rounded-full items-center justify-center mb-2 border border-[#4d0099]">
                <FontAwesome name="github" size={24} color="white" />
              </View>
              <Text className="text-white text-xs">Github</Text>
            </TouchableOpacity>
            <TouchableOpacity className="items-center">
              <View className="w-12 h-12 bg-[#e1306c] rounded-full items-center justify-center mb-2">
                <FontAwesome name="instagram" size={24} color="white" />
              </View>
              <Text className="text-white text-xs">Instagram</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="items-center pb-10">
          <Text className="text-[#4d0099] text-xs font-bold text-center">
            © 2026 Eventix Team. All rights reserved.{"\n"}
            Designed for FPT University Case Study.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
