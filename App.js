import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import HomeScreen from './src/screens/HomeScreen';
import ToolsScreen from './src/screens/ToolsScreen';
import BreatheScreen from './src/screens/BreatheScreen';
import TrackingScreen from './src/screens/TrackingScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  HomeTab: { icon: '🏠', label: 'Home' },
  ToolsTab: { icon: '🆘', label: 'Tools' },
  BreatheTab: { icon: '🌬️', label: 'Breathe' },
  TrackTab: { icon: '📊', label: 'Progress' },
};

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
              {TAB_ICONS[route.name]?.icon}
            </Text>
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={{
              fontSize: 11,
              fontWeight: focused ? '700' : '500',
              color: focused ? '#4A90D9' : '#7F8C8D',
              marginTop: -2,
            }}>
              {TAB_ICONS[route.name]?.label}
            </Text>
          ),
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopColor: '#E0E6ED',
            paddingTop: 6,
            height: 85,
          },
          headerStyle: { backgroundColor: '#F5F7FA', shadowColor: 'transparent', elevation: 0 },
          headerTitleStyle: { fontWeight: '700', color: '#2C3E50' },
        })}
      >
        <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Recovery Companion' }} />
        <Tab.Screen name="ToolsTab" component={ToolsScreen} options={{ title: 'Craving Tools' }} />
        <Tab.Screen name="BreatheTab" component={BreatheScreen} options={{ title: 'Breathe' }} />
        <Tab.Screen name="TrackTab" component={TrackingScreen} options={{ title: 'Progress' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
