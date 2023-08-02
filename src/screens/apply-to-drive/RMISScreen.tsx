import React, {useCallback} from 'react';
import {StyleSheet, View, Linking, Dimensions} from 'react-native';
import {useSelector} from 'react-redux';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {ApplyToDriveScreenProps} from '../../navigation/NavigatorTypes';
import {Layout, useStyleSheet} from '@ui-kitten/components';
import {ApplyToDriveFooter} from '../../components/apply-to-drive-footer';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {selectDriver, updateUserState} from '../../slices/user';
import {handleError} from '../../lib/ErrorHelper';
import {useAppDispatch} from '../../hooks';

const {width} = Dimensions.get('window');

export default function RMISScreen({
  navigation,
}: ApplyToDriveScreenProps<'RMISScreen'>): React.ReactElement {
  const styles = useStyleSheet(themedStyles);
  const driver = useSelector(selectDriver);
  const dispatch = useAppDispatch();

  const nextStep = useCallback(async () => {
    try {
      await dispatch(
        updateUserState({data: {state: 'pending_approval'}}),
      ).unwrap();

      if (driver) {
        await navigation.navigate('Complete');
        const email = 'support@frayt.com';
        const subject = 'Box Truck Frayt Application';
        const body =
          'Email and Application ID will be used to link this to your account. If these are changed your submission will be rejected.\n' +
          ` - Email: ${driver.email}\n` +
          ` - Application ID: ${driver.id}Yeah\n` +
          'Please enter your information below after each colon: \n' +
          ' - DOT Number: \n' +
          ' - MC Number: \n' +
          ' - Company Name: \n';
        const url = `mailto:${email}?subject=${subject}&body=${body}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        }
      }
    } catch (error) {
      handleError(error);
    }
  }, [navigation]);

  return (
    <Layout style={styles.container} level="3">
      <KeyboardAwareScrollView
        scrollEnabled={true}
        contentContainerStyle={styles.center}>
        <View style={styles.view}>
          <Text category="label" style={{...styles.text, fontWeight: 'bold'}}>
            Please email the following items to support@frayt.com:
          </Text>
          <Text style={styles.text}> - Your DOT Number</Text>
          <Text style={styles.text}> - Your MC Number</Text>
          <Text style={styles.text}> - Your Company Name</Text>
          <Button onPress={nextStep} style={styles.started}>
            Click to continue
          </Button>
        </View>
      </KeyboardAwareScrollView>

      <ApplyToDriveFooter
        step={9}
        previousAction={() =>
          navigation.navigate('ApplyToDrive', {screen: 'BackgroundCheck'})
        }
        disableNext={false}
        nextAction={nextStep}
      />
    </Layout>
  );
}

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  view: {
    width: width - 30,
  },
  text: {
    marginBottom: 15,
    fontSize: 15,
    lineHeight: 20,
  },
  started: {
    marginTop: 20,
    width: '100%',
  },
});
