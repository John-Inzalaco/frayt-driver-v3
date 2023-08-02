import React from 'react';
import {Layout} from '@ui-kitten/components';
import {AccountStackProps} from '../../navigation/NavigatorTypes';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {logoutUser} from '../../slices/user';
import {useAppDispatch} from '../../hooks';
import {StyleSheet} from 'react-native';
import {handleError} from '../../lib/ErrorHelper';

export default function LogoutScreen({
  navigation,
}: AccountStackProps<'Logout'>): React.ReactElement {
  const dispatch = useAppDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigation.replace('Auth', {screen: 'Login'});
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Layout level="3" style={styles.container}>
      <Text category="p1" style={styles.text}>
        Do you want to logout of your account? You will be able to login again
        immediately.
      </Text>
      <Button status="danger" onPress={handleLogout}>
        LOGOUT
      </Button>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 26,
    paddingHorizontal: 10,
  },
  text: {
    marginBottom: 15,
  },
});
