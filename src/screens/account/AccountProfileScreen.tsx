import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {AccountStackProps} from '../../navigation/NavigatorTypes';
import {
  Layout,
  Input,
  Button,
  IndexPath,
  useStyleSheet,
  Spinner,
} from '@ui-kitten/components';
import {Formik} from 'formik';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  ErrorMessage,
  ErrorMessageProps,
} from '../../lib/FormikSubmissionErrors';
import {
  selectDriver,
  selectToken,
  updateUser,
  selectTheme,
} from '../../slices/user';
import * as Yup from 'yup';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {type Driver} from '@frayt/sdk';
import {useSelector} from 'react-redux';
import {themeData} from '../../theme';
import {Text} from '../../components/ui-kitten/Text';

export type ProfileValues = {
  email: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
};

const profileSchema: Yup.SchemaOf<ProfileValues> = Yup.object().shape({
  email: Yup.string().required('Required'),
  phone: Yup.string().required('Required'),
  address: Yup.string().default(''),
  address2: Yup.string(),
  city: Yup.string().required('Required'),
  state: Yup.string().required('Required'),
  zip: Yup.string()
    .matches(/^\d{4,}(?:[-\s]\d{4})?$/, 'Invalid zip code')
    .required('Required'),
});

export const ProfileScreen = ({
  navigation,
}: AccountStackProps<'Profile'>): React.ReactElement => {
  const styles = useStyleSheet(themedStyles);
  const driver = useSelector(selectDriver);
  const token = useSelector(selectToken);
  const currentTheme = useSelector(selectTheme);
  const dispatch = useAppDispatch();
  const sliceLoading = useAppSelector(state => state.user.loading);
  const [navigating, setNavigating] = useState(false);

  const buildProfileValues = (driver: Driver | null): ProfileValues => {
    const address = driver?.address ?? {
      address: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
    };
    return {
      email: driver?.email ?? '',
      phone: driver?.phone_number ?? '',
      address: address?.address ?? '',
      address2: address?.address2 ?? '',
      city: address?.city ?? '',
      state: address?.state ?? '',
      zip: address?.zip ?? '',
    };
  };
  const saveProfile = async (values: ProfileValues) => {
    try {
      if (!token) throw new Error('Missing user token');
      const result = await dispatch(
        updateUser({token: token, data: {...values}}),
      ).unwrap();

      if (result) {
        setNavigating(true);
        navigation.navigate('Account');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const [initialValues, _setInitialValues] = useState<ProfileValues>(
    buildProfileValues(driver),
  );
  const [_selectedIndex, _setSelectedIndex] = React.useState(
    new IndexPath(themeData.indexOf(currentTheme)),
  );

  return (
    <Layout level="3" style={styles.container}>
      <Formik
        initialValues={initialValues}
        validationSchema={profileSchema}
        onSubmit={saveProfile}>
        {({handleChange, handleBlur, values, errors, touched, submitForm}) => {
          const ErrorMsg = ({field}: ErrorMessageProps) => (
            <ErrorMessage errors={errors} touched={touched} field={field} />
          );

          return (
            <KeyboardAwareScrollView>
              <View style={styles.inputWrapper}>
                <Input
                  value={values.email}
                  label="EMAIL"
                  placeholder=""
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                />
                <ErrorMsg field="email" />
              </View>
              <View style={styles.inputWrapper}>
                <Input
                  value={values.phone}
                  label="PHONE NUMBER"
                  placeholder=""
                  onChangeText={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                />
                <ErrorMsg field="phone" />
              </View>
              <View style={styles.inputWrapper}>
                <Input
                  value={values.address}
                  label="ADDRESS 1"
                  placeholder=""
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
                    onChangeText={handleChange('state')}
                    onBlur={handleBlur('state')}
                  />
                  <ErrorMsg field="state" />
                </View>
                <View style={styles.halfColumn}>
                  <Input
                    value={values.zip}
                    label="ZIP"
                    placeholder=""
                    onChangeText={handleChange('zip')}
                    onBlur={handleBlur('zip')}
                  />
                  <ErrorMsg field="zip" />
                </View>
              </View>
              {
                // Removed until we can fix the light theme stylings
              }
              {/* <View style={styles.inputWrapper}>
                <Select
                  selectedIndex={selectedIndex}
                  onSelect={i => {
                    const index = i as IndexPath;
                    dispatch(toggleTheme(themeData[index.row]));
                  }}
                  value={currentTheme}
                  label="THEME">
                  {themeData.map((each, index) => (
                    <SelectItem key={index} title={each} />
                  ))}
                </Select>
              </View> */}
              <Button
                onPress={submitForm}
                style={styles.submitButton}
                disabled={sliceLoading || navigating}
                accessoryRight={props =>
                  sliceLoading ? (
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
};

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 26,
    paddingHorizontal: 10,
  },
  side: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 20,
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 5,
  },
  halfColumn: {flexDirection: 'column', width: '33%'},
});
