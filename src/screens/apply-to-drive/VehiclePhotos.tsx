import React, {useState} from 'react';
import {StyleSheet, View, TouchableOpacity, Alert} from 'react-native';
import {Layout, Button} from '@ui-kitten/components';
import {ApplyToDriveScreenProps} from '../../navigation/NavigatorTypes';
import FastImage from 'react-native-fast-image';
import {ApplyToDriveFooter} from '../../components/apply-to-drive-footer';
import {Text} from '../../components/ui-kitten/Text';
import {Formik} from 'formik';
import {
  ErrorMessage,
  ErrorMessageProps,
} from '../../lib/FormikSubmissionErrors';
import * as Yup from 'yup';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Asset} from 'react-native-image-picker';
import {DriverDocument} from '@frayt/sdk';
import {useRequestPhoto} from '../../components/PhotoHelper';
import {updateUser} from '../../slices/user';
import {useToken} from '../../lib/TokenHelper';
import {useAppDispatch} from '../../hooks';

type VehiclePhotosYupValues = {
  drivers_side: string | null;
  back: string | null;
  passengers_side: string | null;
  front: string | null;
  cargo_area: string | null;
};

type VehiclePhotosUris = {
  drivers_side: string | undefined;
  back: string | undefined;
  passengers_side: string | undefined;
  front: string | undefined;
  cargo_area: string | undefined;
};

type VehiclePhotosAssets = {
  drivers_side: DriverDocument | null;
  back: DriverDocument | null;
  passengers_side: DriverDocument | null;
  front: DriverDocument | null;
  cargo_area: DriverDocument | null;
};

const vehiclePhotosSchema: Yup.SchemaOf<VehiclePhotosYupValues> =
  Yup.object().shape({
    drivers_side: Yup.string().required('Required').typeError('Required'),
    back: Yup.string().required('Required').typeError('Required'),
    passengers_side: Yup.string().required('Required').typeError('Required'),
    front: Yup.string().required('Required').typeError('Required'),
    cargo_area: Yup.string().required('Required').typeError('Required'),
  });

export default function VehiclePhotos({
  navigation,
}: ApplyToDriveScreenProps<'VehiclePhotos'>): React.ReactElement {
  const {handlePhoto} = useRequestPhoto();
  const {token} = useToken();
  const dispatch = useAppDispatch();
  const [initialValues, _setInitialValues] = useState<VehiclePhotosYupValues>({
    drivers_side: null,
    back: null,
    passengers_side: null,
    front: null,
    cargo_area: null,
  });

  const [photos, setPhotos] = useState<VehiclePhotosAssets>({
    drivers_side: null,
    back: null,
    passengers_side: null,
    front: null,
    cargo_area: null,
  });

  const [uris, setUris] = useState<VehiclePhotosUris>({
    drivers_side: undefined,
    back: undefined,
    passengers_side: undefined,
    front: undefined,
    cargo_area: undefined,
  });

  const nextStep = async () => {
    try {
      if (!token) throw new Error('Missing user token');

      console.log(photos);
      const result = await dispatch(
        updateUser({token: token, data: {vehicle_photos: photos}}),
      ).unwrap();

      if (result) {
        navigation.navigate('ApplyToDrive', {
          screen: 'BackgroundCheck',
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

  const setAsset = (asset: Asset | undefined, field: string) => {
    if (asset && asset.base64) {
      setPhotos({
        ...photos,
        [field]: {
          data: asset.base64,
          height: asset?.height || 0,
          width: asset?.width || 0,
          mime: asset?.type || '',
          modificationDate: asset?.modificationDate || '',
          path: asset?.path || '',
          size: asset?.fileSize || 0,
        },
      });
      setUris({...uris, [field]: asset?.uri});
    }
  };

  return (
    <Layout style={styles.container} level="3">
      <Formik
        initialValues={initialValues}
        validationSchema={vehiclePhotosSchema}
        onSubmit={nextStep}>
        {({setFieldValue, errors, touched, submitForm}) => {
          const ErrorMsg = ({field}: ErrorMessageProps) => (
            <ErrorMessage errors={errors} touched={touched} field={field} />
          );
          return (
            <KeyboardAwareScrollView>
              <Text style={styles.heading} category="h5">
                Vehicle Photos
              </Text>

              <Text style={styles.text} category="p1">
                Make sure that your license plate is clearly visible in the Back
                (Exterior) photo.
              </Text>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.label} category="label" appearance="hint">
                    FRONT (EXTERIOR)
                  </Text>
                  <TouchableOpacity
                    testID="VehiclePhotosScreen.FrontPhoto"
                    style={styles.photoWrapper}
                    onPress={async () => {
                      const asset = await handlePhoto(setFieldValue, 'front');
                      setAsset(asset, 'front');
                    }}>
                    {uris.front ? (
                      <FastImage
                        resizeMode="cover"
                        style={styles.photo}
                        source={{uri: uris.front}}
                      />
                    ) : (
                      <FastImage
                        resizeMode="contain"
                        style={styles.photo}
                        source={require('../../images/Vehicle/Front1.png')}
                      />
                    )}
                  </TouchableOpacity>
                  <ErrorMsg field="front" />
                </View>
                <View style={styles.half}>
                  <Text style={styles.label} category="label" appearance="hint">
                    BACK (EXTERIOR)
                  </Text>

                  <TouchableOpacity
                    testID="VehiclePhotosScreen.BackPhoto"
                    style={styles.photoWrapper}
                    onPress={async () => {
                      const asset = await handlePhoto(setFieldValue, 'back');
                      setAsset(asset, 'back');
                    }}>
                    {uris.back ? (
                      <FastImage
                        resizeMode="cover"
                        style={styles.photo}
                        source={{uri: uris.back}}
                      />
                    ) : (
                      <FastImage
                        resizeMode="contain"
                        style={styles.photo}
                        source={require('../../images/Vehicle/Back1.png')}
                      />
                    )}
                  </TouchableOpacity>
                  <ErrorMsg field="back" />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.label} category="label" appearance="hint">
                    DRIVER SIDE (EXTERIOR)
                  </Text>
                  <TouchableOpacity
                    testID="VehiclePhotosScreen.DriverSidePhoto"
                    style={styles.photoWrapper}
                    onPress={async () => {
                      const asset = await handlePhoto(
                        setFieldValue,
                        'drivers_side',
                      );
                      setAsset(asset, 'drivers_side');
                    }}>
                    {uris.drivers_side ? (
                      <FastImage
                        resizeMode="cover"
                        style={styles.photo}
                        source={{uri: uris.drivers_side}}
                      />
                    ) : (
                      <FastImage
                        resizeMode="contain"
                        style={styles.photo}
                        source={require('../../images/Vehicle/Side1.png')}
                      />
                    )}
                  </TouchableOpacity>
                  <ErrorMsg field="drivers_side" />
                </View>
                <View style={styles.half}>
                  <Text style={styles.label} category="label" appearance="hint">
                    PASSENGER SIDE (EXTERIOR)
                  </Text>

                  <TouchableOpacity
                    testID="VehiclePhotosScreen.PassengerSidePhoto"
                    style={styles.photoWrapper}
                    onPress={async () => {
                      const asset = await handlePhoto(
                        setFieldValue,
                        'passengers_side',
                      );
                      setAsset(asset, 'passengers_side');
                    }}>
                    {uris.passengers_side ? (
                      <FastImage
                        resizeMode="cover"
                        style={styles.photo}
                        source={{uri: uris.passengers_side}}
                      />
                    ) : (
                      <FastImage
                        resizeMode="contain"
                        style={styles.photo}
                        source={require('../../images/Vehicle/Side2.png')}
                      />
                    )}
                  </TouchableOpacity>
                  <ErrorMsg field="passengers_side" />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.label} category="label" appearance="hint">
                    CARGO AREA (INTERIOR)
                  </Text>
                  <TouchableOpacity
                    testID="VehiclePhotosScreen.CargoPhoto"
                    style={styles.photoWrapper}
                    onPress={async () => {
                      const asset = await handlePhoto(
                        setFieldValue,
                        'cargo_area',
                      );
                      setAsset(asset, 'cargo_area');
                    }}>
                    {uris.cargo_area ? (
                      <FastImage
                        resizeMode="cover"
                        style={styles.photo}
                        source={{uri: uris.cargo_area}}
                      />
                    ) : (
                      <FastImage
                        resizeMode="contain"
                        style={styles.photo}
                        source={require('../../images/Vehicle/Trunk.png')}
                      />
                    )}
                  </TouchableOpacity>
                  <ErrorMsg field="cargo_area" />
                </View>
              </View>

              <Button
                onPress={submitForm}
                style={styles.started}
                testID="VehiclePhotosScreen.SubmitButton">
                Next Step
              </Button>
            </KeyboardAwareScrollView>
          );
        }}
      </Formik>
      <ApplyToDriveFooter
        step={7}
        previousAction={() => navigation.goBack()}
        disableNext={false}
        nextAction={() => {
          navigation.navigate('ApplyToDrive', {screen: 'BackgroundCheck'});
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
    marginBottom: 10,
    padding: 0,
  },
  photoWrapper: {
    marginTop: 0,
    padding: 10,
    backgroundColor: 'color-basic-500',
    border: '5px solid #FF0000',
    borderRadius: 4,
    flexDirection: 'column',
    height: 113,
    width: 177,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    height: 113,
    width: 177,
    backgroundColor: 'transparent',
  },
  half: {
    width: '47%',
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  heading: {
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  text: {
    marginBottom: 20,
  },
});
