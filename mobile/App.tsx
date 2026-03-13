import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContextType';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { PaymentTimerProvider } from './src/context/PaymentTimerContext';
import { FloatingPaymentTimer } from './src/components/FloatingPaymentTimer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ThemeProvider>
            <PaymentTimerProvider>
              <NavigationContainer>
                <StatusBar style="auto" />
                <AppNavigator />
                <FloatingPaymentTimer />
              </NavigationContainer>
            </PaymentTimerProvider>
          </ThemeProvider>
        </AuthProvider>
      </SafeAreaProvider>
      <Toast />
    </GestureHandlerRootView>
  );
};

export default App;
