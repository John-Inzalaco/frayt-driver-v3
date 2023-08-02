import React from 'react';
import {Image, StyleSheet} from 'react-native';
import {Layout} from '@ui-kitten/components';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {ApplyToDriveScreenProps} from '../../navigation/NavigatorTypes';
import {ScrollView} from 'react-native-gesture-handler';
import {ApplyToDriveFooter} from '../../components/apply-to-drive-footer';

export default function Payouts({
  navigation,
}: ApplyToDriveScreenProps<'Payouts'>): React.ReactElement {
  return (
    <Layout style={styles.container} level="3">
      <ScrollView>
        <Text style={styles.heading} category="h5">
          Payouts
        </Text>

        <Image
          style={styles.branchIcon}
          resizeMode={'cover'} // cover or contain its upto you view look
          source={require('../../images/Branch.png')}
        />

        <Text style={styles.branchInstructions} category="p1">
          Payouts are handled through our partner, Branch. Once your application
          is approved, you will receive an email with details on how to setup
          your Branch account.
        </Text>

        <Button
          onPress={() => {
            navigation.navigate('ApplyToDrive', {screen: 'Vehicle'});
          }}
          style={styles.started}>
          Next Step
        </Button>
      </ScrollView>
      <ApplyToDriveFooter
        step={5}
        previousAction={() => navigation.goBack()}
        disableNext={false}
        nextAction={() => {
          navigation.navigate('ApplyToDrive', {screen: 'Vehicle'});
        }}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 15,
  },
  started: {
    marginTop: 20,
    width: '100%',
  },
  heading: {
    textAlign: 'center',
    marginTop: 25,
  },
  text: {
    textAlign: 'left',
    marginBottom: 20,
  },
  branchInstructions: {
    marginBottom: 10,
    marginTop: 20,
  },
  list: {
    width: '100%',
    marginBottom: 3,
    fontWeight: '300',
  },
  branchIcon: {
    width: 148,
    height: 42,
    margin: 'auto',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
});
