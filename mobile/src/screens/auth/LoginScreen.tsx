import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useAuth } from '../../context/AuthContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

// Đảm bảo browser OAuth có thể đóng khi redirect về app
WebBrowser.maybeCompleteAuthSession();

// ─── Redirect URI ────────────────────────────────────────────────────────────
// makeRedirectUri với scheme trả về "eventix://" cho dev build / standalone.
// Expo Go không hỗ trợ custom scheme → cần chạy bằng: npx expo run:android
const REDIRECT_URI = makeRedirectUri({
  scheme: 'eventix',  // khớp với "scheme" trong app.json
});

export default function Login({ navigation }: any) {
  const { login, loginWithGoogle, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? webClientId;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? webClientId;

  // ─── Google Auth Request ──────────────────────────────────────────────────
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    androidClientId,
    iosClientId,
    redirectUri: REDIRECT_URI,
  });

  // ─── Log redirectUri để debug ─────────────────────────────────────────────
  useEffect(() => {
    console.log('═══════════════════════════════════════════════');
    console.log('[Google OAuth] redirectUri =', REDIRECT_URI);
    console.log('� Thêm URI này vào Google Cloud Console:');
    console.log('   OAuth 2.0 Client (Web) → Authorized redirect URIs');
    console.log('📌 Chạy bằng: npx expo run:android (không phải expo start)');
    console.log('═══════════════════════════════════════════════');
  }, []);

  // ─── Xử lý response từ Google ─────────────────────────────────────────────
  useEffect(() => {
    if (!response) return;

    console.log('[Google] response.type =', response.type);

    if (response.type === 'success') {
      // Thử lấy idToken từ nhiều nơi (vì tuỳ platform/flow)
      const idToken: string | undefined =
        (response.authentication as any)?.idToken ??
        (response.params as any)?.id_token;

      if (!idToken) {
        console.warn('[Google] Không tìm thấy idToken trong response:', JSON.stringify(response, null, 2));
        Alert.alert(
          'Lỗi Google Login',
          'Không nhận được ID token từ Google. Vui lòng thử lại.',
        );
        setGoogleLoading(false);
        return;
      }

      console.log('[Google] idToken prefix =', idToken.slice(0, 20), '...');
      loginWithGoogle(idToken).finally(() => setGoogleLoading(false));
    } else if (response.type === 'cancel' || response.type === 'dismiss') {
      console.log('[Google] Người dùng huỷ đăng nhập Google');
      setGoogleLoading(false);
    } else {
      console.warn('[Google] Lỗi:', response.type, (response as any)?.error);
      setGoogleLoading(false);
    }
  }, [response, loginWithGoogle]);

  const handleGooglePress = () => {
    if (!webClientId) {
      Alert.alert('Cấu hình thiếu', 'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID chưa được set trong .env');
      return;
    }
    setGoogleLoading(true);
    promptAsync();
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập email và mật khẩu.');
      return;
    }
    await login(email.trim(), password);
  };

  // ─── Animations ───────────────────────────────────────────────────────────
  const fadeAnim = useSharedValue(0);
  const slideUpAnim = useSharedValue(50);
  const logoScale = useSharedValue(0.5);
  const float1 = useSharedValue(0);
  const float2 = useSharedValue(0);
  const float3 = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });
    fadeAnim.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
    slideUpAnim.value = withDelay(200, withSpring(0, { damping: 15, stiffness: 100 }));

    float1.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      ), -1, true,
    );
    float2.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      ), -1, true,
    );
    float3.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(15, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
      ), -1, true,
    );
  }, []);

  const animatedFormStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideUpAnim.value }],
  }));

  const animatedLogoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: fadeAnim.value,
  }));

  const animatedFloat1 = useAnimatedStyle(() => ({ transform: [{ translateY: float1.value }] }));
  const animatedFloat2 = useAnimatedStyle(() => ({ transform: [{ translateY: float2.value }, { translateX: float2.value }] }));
  const animatedFloat3 = useAnimatedStyle(() => ({ transform: [{ translateY: float3.value }, { translateX: -float3.value }] }));

  const isGoogleBusy = googleLoading || authLoading;

  // ─── Render ───────────────────────────────────────────────────────────────
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
        {/* Floating glow blobs */}
        <View className="absolute inset-0 overflow-hidden">
          <Animated.View style={[animatedFloat1, styles.glowBlob, { top: '10%', left: '-10%', backgroundColor: 'rgba(213, 0, 249, 0.3)' }]} />
          <Animated.View style={[animatedFloat2, styles.glowBlob, { top: '40%', right: '-20%', backgroundColor: 'rgba(0, 229, 255, 0.25)' }]} />
          <Animated.View style={[animatedFloat3, styles.glowBlob, { bottom: '-10%', left: '20%', backgroundColor: 'rgba(124, 77, 255, 0.3)' }]} />
        </View>

        {/* Dark gradient overlay */}
        <LinearGradient
          colors={['rgba(10, 0, 20, 0.4)', 'rgba(10, 0, 20, 0.8)', '#0a0014']}
          className="absolute inset-0"
        />

        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo & Title ── */}
          <View className="min-h-[250px] justify-center items-center pt-12">
            <Animated.View style={animatedLogoStyle} className="items-center">
              <View className="w-20 h-20 bg-[#1a0033] rounded-3xl items-center justify-center border-2 border-[#d500f9] mb-4" style={styles.logoGlow}>
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

          {/* ── Login Form ── */}
          <Animated.View
            style={animatedFormStyle}
            className="flex-1 bg-[#1a0033]/80 rounded-t-[40px] px-8 pt-8 border-t border-[#4d0099]/50"
          >
            <Text className="text-3xl font-bold text-white mb-2">Welcome Back</Text>
            <Text className="text-sm text-[#b388ff] mb-6">Sign in to discover amazing events near you</Text>

            {/* Email */}
            <View className="mb-4">
              <View className="flex-row items-center bg-[#0a0014]/90 border border-[#4d0099] h-14 rounded-2xl px-4">
                <MaterialIcons name="email" size={22} color="#b388ff" />
                <TextInput
                  className="flex-1 ml-3 text-base text-white"
                  placeholder="Email Address"
                  placeholderTextColor="#6a1b9a"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password */}
            <View className="mb-2">
              <View className="flex-row items-center bg-[#0a0014]/90 border border-[#4d0099] h-14 rounded-2xl px-4">
                <MaterialIcons name="lock" size={22} color="#b388ff" />
                <TextInput
                  className="flex-1 ml-3 text-base text-white"
                  placeholder="Password"
                  placeholderTextColor="#6a1b9a"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
                  <MaterialIcons
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={22}
                    color="#6a1b9a"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              className="items-end mb-6"
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text className="text-sm font-bold text-[#00e5ff]">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={authLoading}
              className="w-full bg-[#d500f9] h-14 rounded-2xl items-center justify-center mb-4"
              style={styles.signInGlow}
            >
              {authLoading && !googleLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg tracking-wide">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-[1px] bg-[#4d0099]/50" />
              <Text className="mx-4 text-[#b388ff] text-xs font-medium uppercase tracking-wider">Or continue with</Text>
              <View className="flex-1 h-[1px] bg-[#4d0099]/50" />
            </View>

            {/* ── Google Sign In Button ── */}
            <TouchableOpacity
              onPress={handleGooglePress}
              disabled={isGoogleBusy || !request}
              className="w-full flex-row items-center justify-center bg-white h-14 rounded-2xl mb-4"
              style={styles.googleBtn}
              activeOpacity={0.85}
            >
              {isGoogleBusy ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <>
                  {/* Google "G" logo colours */}
                  <View style={styles.googleIconWrap}>
                    <FontAwesome5 name="google" size={20} color="#4285F4" />
                  </View>
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Create Account */}
            <View className="flex-row justify-center items-center pb-8 mt-auto pt-4">
              <Text className="text-[#b388ff]">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
                <Text className="text-[#00e5ff] font-bold">Create an account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
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
  logoGlow: {
    shadowColor: 'rgba(213, 0, 249, 0.5)',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 25,
    shadowOpacity: 1,
    elevation: 12,
  },
  signInGlow: {
    shadowColor: 'rgba(213, 0, 249, 0.4)',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 20,
    shadowOpacity: 1,
    elevation: 8,
  },
  glowBlob: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.6,
  },
  googleBtn: {
    shadowColor: 'rgba(0,0,0,0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    shadowOpacity: 1,
    elevation: 4,
  },
  googleIconWrap: {
    marginRight: 12,
  },
  googleBtnText: {
    color: '#1f1f1f',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});
