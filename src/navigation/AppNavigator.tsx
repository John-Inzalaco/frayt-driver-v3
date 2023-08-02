import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeTabs from './HomeTabs';
import ApplyToDriveStack from './ApplyToDriveStack';
import AuthStack from './AuthStack';
import {RootStackParamList} from './NavigatorTypes';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator id="App" initialRouteName="Auth">
      <Stack.Screen
        name="Auth"
        component={AuthStack}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Home"
        component={HomeTabs}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ApplyToDrive"
        component={ApplyToDriveStack}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
