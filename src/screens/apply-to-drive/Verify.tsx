import React, {useState, useCallback} from 'react';
import {Alert, StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  Layout,
  Input,
  Datepicker,
  NativeDateService,
  Spinner,
} from '@ui-kitten/components';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {ApplyToDriveScreenProps} from '../../navigation/NavigatorTypes';
import {ApplyToDriveFooter} from '../../components/apply-to-drive-footer';
import {type Driver, IdentityValues} from '@frayt/sdk';
import * as Yup from 'yup';
import StringMask from 'string-mask';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {selectDriver, selectToken, updateUser} from '../../slices/user';
import {Formik} from 'formik';
import {
  ErrorMessage,
  ErrorMessageProps,
} from '../../lib/FormikSubmissionErrors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {FontAwesome5ProEva} from '../../components/ui-kitten/FontAwesome5ProEva';
import {useRequestPhoto} from '../../components/PhotoHelper';
import moment from 'moment';

type VerifyValues = {
  licenseNumber: string;
  licensePhoto: string | null;
  licenseExpirationDate: string | number | Date;
  ssn: string;
  profilePhoto: string | null;
};

const verifySchema: Yup.SchemaOf<VerifyValues> = Yup.object().shape({
  licenseNumber: Yup.string().required('Required'),
  licensePhoto: Yup.string().required('Required'),
  licenseExpirationDate: Yup.string().required('Required'),
  ssn: Yup.string().min(9, 'Not a valid SSN').required('Required'),
  profilePhoto: Yup.string().required('Required'),
});

export default function Verify({
  navigation,
}: ApplyToDriveScreenProps<'Verify'>): React.ReactElement {
  const {requestPhoto} = useRequestPhoto();
  const dispatch = useAppDispatch();
  const driver = useAppSelector(selectDriver);
  const token = useAppSelector(selectToken);
  const DELIMITER = '-';
  const MASK = '000-00-0000';
  const formatDateService = new NativeDateService('en', {format: 'MM-DD-YYYY'});

  const [profilePhotoFileName, setProfilePhotoFileName] = useState<string>('');
  const [licensePhotoFileName, setLicensePhotoFileName] = useState<string>('');
  const [initialValues, _setInitialValues] = useState<VerifyValues>({
    licenseNumber: driver?.license_number ?? '',
    licensePhoto: '',
    licenseExpirationDate: new Date(),
    ssn: '',
    profilePhoto: '',
  });

  const [loading, setLoading] = useState(false);

  const removeTrailingCharIfFound = useCallback(
    (str: string, char: string): string => {
      return str
        .split(char)
        .filter(segment => segment !== '')
        .join(char);
    },
    [],
  );

  const formatValue = useCallback(
    (str: string): string => {
      const unmaskedValue = str.split(DELIMITER).join('');
      const formatted = StringMask.process(unmaskedValue, MASK);
      return removeTrailingCharIfFound(formatted.result, DELIMITER);
    },
    [removeTrailingCharIfFound],
  );

  const nextStep = useCallback(
    async (data: VerifyValues) => {
      setLoading(true);
      if (!token) {
        setLoading(false);
        Alert.alert(
          'Error',
          'Missing token, please contact support or log in with your credentials from step 1.',
        );
        return;
      }

      const licenseExpirationDate = moment(data.licenseExpirationDate).format(
        'YYYY-MM-DD',
      );
      const identity = {...data, licenseExpirationDate} as IdentityValues;

      try {
        const driver: Driver = await dispatch(
          updateUser({token: token, data: identity}),
        ).unwrap();

        setLoading(false);
        if (!driver)
          throw new Error('Unknown error encountered while updating account');

        navigation.navigate('Payouts');
      } catch (error) {
        setLoading(false);
        if (typeof error === 'string') {
          Alert.alert('Submission Error', error);
        } else if (error instanceof Error) {
          Alert.alert('Submission Error', error.message);
        }
      }
    },
    [token],
  );

  return (
    <Layout style={styles.container} level="3">
      <Formik
        initialValues={initialValues}
        validationSchema={verifySchema}
        onSubmit={nextStep}>
        {({
          setFieldValue,
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
            <KeyboardAwareScrollView>
              <Text style={styles.heading} category="h5">
                Verify Identity
              </Text>

              <View style={styles.inputWrapper}>
                <Input
                  value={values.licenseNumber}
                  label="DRIVER'S LICENSE #"
                  placeholder="##########"
                  testID="VerifyScreen.LicenseInput"
                  secureTextEntry={false}
                  onChangeText={handleChange('licenseNumber')}
                  onBlur={handleBlur('licenseNumber')}
                />
                <ErrorMsg field="licenseNumber" />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label} category="label" appearance="hint">
                  DRIVER'S LICENSE PHOTO
                </Text>

                <TouchableOpacity
                  testID="VerifyScreen.LicensePhotoInput"
                  onPress={async () => {
                    setLoading(true);
                    try {
                      const {assets} = await requestPhoto();
                      if (assets && assets[0]) {
                        setFieldValue('licensePhoto', assets[0].base64);
                        setLicensePhotoFileName(assets[0].fileName ?? '');
                      }
                      setLoading(false);
                    } catch (error: unknown) {
                      setLoading(false);
                      if (typeof error === 'string') {
                        Alert.alert('Error accessing camera', error);
                      } else if (error instanceof Error) {
                        Alert.alert('Error accessing camera', error.message);
                      }
                    }
                  }}>
                  <View pointerEvents="none">
                    <Input
                      value={licensePhotoFileName}
                      accessoryRight={evaProps => (
                        <FontAwesome5ProEva eva={evaProps} name="calendar" />
                      )}
                    />
                  </View>
                </TouchableOpacity>

                <ErrorMsg field="licensePhoto" />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label} category="label" appearance="hint">
                  DRIVER'S LICENSE EXPIRATION
                </Text>
                <Datepicker
                  testID="VerifyScreen.LicenseExpirationInput"
                  date={values.licenseExpirationDate}
                  onSelect={value =>
                    setFieldValue('licenseExpirationDate', value)
                  }
                  dateService={formatDateService}
                  max={new Date(2100, 1, 1)}
                  onBlur={() => handleBlur('licenseExpirationDate')}
                  accessoryRight={evaProps => (
                    <FontAwesome5ProEva eva={evaProps} name="calendar" />
                  )}
                />
                <ErrorMsg field="licenseExpirationDate" />
              </View>

              <View style={styles.inputWrapper}>
                <Input
                  testID="VerifyScreen.SsnInput"
                  value={values.ssn}
                  label="SOCIAL SECURITY NUMBER"
                  placeholder="###-##-####"
                  maxLength={11}
                  onChangeText={text => setFieldValue('ssn', formatValue(text))}
                  onBlur={handleBlur('ssn')}
                />
                <ErrorMsg field="ssn" />
              </View>

              <Text style={styles.inputWrapper} category="p1">
                Please upload a profile photo to verify your ID. This photo will
                also be shown to shippers when you are on their deliveries.
              </Text>

              <View style={styles.inputWrapper}>
                <Text style={styles.label} category="label" appearance="hint">
                  PROFILE PHOTO
                </Text>

                <TouchableOpacity
                  testID="VerifyScreen.ProfilePhotoInput"
                  onPress={async () => {
                    setLoading(true);
                    try {
                      const {assets} = await requestPhoto();
                      if (assets && assets[0]) {
                        setFieldValue('profilePhoto', assets[0].base64, true);
                        setProfilePhotoFileName(assets[0].fileName ?? '');
                      }
                      setLoading(false);
                    } catch (error: unknown) {
                      setLoading(false);
                      if (typeof error === 'string') {
                        Alert.alert('Error accessing camera', error);
                      } else if (error instanceof Error) {
                        Alert.alert('Error accessing camera', error.message);
                      }
                    }
                  }}>
                  <View pointerEvents="none">
                    <Input
                      value={profilePhotoFileName}
                      accessoryRight={evaProps => (
                        <FontAwesome5ProEva eva={evaProps} name="calendar" />
                      )}
                    />
                  </View>
                </TouchableOpacity>

                <ErrorMsg field="profilePhoto" />
              </View>
              <Button
                onPress={submitForm}
                style={styles.started}
                disabled={loading}
                testID="VerifyScreen.SubmitButton">
                <Text>
                  Next Step{'  '}
                  {loading ? <Spinner status="basic" size="tiny" /> : <></>}
                </Text>
              </Button>
            </KeyboardAwareScrollView>
          );
        }}
      </Formik>

      <ApplyToDriveFooter
        step={4}
        previousAction={() => navigation.goBack()}
        disableNext={!driver?.license_number}
        nextAction={() => {
          navigation.navigate('ApplyToDrive', {screen: 'Payouts'});
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
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
  },
  started: {
    marginTop: 0,
    width: '100%',
  },
  heading: {
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
});
