import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

// Navigators
import TabNavigator from './TabNavigator';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import CreateAccount from '../screens/auth/CreateAccount';
import ForgotPassword from '../screens/auth/ForgotPassword';
import VerifyEmail from '../screens/auth/VerifyEmail';

// App Screens
import EventDetail from '../screens/EventDetail';
import TicketSelection from '../screens/TicketSelection';
import Checkout from '../screens/Checkout';
import OrderConfirmation from '../screens/OrderConfirmation';
import TicketDetail from '../screens/TicketDetail';
import CreateEvent from '../screens/organizer/CreateEvent';
import SeatMapDesigner from '../screens/organizer/SeatMapDesigner';
import EditProfile from '../screens/EditProfile';
import SecuritySettings from '../screens/auth/SecuritySettings';
import Notifications from '../screens/Notifications';
import Explore from '../screens/Explore';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { auth } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {auth.role !== 'guest' ? (
        // User is signed in
        <Stack.Group>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="EventDetail" component={EventDetail} />
          <Stack.Screen name="TicketSelection" component={TicketSelection} />
          <Stack.Screen name="Checkout" component={Checkout} />
          <Stack.Screen name="OrderConfirmation" component={OrderConfirmation} />
          <Stack.Screen name="TicketDetail" component={TicketDetail} />
          <Stack.Screen name="CreateEvent" component={CreateEvent} />
          <Stack.Screen name="SeatMapDesigner" component={SeatMapDesigner} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="SecuritySettings" component={SecuritySettings} />
          <Stack.Screen name="Notifications" component={Notifications} />
          <Stack.Screen name="Explore" component={Explore} />
        </Stack.Group>
      ) : (
        // User is NOT signed in
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="CreateAccount" component={CreateAccount} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="VerifyEmail" component={VerifyEmail} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
