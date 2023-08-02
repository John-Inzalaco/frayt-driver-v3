import React, {useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {Layout, CheckBox, useStyleSheet} from '@ui-kitten/components';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {ApplyToDriveScreenProps} from '../../navigation/NavigatorTypes';
import {ApplyToDriveFooter} from '../../components/apply-to-drive-footer';
import {
  CardField,
  useStripe,
  PaymentMethod,
  PaymentIntent,
} from '@stripe/stripe-react-native';
import * as Yup from 'yup';
import {Formik} from 'formik';
import {
  ErrorMessage,
  ErrorMessageProps,
} from '../../lib/FormikSubmissionErrors';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {createBackgroundChargePayment, selectToken} from '../../slices/user';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {selectDriver} from '../../slices/user';

type CardStyle = {
  backgroundColor: string;
  textColor: string;
  placeholderColor: string;
};

const backgroundCheckSchema: Yup.SchemaOf<{agreed: boolean}> =
  Yup.object().shape({
    agreed: Yup.boolean().isTrue('Required').required('Required'),
  });

export default function BackgroundCheck({
  navigation,
}: ApplyToDriveScreenProps<'BackgroundCheck'>): React.ReactElement {
  const styles = useStyleSheet(themedStyles);
  const token = useAppSelector(selectToken);
  const driver = useAppSelector(selectDriver);
  const dispatch = useAppDispatch();
  const [initialValues, _setInitialValues] = useState<{agreed: boolean}>({
    agreed: false,
  });
  const {createPaymentMethod, handleNextAction} = useStripe();

  const vehicle_class = driver?.vehicle?.vehicle_class;

  const nextStep = async () => {
    if (vehicle_class === 4) {
      navigation.navigate('ApplyToDrive', {
        screen: 'RMISScreen',
      });
    } else {
      navigation.navigate('ApplyToDrive', {screen: 'Complete'});
    }
  };

  const startBackgroundCheck = async () => {
    try {
      const result = await createPaymentMethod({paymentMethodType: 'Card'});
      await chargeBackgroundCheck(result.paymentMethod);
    } catch (error) {
      if (typeof error === 'string') {
        Alert.alert('Submission Error', error);
      } else if (error instanceof Error) {
        Alert.alert('Submission Error', error.message);
      }
    }
  };

  const chargeBackgroundCheck = async (
    paymentMethod?: PaymentMethod.Result,
    paymentIntent?: PaymentIntent.Result,
  ) => {
    const {
      payment_intent_client_secret: paymentIntentClientSecret,
      requires_action: requiresAction,
    } = await dispatch(
      createBackgroundChargePayment({token, paymentMethod, paymentIntent}),
    ).unwrap();

    if (!paymentIntentClientSecret) {
      throw new Error('Missing payment intent information');
    }

    if (!requiresAction) {
      // Payment succeeded
      nextStep();
    } else {
      const {error, paymentIntent} = await handleNextAction(
        paymentIntentClientSecret,
      );

      if (error) {
        throw new Error(error.localizedMessage);
      } else if (paymentIntent) {
        if (paymentIntent.status === 'Succeeded') {
          // Payment succedeed
          nextStep();
        } else {
          // Confirm the PaymentIntent again on your server
          chargeBackgroundCheck(paymentMethod, paymentIntent);
        }
      }
    }
  };

  return (
    <Layout style={styles.container} level="3">
      <Formik
        initialValues={initialValues}
        validationSchema={backgroundCheckSchema}
        onSubmit={startBackgroundCheck}>
        {({errors, touched, setFieldValue, values, submitForm}) => {
          const ErrorMsg = ({field}: ErrorMessageProps) => (
            <ErrorMessage errors={errors} touched={touched} field={field} />
          );

          return (
            <KeyboardAwareScrollView>
              <Text style={styles.heading} category="h5">
                Background Check
              </Text>

              <Text style={styles.paragraph} category="p1">
                Your application is almost done! Thank you for applying for
                FRAYT. You can still go back and change any details if needed.
              </Text>

              <Text style={styles.paragraph} category="p1">
                Once your application is submitted, we will send you a
                background check from Turn. You’ll receive an email from Turn
                directly with a link to begin the background check.
              </Text>

              <Text style={styles.paragraph} category="p1">
                The background check will cost $35. The payment will only be
                charged once your application is reviewed by our team.
              </Text>

              <CardField
                placeholders={{
                  number: '4242 4242 4242 4242',
                  expiration: '04/24',
                  cvc: '242',
                }}
                postalCodeEnabled={false}
                cardStyle={styles.cardStyle as CardStyle}
                style={styles.cardFieldStyle}
              />

              <View>
                <View style={[styles.row, styles.checkboxOffset]}>
                  <CheckBox
                    onChange={value => setFieldValue('agreed', value)}
                    checked={values.agreed}>
                    {evaProps => (
                      <Text {...evaProps} category="label">
                        I understand I will be charged after my application is
                        manually reviewed
                      </Text>
                    )}
                  </CheckBox>
                </View>
                <ErrorMsg field="agreed" />
              </View>

              <Button onPress={submitForm} style={styles.started}>
                Next Step
              </Button>
            </KeyboardAwareScrollView>
          );
        }}
      </Formik>

      <ApplyToDriveFooter
        step={8}
        previousAction={() => navigation.goBack()}
        disableNext={false}
        nextAction={() => {
          if (vehicle_class === 4) {
            navigation.navigate('ApplyToDrive', {
              screen: 'RMISScreen',
            });
          } else {
            navigation.navigate('ApplyToDrive', {screen: 'Complete'});
          }
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
  half: {
    width: '47%',
    flexShrink: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  paragraph: {
    textAlign: 'left',
    marginBottom: 10,
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
  text: {
    marginBottom: 20,
  },
  select: {
    marginBottom: 20,
  },
  checkboxOffset: {
    paddingRight: 10,
  },
  cardStyle: {
    backgroundColor: 'color-basic-900',
    textColor: 'color-basic-500',
    placeholderColor: 'color-basic-600',
  },
  cardFieldStyle: {
    width: '100%',
    height: 50,
    marginTop: 5,
    marginBottom: 16,
  },
});
