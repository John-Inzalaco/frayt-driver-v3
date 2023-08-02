import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout} from '@ui-kitten/components';
import {ApplyToDriveScreenProps} from '../../navigation/NavigatorTypes';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';

export default function InfoScreen({
  navigation,
}: ApplyToDriveScreenProps<'Info'>): React.ReactElement {
  return (
    <Layout style={styles.container}>
      <Text style={styles.heading} category="h5">
        Apply To Drive
      </Text>
      <Text style={styles.textBlock} category="p1">
        Thank you for your interest in applying to FRAYT! Once approved as an
        independent driver you will be able to start taking Matches
        (deliveries).
      </Text>
      <Text category="p1">
        Before you get started, you'll want to make sure you have all the
        information on hand that you'll need to complete the application.
      </Text>

      <Text style={[styles.listHeader]} category="h6">
        You'll need these for the application:
      </Text>
      <Text category="p1">
        Vehicle Insurance and Registration
        {'\n'}Driver's License
        {'\n'}Vehicle (For taking photos)
        {'\n'}Credit Card for Background Check ($35)
      </Text>

      <Button
        onPress={() => {
          navigation.navigate('ApplyToDrive', {
            screen: 'Questionnaire',
          });
        }}
        testID="InfoScreen.StartButton"
        style={styles.started}>
        GET STARTED
      </Button>
      <Button
        style={styles.back}
        status="basic"
        testID="InfoScreen.BackButton"
        onPress={() => {
          navigation.goBack();
        }}>
        BACK
      </Button>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 15,
  },
  textBlock: {
    marginBottom: 15,
  },
  started: {
    marginTop: 20,
    width: '100%',
  },
  back: {
    marginTop: 20,
    width: '100%',
  },
  heading: {
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
  listHeader: {
    marginTop: 15,
  },
});
