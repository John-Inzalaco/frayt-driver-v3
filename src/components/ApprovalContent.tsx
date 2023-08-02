import React from 'react';
import {Alert, StyleSheet, View, Linking} from 'react-native';
import {Button} from './ui-kitten/Button';
import {Text} from './ui-kitten/Text';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {AuthStackParamList} from '../navigation/NavigatorTypes';
import {useAppDispatch} from '../hooks';
import {selectDriver, updateUser, getDriver} from '../slices/user';
import {useToken} from '../lib/TokenHelper';
import {useLoginHelper} from '../lib/LoginHelper';
import {useSelector} from 'react-redux';
import QueryString from 'qs';
import {Driver} from '@frayt/sdk';

export function ApprovalContent({testDriver}: {testDriver: Driver}) {
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();
  const dispatch = useAppDispatch();
  const {getAuthRoute} = useLoginHelper();
  const {token: token} = useToken();
  const driver = testDriver ?? useSelector(selectDriver);

  const emailSupport = async (subject: string) => {
    const params = QueryString.stringify({subject}),
      emailUrl = `mailto:support@frayt.com?${params}`;

    const supported = await Linking.canOpenURL(emailUrl);

    if (!supported) {
      throw new Error('Cannot send email');
    }

    if (supported) {
      Linking.openURL(emailUrl);
    }
  };

  const checkUser = async () => {
    if (token) {
      return await dispatch(getDriver({token: token}));
    }
  };

  const renderApplicantInfo = () => {
    if (driver?.needsUpdatedDocuments()) {
      return (
        <View>
          <Text category="h5" style={styles.header}>
            Application Completed!
          </Text>
          <Text category="p1" style={styles.content}>
            Some of your documents on file are expired or rejected. Please
            submit your updated documents below and for further review. Thanks
            for applying at FRAYT!
          </Text>
          <Button>Upload Documents</Button>
        </View>
      );
    }
    return (
      <View>
        <Text category="h5" style={styles.header}>
          Application Completed!
        </Text>
        <Text category="p1" style={styles.content}>
          Thank you! We are currently reviewing your application. Once approved,
          you'll be able to begin using Frayt.
        </Text>
        <Button onPress={() => checkUser()}>Check Again</Button>
      </View>
    );
  };

  const renderRegisteredOrApprovedDriverInfo = () => {
    if (driver?.needsUpdatedDocuments()) {
      return (
        <View>
          <Text category="h6" style={styles.header}>
            Your account has been suspended
          </Text>
          <Text category="p1" style={styles.content}>
            Some of your documents on file are expired or rejected.
          </Text>

          <Text category="p1" style={styles.content}>
            Please submit your updated documents below and for further review.
            Thanks for applying at FRAYT!
          </Text>
          <Button onPress={() => navigation.navigate('DocumentsScreen')}>
            Submit Documents
          </Button>
        </View>
      );
    }
    if (driver?.documentsAwaitingApproval()) {
      return (
        <View>
          <Text category="h6" style={styles.header}>
            Documents Are In Review
          </Text>
          <Text category="p1" style={styles.content}>
            Thank you! We are currently reviewing your new documents. Once
            approved, you'll be able to begin using Frayt.
          </Text>
          <Button onPress={() => checkUser()}>Check Again</Button>
        </View>
      );
    }
    return (
      <View>
        <Text category="h6" style={styles.header}>
          You have been approved to drive for FRAYT!
        </Text>
        <Text category="p1" style={styles.content}>
          Now let's make sure that you have everything setup...
        </Text>
        <Button
          onPress={async () => {
            try {
              if (driver?.state === 'registered') {
                return await navigate();
              }
              const result = await dispatch(
                updateUser({token: token ?? '', data: {state: 'registered'}}),
              ).unwrap();

              if (result) {
                await navigate();
              }
            } catch (err) {
              if (err instanceof Error) {
                Alert.alert('Error', err.message);
              } else if (typeof err === 'string') {
                Alert.alert('Error', err);
              }
            }
          }}>
          Continue
        </Button>
      </View>
    );
  };

  const renderRejectedDriverInfo = () => {
    return (
      <View>
        <Text category="h6" style={styles.header}>
          You are not approved to drive for FRAYT
        </Text>
        <Text category="p1" style={styles.content}>
          This app is intended for approved drivers only. If you have any
          questions please contact us at support@frayt.com
        </Text>
        <Button
          onPress={() =>
            emailSupport(
              `${driver?.first_name} ${driver?.last_name}'s Rejection (LP# ${driver?.vehicle?.license_plate}))`,
            )
          }
          style={styles.emailButton}>
          Email Support
        </Button>
        <Button onPress={() => checkUser()}>Check Again</Button>
      </View>
    );
  };

  const renderDisabledDriverInfo = () => {
    return (
      <View>
        <Text category="h6" style={styles.header}>
          Your account has been suspended
        </Text>
        <Text category="p1" style={styles.content}>
          It appears that your application was rejected or your account has been
          suspended. If you have questions about your disabled account, please
          contact us at support@frayt.com
        </Text>
        <Button
          onPress={() =>
            emailSupport(
              `${driver?.first_name} ${driver?.last_name}'s Suspension (LP# ${driver?.vehicle?.license_plate}))`,
            )
          }
          style={styles.emailButton}>
          Email Support
        </Button>
        <Button onPress={() => checkUser()}>Check Again</Button>
      </View>
    );
  };

  const navigate = async () => {
    const {route, screen} = await getAuthRoute();
    if (route === 'Home') return navigation.navigate(route, {screen: screen});
    navigation.navigate(route, {screen: screen});
  };

  const renderContent = () => {
    switch (driver?.state) {
      case 'registered':
      case 'approved':
        return renderRegisteredOrApprovedDriverInfo();
      case 'rejected':
        return renderRejectedDriverInfo();
      case 'disabled':
        return renderDisabledDriverInfo();
      case 'applying':
      case 'pending_approval':
      case 'screening':
      default:
        return renderApplicantInfo();
    }
  };

  return renderContent();
}

const styles = StyleSheet.create({
  header: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
  content: {
    textAlign: 'center',
    marginBottom: 24,
  },
  emailButton: {
    marginBottom: 15,
  },
});
