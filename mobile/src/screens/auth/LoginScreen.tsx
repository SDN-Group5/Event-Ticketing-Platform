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
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function Login({ navigation }: any) {
  const { signInAsUser } = useAuth();

  // Animation values
  const fadeAnim = useSharedValue(0);
  const slideUpAnim = useSharedValue(50);
  const logoScale = useSharedValue(0.5);
  
  // Background floating animations
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);

  useEffect(() => {
    // Sequence of animations on mount
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });
    fadeAnim.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
    slideUpAnim.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));

    // Continuous floating background animations
    float1.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1, // infinite
      true // reverse
    );

    float2.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    float3.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(15, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
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

  const animatedFloat1 = useAnimatedStyle(() => ({ transform: [{ translateY: float1.value }] }));
  const animatedFloat2 = useAnimatedStyle(() => ({ transform: [{ translateY: float2.value }, { translateX: float2.value }] }));
  const animatedFloat3 = useAnimatedStyle(() => ({ transform: [{ translateY: float3.value }, { translateX: -float3.value }] }));

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
        {/* Animated Background Elements */}
        <View className="absolute inset-0 overflow-hidden">
          <Animated.View style={[animatedFloat1, styles.glowBlob, { top: '10%', left: '-10%', backgroundColor: 'rgba(213, 0, 249, 0.3)' }]} />
          <Animated.View style={[animatedFloat2, styles.glowBlob, { top: '40%', right: '-20%', backgroundColor: 'rgba(0, 229, 255, 0.25)' }]} />
          <Animated.View style={[animatedFloat3, styles.glowBlob, { bottom: '-10%', left: '20%', backgroundColor: 'rgba(124, 77, 255, 0.3)' }]} />
        </View>

        {/* Dark gradient overlay to make text readable but keep background visible */}
        <LinearGradient
          colors={['rgba(10, 0, 20, 0.4)', 'rgba(10, 0, 20, 0.8)', '#0a0014']}
          className="absolute inset-0"
        />
        
        {/* Top Section: Logo & Title */}
        <View className="flex-[0.35] justify-center items-center pt-12">
          <Animated.View style={animatedLogoStyle} className="items-center">
            {/* Logo Container with solid background to prevent blurriness */}
            <View className="w-20 h-20 bg-[#1a0033] rounded-3xl items-center justify-center border-2 border-[#d500f9] shadow-[0_0_25px_rgba(213,0,249,0.5)] mb-4">
              <MaterialIcons name="graphic-eq" size={44} color="#00e5ff" />
            </View>
            <Text className="text-5xl font-black text-white tracking-widest" style={styles.textGlow}>
              EVENTIX
            </Text>
            <Text className="text-[#00e5ff] font-bold mt-2 uppercase text-xs" style={{ letterSpacing: 3 }}>
              Live The Moment
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Section: Form */}
        <Animated.View 
          style={animatedFormStyle} 
          className="flex-[0.65] bg-[#1a0033]/80 rounded-t-[40px] px-8 pt-8 border-t border-[#4d0099]/50"
        >
          <Text className="text-3xl font-bold text-white mb-2">Welcome Back</Text>
          <Text className="text-sm text-[#b388ff] mb-6">Sign in to discover amazing events near you</Text>

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

          <View className="mb-2">
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

          <TouchableOpacity className="items-end mb-6">
            <Text className="text-sm font-bold text-[#00e5ff]">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={signInAsUser}
            className="w-full bg-[#d500f9] h-14 rounded-2xl items-center justify-center mb-6 shadow-[0_0_20px_rgba(213,0,249,0.4)]"
          >
            <Text className="text-white font-bold text-lg tracking-wide">Sign In</Text>
          </TouchableOpacity>

          {/* Social Login Section */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[1px] bg-[#4d0099]/50" />
            <Text className="mx-4 text-[#b388ff] text-xs font-medium uppercase tracking-wider">Or continue with</Text>
            <View className="flex-1 h-[1px] bg-[#4d0099]/50" />
          </View>

          <View className="flex-row justify-between mb-8">
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
            <Text className="text-[#b388ff]">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
              <Text className="text-[#00e5ff] font-bold">Create an account</Text>
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
  },
  glowBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    filter: 'blur(40px)', // Note: filter blur works on web, on mobile it relies on opacity/gradient
  }
});
