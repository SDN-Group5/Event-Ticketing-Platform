import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import Explore from '../screens/Explore';
import MyTickets from '../screens/MyTickets';
import MyEvents from '../screens/MyEvents';
import Profile from '../screens/Profile';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialIcons.glyphMap = 'explore';

          if (route.name === 'Explore') iconName = 'explore';
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
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen name="Explore" component={Explore} />
      <Tab.Screen name="Tickets" component={MyTickets} />
      <Tab.Screen name="Manage" component={MyEvents} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
