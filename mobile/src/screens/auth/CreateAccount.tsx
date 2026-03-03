import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  withSpring,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function CreateAccount({ navigation }: any) {
  const { register, isLoading, error, clearError } = useAuth();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideUpAnim = useSharedValue(50);
  const logoScale = useSharedValue(0.5);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });
    fadeAnim.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
    slideUpAnim.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));
  }, []);

  // Clear errors when inputs change
  useEffect(() => {
    if (error || localError) {
      const timer = setTimeout(() => {
        clearError();
        setLocalError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, localError]);

  const animatedFormStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ translateY: slideUpAnim.value }],
    };
  });

  const animatedLogoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: fadeAnim.value,
    };
  });

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      setLocalError('Vui lòng nhập tên');
      return false;
    }

    if (firstName.trim().length < 2) {
      setLocalError('Tên phải có ít nhất 2 ký tự');
      return false;
    }

    if (!lastName.trim()) {
      setLocalError('Vui lòng nhập họ');
      return false;
    }

    if (lastName.trim().length < 2) {
      setLocalError('Họ phải có ít nhất 2 ký tự');
      return false;
    }

    if (!email.trim()) {
      setLocalError('Vui lòng nhập email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setLocalError('Email không hợp lệ');
      return false;
    }

    if (!password) {
      setLocalError('Vui lòng nhập mật khẩu');
      return false;
    }

    if (password.length < 6) {
      setLocalError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (password !== confirmPassword) {
      setLocalError('Mật khẩu xác nhận không khớp');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    setLocalError(null);
    clearError();

    if (!validateForm()) {
      return;
    }

    const result = await register(
      firstName.trim(),
      lastName.trim(),
      email.trim(),
      password
    );

    if (result.success) {
      if (result.requiresVerification && result.email) {
        // Navigate to email verification screen
        navigation.replace('VerifyEmail', { email: result.email });
      } else {
        // Should not happen, but handle it
        Alert.alert(
          'Đăng ký thành công',
          'Bạn có thể đăng nhập ngay bây giờ.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Login'),
            },
          ]
        );
      }
    } else {
      // Error is already set in AuthContext
    }
  };

  const displayError = error || localError;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#05000a]"
    >
      <ImageBackground
        source={{ uri: 'https://img.freepik.com/free-photo/optical-fiber-background_23-2149301532.jpg' }}
        className="flex-1"
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(10, 0, 20, 0.4)', 'rgba(10, 0, 20, 0.8)', '#0a0014']}
          className="absolute inset-0"
        />
        
        {/* Top Section: Logo & Title */}
        <View className="flex-[0.2] justify-center items-center pt-8">
          <Animated.View style={animatedLogoStyle} className="items-center">
            <View className="w-16 h-16 bg-[#1a0033] rounded-2xl items-center justify-center border-2 border-[#d500f9] shadow-[0_0_20px_rgba(213,0,249,0.5)] mb-3">
              <MaterialIcons name="confirmation-number" size={32} color="#00e5ff" />
            </View>
            <Text className="text-3xl font-black text-white tracking-widest" style={styles.textGlow}>
              TicketVibe
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Section: Form */}
        <Animated.View 
          style={animatedFormStyle} 
          className="flex-[0.8] bg-[#1a0033]/80 rounded-t-[40px] px-8 pt-8 border-t border-[#4d0099]/50"
        >
          <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            <Text className="text-3xl font-bold text-white mb-2">Create Account</Text>
            <Text className="text-sm text-[#b388ff] mb-6">Join us to discover amazing events near you</Text>

            {/* Error Message */}
            {displayError && (
              <View className="mb-4 bg-red-500/20 border border-red-500/50 rounded-xl p-3">
                <Text className="text-red-400 text-sm text-center">{displayError}</Text>
              </View>
            )}

            {/* First Name */}
            <View className="mb-4">
              <View className={`flex-row items-center bg-[#0a0014]/90 border h-14 rounded-2xl px-4 ${displayError && !firstName.trim() ? 'border-red-500/50' : 'border-[#4d0099]'}`}>
                <MaterialIcons name="person" size={22} color="#b388ff" />
                <TextInput 
                  className="flex-1 ml-3 text-base text-white"
                  placeholder="First Name"
                  placeholderTextColor="#6a1b9a"
                  value={firstName}
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (localError) setLocalError(null);
                  }}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Last Name */}
            <View className="mb-4">
              <View className={`flex-row items-center bg-[#0a0014]/90 border h-14 rounded-2xl px-4 ${displayError && !lastName.trim() ? 'border-red-500/50' : 'border-[#4d0099]'}`}>
                <MaterialIcons name="person" size={22} color="#b388ff" />
                <TextInput 
                  className="flex-1 ml-3 text-base text-white"
                  placeholder="Last Name"
                  placeholderTextColor="#6a1b9a"
                  value={lastName}
                  onChangeText={(text) => {
                    setLastName(text);
                    if (localError) setLocalError(null);
                  }}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Email */}
            <View className="mb-4">
              <View className={`flex-row items-center bg-[#0a0014]/90 border h-14 rounded-2xl px-4 ${displayError && !email.trim() ? 'border-red-500/50' : 'border-[#4d0099]'}`}>
                <MaterialIcons name="email" size={22} color="#b388ff" />
                <TextInput 
                  className="flex-1 ml-3 text-base text-white"
                  placeholder="Email Address"
                  placeholderTextColor="#6a1b9a"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (localError) setLocalError(null);
                  }}
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password */}
            <View className="mb-4">
              <View className={`flex-row items-center bg-[#0a0014]/90 border h-14 rounded-2xl px-4 ${displayError && !password ? 'border-red-500/50' : 'border-[#4d0099]'}`}>
                <MaterialIcons name="lock" size={22} color="#b388ff" />
                <TextInput 
                  className="flex-1 ml-3 text-base text-white"
                  placeholder="Password"
                  placeholderTextColor="#6a1b9a"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (localError) setLocalError(null);
                  }}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons 
                    name={showPassword ? "visibility-off" : "visibility"} 
                    size={22} 
                    color={showPassword ? "#b388ff" : "#6a1b9a"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View className="mb-6">
              <View className={`flex-row items-center bg-[#0a0014]/90 border h-14 rounded-2xl px-4 ${displayError && password !== confirmPassword ? 'border-red-500/50' : 'border-[#4d0099]'}`}>
                <MaterialIcons name="lock" size={22} color="#b388ff" />
                <TextInput 
                  className="flex-1 ml-3 text-base text-white"
                  placeholder="Confirm Password"
                  placeholderTextColor="#6a1b9a"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (localError) setLocalError(null);
                  }}
                  editable={!isLoading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <MaterialIcons 
                    name={showConfirmPassword ? "visibility-off" : "visibility"} 
                    size={22} 
                    color={showConfirmPassword ? "#b388ff" : "#6a1b9a"} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              className={`w-full h-14 rounded-2xl items-center justify-center mb-6 shadow-[0_0_20px_rgba(213,0,249,0.4)] ${isLoading ? 'bg-[#d500f9]/50' : 'bg-[#d500f9]'}`}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg tracking-wide">Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Social Login Section */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-[#4d0099]/50" />
              <Text className="mx-4 text-[#b388ff] text-xs font-medium uppercase tracking-wider">Or continue with</Text>
              <View className="flex-1 h-[1px] bg-[#4d0099]/50" />
            </View>

            <View className="flex-row justify-between mb-6">
              <TouchableOpacity 
                className="flex-1 flex-row items-center justify-center bg-[#0a0014]/90 border border-[#4d0099] h-14 rounded-2xl mr-2"
                disabled={isLoading}
              >
                <FontAwesome5 name="google" size={18} color="#fff" />
                <Text className="font-bold text-white ml-3">Google</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 flex-row items-center justify-center bg-[#0a0014]/90 border border-[#4d0099] h-14 rounded-2xl ml-2"
                disabled={isLoading}
              >
                <FontAwesome5 name="facebook-f" size={18} color="#fff" />
                <Text className="font-bold text-white ml-3">Facebook</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-center items-center pb-8 mt-auto">
              <Text className="text-[#b388ff]">Already have an account? </Text>
              <TouchableOpacity 
                onPress={() => navigation.replace('Login')}
                disabled={isLoading}
              >
                <Text className="text-[#00e5ff] font-bold">Sign in</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  textGlow: {
    textShadowColor: 'rgba(213, 0, 249, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  }
});
