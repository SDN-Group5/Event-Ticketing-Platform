import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

import Explore from '../screens/Explore';
import MyTickets from '../screens/MyTickets';
import MyEvents from '../screens/MyEvents';
import Profile from '../screens/Profile';
import UserScreen from '../screens/user/UserHomeScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = 'home';

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Explore') iconName = 'explore';
          else if (route.name === 'Tickets') iconName = 'local-activity';
          else if (route.name === 'Manage') iconName = 'event';
          else if (route.name === 'Profile') iconName = 'person';

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#d500f9', // Neon purple active
        tabBarInactiveTintColor: '#6a1b9a', // Darker purple inactive
        tabBarStyle: {
          backgroundColor: '#0a0014', // Very dark neon background
          borderTopColor: '#4d0099', // Neon purple border
          height: Platform.OS === 'ios' ? 70 + insets.bottom : 70,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 10,
          paddingTop: 10,
        },
      })}
    >
      <Tab.Screen name="Home" component={UserScreen} />
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen name="Tickets" component={MyTickets} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
