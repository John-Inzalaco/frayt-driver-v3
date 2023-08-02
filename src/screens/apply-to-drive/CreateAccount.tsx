import React, {useState, useRef, useEffect} from 'react';
import {Alert, Linking, StyleSheet, View} from 'react-native';
import {Layout, Input, CheckBox, useStyleSheet} from '@ui-kitten/components';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {ApplyToDriveScreenProps} from '../../navigation/NavigatorTypes';
import SignatureScreen, {SignatureViewRef} from 'react-native-signature-canvas';
import {Formik, FormikHelpers} from 'formik';
import * as Yup from 'yup';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  ErrorMessage,
  ErrorMessageProps,
} from '../../lib/FormikSubmissionErrors';
import {getAgreements, AgreementType, AgreementDocument} from '@frayt/sdk';
import {ApplyToDriveFooter} from '../../components/apply-to-drive-footer';
import {useSelector} from 'react-redux';
import {
  createUser,
  selectDriver,
  updateOneSignalNotificationId,
} from '../../slices/user';
import {useAppDispatch} from '../../hooks';

export type RegistrationValues = {
  password: string;
  password_confirmation: string;
  agreements: AgreementValues[];
  signature: string | null;
};

export type AgreementValues = {
  agreed: boolean;
  document_id: string;
};

const agreementSchema: Yup.SchemaOf<AgreementValues> = Yup.object().shape({
  agreed: Yup.boolean().oneOf([true], 'Please agree to continue').required(),
  document_id: Yup.string().required(),
});

const registrationSchema: Yup.SchemaOf<RegistrationValues> = Yup.object().shape(
  {
    password: Yup.string()
      .min(8, 'Should have 8 characters or more')
      .required('Required'),
    password_confirmation: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Required'),
    agreements: Yup.array(agreementSchema).required(),
    signature: Yup.string().required('Signature is required'),
  },
);

const signatureScreenWebStyle = `body,html {height: 150px; width: 100%;} .m-signature-pad--footer {display: none; margin: 0px;}`;

export default function CreateAccount({
  navigation,
  route: route,
}: ApplyToDriveScreenProps<'CreateAccount'>): React.ReactElement {
  const [driverAgreements, setDriverAgreements] = useState<AgreementDocument[]>(
    [],
  );
  const [initialValues, setInitialValues] = useState<RegistrationValues>({
    password: '',
    password_confirmation: '',
    agreements: [],
    signature: null,
  });
  const driver = useSelector(selectDriver);
  const signatureRef = useRef<SignatureViewRef>(null);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const dispatch = useAppDispatch();
  const styles = useStyleSheet(themedStyles);

  useEffect(() => {
    async function getDriverAgreements() {
      const agreements = await getAgreements(AgreementType.DRIVER);
      if (agreements) {
        await setDriverAgreements(agreements);
      }
    }
    getDriverAgreements();
  }, []);

  useEffect(() => {
    setInitialValues(iv => ({
      ...iv,
      agreements: driverAgreements.map((a: AgreementDocument) => ({
        document_id: a.id,
        agreed: false,
      })),
    }));
  }, [driverAgreements]);

  const nextStep = async (
    {
      password,
      signature,
      password_confirmation,
      agreements,
    }: RegistrationValues,
    formikHelpers: FormikHelpers<RegistrationValues>,
  ) => {
    if (!signature) {
      formikHelpers.setSubmitting(false);
      return;
    }
    const {email, ...questionnaires} = route.params;

    const data = {
      signature: signature,
      password_confirmation: password_confirmation,
      agreements: agreements,
      ...questionnaires,
      user: {
        password,
        email,
      },
    };

    try {
      const {driver} = await dispatch(createUser({data: data})).unwrap();

      if (!driver)
        throw new Error('Unknown error encountered while creating account');

      await dispatch(updateOneSignalNotificationId(null)).unwrap();
      navigation.navigate('ApplyToDrive', {
        screen: 'Personal',
      });
    } catch (error) {
      if (typeof error === 'string') {
        Alert.alert('Submission Error', error);
      } else if (error instanceof Error) {
        Alert.alert('Submission Error', error.message);
      }
      formikHelpers.setSubmitting(false);
    }
  };

  const updateAgreementKeys = (data, field, index) => {
    const agreementerrorsObject: any = {};
    if (data && data[index]) {
      data?.map((item: any) => {
        if (item) {
          agreementerrorsObject[field] = item?.agreed;
        }
      });
    }
    return agreementerrorsObject;
  };

  return (
    <Layout style={styles.container} level="3">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={registrationSchema}
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

          const AgreementsErrorMsg = ({field, index}: ErrorMessageProps) => (
            <ErrorMessage
              errors={updateAgreementKeys(errors?.agreements, field, index)}
              touched={updateAgreementKeys(touched?.agreements, field, index)}
              field={field}
            />
          );

          return (
            <KeyboardAwareScrollView
              scrollEnabled={scrollEnabled}
              testID="CreateAccount.ScrollView">
              <Text
                testID="CreateAccount.HeaderText"
                style={styles.heading}
                category="h5">
                Create Account
              </Text>

              <Input
                style={styles.select}
                label="Password"
                testID="CreateAccount.PasswordInput"
                secureTextEntry={true}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
              />

              <ErrorMsg field="password" />

              <Input
                style={styles.select}
                label="Password Confirmation"
                testID="CreateAccount.PasswordConfirmationInput"
                secureTextEntry={true}
                onChangeText={handleChange('password_confirmation')}
                onBlur={handleBlur('password_confirmation')}
              />

              {touched.password_confirmation ? (
                <ErrorMsg field="password_confirmation" />
              ) : null}

              {driverAgreements.map((agreement, i) => (
                <View key={`agreement_title_wrapper_${i}`}>
                  <Text
                    style={styles.agreementLink}
                    category="p1"
                    key={`agreement_title_${i}`}
                    onPress={() => Linking.openURL(agreement.url)}>
                    {agreement.title}
                  </Text>
                  <CheckBox
                    style={styles.select}
                    key={`agreement_${i}`}
                    testID={`CreateAccount.AgreementCheckbox_${i}`}
                    onChange={checked => {
                      setFieldValue(`agreements[${i}].agreed`, checked, true);
                    }}
                    checked={!!values.agreements[i]?.agreed}>
                    {`I agree to ${agreement.title}`}
                  </CheckBox>
                  <AgreementsErrorMsg
                    key={`agreement_error_${i}`}
                    field={`agreements[${i}].agreed`}
                    index={i}
                  />
                </View>
              ))}

              <Text style={styles.label} category="label" appearance="hint">
                Signature
              </Text>
              <SignatureScreen
                ref={signatureRef}
                onOK={signature => setFieldValue('signature', signature)}
                onBegin={() => setScrollEnabled(false)}
                onEnd={() => {
                  setScrollEnabled(true);
                  signatureRef.current?.readSignature();
                }}
                autoClear={false}
                webStyle={signatureScreenWebStyle}
                dotSize={5}
                style={styles.signature}
              />

              <ErrorMsg field="signature" />

              <Button
                onPress={() => submitForm()}
                style={styles.started}
                testID="CreateAccount.SubmitButton">
                Next Step
              </Button>
            </KeyboardAwareScrollView>
          );
        }}
      </Formik>
      <ApplyToDriveFooter
        step={2}
        previousAction={() =>
          navigation.navigate('ApplyToDrive', {screen: 'Questionnaire'})
        }
        disableNext={driver?.email ? false : true}
        nextAction={() => {
          navigation.navigate('ApplyToDrive', {screen: 'Personal'});
        }}
      />
    </Layout>
  );
}

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 15,
  },
  label: {
    marginBottom: 10,
  },
  agreementLink: {
    marginBottom: 10,
    color: 'color-primary-500',
  },
  started: {
    marginTop: 20,
    width: '100%',
  },
  heading: {
    textAlign: 'center',
    marginTop: 25,
    marginBottom: 10,
  },
  text: {
    marginBottom: 20,
  },
  select: {
    marginBottom: 20,
  },
  signature: {
    width: '100%',
    height: 150,
  },
});
