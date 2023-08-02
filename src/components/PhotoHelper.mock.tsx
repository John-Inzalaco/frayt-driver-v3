import {Alert} from 'react-native';
import {
  Asset,
  CameraOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';

type FormikSetFieldValue = (
  field: string,
  value: any,
  shouldValidate?: boolean,
) => void;

export function useRequestPhoto() {
  /**
   *
   * @param setFieldValue  - {@link FormikSetFieldValue} setFieldValue from Formik to update form state for photo field
   * @param field - {@link string} name of field for photo to update with base64 response from ImagePicker
   * @param filenameField - {@link string} optional parameter, name of field for photo filename to update from ImagePicker
   */
  async function handlePhoto(
    setFieldValue: FormikSetFieldValue,
    field: string,
    filenameField?: string,
  ): Promise<Asset | undefined> {
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
  }

  const requestPhoto = async (
    _options?: CameraOptions,
  ): Promise<Pick<ImagePickerResponse, 'assets'>> => {
    return {
      assets: [
        {
          fileName: 'base64_img.jpg',
          base64:
            '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iiigD//2Q==',
        },
      ],
    };
  };

  return {
    requestPhoto,
    handlePhoto,
  };
}
