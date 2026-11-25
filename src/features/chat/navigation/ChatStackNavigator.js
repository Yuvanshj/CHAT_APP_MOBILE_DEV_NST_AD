import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ConversationsScreen } from '../screens/ConversationsScreen.js';
import { ChatScreen } from '../screens/ChatScreen.js';
import { COLORS } from '../constants/theme.js';

const Stack = createNativeStackNavigator();

export const ChatStackNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ConversationList"
      screenOptions={{
        headerBackButtonDisplayMode: 'generic',
        headerTintColor: '#FFFFFF',
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: '#FFFFFF',
        },
      }}
    >
      <Stack.Screen
        name="ConversationList"
        component={ConversationsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }) => ({
          headerTitle: route.params?.data?.name ?? 'Chat',
          headerBackTitle: 'Back',
        })}
      />
    </Stack.Navigator>
  );
};

export default ChatStackNavigator;
