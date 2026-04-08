import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { colors } from '../constants/theme';
import { ContextInputScreen } from '../screens/ContextInputScreen';
import { MatchResultScreen } from '../screens/MatchResultScreen';
import { SavedPoemsScreen } from '../screens/SavedPoemsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useAppState } from '../state/AppStateContext';
import type { ContextProfile, MatchResult } from '../types/models';

export type InputStackParamList = {
  ContextInput: undefined;
  MatchResult: {
    result: MatchResult;
    context: ContextProfile;
    source: 'ai' | 'backend' | 'local';
    warning?: string;
  };
};

const Tab = createBottomTabNavigator();
const InputStack = createNativeStackNavigator<InputStackParamList>();

function InputFlowNavigator() {
  return (
    <InputStack.Navigator>
      <InputStack.Screen
        name="ContextInput"
        component={ContextInputScreen}
        options={{ title: 'Context Input' }}
      />
      <InputStack.Screen
        name="MatchResult"
        component={MatchResultScreen}
        options={{ title: 'Match Result' }}
      />
    </InputStack.Navigator>
  );
}

export function AppNavigator() {
  const { isHydrating } = useAppState();

  if (isHydrating) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ marginTop: 12, color: colors.inkSoft }}>Loading your poetry companion…</Text>
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background: colors.bg,
          card: colors.card,
          text: colors.ink,
          primary: colors.accent,
          border: colors.border,
        },
      }}
    >
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.inkSoft,
        }}
      >
        <Tab.Screen name="Input" component={InputFlowNavigator} />
        <Tab.Screen
          name="Saved Poems"
          component={SavedPoemsScreen}
          options={{ headerShown: true }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ headerShown: true }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}