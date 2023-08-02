import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStackParamList} from './NavigatorTypes';
import {
  ApprovalScreen,
  LoginScreen,
  AgreementsScreen,
  UpdateCargoCapacityScreen,
  SetupWalletScreen,
  PermissionsScreen,
  DocumentsScreen,
  DocumentCaptureModal,
  LoadUnloadScreen,
  ForgotPasswordScreen,
  PasswordResetSuccessScreen,
  UpdatePasswordScreen,
  PasswordUpdatedScreen,
} from '../screens/auth';
import {useTheme} from '@ui-kitten/components';
import {Text} from '../components/ui-kitten/Text';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      id="AuthStack"
      screenOptions={{
        headerTitle: () => <Text category="h5">Onboarding</Text>,
        headerStyle: {
          backgroundColor: theme['color-basic-800'],
        },
        headerTitleAlign: 'center',
        headerBackVisible: false,
      }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Approval"
        component={ApprovalScreen}
        options={{headerShown: true}}
      />
      <Stack.Screen name="Permissions" component={PermissionsScreen} />
      <Stack.Screen
        name="AgreementsScreen"
        component={AgreementsScreen}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="UpdateCargoCapacityScreen"
        component={UpdateCargoCapacityScreen}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="SetupWalletScreen"
        component={SetupWalletScreen}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="DocumentsScreen"
        component={DocumentsScreen}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="DocumentCaptureModal"
        component={DocumentCaptureModal}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="LoadUnloadScreen"
        component={LoadUnloadScreen}
        options={{headerShown: true}}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PasswordResetSuccess"
        component={PasswordResetSuccessScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="UpdatePassword"
        component={UpdatePasswordScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PasswordUpdated"
        component={PasswordUpdatedScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
