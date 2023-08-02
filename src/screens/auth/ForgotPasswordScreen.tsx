import {ReactElement, useState} from 'react';
import {Alert, KeyboardAvoidingView, StyleSheet, View} from 'react-native';
import {Layout, Input, useStyleSheet, Divider} from '@ui-kitten/components';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {AuthStackProps} from '../../navigation/NavigatorTypes';
import {requestResetPassword} from '@frayt/sdk';
import axios from 'axios';

export default function ForgotPasswordScreen({
  navigation,
}: AuthStackProps<'ForgotPassword'>): ReactElement {
  const styles = useStyleSheet(themedStyles);
  const [email, setEmail] = useState('');

  const handleResetPassword = async () => {
    try {
      await requestResetPassword(email).then(() =>
        navigation.navigate('PasswordResetSuccess'),
      );
    } catch (error) {
      if (typeof error === 'string') {
        Alert.alert('Submission Error', error);
      } else if (axios.isAxiosError(error)) {
        Alert.alert(
          'Submission Error',
          error.response?.data.message ?? 'Unknown error, please try again.',
        );
      }
    }
  };

  return (
    <Layout style={styles.container}>
      <View style={styles.baseView}>
        <KeyboardAvoidingView behavior="position" style={styles.keyboardAvoid}>
          <Text category="h5" style={styles.header}>
            Forgot Password
          </Text>
          <Text category="p1" style={styles.text}>
            Enter your email and we'll send you a temporary password to reset
            it.
          </Text>
          <Input
            value={email}
            style={styles.input}
            label="EMAIL"
            textStyle={styles.inputText}
            secureTextEntry={false}
            onChangeText={nextValue => setEmail(nextValue)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button style={styles.button} onPress={handleResetPassword}>
            RESET PASSWORD
          </Button>
        </KeyboardAvoidingView>
        <View style={styles.backView}>
          <Divider style={styles.divider} />
          <Button
            style={styles.backButton}
            status="basic"
            onPress={() => {
              navigation.navigate('Login');
            }}>
            BACK
          </Button>
        </View>
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
  inputText: {
    color: 'black',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'color-basic-500',
  },
  button: {
    width: '100%',
    marginBottom: 15,
  },
  backButton: {
    backgroundColor: 'color-basic-500',
  },
  keyboardAvoid: {
    flex: 2,
    justifyContent: 'flex-end',
    width: '100%',
  },
  divider: {
    height: 2,
    width: '100%',
    marginBottom: 15,
    backgroundColor: 'color-basic-500',
  },
  backView: {
    width: '100%',
    justifyContent: 'flex-start',
    flex: 1,
  },
});
