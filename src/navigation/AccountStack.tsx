import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AccountStackProps, AccountStackParamList} from './NavigatorTypes';
import {AccountScreen} from '../screens/account/AccountScreen';
import {ProfileScreen} from '../screens/account/AccountProfileScreen';
import {VehicleScreen} from '../screens/account/VehicleScreen';
import {Text} from '../components/ui-kitten/Text';
import {Layout} from '@ui-kitten/components';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import {NotificationsScreen} from '../screens/account/NotificationsScreen';
import PasswordScreen from '../screens/account/PasswordScreen';
import LogoutScreen from '../screens/account/LogoutScreen';
import {PayoutsScreen} from '../screens/account/PayoutsScreen';
import {ReportsScreen} from '../screens/account/ReportsScreen';

const EmptyScreen = () => <View></View>;

const Stack = createNativeStackNavigator<AccountStackParamList>();

export function AccountStack({navigation}: AccountStackProps<'Account'>) {
  const screenOptions = {
    headerBackVisible: false,
    headerLeft: () => {
      return (
        <TouchableOpacity onPress={() => navigation.navigate('Account')}>
          <Icon name="arrow-left" size={18} color="white" />
        </TouchableOpacity>
      );
    },
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerTitle: props => {
          return <Text category="h6">{props.children}</Text>;
        },
        headerBackground: () => {
          return <Layout style={styles.headerContainer}></Layout>;
        },
        headerTitleAlign: 'center',
      }}>
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="Vehicle"
        component={VehicleScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="Payouts"
        component={PayoutsScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="Reports"
        component={ReportsScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="Password"
        component={PasswordScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="DeliverPro"
        component={EmptyScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="Logout"
        component={LogoutScreen}
        options={screenOptions}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
  },
});
