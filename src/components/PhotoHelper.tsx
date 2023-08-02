import {useActionSheet} from '@expo/react-native-action-sheet';
import {Alert, Platform} from 'react-native';
import {
  type CameraOptions,
  type ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
  Asset,
} from 'react-native-image-picker';
import {usePermissions} from './PermissionsHelper';

type FormikSetFieldValue = (
  field: string,
  value: any,
  shouldValidate?: boolean,
) => void;

export function useRequestPhoto() {
  const {showActionSheetWithOptions} = useActionSheet();
  const {cameraPermission, requestCameraPermission} = usePermissions();

  /**
   *
   * @param setFieldValue  - {@link FormikSetFieldValue} setFieldValue from Formik to update form state for photo field
   * @param field - {@link string} name of field for photo to update with base64 response from ImagePicker
   * @param filenameField - {@link string} optional parameter, name of field for photo filename to update from ImagePicker
   */
  const handlePhoto = async (
    setFieldValue: FormikSetFieldValue,
    field: string,
    filenameField?: string,
  ): Promise<Asset | undefined> => {
    try {
      const {assets} = await requestPhoto();
      if (assets && assets.length > 0) {
        setFieldValue(field, assets[0].base64);
        filenameField && setFieldValue(field, assets[0].fileName);
        return assets[0];
      }
    } catch (error: unknown) {
      if (typeof error === 'string') {
        Alert.alert('Error accessing camera', error);
      } else if (error instanceof Error) {
        Alert.alert('Error accessing camera', error.message);
      }
    }
  };

  /**
   * Brings up an action sheet for the user to decide between choosing a photo
   * from their photo library, or take one from their camera.
   * @param options - {@link CameraOptions} to override default options
   * @returns - {@link ImagePickerResponse}
   */
  const requestPhoto = (
    options?: CameraOptions,
  ): Promise<Pick<ImagePickerResponse, 'didCancel' | 'assets'>> => {
    const defaultOptions: CameraOptions = {
      mediaType: 'photo',
      includeBase64: true,
      maxWidth: 2560,
      maxHeight: 1440,
      quality: 0.9,
    };

    const cameraOptions: CameraOptions = Object.assign(defaultOptions, options);

    return new Promise((resolve, reject) => {
      const dialogueOptions = [
        'Take photo',
        'Select from Camera Roll',
        'Cancel',
      ];

      showActionSheetWithOptions(
        {
          options: dialogueOptions,
          cancelButtonIndex: 2,
        },
        async (selectedIndex: number | undefined) => {
          try {
            switch (selectedIndex) {
              case 0: {
                // Android does not need camera access for this library
                if (
                  Platform.OS !== 'android' &&
                  cameraPermission !== 'granted'
                ) {
                  const permission = await requestCameraPermission();
                  if (permission !== 'granted') return reject(permission);
                }
                const photo = await launchCamera(cameraOptions);

                if (photo.errorCode || photo.errorMessage) {
                  return reject(photo);
                }
                return resolve(photo);
              }
              case 1: {
                const image = await launchImageLibrary(cameraOptions);

                if (image.errorCode || image.errorMessage) {
                  return reject(image);
                }

                return resolve(image);
              }
              case 2:
                return resolve({didCancel: true});
            }
          } catch (error) {
            return reject(error);
          }
        },
      );
    });
  };

  return {
    requestPhoto,
    handlePhoto,
  };
}
