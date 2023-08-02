import React, {useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {
  Layout,
  Datepicker,
  Input,
  NativeDateService,
} from '@ui-kitten/components';
import {ApplyToDriveScreenProps} from '../../navigation/NavigatorTypes';
import {ApplyToDriveFooter} from '../../components/apply-to-drive-footer';
import {selectDriver, updateUser} from '../../slices/user';
import {useSelector} from 'react-redux';
import {type Driver} from '@frayt/sdk';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {Formik} from 'formik';
import {
  ErrorMessage,
  ErrorMessageProps,
} from '../../lib/FormikSubmissionErrors';
import * as Yup from 'yup';
import moment from 'moment';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useAppDispatch} from '../../hooks';
import {FontAwesome5ProEva} from '../../components/ui-kitten/FontAwesome5ProEva';
import {useToken} from '../../lib/TokenHelper';

export type PersonalValues = {
  first_name: string;
  last_name: string;
  birthdate: Date;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
};

const minAge = 18;
const maxAge = 80;
const minDate = moment().startOf('day').subtract(maxAge, 'years');
const maxDate = moment().startOf('day').subtract(minAge, 'years');

const personalSchema: Yup.SchemaOf<PersonalValues> = Yup.object().shape({
  first_name: Yup.string().required('Required'),
  last_name: Yup.string().required('Required'),
  birthdate: Yup.date()
    .min(minDate.toDate(), `The maximum age allowed is ${maxAge} years old`)
    .max(maxDate.toDate(), `Should have at least ${minAge} years old`)
    .required('Required'),
  address: Yup.string().required('Required'),
  address2: Yup.string(),
  city: Yup.string().required('Required'),
  state: Yup.string().required('Required'),
  zip: Yup.string()
    .matches(/^\d{4,}(?:[-\s]\d{4})?$/, 'Invalid zip code')
    .required('Required'),
});

export default function Personal({
  navigation,
}: ApplyToDriveScreenProps<'Personal'>): React.ReactElement {
  const driver = useSelector(selectDriver);
  const {token} = useToken();
  const dispatch = useAppDispatch();
  const formatDateService = new NativeDateService('en', {format: 'MM-DD-YYYY'});
  const driverHasAddress = driver.address
    ? driver.address.address !== ''
    : false;
  const buildPersonalValues = (driver: Driver): PersonalValues => {
    const address = driver.address;
    if (!address) {
      return {
        first_name: '',
        last_name: '',
        birthdate: maxDate.toDate(),
        address: '',
        address2: '',
        city: '',
        state: '',
        zip: '',
      };
    }
    return {
      ...address,
      address2: address.address2 ? address.address2 : '',
      first_name: driver.first_name ? driver.first_name : '',
      last_name: driver.last_name ? driver.last_name : '',
      birthdate: maxDate.toDate(),
    };
  };

  const nextStep = async (values: PersonalValues) => {
    try {
      if (!token) throw new Error('Missing user token');

      const birthdate = moment(values.birthdate).format('YYYY-MM-DD');
      const result = await dispatch(
        updateUser({token: token, data: {...values, birthdate}}),
      ).unwrap();

      if (result) {
        navigation.navigate('ApplyToDrive', {
          screen: 'Verify',
        });
      }
    } catch (error) {
      if (typeof error === 'string') {
        Alert.alert('Submission Error', error);
      } else if (error instanceof Error) {
        Alert.alert('Submission Error', error.message);
      }
    }
  };

  const [initialValues, _setInitialValues] = useState<PersonalValues>(
    buildPersonalValues(driver),
  );

  return (
    <Layout style={styles.container} level="3">
      <Formik
        initialValues={initialValues}
        validationSchema={personalSchema}
        onSubmit={nextStep}>
        {({
          handleChange,
          handleBlur,
          values,
          errors,
          touched,
          setFieldValue,
          submitForm,
        }) => {
          const ErrorMsg = ({field}: ErrorMessageProps) => (
            <ErrorMessage errors={errors} touched={touched} field={field} />
          );

          return (
            <KeyboardAwareScrollView testID="PersonalScreen.ScrollView">
              <Text style={styles.heading} category="h5">
                Personal
              </Text>
              <View style={styles.inputWrapper}>
                <Input
                  value={values.first_name}
                  label="FIRST NAME"
                  testID="PersonalScreen.FirstNameInput"
                  placeholder=""
                  secureTextEntry={false}
                  onChangeText={handleChange('first_name')}
                  onBlur={handleBlur('first_name')}
                />
                <ErrorMsg field="first_name" />
              </View>

              <View style={styles.inputWrapper}>
                <Input
                  value={values.last_name}
                  label="LAST NAME"
                  testID="PersonalScreen.LastNameInput"
                  placeholder=""
                  secureTextEntry={false}
                  onChangeText={handleChange('last_name')}
                  onBlur={handleBlur('last_name')}
                />

                <ErrorMsg field="last_name" />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={styles.label} category="label" appearance="hint">
                  DATE OF BIRTH
                </Text>
                <Datepicker
                  date={values.birthdate}
                  onSelect={value => {
                    setFieldValue('birthdate', value);
                  }}
                  testID="PersonalScreen.DatePicker"
                  dateService={formatDateService}
                  min={minDate.toDate()}
                  max={maxDate.toDate()}
                  onBlur={() => handleBlur('birthdate')}
                  accessoryRight={evaProps => (
                    <FontAwesome5ProEva eva={evaProps} name="calendar" />
                  )}
                />
                <ErrorMsg field="birthdate" />
              </View>

              <View style={styles.inputWrapper}>
                <Input
                  value={values.address}
                  label="ADDRESS 1"
                  testID="PersonalScreen.AddressInput"
                  placeholder=""
                  secureTextEntry={false}
                  onChangeText={handleChange('address')}
                  onBlur={handleBlur('address')}
                />

                <ErrorMsg field="address" />
              </View>

              <View style={styles.inputWrapper}>
                <Input
                  value={values.address2}
                  label="ADDRESS 2"
                  placeholder=""
                  secureTextEntry={false}
                  onChangeText={handleChange('address2')}
                  onBlur={handleBlur('address2')}
                />
                <ErrorMsg field="address2" />
              </View>

              <View style={[styles.side, styles.inputWrapper]}>
                <View style={styles.halfColumn}>
                  <Input
                    value={values.city}
                    label="CITY"
                    placeholder=""
                    testID="PersonalScreen.CityInput"
                    secureTextEntry={false}
                    onChangeText={handleChange('city')}
                    onBlur={handleBlur('city')}
                  />
                  <ErrorMsg field="city" />
                </View>
                <View style={styles.halfColumn}>
                  <Input
                    value={values.state}
                    label="STATE"
                    placeholder=""
                    testID="PersonalScreen.StateInput"
                    secureTextEntry={false}
                    onChangeText={handleChange('state')}
                    onBlur={handleBlur('state')}
                  />
                  <ErrorMsg field="state" />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Input
                  value={values.zip}
                  label="ZIP"
                  placeholder=""
                  testID="PersonalScreen.ZipInput"
                  secureTextEntry={false}
                  onChangeText={handleChange('zip')}
                  onBlur={handleBlur('zip')}
                />
                <ErrorMsg field="zip" />
              </View>

              <Button
                onPress={submitForm}
                style={styles.started}
                testID="PersonalScreen.SubmitButton">
                Next Step
              </Button>
            </KeyboardAwareScrollView>
          );
        }}
      </Formik>

      <ApplyToDriveFooter
        step={3}
        previousAction={() => navigation.goBack()}
        disableBack={true}
        disableNext={!driverHasAddress}
        nextAction={() => {
          navigation.navigate('ApplyToDrive', {screen: 'Verify'});
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
  side: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  started: {
    marginTop: 20,
    width: '100%',
  },
  heading: {
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
  },
  halfColumn: {flexDirection: 'column', width: '47%'},
});
