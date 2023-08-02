import React from 'react';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {StyleSheet, Platform} from 'react-native';
import {HomeTabParamList} from './NavigatorTypes';
import {DriveScreen} from '../screens/DriveScreen';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import {
  BottomNavigation,
  BottomNavigationElement,
  BottomNavigationTab,
  BottomNavigationTabElement,
} from '@ui-kitten/components';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MatchesStack} from './MatchesStack';
import {AccountStack} from './AccountStack';
import {SupportStack} from './SupportStack';

const Tab = createBottomTabNavigator<HomeTabParamList>();

const TAB_ICON_SIZE = 18;

export default function HomeTabs() {
  return (
    <Tab.Navigator
      id="Home"
      tabBar={props => <HomeTabBar {...props} />}
      screenOptions={{headerShown: false, lazy: false}}>
      <Tab.Screen
        name="DriveStack"
        component={DriveScreen}
        options={{
          tabBarIcon: props => {
            return (
              <Icon
                color={props.style.tintColor}
                name="briefcase"
                size={TAB_ICON_SIZE}
                solid
              />
            );
          },
        }}
      />
      <Tab.Screen
        name="MatchesStack"
        component={MatchesStack}
        options={{
          tabBarIcon: props => (
            <Icon
              color={props.style.tintColor}
              name="list"
              size={TAB_ICON_SIZE}
              solid
            />
          ),
        }}
      />
      <Tab.Screen
        name="AccountStack"
        component={AccountStack}
        options={{
          tabBarIcon: props => (
            <Icon
              color={props.style.tintColor}
              name="user"
              size={TAB_ICON_SIZE}
              solid
            />
          ),
        }}
      />
      <Tab.Screen
        name="SupportStack"
        component={SupportStack}
        options={{
          tabBarIcon: props => (
            <Icon
              color={props.style.tintColor}
              name="inbox"
              size={TAB_ICON_SIZE}
              solid
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const HomeTabBar = (props: BottomTabBarProps): BottomNavigationElement => {
  const onSelect = (index: number): void => {
    const selectedTabRoute: string = props.state.routeNames[index];
    props.navigation.navigate(selectedTabRoute);
  };

  type Props = NativeStackScreenProps<HomeTabParamList>;

  const createNavigationTabForRoute = (
    route: Props['route'],
  ): BottomNavigationTabElement => {
    const {options} = props.descriptors[route.key];
    return (
      <BottomNavigationTab
        key={route.key}
        icon={options.tabBarIcon}
        style={styles.bottomNavigationTab}
      />
    );
  };

  return (
    <BottomNavigation selectedIndex={props.state.index} onSelect={onSelect}>
      {props.state.routes.map(createNavigationTabForRoute)}
    </BottomNavigation>
  );
};

const styles = StyleSheet.create({
  bottomNavigationTab: {
    height: 56,
    marginBottom: Platform.OS === 'ios' ? 21 : 0,
  },
});
