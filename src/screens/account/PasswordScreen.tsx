import React, {useState} from 'react';
import {Input, Layout, Spinner} from '@ui-kitten/components';
import {Button} from '../../components/ui-kitten/Button';
import {DividerGray} from '../../components/ui-kitten/DividerGray';
import * as Yup from 'yup';
import {Formik, FormikHelpers} from 'formik';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useToken} from '../../lib/TokenHelper';
import {updateUserPassword} from '@frayt/sdk';
import {Alert, StyleSheet} from 'react-native';
import axios from 'axios';
import {
  ErrorMessage,
  ErrorMessageProps,
} from '../../lib/FormikSubmissionErrors';
import {Text} from '../../components/ui-kitten/Text';

export type PasswordChangeValues = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

const passwordChangeSchema: Yup.SchemaOf<PasswordChangeValues> =
  Yup.object().shape({
    currentPassword: Yup.string().required('Required'),
    newPassword: Yup.string()
      .min(8, 'Should have 8 characters or more')
      .required('Required'),
    confirmNewPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Required'),
  });

export default function PasswordScreen(): React.ReactElement {
  const {token} = useToken();
  const [secureTextEntry, _setSecureTextEntry] = useState(true);
  const [initialValues] = React.useState<PasswordChangeValues>({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const handlePasswordChange = async (
    {currentPassword, newPassword, confirmNewPassword}: PasswordChangeValues,
    formikHelpers: FormikHelpers<PasswordChangeValues>,
  ) => {
    try {
      setLoading(true);
      await updateUserPassword(
        currentPassword,
        newPassword,
        confirmNewPassword,
        token ?? '',
      );
      setLoading(false);
      Alert.alert('Password updated.');
    } catch (error) {
      setLoading(false);
      if (typeof error === 'string') {
        Alert.alert('Submission Error', error);
      } else if (axios.isAxiosError(error)) {
        Alert.alert(
          'Submission Error',
          error.response?.data.message ?? 'Unknown error, please try again.',
        );
      }
      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <Layout level="3" style={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={passwordChangeSchema}
        onSubmit={handlePasswordChange}>
        {({handleChange, handleBlur, errors, touched, submitForm}) => {
          const ErrorMsg = ({field}: ErrorMessageProps) => (
            <ErrorMessage errors={errors} touched={touched} field={field} />
          );

          return (
            <KeyboardAwareScrollView>
              <Input
                label={'CURRENT PASSWORD'}
                style={styles.input}
                secureTextEntry={secureTextEntry}
                textContentType="password"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={handleChange('currentPassword')}
                onBlur={handleBlur('currentPassword')}
              />
              <ErrorMsg field="currentPassword" />
              <DividerGray style={styles.divider} />
              <Input
                label={'NEW PASSWORD'}
                style={styles.input}
                secureTextEntry={secureTextEntry}
                textContentType="password"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
              />
              <ErrorMsg field="newPassword" />
              <Input
                label={'CONFIRM PASSWORD'}
                style={styles.input}
                secureTextEntry={secureTextEntry}
                textContentType="password"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={handleChange('confirmNewPassword')}
                onBlur={handleBlur('confirmNewPassword')}
              />
              <ErrorMsg field="confirmNewPassword" />
              <Button
                disabled={loading}
                onPress={() => submitForm()}
                accessoryRight={props =>
                  loading ? (
                    <Text {...props}>
                      <Spinner status="basic" size="small" />
                    </Text>
                  ) : (
                    <></>
                  )
                }>
                SAVE
              </Button>
            </KeyboardAwareScrollView>
          );
        }}
      </Formik>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 26,
  },
  input: {
    marginBottom: 15,
  },
  divider: {
    marginBottom: 15,
  },
});
