import {ReactElement} from 'react';
import {AuthStackProps} from '../../navigation/NavigatorTypes';
import {Layout, Text, Button, useStyleSheet} from '@ui-kitten/components';
import {StyleSheet, View} from 'react-native';

export default function PasswordResetSuccessScreen({
  navigation,
}: AuthStackProps<'PasswordResetSuccess'>): ReactElement {
  const styles = useStyleSheet(themedStyles);

  return (
    <Layout style={styles.container}>
      <View style={styles.baseView}>
        <Text category="h5" style={styles.header}>
          Successfully Reset
        </Text>
        <Text category="p1" style={styles.text}>
          We've sent an email to you if there is an account associated with that
          email.
        </Text>
        <Button
          style={styles.button}
          onPress={() => navigation.navigate('Login')}>
          DONE
        </Button>
      </View>
    </Layout>
  );
}

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  baseView: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  header: {
    textAlign: 'center',
  },
  text: {
    marginBottom: 15,
  },
  button: {
    width: '100%',
    marginBottom: 15,
  },
});
