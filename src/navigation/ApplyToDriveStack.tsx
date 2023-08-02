import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import InfoScreen from '../screens/apply-to-drive/Info';
import Questionnaire from '../screens/apply-to-drive/Questionnaire';
import {ApplyToDriveStackParamList} from './NavigatorTypes';
import Complete from '../screens/apply-to-drive/Complete';
import BackgroundCheck from '../screens/apply-to-drive/BackgroundCheck';
import VehiclePhotos from '../screens/apply-to-drive/VehiclePhotos';
import VehicleScreen from '../screens/apply-to-drive/VehicleScreen';
import Payouts from '../screens/apply-to-drive/Payouts';
import Verify from '../screens/apply-to-drive/Verify';
import Personal from '../screens/apply-to-drive/Personal';
import CreateAccount from '../screens/apply-to-drive/CreateAccount';
import RMISScreen from '../screens/apply-to-drive/RMISScreen';
import {ApplyToDriverHeader} from '../components/apply-to-driver-header';

const Stack = createNativeStackNavigator<ApplyToDriveStackParamList>();

export default function ApplyToDriveStack() {
  return (
    <Stack.Navigator id="ApplyToDrive">
      <Stack.Screen
        name="Info"
        component={InfoScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Questionnaire"
        component={Questionnaire}
        options={{
          headerShown: true,
          header: () => (
            <ApplyToDriverHeader title="Apply To Drive" step="Step 1" />
          ),
          headerLargeTitle: true,
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
          },
          headerStyle: {
            backgroundColor: '#222B45',
          },
        }}
      />
      <Stack.Screen
        name="CreateAccount"
        component={CreateAccount}
        options={{
          headerShown: true,
          header: () => (
            <ApplyToDriverHeader title="Apply To Drive" step="Step 2" />
          ),
          headerLargeTitle: true,
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
          },
          headerStyle: {
            backgroundColor: '#222B45',
          },
        }}
      />
      <Stack.Screen
        name="Personal"
        component={Personal}
        options={{
          headerShown: true,
          header: () => (
            <ApplyToDriverHeader title="Apply To Drive" step="Step 3" />
          ),
          headerLargeTitle: true,
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
          },
          headerStyle: {
            backgroundColor: '#222B45',
          },
        }}
      />
      <Stack.Screen
        name="Verify"
        component={Verify}
        options={{
          headerShown: true,
          header: () => (
            <ApplyToDriverHeader title="Apply To Drive" step="Step 4" />
          ),
          headerLargeTitle: true,
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
          },
          headerStyle: {
            backgroundColor: '#222B45',
          },
        }}
      />
      <Stack.Screen
        name="Payouts"
        component={Payouts}
        options={{
          headerShown: true,
          header: () => (
            <ApplyToDriverHeader title="Apply To Drive" step="Step 5" />
          ),
          headerLargeTitle: true,
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
          },
          headerStyle: {
            backgroundColor: '#222B45',
          },
        }}
      />
      <Stack.Screen
        name="Vehicle"
        component={VehicleScreen}
        options={{
          headerShown: true,
          header: () => (
            <ApplyToDriverHeader title="Apply To Drive" step="Step 6" />
          ),
          headerLargeTitle: true,
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
          },
          headerStyle: {
            backgroundColor: '#222B45',
          },
        }}
      />
      <Stack.Screen
        name="VehiclePhotos"
        component={VehiclePhotos}
        options={{
          headerShown: true,
          header: () => (
            <ApplyToDriverHeader title="Apply To Drive" step="Step 7" />
          ),
          headerLargeTitle: true,
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
          },
          headerStyle: {
            backgroundColor: '#222B45',
          },
        }}
      />
      <Stack.Screen
        name="BackgroundCheck"
        component={BackgroundCheck}
        options={{
          headerShown: true,
          header: () => (
            <ApplyToDriverHeader title="Apply To Drive" step="Step 8" />
          ),
          headerLargeTitle: true,
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
          },
          headerStyle: {
            backgroundColor: '#222B45',
          },
        }}
      />
      <Stack.Screen
        name="RMISScreen"
        component={RMISScreen}
        options={{
          headerShown: true,
          header: () => (
            <ApplyToDriverHeader title="Apply To Drive" step="Step 9" />
          ),
          headerLargeTitle: true,
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
          },
          headerStyle: {
            backgroundColor: '#222B45',
          },
        }}
      />
      <Stack.Screen
        name="Complete"
        component={Complete}
        options={{
          headerShown: true,
          header: () => (
            <ApplyToDriverHeader title="Apply To Drive" step="Step 10" />
          ),
          headerLargeTitle: true,
          headerTitleStyle: {
            fontSize: 20,
            color: 'white',
          },
          headerStyle: {
            backgroundColor: '#222B45',
          },
        }}
      />
    </Stack.Navigator>
  );
}
