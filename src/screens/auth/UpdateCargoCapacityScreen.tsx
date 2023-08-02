import React, {useState} from 'react';
import {StyleSheet, View, Alert} from 'react-native';
import {Layout, Input, useStyleSheet, CheckBox} from '@ui-kitten/components';
import * as Yup from 'yup';
import {Formik} from 'formik';
import StringMask from 'string-mask';
import {AuthStackProps} from '../../navigation/NavigatorTypes';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {DividerGray} from '../../components/ui-kitten/DividerGray';
import {
  ErrorMessage,
  ErrorMessageProps,
} from '../../lib/FormikSubmissionErrors';
import {
  selectDriver,
  selectToken,
  logoutUser,
  updateCargoCapacity,
} from '../../slices/user';
import {useAppSelector, useAppDispatch} from '../../hooks';
import {useLoginHelper} from '../../lib/LoginHelper';
import {CargoCapacityMeasurements} from '@frayt/sdk';

type CapacityValues = {
  capacity_height: number | null;
  capacity_width: number | null;
  capacity_length: number | null;
  capacity_weight: number | null;
  capacity_between_wheel_wells: number | null;
  capacity_door_height: number | null;
  capacity_door_width: number | null;
  lift_gate?: boolean;
  pallet_jack?: boolean;
};

const capacitySchema: Yup.SchemaOf<CapacityValues> = Yup.object().shape({
  capacity_height: Yup.number().nullable().required('Required'),
  capacity_width: Yup.number().nullable().required('Required'),
  capacity_length: Yup.number().nullable().required('Required'),
  capacity_weight: Yup.number().defined().nullable(),
  capacity_between_wheel_wells: Yup.number().defined().nullable(),
  capacity_door_height: Yup.number().nullable().required('Required'),
  capacity_door_width: Yup.number().nullable().required('Required'),
  lift_gate: Yup.boolean(),
  pallet_jack: Yup.boolean(),
});

const MASK = '000';

export default function ({
  navigation,
}: AuthStackProps<'UpdateCargoCapacityScreen'>): React.ReactElement {
  const styles = useStyleSheet(themedStyles);
  const dispatch = useAppDispatch();
  const {getAuthRoute} = useLoginHelper();

  const driver = useAppSelector(selectDriver);
  const token = useAppSelector(selectToken);
  const vehicle = driver?.vehicle;

  const initialValues = {
    capacity_height: vehicle?.capacity_height || null,
    capacity_width: vehicle?.capacity_width || null,
    capacity_length: vehicle?.capacity_length || null,
    capacity_weight: vehicle?.capacity_weight || null,
    capacity_between_wheel_wells: vehicle?.capacity_between_wheel_wells || null,
    capacity_door_height: vehicle?.capacity_door_height || null,
    capacity_door_width: vehicle?.capacity_door_width || null,
    lift_gate: vehicle?.lift_gate || false,
    pallet_jack: vehicle?.pallet_jack || false,
  };

  const [values, _setValues] = useState<CapacityValues>(initialValues);

  const handleContinue = async (values: CapacityValues) => {
    try {
      if (!token) throw new Error('Missing user token');

      const result = await dispatch(
        updateCargoCapacity({
          vehicleCapacity: values as CargoCapacityMeasurements,
          vehicleId: vehicle?.id || '',
          token,
        }),
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

  const formatValue = (str: string): string => {
    const formatted = StringMask.process(str, MASK);
    return formatted.result;
  };

  return (
    <Layout level="3" style={styles.container}>
      <Text category="h4" style={[styles.heading, styles.space]}>
        Vehicle Capacity
      </Text>
      <Formik
        initialValues={values}
        validationSchema={capacitySchema}
        onSubmit={handleContinue}>
        {({handleBlur, values, errors, touched, setFieldValue, submitForm}) => {
          const ErrorMsg = ({field}: ErrorMessageProps) => (
            <ErrorMessage errors={errors} touched={touched} field={field} />
          );

          return (
            <>
              <Text category="h5" style={styles.space}>
                Cargo Area
              </Text>
              <View style={[styles.side, styles.space]}>
                <View style={styles.three_column}>
                  <Input
                    value={`${values.capacity_height || ''}`}
                    label="HEIGHT"
                    placeholder="in"
                    secureTextEntry={false}
                    onChangeText={text =>
                      setFieldValue('capacity_height', formatValue(text))
                    }
                    onBlur={handleBlur('capacity_height')}
                    style={styles.input}
                    textStyle={styles.inputText}
                  />
                  <ErrorMsg field="capacity_height" />
                </View>
                <View style={styles.three_column}>
                  <Input
                    value={`${values.capacity_width || ''}`}
                    label="WIDTH"
                    placeholder="in"
                    secureTextEntry={false}
                    onChangeText={text =>
                      setFieldValue('capacity_width', formatValue(text))
                    }
                    onBlur={handleBlur('capacity_width')}
                    style={styles.input}
                    textStyle={styles.inputText}
                  />
                  <ErrorMsg field="capacity_width" />
                </View>
                <View style={styles.three_column}>
                  <Input
                    value={`${values.capacity_length || ''}`}
                    label="LENGTH"
                    placeholder="in"
                    secureTextEntry={false}
                    onChangeText={text =>
                      setFieldValue('capacity_length', formatValue(text))
                    }
                    onBlur={handleBlur('capacity_length')}
                    style={styles.input}
                    textStyle={styles.inputText}
                  />
                  <ErrorMsg field="capacity_length" />
                </View>
              </View>
              {vehicle?.vehicle_class === 3 && (
                <View style={styles.space}>
                  <Input
                    value={`${values.capacity_between_wheel_wells || ''}`}
                    label="Distance Between Wheel Wells"
                    placeholder="in"
                    secureTextEntry={false}
                    onChangeText={text =>
                      setFieldValue(
                        'capacity_between_wheel_wells',
                        formatValue(text),
                      )
                    }
                    onBlur={handleBlur('capacity_between_wheel_wells')}
                    style={styles.input}
                    textStyle={styles.inputText}
                  />
                  <ErrorMsg field="capacity_between_wheel_wells" />
                </View>
              )}
              {(vehicle?.vehicle_class === 3 ||
                vehicle?.vehicle_class === 4) && (
                <View style={styles.space}>
                  <Input
                    value={`${values.capacity_weight || ''}`}
                    label="Cargo Weight Limit"
                    placeholder="lb"
                    secureTextEntry={false}
                    onChangeText={text =>
                      setFieldValue('capacity_weight', formatValue(text))
                    }
                    onBlur={handleBlur('capacity_weight')}
                    style={styles.input}
                    textStyle={styles.inputText}
                  />
                  <ErrorMsg field="capacity_weight" />
                </View>
              )}
              <Text category="h5" style={styles.space}>
                Door
              </Text>
              <View style={[styles.side, styles.space]}>
                <View style={styles.two_column}>
                  <Input
                    value={`${values.capacity_door_height || ''}`}
                    label="HEIGHT"
                    placeholder="in"
                    secureTextEntry={false}
                    onChangeText={text =>
                      setFieldValue('capacity_door_height', formatValue(text))
                    }
                    onBlur={handleBlur('capacity_door_height')}
                    style={styles.input}
                    textStyle={styles.inputText}
                  />
                  <ErrorMsg field="capacity_door_height" />
                </View>
                <View style={styles.two_column}>
                  <Input
                    value={`${values.capacity_door_width || ''}`}
                    label="WIDTH"
                    placeholder="in"
                    secureTextEntry={false}
                    onChangeText={text =>
                      setFieldValue('capacity_door_width', formatValue(text))
                    }
                    onBlur={handleBlur('capacity_door_width')}
                    style={styles.input}
                    textStyle={styles.inputText}
                  />
                  <ErrorMsg field="capacity_door_width" />
                </View>
              </View>
              {vehicle?.vehicle_class === 4 && (
                <>
                  <View style={styles.space}>
                    <CheckBox
                      checked={values.lift_gate}
                      onChange={() =>
                        setFieldValue('lift_gate', !values.lift_gate)
                      }>
                      Lift Gate
                    </CheckBox>
                    <ErrorMsg field="lift_gate" />
                  </View>
                  <View style={styles.space}>
                    <CheckBox
                      checked={values.pallet_jack}
                      onChange={() =>
                        setFieldValue('pallet_jack', !values.pallet_jack)
                      }>
                      Pallet Jack
                    </CheckBox>
                    <ErrorMsg field="pallet_jack" />
                  </View>
                </>
              )}
              <Button onPress={submitForm} style={styles.space}>
                CONTINUE
              </Button>
            </>
          );
        }}
      </Formik>
      <DividerGray style={styles.space} />
      <Button status="danger" onPress={handleLogOut}>
        SIGN OUT
      </Button>
    </Layout>
  );
}

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    paddingHorizontal: 10,
  },
  heading: {
    alignSelf: 'center',
  },
  side: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  space: {
    marginBottom: 15,
  },
  two_column: {
    width: '47%',
  },
  three_column: {
    width: '31%',
  },
  inputText: {
    color: 'black',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'color-basic-500',
  },
});
