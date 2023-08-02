import {StyleSheet, TouchableOpacity} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {MatchesStackParamList, MatchesStackProps} from './NavigatorTypes';
import {Text} from '../components/ui-kitten/Text';
import {Layout} from '@ui-kitten/components';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import {MatchesScreen} from '../screens/matches/MatchesScreen';
import {AvailableScreen} from '../screens/matches/AvailableScreen';
import {AcceptedScreen} from '../screens/matches/AcceptedScreen';
import {PhotoCaptureModal} from '../screens/matches/PhotoCaptureModal';
import {SignatureCaptureModal} from '../screens/matches/SignatureModal';
import {BarcodeModal} from '../screens/matches/BarcodeModal';
import {BarcodePhotosModal} from '../screens/matches/BarcodePhotosModal';

const Stack = createNativeStackNavigator<MatchesStackParamList>();

export function MatchesStack({navigation}: MatchesStackProps<'Matches'>) {
  const screenOptions = {
    headerBackVisible: false,
    headerLeft: () => {
      return (
        <TouchableOpacity onPress={() => navigation.navigate('Matches')}>
          <Icon name="arrow-left" size={18} color="white" />
        </TouchableOpacity>
      );
    },
  };

  return (
    <Stack.Navigator>
      <Stack.Group
        screenOptions={{
          headerTitle: props => {
            return <Text category="h6">{props.children}</Text>;
          },
          headerBackground: () => {
            return <Layout style={styles.headerContainer}></Layout>;
          },
          headerTitleAlign: 'center',
        }}>
        <Stack.Screen name="Matches" component={MatchesScreen} />
        <Stack.Screen
          name="Available"
          component={AvailableScreen}
          options={screenOptions}
        />
        <Stack.Screen
          name="Accepted"
          component={AcceptedScreen}
          options={screenOptions}
        />
      </Stack.Group>
      <Stack.Group
        screenOptions={{presentation: 'fullScreenModal', headerShown: false}}>
        <Stack.Screen name="Signature" component={SignatureCaptureModal} />
        <Stack.Screen name="Photo" component={PhotoCaptureModal} />
        <Stack.Screen name="Barcode" component={BarcodeModal} />
        <Stack.Screen name="BarcodePhotos" component={BarcodePhotosModal} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
  },
});
