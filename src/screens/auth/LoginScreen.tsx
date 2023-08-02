import {ReactElement, useCallback, useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  ImageBackground,
  KeyboardAvoidingView,
} from 'react-native';
import FullStory from '@fullstory/react-native';
import {
  Layout,
  Input,
  Divider,
  useStyleSheet,
  Spinner,
} from '@ui-kitten/components';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {AuthStackProps} from '../../navigation/NavigatorTypes';
import SvgLogo from '../../images/logo-svg';
import {
  loginUser,
  updateOneSignalNotificationId,
  selectDriver,
} from '../../slices/user';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {useLoginHelper} from '../../lib/LoginHelper';
import {useToken} from '../../lib/TokenHelper';
import {useFocusEffect, useIsFocused, useRoute} from '@react-navigation/native';
import {handleError} from '../../lib/ErrorHelper';
import * as Sentry from '@sentry/react-native';
import SplashScreen from 'react-native-splash-screen';

export default function LoginScreen({
  navigation,
}: AuthStackProps<'Login'>): ReactElement {
  const styles = useStyleSheet(themedStyles);
  const {token: token} = useToken();
  const driver = useAppSelector(selectDriver);
  const {getAuthRoute} = useLoginHelper();
  const [navigated, setNavigated] = useState<boolean>(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // In case we want to allow users to see their password
  const [secureTextEntry] = useState(true);
  const dispatch = useAppDispatch();
  const currentRoute = useRoute();
  const sliceLoading = useAppSelector(state => state.user.loading);
  const [loginDisable, setLoginDisable] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) {
      const unsubscribe = navigation.addListener('transitionEnd', () => {
        SplashScreen.hide();
      });

      return () => unsubscribe();
    }
  }, [isFocused]);

  useFocusEffect(
    useCallback(() => {
      const maybeNavigate = async () => {
        const {route, screen} = await getAuthRoute();
        if (route === 'Home') {
          setNavigated(true);
          navigation.navigate(route, {screen: screen});
        } else {
          if (currentRoute.name === 'Login' && screen === 'Login') return;
          setNavigated(true);
          navigation.navigate(route, {screen: screen});
        }
      };

      if (token && driver && !navigated) {
        FullStory.identify(driver.id, {
          displayName: `${driver.first_name} ${driver.last_name}`,
          email: driver.email,
        });

        Sentry.setUser({email: driver.email});

        if (driver.password_reset_code) {
          if (email !== '' && password !== '') {
            setNavigated(true);
            navigation.navigate('UpdatePassword', {
              email: email,
              currentPassword: password,
            });
          } else maybeNavigate();
        } else maybeNavigate();
      } else {
        SplashScreen.hide();
      }

      return () => setNavigated(false);
    }, [navigation, token]),
  );

  const handleLogin = async () => {
    setNavigated(false);
    try {
      const {token, driver} = await dispatch(
        loginUser({email, password}),
      ).unwrap();
      if (token && driver) setLoginDisable(true);
      await dispatch(updateOneSignalNotificationId(null)).unwrap();
    } catch (error: unknown) {
      handleError(error, 'Submission Error');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <Layout style={styles.container}>
      <ImageBackground
        source={require('../../images/Cincinnati.png')}
        style={styles.backgroundImage}
        resizeMode="cover">
        <View style={styles.baseView}>
          <View style={styles.logoView}>
            <SvgLogo style={styles.logo} />
          </View>
          <KeyboardAvoidingView
            behavior="position"
            style={styles.keyboardAvoid}>
            <Text style={styles.text} category="h5">
              Login
            </Text>
            <Input
              value={email}
              style={styles.input}
              label="EMAIL"
              testID="LoginScreen.EmailInput"
              textStyle={styles.inputText}
              secureTextEntry={false}
              onChangeText={nextValue => setEmail(nextValue)}
              textContentType="username"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              value={password}
              style={styles.input}
              textStyle={styles.inputText}
              label="PASSWORD"
              testID="LoginScreen.PasswordInput"
              secureTextEntry={secureTextEntry}
              onChangeText={nextValue => setPassword(nextValue)}
              textContentType="password"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button
              style={styles.button}
              testID="LoginScreen.LoginButton"
              onPress={handleLogin}
              disabled={sliceLoading || loginDisable || navigated}
              accessoryRight={props =>
                sliceLoading ? (
                  <Text {...props}>
                    <Spinner status="basic" />
                  </Text>
                ) : (
                  <></>
                )
              }>
              LOGIN
            </Button>
            <Button
              style={[styles.button, styles.forgotButton]}
              onPress={handleForgotPassword}>
              FORGOT YOUR PASSWORD?
            </Button>
          </KeyboardAvoidingView>
          <View style={styles.applyView}>
            <Divider style={styles.divider} />
            <Text style={styles.text} category="h5">
              Apply To Drive
            </Text>
            <Button
              style={styles.button}
              testID="LoginScreen.ApplyButton"
              onPress={() => {
                navigation.navigate('ApplyToDrive', {
                  screen: 'Info',
                });
              }}>
              APPLY
            </Button>
          </View>
        </View>
      </ImageBackground>
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
  },
  logoView: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 253,
    height: 59,
  },
  keyboardAvoid: {
    flex: 2,
    justifyContent: 'flex-end',
    width: '100%',
  },
  text: {
    marginBottom: 15,
    alignSelf: 'center',
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
  divider: {
    height: 2,
    width: '100%',
    marginBottom: 30,
    backgroundColor: 'color-basic-500',
  },
  applyView: {
    width: '100%',
    justifyContent: 'flex-start',
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
  },
  forgotButton: {
    backgroundColor: 'transparent',
  },
});
