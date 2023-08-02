import React, {useState} from 'react';
import {
  Layout,
  Select,
  Input,
  SelectItem,
  IndexPath,
} from '@ui-kitten/components';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {ApplyToDriveScreenProps} from '../../navigation/NavigatorTypes';
import {useSelector} from 'react-redux';
import {selectDriver} from '../../slices/user';
import {Formik, FormikHelpers} from 'formik';
import * as Yup from 'yup';
import {
  ErrorMessage,
  ErrorMessageProps,
} from '../../lib/FormikSubmissionErrors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {MarketPicker} from '../../components/MarketPicker';
import PhoneInput from '../../components/PhoneInput';
import {StyleSheet, View} from 'react-native';
import {ApplyToDriveFooter} from '../../components/apply-to-drive-footer';
import {Driver} from '@frayt/sdk';

enum EnglishProficiency {
  None,
  Beginner,
  Intermediate,
  Advanced,
}

const PROFICIENCY_DATA = ['none', 'beginner', 'intermediate', 'advanced'];

const PROFICIENCY_TEXT = [
  'None (Not Proficient)',
  'Beginner',
  'Intermediate',
  'Advanced (Fluent)',
];

const VEHICLE_CLASS_DATA = ['car', 'midsize', 'cargo_van', 'box_truck'];

const VEHICLE_CLASS_TEXT = ['Car', 'Midsize', 'Cargo Van', 'Box Truck'];

type QuestionnaireValues = {
  market_id: string | null;
  vehicle_class: number;
  english_proficiency: EnglishProficiency | -1;
  email: string;
  phone_number: string | null;
};

const questionnaireSchema: Yup.SchemaOf<QuestionnaireValues> =
  Yup.object().shape({
    market_id: Yup.string().nullable().min(0).required('Required'),
    vehicle_class: Yup.number().min(0).max(3).required('Required'),
    english_proficiency: Yup.number()
      .min(0, 'Required')
      .max(3)
      .required('Required'),
    email: Yup.string().email().required('Required'),
    phone_number: Yup.string()
      .nullable()
      .min(12, 'Not a valid phone number')
      .required('Required'),
  });

export default function Questionnaire({
  navigation,
}: ApplyToDriveScreenProps<'Questionnaire'>): React.ReactElement {
  const driver = useSelector(selectDriver);
  const buildQuestionnaireValues = (
    driver: Driver | null,
  ): QuestionnaireValues => ({
    market_id: null,
    vehicle_class: -1,
    english_proficiency: -1,
    email: driver?.email || '',
    phone_number: '+1',
  });
  const [initialValues, _setInitialValues] = useState<QuestionnaireValues>(
    buildQuestionnaireValues(driver),
  );

  const nextStep = async (
    questionnaire: QuestionnaireValues,
    formikHelpers: FormikHelpers<QuestionnaireValues>,
  ) => {
    if (!questionnaire.phone_number || !questionnaire.market_id) {
      formikHelpers.setSubmitting(false);
      return;
    }
    navigation.navigate('ApplyToDrive', {
      screen: 'CreateAccount',
      params: {
        english_proficiency:
          PROFICIENCY_DATA[questionnaire.english_proficiency],
        vehicle_class: VEHICLE_CLASS_DATA[questionnaire.vehicle_class],
        market_id: questionnaire.market_id,
        email: questionnaire.email,
        phone_number: questionnaire.phone_number,
      },
    });
  };

  return (
    <Layout style={styles.container} level="3">
      <Formik
        initialValues={initialValues}
        validationSchema={questionnaireSchema}
        onSubmit={nextStep}>
        {({
          handleChange,
          handleBlur,
          values,
          errors,
          touched,
          setFieldValue,
          setFieldError,
          setFieldTouched,
          submitForm,
        }) => {
          const ErrorMsg = ({field}: ErrorMessageProps) => (
            <ErrorMessage errors={errors} touched={touched} field={field} />
          );
          return (
            <KeyboardAwareScrollView>
              <Text style={styles.heading} category="h5">
                Questionnaire
              </Text>

              <View style={styles.inputBlock}>
                <MarketPicker
                  onChange={market =>
                    market
                      ? setFieldValue('market_id', market.id)
                      : setFieldValue('market_id', '')
                  }
                />
                <ErrorMsg field="market_id" />
              </View>

              <View style={styles.inputBlock}>
                <Select
                  placeholder="Select your vehicle type"
                  disabled={!values.market_id}
                  label="Vehicle Class"
                  value={VEHICLE_CLASS_TEXT[values.vehicle_class]}
                  onSelect={index => {
                    setFieldValue('vehicle_class', (index as IndexPath).row);
                  }}>
                  <SelectItem
                    title={evaProps => <Text {...evaProps}>Car</Text>}
                  />
                  <SelectItem
                    title={evaProps => <Text {...evaProps}>Midsize</Text>}
                  />
                  <SelectItem
                    title={evaProps => <Text {...evaProps}>Cargo Van</Text>}
                  />
                  <SelectItem
                    title={evaProps => <Text {...evaProps}>Box Truck</Text>}
                  />
                </Select>
                <ErrorMsg field="vehicle_class" />
              </View>

              <View style={styles.inputBlock}>
                <Select
                  placeholder="English Proficiency "
                  label="ENGLISH PROFICIENCY"
                  value={PROFICIENCY_TEXT[values.english_proficiency]}
                  onSelect={index => {
                    setFieldValue(
                      'english_proficiency',
                      (index as IndexPath).row,
                    );
                  }}>
                  <SelectItem
                    title={evaProps => (
                      <Text {...evaProps}>None (Not Proficient)</Text>
                    )}
                  />
                  <SelectItem
                    title={evaProps => <Text {...evaProps}>Beginner</Text>}
                  />
                  <SelectItem
                    title={evaProps => <Text {...evaProps}>Intermediate</Text>}
                  />
                  <SelectItem
                    testID={'QuestionnaireScreen.ProficiencyItem'}
                    title={evaProps => (
                      <Text {...evaProps}>Advanced (Fluent)</Text>
                    )}
                  />
                </Select>
                <ErrorMsg field="english_proficiency" />
              </View>

              <View style={styles.inputBlock}>
                <Input
                  value={values.email}
                  label="EMAIL"
                  testID="QuestionnaireScreen.EmailInput"
                  placeholder="test@email.com"
                  secureTextEntry={false}
                  autoComplete={'email'}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  textContentType="username"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <ErrorMsg field="email" />
              </View>

              <View style={styles.inputBlock}>
                <Text category="label" appearance="hint">
                  PHONE NUMBER
                </Text>
                <PhoneInput
                  onBlur={(phone_number, phone_error) => {
                    setFieldTouched('phone_number', true, false);
                    if (phone_error) {
                      setFieldError('phone_number', phone_error);
                    }
                  }}
                  onChange={(phone_number, phone_error) => {
                    if (phone_error) {
                      setFieldValue('phone_number', phone_number, false);
                      setFieldError('phone_number', phone_error);
                    } else {
                      setFieldValue('phone_number', phone_number, true);
                    }
                  }}
                  phoneNumber={values.phone_number}
                  errorStyle={styles.error}
                />
                <ErrorMsg field="phone_number" />
              </View>

              <Button
                testID="QuestionnaireScreen.SubmitButton"
                onPress={submitForm}
                style={styles.started}>
                Next Step
              </Button>
            </KeyboardAwareScrollView>
          );
        }}
      </Formik>
      <ApplyToDriveFooter
        step={1}
        previousAction={() =>
          navigation.navigate('ApplyToDrive', {screen: 'Info'})
        }
        disableNext={driver?.email ? false : true}
        nextAction={() => {
          const values = buildQuestionnaireValues(driver);
          navigation.navigate('ApplyToDrive', {
            screen: 'CreateAccount',
            params: {
              market_id: values.market_id ? values.market_id : '',
              vehicle_class: VEHICLE_CLASS_DATA[values.vehicle_class],
              english_proficiency: PROFICIENCY_DATA[values.english_proficiency],
              email: values.email,
              phone_number: values.phone_number ? values.phone_number : '',
            },
          });
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
  heading: {
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  error: {
    marginTop: 4,
    marginBottom: 16,
  },
  inputBlock: {marginBottom: 20},
});
