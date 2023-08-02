import React, {useState} from 'react';
import {Alert, StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  Layout,
  Input,
  Datepicker,
  NativeDateService,
} from '@ui-kitten/components';
import {ApplyToDriveScreenProps} from '../../navigation/NavigatorTypes';
import {ApplyToDriveFooter} from '../../components/apply-to-drive-footer';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {Formik} from 'formik';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  ErrorMessage,
  ErrorMessageProps,
} from '../../lib/FormikSubmissionErrors';
import * as Yup from 'yup';
import {type Vehicle, type Driver} from '@frayt/sdk';
import {useSelector} from 'react-redux';
import {
  selectDriver,
  createDriverVehicle,
  updateDriverVehicle,
} from '../../slices/user';
import {useRequestPhoto} from '../../components/PhotoHelper';
import moment from 'moment';
import {useAppDispatch} from '../../hooks';
import {FontAwesome5ProEva} from '../../components/ui-kitten/FontAwesome5ProEva';
import {useToken} from '../../lib/TokenHelper';

type VehicleValues = {
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  vin: string;
  insurancePhoto: string | null;
  registrationPhoto: string | null;
  insuranceExpirationDate: string | number | Date;
  registrationExpirationDate: string | number | Date;
};

const maxDate = moment().startOf('day').add(100, 'years');

const vehicleSchema: Yup.SchemaOf<VehicleValues> = Yup.object().shape({
  make: Yup.string().required('Required'),
  model: Yup.string().required('Required'),
  year: Yup.string().required('Required'),
  licensePlate: Yup.string().required('Required'),
  vin: Yup.string().required('Required'),
  insurancePhoto: Yup.string().required('Required'),
  registrationPhoto: Yup.string().required('Required'),
  insuranceExpirationDate: Yup.string().required('Required'),
  registrationExpirationDate: Yup.string().required('Required'),
});

export default function VehicleScreen({
  navigation,
}: ApplyToDriveScreenProps<'Vehicle'>): React.ReactElement {
  const {requestPhoto} = useRequestPhoto();
  const driver = useSelector(selectDriver);
  const {token} = useToken();
  const dispatch = useAppDispatch();
  const formatDateService = new NativeDateService('en', {format: 'MM-DD-YYYY'});

  const buildVerifyValues = (_driver: Driver | null): VehicleValues => ({
    make: '',
    model: '',
    year: new Date().getFullYear().toString(),
    licensePlate: '',
    vin: '',
    insurancePhoto: '',
    registrationPhoto: '',
    insuranceExpirationDate: new Date(),
    registrationExpirationDate: new Date(),
  });

  const [insurancePhotoFileName, setInsurancePhotoFileName] =
    useState<string>('');
  const [registrationPhotoFileName, setRegistrationPhotoFileName] =
    useState<string>('');
  const [initialValues, _setInitialValues] = useState<VehicleValues>(
    buildVerifyValues(driver),
  );

  const nextStep = async (data: VehicleValues) => {
    try {
      if (!token) {
        throw new Error('Missing user token');
      }
      if (!driver) throw new Error('Missing Driver');
      const {vehicle} = driver;
      const insuranceExpirationDate = moment(
        data.insuranceExpirationDate,
      ).format('YYYY-MM-DD');
      const registrationExpirationDate = moment(
        data.insuranceExpirationDate,
      ).format('YYYY-MM-DD');
      const vehicleData = {
        ...data,
        insuranceExpirationDate,
        registrationExpirationDate,
      } as VehicleValues;

      const result: Vehicle = await dispatch(
        vehicle
          ? updateDriverVehicle({
              token: token,
              vehicleId: vehicle.id,
              data: vehicleData,
            })
          : createDriverVehicle({token: token, data: vehicleData}),
      ).unwrap();

      if (!result)
        throw new Error('Unknown error encountered while updating account');

      navigation.navigate('VehiclePhotos');
    } catch (error) {
      if (typeof error === 'string') {
        Alert.alert('Submission Error', error);
      } else if (error instanceof Error) {
        Alert.alert('Submission Error', error.message);
      }
    }
  };

  const numbersOnly = (str: string): string => str.replace(/[^0-9]/g, '');

  return (
    <Layout style={styles.container} level="3">
      <Formik
        initialValues={initialValues}
        validationSchema={vehicleSchema}
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
            <KeyboardAwareScrollView testID="VehicleScreen.ScrollView">
              <Text style={styles.heading} category="h5">
                Vehicle
              </Text>

              <View style={[styles.side, styles.inputWrapper]}>
                <View style={styles.halfColumn}>
                  <Input
                    testID="VehicleScreen.MakeInput"
                    value={values.make}
                    label="VEHICLE MAKE"
                    placeholder=""
                    onChangeText={handleChange('make')}
                    onBlur={handleBlur('make')}
                  />
                  <ErrorMsg field="make" />
                </View>
                <View style={styles.halfColumn}>
                  <Input
                    testID="VehicleScreen.ModelInput"
                    value={values.model}
                    label="VEHICLE MODEL"
                    placeholder=""
                    onChangeText={handleChange('model')}
                    onBlur={handleBlur('model')}
                  />
                  <ErrorMsg field="model" />
                </View>
              </View>

              <View style={[styles.side, styles.inputWrapper]}>
                <View style={styles.halfColumn}>
                  <Input
                    testID="VehicleScreen.YearInput"
                    value={values.year}
                    label="VEHICLE YEAR"
                    placeholder=""
                    keyboardType="number-pad"
                    onChangeText={str =>
                      setFieldValue('year', numbersOnly(str))
                    }
                    onBlur={handleBlur('year')}
                  />
                  <ErrorMsg field="year" />
                </View>
                <View style={styles.halfColumn}>
                  <Input
                    testID="VehicleScreen.LicensePlateInput"
                    value={values.licensePlate}
                    label="LICENSE PLATE"
                    placeholder=""
                    onChangeText={handleChange('licensePlate')}
                    onBlur={handleBlur('licensePlate')}
                  />
                  <ErrorMsg field="licensePlate" />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Input
                  testID="VehicleScreen.VinInput"
                  value={values.vin}
                  label="VIN #"
                  placeholder=""
                  onChangeText={handleChange('vin')}
                  onBlur={handleBlur('vin')}
                />
                <ErrorMsg field="vin" />
              </View>

              <Text style={[styles.inputWrapper]} category="p1">
                Please take clear photos of your vehicle’s insurance and
                registration.
              </Text>

              <View style={styles.inputWrapper}>
                <Text style={[styles.label]} category="label" appearance="hint">
                  INSURANCE
                </Text>
                <TouchableOpacity
                  testID="VehicleScreen.InsurancePhotoInput"
                  onPress={async () => {
                    try {
                      const {assets} = await requestPhoto();
                      if (assets && assets[0]) {
                        setFieldValue('insurancePhoto', assets[0].base64);
                        setInsurancePhotoFileName(assets[0].fileName ?? '');
                      }
                    } catch (error: unknown) {
                      if (typeof error === 'string') {
                        Alert.alert('Error accessing camera', error);
                      } else if (error instanceof Error) {
                        Alert.alert('Error accessing camera', error.message);
                      }
                    }
                  }}>
                  <View pointerEvents="none">
                    <Input
                      value={insurancePhotoFileName}
                      accessoryRight={evaProps => (
                        <FontAwesome5ProEva eva={evaProps} name="paperclip" />
                      )}
                    />
                  </View>
                </TouchableOpacity>
                <ErrorMsg field="insurancePhoto" />
              </View>

              <View style={styles.inputWrapper}>
                <Text style={[styles.label]} category="label" appearance="hint">
                  REGISTRATION
                </Text>
                <TouchableOpacity
                  testID="VehicleScreen.RegistrationPhotoInput"
                  onPress={async () => {
                    try {
                      const {assets} = await requestPhoto();
                      if (assets && assets[0]) {
                        setFieldValue('registrationPhoto', assets[0].base64);
                        setRegistrationPhotoFileName(assets[0].fileName ?? '');
                      }
                    } catch (error: unknown) {
                      if (typeof error === 'string') {
                        Alert.alert('Error accessing camera', error);
                      } else if (error instanceof Error) {
                        Alert.alert('Error accessing camera', error.message);
                      }
                    }
                  }}>
                  <View pointerEvents="none">
                    <Input
                      value={registrationPhotoFileName}
                      accessoryRight={evaProps => (
                        <FontAwesome5ProEva eva={evaProps} name="paperclip" />
                      )}
                    />
                  </View>
                </TouchableOpacity>
                <ErrorMsg field="registrationPhoto" />
              </View>

              <View style={[styles.side, styles.inputWrapper]}>
                <View style={styles.halfColumn}>
                  <Text style={styles.label} category="label" appearance="hint">
                    INSURANCE EXPIRATION
                  </Text>
                  <Datepicker
                    testID="VehicleScreen.InsuranceExpirationInput"
                    date={values.insuranceExpirationDate}
                    onSelect={value =>
                      setFieldValue('insuranceExpirationDate', value)
                    }
                    placeholder=" "
                    dateService={formatDateService}
                    min={new Date()}
                    max={maxDate.toDate()}
                    accessoryRight={evaProps => (
                      <FontAwesome5ProEva eva={evaProps} name="calendar" />
                    )}
                  />
                </View>
                <View style={styles.halfColumn}>
                  <Text style={styles.label} category="label" appearance="hint">
                    REGISTRATION EXPIRATION
                  </Text>
                  <Datepicker
                    testID="VehicleScreen.RegistrationExpirationInput"
                    date={values.registrationExpirationDate}
                    onSelect={value =>
                      setFieldValue('registrationExpirationDate', value)
                    }
                    placeholder=" "
                    dateService={formatDateService}
                    min={new Date()}
                    max={maxDate.toDate()}
                    onBlur={() => handleBlur('registrationExpirationDate')}
                    accessoryRight={evaProps => (
                      <FontAwesome5ProEva eva={evaProps} name="calendar" />
                    )}
                  />
                </View>
              </View>

              <Button
                onPress={submitForm}
                style={styles.started}
                testID="VehicleScreen.SubmitButton">
                Next Step
              </Button>
            </KeyboardAwareScrollView>
          );
        }}
      </Formik>

      <ApplyToDriveFooter
        step={6}
        previousAction={() => navigation.goBack()}
        disableNext={false}
        nextAction={() => {
          navigation.navigate('ApplyToDrive', {screen: 'VehiclePhotos'});
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
  started: {
    marginTop: 20,
    width: '100%',
  },
  label: {
    marginBottom: 5,
  },
  halfColumn: {flexDirection: 'column', width: '47%'},
  side: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heading: {
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  inputWrapper: {
    marginBottom: 20,
  },
});
