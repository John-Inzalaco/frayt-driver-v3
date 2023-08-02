import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {SupportStackParamList, SupportStackProps} from './NavigatorTypes';
import {SupportScreen} from '../screens/support/SupportScreen';
import {GetHelpScreen} from '../screens/support/GetHelpScreen';
import {Text} from '../components/ui-kitten/Text';
import {Layout} from '@ui-kitten/components';
import {StyleSheet, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';

const Stack = createNativeStackNavigator<SupportStackParamList>();

export function SupportStack({navigation}: SupportStackProps<'Support'>) {
  const screenOptions = {
    headerBackVisible: false,
    headerLeft: () => {
      return (
        <TouchableOpacity onPress={() => navigation.navigate('Support')}>
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
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen
        name="GetHelp"
        component={GetHelpScreen}
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
