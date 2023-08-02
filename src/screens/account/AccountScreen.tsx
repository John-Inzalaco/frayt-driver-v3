import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Layout, IndexPath, Menu, MenuItem} from '@ui-kitten/components';
import {Text} from '../../components/ui-kitten/Text';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';
import {AccountStackProps} from '../../navigation/NavigatorTypes';

export function AccountScreen({
  navigation,
}: AccountStackProps<'Account'>): React.ReactElement {
  const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(0));

  const ProfileIcon = evaProps => (
    <FontAwesome5Pro
      name={'user'}
      style={[styles.icon, {color: evaProps.style.tintColor}]}
      size={15}
      solid
    />
  );

  const VehicleIcon = evaProps => (
    <FontAwesome5Pro
      name={'truck'}
      style={[styles.icon, {color: evaProps.style.tintColor}]}
      size={15}
      solid
    />
  );
  const PayoutsIcon = evaProps => (
    <FontAwesome5Pro
      name={'credit-card'}
      style={[styles.icon, {color: evaProps.style.tintColor}]}
      size={15}
      solid
    />
  );
  const ReportsIcon = evaProps => (
    <FontAwesome5Pro
      name={'chart-bar'}
      style={[styles.icon, {color: evaProps.style.tintColor}]}
      size={15}
    />
  );
  const NotificationsIcon = evaProps => (
    <FontAwesome5Pro
      name={'mobile-alt'}
      style={[styles.icon, {color: evaProps.style.tintColor}]}
      size={15}
    />
  );
  const PasswordIcon = evaProps => (
    <FontAwesome5Pro
      name={'lock-alt'}
      style={[styles.icon, {color: evaProps.style.tintColor}]}
      size={15}
      solid
    />
  );
  const LogoutIcon = evaProps => (
    <FontAwesome5Pro
      name={'arrow-from-left'}
      style={[styles.icon, {color: evaProps.style.tintColor}]}
      size={15}
    />
  );
  return (
    <Layout style={styles.container} level="3">
      <View style={styles.menuView}>
        <Menu
          selectedIndex={selectedIndex}
          onSelect={index => setSelectedIndex(index)}>
          <MenuItem
            style={styles.menuItem}
            title={evaProps => <Text {...evaProps}>Profile</Text>}
            accessoryLeft={ProfileIcon}
            onPress={() => {
              navigation.navigate('Profile');
            }}
          />
          <MenuItem
            style={styles.menuItem}
            title={evaProps => <Text {...evaProps}>Vehicle</Text>}
            onPress={() => navigation.navigate('Vehicle')}
            accessoryLeft={VehicleIcon}
          />
          <MenuItem
            style={styles.menuItem}
            title={evaProps => <Text {...evaProps}>Payouts</Text>}
            onPress={() => {
              navigation.navigate('Payouts');
            }}
            accessoryLeft={PayoutsIcon}
          />
          <MenuItem
            style={styles.menuItem}
            title={evaProps => <Text {...evaProps}>Reports</Text>}
            onPress={() => {
              navigation.navigate('Reports');
            }}
            accessoryLeft={ReportsIcon}
          />
          <MenuItem
            style={styles.menuItem}
            title={evaProps => <Text {...evaProps}>Notifications</Text>}
            onPress={() => navigation.navigate('Notifications')}
            accessoryLeft={NotificationsIcon}
          />
          <MenuItem
            style={styles.menuItem}
            title={evaProps => <Text {...evaProps}>Password</Text>}
            onPress={() => {
              navigation.navigate('Password');
            }}
            accessoryLeft={PasswordIcon}
          />
          <MenuItem
            style={styles.menuItem}
            title={evaProps => <Text {...evaProps}>Logout</Text>}
            onPress={() => {
              navigation.navigate('Logout');
            }}
            accessoryLeft={LogoutIcon}
          />
        </Menu>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  headerView: {
    marginBottom: 10,
    height: 56,
    justifyContent: 'center',
  },
  headerText: {
    textAlign: 'center',
  },
  menuView: {
    marginHorizontal: 10,
  },
  menuItem: {
    paddingHorizontal: 20,
  },
  icon: {
    width: 18,
  },
});
