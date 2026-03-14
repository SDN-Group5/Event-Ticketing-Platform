import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, TextInput, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthAPI } from '../../services/authApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SecuritySettings({ navigation }: any) {
  const [faceId, setFaceId] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  
  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng điền đầy đủ thông tin',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu mới không khớp',
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      });
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('auth_token');
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Phiên đăng nhập hết hạn',
        });
        return;
      }

      await AuthAPI.changePassword(token, {
        currentPassword,
        newPassword,
      });

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đổi mật khẩu thành công',
      });
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Change password error:', error);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: error.message || 'Không thể đổi mật khẩu',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0a0014]">
      <View className="flex-row items-center p-4 pt-12 bg-[#1a0033] border-b border-[#4d0099]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center border border-[#4d0099]">
          <MaterialIcons name="arrow-back" size={24} color="#d500f9" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-lg font-bold text-white pr-10">Bảo mật</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6">
        <Text className="text-sm font-bold text-[#b388ff] uppercase tracking-wider mb-4 ml-2">Xác thực</Text>
        
        <View className="bg-[#1a0033] border border-[#4d0099] rounded-3xl overflow-hidden mb-8">
          <TouchableOpacity 
            onPress={() => setIsChangingPassword(!isChangingPassword)}
            className="flex-row items-center justify-between p-5 border-b border-[#4d0099]"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center mr-4">
                <MaterialIcons name="lock" size={20} color="#00e5ff" />
              </View>
              <Text className="text-base font-bold text-white">Đổi mật khẩu</Text>
            </View>
            <MaterialIcons name={isChangingPassword ? "expand-less" : "expand-more"} size={24} color="#6a1b9a" />
          </TouchableOpacity>

          {isChangingPassword && (
            <View className="p-5 bg-[#140026]">
              <Text className="text-xs text-[#b388ff] mb-2 ml-1">Mật khẩu hiện tại</Text>
              <View className="bg-[#0a0014] border border-[#4d0099] h-12 rounded-xl px-4 mb-4 flex-row items-center">
                <TextInput
                  secureTextEntry={!showCurrentPassword}
                  className="flex-1 text-white text-sm"
                  placeholder="Nhập mật khẩu hiện tại"
                  placeholderTextColor="#4d0099"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)} className="pl-2">
                  <MaterialIcons 
                    name={showCurrentPassword ? "visibility" : "visibility-off"} 
                    size={20} 
                    color="#6a1b9a" 
                  />
                </TouchableOpacity>
              </View>

              <Text className="text-xs text-[#b388ff] mb-2 ml-1">Mật khẩu mới</Text>
              <View className="bg-[#0a0014] border border-[#4d0099] h-12 rounded-xl px-4 mb-4 flex-row items-center">
                <TextInput
                  secureTextEntry={!showNewPassword}
                  className="flex-1 text-white text-sm"
                  placeholder="Nhập mật khẩu mới"
                  placeholderTextColor="#4d0099"
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} className="pl-2">
                  <MaterialIcons 
                    name={showNewPassword ? "visibility" : "visibility-off"} 
                    size={20} 
                    color="#6a1b9a" 
                  />
                </TouchableOpacity>
              </View>

              <Text className="text-xs text-[#b388ff] mb-2 ml-1">Xác nhận mật khẩu mới</Text>
              <View className="bg-[#0a0014] border border-[#4d0099] h-12 rounded-xl px-4 mb-6 flex-row items-center">
                <TextInput
                  secureTextEntry={!showConfirmPassword}
                  className="flex-1 text-white text-sm"
                  placeholder="Nhập lại mật khẩu mới"
                  placeholderTextColor="#4d0099"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="pl-2">
                  <MaterialIcons 
                    name={showConfirmPassword ? "visibility" : "visibility-off"} 
                    size={20} 
                    color="#6a1b9a" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                disabled={loading}
                onPress={handleChangePassword}
                className="bg-[#d500f9] h-12 rounded-xl items-center justify-center shadow-[0_0_15px_rgba(213,0,249,0.4)]"
              >
                {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Cập nhật mật khẩu</Text>}
              </TouchableOpacity>
            </View>
          )}

          <View className="flex-row items-center justify-between p-5 border-b border-[#4d0099]">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center mr-4">
                <MaterialIcons name="face" size={20} color="#d500f9" />
              </View>
              <Text className="text-base font-bold text-white">Face ID / Vân tay</Text>
            </View>
            <Switch
              value={faceId}
              onValueChange={setFaceId}
              trackColor={{ false: '#4d0099', true: '#d500f9' }}
              thumbColor={faceId ? '#fff' : '#b388ff'}
            />
          </View>

          <View className="flex-row items-center justify-between p-5">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center mr-4">
                <MaterialIcons name="security" size={20} color="#00e5ff" />
              </View>
              <Text className="text-base font-bold text-white">Xác thực 2 lớp (2FA)</Text>
            </View>
            <Switch
              value={twoFactor}
              onValueChange={setTwoFactor}
              trackColor={{ false: '#4d0099', true: '#d500f9' }}
              thumbColor={twoFactor ? '#fff' : '#b388ff'}
            />
          </View>
        </View>

        <Text className="text-sm font-bold text-[#b388ff] uppercase tracking-wider mb-4 ml-2">Thiết bị đang đăng nhập</Text>
        
        <View className="bg-[#1a0033] border border-[#4d0099] rounded-3xl overflow-hidden mb-8">
          <View className="flex-row items-center justify-between p-5 border-b border-[#4d0099]">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center mr-4">
                <MaterialIcons name="smartphone" size={20} color="#d500f9" />
              </View>
              <View>
                <Text className="text-base font-bold text-white">Thiết bị này</Text>
                <Text className="text-xs text-[#00e5ff] mt-1">Đang hoạt động</Text>
              </View>
            </View>
          </View>
          <View className="flex-row items-center justify-between p-5">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-[#2a004d] rounded-full items-center justify-center mr-4">
                <MaterialIcons name="laptop-mac" size={20} color="#6a1b9a" />
              </View>
              <View>
                <Text className="text-base font-bold text-white">Trình duyệt Web</Text>
                <Text className="text-xs text-[#b388ff] mt-1">Hoạt động 2 ngày trước</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Text className="text-red-500 font-bold">Đăng xuất</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
