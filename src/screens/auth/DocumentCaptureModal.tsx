import React, {useState} from 'react';
import {
  Datepicker,
  Layout,
  NativeDateService,
  useTheme,
} from '@ui-kitten/components';
import {Button} from '../../components/ui-kitten/Button';
import {Text} from '../../components/ui-kitten/Text';
import {AuthStackProps} from '../../navigation/NavigatorTypes';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import {Alert, StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useRequestPhoto} from '../../components/PhotoHelper';
import {updateDriverDocument} from '../../slices/user';
import {FontAwesome5ProEva} from '../../components/ui-kitten/FontAwesome5ProEva';
import moment from 'moment';
import {useAppDispatch} from '../../hooks';

import {type Asset} from 'react-native-image-picker';

export default function DocumentCaptureModal({
  route,
  navigation,
}: AuthStackProps<'DocumentCaptureModal'>) {
  const theme = useTheme();
  const {requestPhoto} = useRequestPhoto();

  const formatDateService = new NativeDateService('en', {format: 'MM-DD-YYYY'});
  const maxDate = moment().startOf('day').add(100, 'years');

  const {userId, documentType, token} = route.params;

  const [image, setImage] = useState<Asset | null>(null);
  const [expirationDate, setexpirationDate] = useState(new Date());

  const dispatch = useAppDispatch();

  const handleSubmit = async () => {
    try {
      const result = await dispatch(
        updateDriverDocument({
          image: {data: image?.base64},
          expirationDate,
          documentType,
          userId,
          token,
        }),
      ).unwrap();

      if (result) {
        navigation.goBack();
      }
    } catch (error) {
      if (typeof error === 'string') {
        Alert.alert('Submission Error', error);
      } else if (error instanceof Error) {
        Alert.alert('Submission Error', error.message);
      }
    }
  };

  return (
    <Layout level="1" style={styles.container}>
      <View style={styles.expirationWrapper}>
        <Text category="label">DOCUMENT EXPIRATION</Text>
        <Datepicker
          date={expirationDate}
          onSelect={date => setexpirationDate(date)}
          dateService={formatDateService}
          min={new Date()}
          max={maxDate.toDate()}
          accessoryRight={evaProps => (
            <FontAwesome5ProEva eva={evaProps} name="calendar" />
          )}
        />
      </View>
      <Layout level="2" style={styles.photoWrapper}>
        {image ? (
          <FastImage
            resizeMode="contain"
            style={styles.photo}
            source={{uri: image.uri}}
          />
        ) : (
          <Text>
            <Icon
              name="file"
              size={250}
              color={theme['color-basic-500']}></Icon>
          </Text>
        )}
      </Layout>
      <Layout level="2" style={styles.buttonsContainer}>
        <Button onPress={() => navigation.goBack()}>GO BACK</Button>
        <Button
          status="primary"
          onPress={async () => {
            try {
              const {assets} = await requestPhoto();
              if (assets && assets[0]) {
                setImage(assets[0]);
              }
            } catch (error: unknown) {
              if (typeof error === 'string') {
                Alert.alert('Error accessing camera', error);
              } else if (error instanceof Error) {
                Alert.alert('Error accessing camera', error.message);
              }
            }
          }}>
          GET PHOTO
        </Button>
        <Button
          disabled={!(image && expirationDate)}
          onPress={() => handleSubmit()}>
          CONFIRM
        </Button>
      </Layout>
    </Layout>
  );
}

const styles = StyleSheet.create({
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 4,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  expirationWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  photo: {
    height: '100%',
    width: '100%',
    backgroundColor: 'transparent',
  },
  photoWrapper: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1 / 1,
    width: '100%',
    marginBottom: 20,
    padding: 10,
  },
});
