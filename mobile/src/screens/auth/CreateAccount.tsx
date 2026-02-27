import React, { useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
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
  const { signInAsUser } = useAuth();

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideUpAnim = useSharedValue(50);
  const logoScale = useSharedValue(0.5);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });
    fadeAnim.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
    slideUpAnim.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));
  }, []);

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
        <View className="flex-[0.25] justify-center items-center pt-8">
          <Animated.View style={animatedLogoStyle} className="items-center">
            <View className="w-16 h-16 bg-[#1a0033] rounded-2xl items-center justify-center border-2 border-[#d500f9] shadow-[0_0_20px_rgba(213,0,249,0.5)] mb-3">
              <MaterialIcons name="graphic-eq" size={32} color="#00e5ff" />
            </View>
            <Text className="text-3xl font-black text-white tracking-widest" style={styles.textGlow}>
              EVENTIX
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Section: Form */}
        <Animated.View 
          style={animatedFormStyle} 
          className="flex-[0.75] bg-[#1a0033]/80 rounded-t-[40px] px-8 pt-8 border-t border-[#4d0099]/50"
        >
          <Text className="text-3xl font-bold text-white mb-2">Create Account</Text>
          <Text className="text-sm text-[#b388ff] mb-6">Join us to discover amazing events near you</Text>

          <View className="mb-4">
            <View className="flex-row items-center bg-[#0a0014]/90 border border-[#4d0099] h-14 rounded-2xl px-4">
              <MaterialIcons name="person" size={22} color="#b388ff" />
              <TextInput 
                className="flex-1 ml-3 text-base text-white"
                placeholder="Full Name"
                placeholderTextColor="#6a1b9a"
              />
            </View>
          </View>

          <View className="mb-4">
            <View className="flex-row items-center bg-[#0a0014]/90 border border-[#4d0099] h-14 rounded-2xl px-4">
              <MaterialIcons name="email" size={22} color="#b388ff" />
              <TextInput 
                className="flex-1 ml-3 text-base text-white"
                placeholder="Email Address"
                placeholderTextColor="#6a1b9a"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View className="mb-6">
            <View className="flex-row items-center bg-[#0a0014]/90 border border-[#4d0099] h-14 rounded-2xl px-4">
              <MaterialIcons name="lock" size={22} color="#b388ff" />
              <TextInput 
                className="flex-1 ml-3 text-base text-white"
                placeholder="Password"
                placeholderTextColor="#6a1b9a"
                secureTextEntry
              />
              <TouchableOpacity>
                <MaterialIcons name="visibility-off" size={22} color="#6a1b9a" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={signInAsUser}
            className="w-full bg-[#d500f9] h-14 rounded-2xl items-center justify-center mb-6 shadow-[0_0_20px_rgba(213,0,249,0.4)]"
          >
            <Text className="text-white font-bold text-lg tracking-wide">Sign Up</Text>
          </TouchableOpacity>

          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-[#4d0099]/50" />
            <Text className="mx-4 text-[#b388ff] text-xs font-medium uppercase tracking-wider">Or continue with</Text>
            <View className="flex-1 h-[1px] bg-[#4d0099]/50" />
          </View>

          <View className="flex-row justify-between mb-6">
            <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-[#0a0014]/90 border border-[#4d0099] h-14 rounded-2xl mr-2">
              <FontAwesome5 name="google" size={18} color="#fff" />
              <Text className="font-bold text-white ml-3">Google</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-[#0a0014]/90 border border-[#4d0099] h-14 rounded-2xl ml-2">
              <FontAwesome5 name="facebook-f" size={18} color="#fff" />
              <Text className="font-bold text-white ml-3">Facebook</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center items-center pb-8 mt-auto">
            <Text className="text-[#b388ff]">Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-[#00e5ff] font-bold">Sign in</Text>
            </TouchableOpacity>
          </View>
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
