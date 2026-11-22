import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ChatStackNavigator } from './ChatStackNavigator.js';
import { AllUsersScreen } from '../screens/AllUsersScreen.js';
import { ImagePickerScreen } from '../screens/ImagePickerScreen.js';
import { CameraScreen } from '../screens/CameraScreen.js';
import { RawCameraScreen } from '../screens/RawCameraScreen.js';
import { COLORS } from '../constants/theme.js';

const Tab = createBottomTabNavigator();

const TabIcon = ({ icon, focused }) => (
  <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>
);

export const RootNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Conversations"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Conversations"
        component={ChatStackNavigator}
        options={{
          tabBarLabel: 'Chats',
          tabBarIcon: ({ focused }) => <TabIcon icon="💬" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AllUsers"
        component={AllUsersScreen}
        options={{
          tabBarLabel: 'Users',
          tabBarIcon: ({ focused }) => <TabIcon icon="👥" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ImagePickerScreen"
        component={ImagePickerScreen}
        options={{
          tabBarLabel: 'Gallery',
          tabBarIcon: ({ focused }) => <TabIcon icon="🖼️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CameraScreen"
        component={CameraScreen}
        options={{
          tabBarLabel: 'Camera',
          tabBarIcon: ({ focused }) => <TabIcon icon="📷" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="RawCameraScreen"
        component={RawCameraScreen}
        options={{
          tabBarLabel: 'Live View',
          tabBarIcon: ({ focused }) => <TabIcon icon="📹" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  icon: {
    fontSize: 20,
    opacity: 0.7,
  },
  iconFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
});

export default RootNavigator;
