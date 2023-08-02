import React, {useState, useEffect} from 'react';
import {
  KeyboardAvoidingView,
  StyleSheet,
  View,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import * as Yup from 'yup';
import {Formik} from 'formik';
import {Layout, Input, useStyleSheet} from '@ui-kitten/components';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {AuthStackProps} from '../../navigation/NavigatorTypes';
import {
  ErrorMessage,
  ErrorMessageProps,
} from '../../lib/FormikSubmissionErrors';
import {sendResetPassword} from '@frayt/sdk';
import {selectToken} from '../../slices/user';
import {useAppSelector} from '../../hooks';

type PasswordValues = {
  password: string;
  confirmPassword: string;
};

const passwordSchema: Yup.SchemaOf<PasswordValues> = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Should have 8 characters or more')
    .required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Required'),
});

export default function UpdatePasswordScreen({
  navigation,
  route: route,
}: AuthStackProps<'UpdatePassword'>) {
  const styles = useStyleSheet(themedStyles);

  const token = useAppSelector(selectToken);
  const {email, currentPassword} = route.params;

  const [initialValues] = useState<PasswordValues>({
    password: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (values: PasswordValues) => {
    const isChanged = await sendResetPassword(
      currentPassword,
      values.password,
      values.confirmPassword,
      token || '',
    );
    if (isChanged) {
      navigation.navigate('PasswordUpdated');
    }
  };

  useEffect(() => {
    if (!email || email == '' || !currentPassword || currentPassword == '') {
      navigation.navigate('Login');
    }
  }, []);

  return (
    <>
      <Layout style={styles.container}>
        <Formik
          initialValues={initialValues}
          validationSchema={passwordSchema}
          onSubmit={handlePasswordChange}>
          {({
            handleChange,
            handleBlur,
            values,
            errors,
            touched,
            submitForm,
          }) => {
            const ErrorMsg = ({field}: ErrorMessageProps) => (
              <ErrorMessage errors={errors} touched={touched} field={field} />
            );

            return (
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View>
                    <Text category="h5" style={styles.header}>
                      Update Password
                    </Text>
                    <Text category="p1" style={styles.text}>
                      Your password has been reset, so now you must change our
                      temporary password before proceeding.
                    </Text>
                    <Input
                      style={styles.input}
                      label="NEW PASSWORD"
                      value={values.password}
                      textStyle={styles.inputText}
                      secureTextEntry={true}
                      textContentType="password"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                    />
                    <ErrorMsg field="password" />
                    <Input
                      style={styles.input}
                      label="CONFIRM PASSWORD"
                      value={values.confirmPassword}
                      textStyle={styles.inputText}
                      secureTextEntry={true}
                      textContentType="password"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                    />
                    <ErrorMsg field="confirmPassword" />
                    <Button style={styles.button} onPress={submitForm}>
                      CONFIRM
                    </Button>
                  </View>
                </TouchableWithoutFeedback>
              </KeyboardAvoidingView>
            );
          }}
        </Formik>
      </Layout>
    </>
  );
}

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  baseView: {
    flex: 2,
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  header: {
    textAlign: 'center',
  },
  text: {
    marginTop: 15,
  },
  inputText: {
    color: 'black',
  },
  input: {
    marginTop: 15,
    backgroundColor: 'color-basic-500',
  },
  button: {
    width: '100%',
    marginTop: 15,
  },
  keyboardAvoid: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
});
