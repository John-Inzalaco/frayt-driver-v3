import React, {useState} from 'react';
import {StyleSheet, Alert, View, Linking} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import StringMask from 'string-mask';
import {Layout, Input, CheckBox, useStyleSheet} from '@ui-kitten/components';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {DividerGray} from '../../components/ui-kitten/DividerGray';
import {AuthStackProps} from '../../navigation/NavigatorTypes';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {selectToken, logoutUser, createPaymentInfo} from '../../slices/user';
import BranchLogoSVG from '../../images/BranchLogoSVG';
import {useLoginHelper} from '../../lib/LoginHelper';
import {
  ErrorMessage,
  ErrorMessageProps,
} from '../../lib/FormikSubmissionErrors';

type WalletValues = {
  ssn: string | null;
  agree_to_tos: boolean;
};

const walletSchema: Yup.SchemaOf<WalletValues> = Yup.object().shape({
  ssn: Yup.string().required('Please enter a valid SSN.'),
  agree_to_tos: Yup.boolean().required(),
});

export default function ({
  navigation,
}: AuthStackProps<'SetupWalletScreen'>): React.ReactElement {
  const styles = useStyleSheet(themedStyles);
  const dispatch = useAppDispatch();
  const {getAuthRoute} = useLoginHelper();

  const token = useAppSelector(selectToken);

  const DELIMITER = '-';
  const MASK = '000-00-0000';

  const initialValues = {
    ssn: null,
    agree_to_tos: false,
  };

  const [values, _setValues] = useState<WalletValues>(initialValues);

  const removeTrailingCharIfFound = (str: string, char: string): string => {
    return str
      .split(char)
      .filter(segment => segment !== '')
      .join(char);
  };

  const formatValue = (str: string): string => {
    const unmaskedValue = str.split(DELIMITER).join('');
    const formatted = StringMask.process(unmaskedValue, MASK);
    return removeTrailingCharIfFound(formatted.result, DELIMITER);
  };

  const openTOS = async () => {
    const tosURL = 'https://www.branchapp.com/terms';
    const supported = await Linking.canOpenURL(tosURL);

    if (supported) {
      Linking.openURL(tosURL);
    }
  };

  const handleContinue = async (values: WalletValues) => {
    try {
      if (!token) throw new Error('Missing user token');

      const result = await dispatch(
        createPaymentInfo({...values, token}),
      ).unwrap();

      if (result) {
        const {route, screen} = await getAuthRoute();
        if (route === 'Home')
          return navigation.navigate(route, {screen: screen});
        navigation.navigate(route, {screen: screen});
      }
    } catch (error) {
      if (typeof error === 'string') {
        Alert.alert('Submission Error', error);
      } else if (error instanceof Error) {
        Alert.alert('Submission Error', error.message);
      }
    }
  };

  const handleLogOut = async () => {
    const {token} = await dispatch(logoutUser()).unwrap();
    if (!token) {
      navigation.replace('Auth', {screen: 'Login'});
    }
  };

  return (
    <Layout level="3" style={styles.container}>
      <Text category="h4" style={[styles.header, styles.space]}>
        Payments
      </Text>
      <View style={[styles.svg, styles.space]}>
        <BranchLogoSVG />
      </View>
      <Text style={styles.space} category="p1">
        We’ve partnered with Branch to offer you faster turnaround on your
        payouts. You’ll be paid on the same day, and be able to access that
        money instantly.
      </Text>
      <Text style={styles.space} category="p1">
        To setup your Branch wallet, we need to verify your Social Security
        Number. Once verified, you will receive an email with instructions on
        claiming your wallet.
      </Text>
      <Formik
        initialValues={values}
        validationSchema={walletSchema}
        onSubmit={handleContinue}>
        {({handleBlur, values, errors, touched, setFieldValue, submitForm}) => {
          const ErrorMsg = ({field}: ErrorMessageProps) => (
            <ErrorMessage errors={errors} touched={touched} field={field} />
          );
          return (
            <>
              <View style={styles.space}>
                <Input
                  value={values.ssn || ''}
                  label="SOCIAL SECURITY NUMBER"
                  placeholder="###-##-####"
                  secureTextEntry={false}
                  onChangeText={text => setFieldValue('ssn', formatValue(text))}
                  onBlur={handleBlur('ssn')}
                  maxLength={11}
                  style={styles.input}
                  textStyle={styles.inputText}
                />
                <ErrorMsg field="ssn" />
              </View>
              <View style={styles.space}>
                <CheckBox
                  checked={values.agree_to_tos}
                  children={() => (
                    <>
                      <Text category="s2">
                        I have read and agree to Branch's{' '}
                      </Text>
                      <Text category="s2" style={styles.link} onPress={openTOS}>
                        Terms of Service
                      </Text>
                    </>
                  )}
                  onChange={() =>
                    setFieldValue('agree_to_tos', !values.agree_to_tos)
                  }
                />
                <ErrorMsg field="agree_to_tos" />
              </View>
              <Button onPress={submitForm} style={styles.space}>
                CONTINUE
              </Button>
            </>
          );
        }}
      </Formik>

      <DividerGray style={styles.space} />
      <Button status="danger" onPress={handleLogOut} style={styles.space}>
        SIGN OUT
      </Button>
    </Layout>
  );
}

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 25,
    alignSelf: 'center',
  },
  svg: {
    alignItems: 'center',
  },
  space: {
    marginBottom: 15,
  },
  inputText: {
    color: 'black',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'color-basic-500',
  },
  link: {
    color: 'color-primary-500',
  },
  rowView: {
    flexDirection: 'row',
  },
});
