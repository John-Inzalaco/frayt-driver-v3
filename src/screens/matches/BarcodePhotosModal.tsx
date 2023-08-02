import {
  IndexPath,
  Layout,
  ModalPanel,
  Select,
  SelectItem,
  Spinner,
  useStyleSheet,
  useTheme,
} from '@ui-kitten/components';
import {StyleSheet, View} from 'react-native';
import {Text} from '../../components/ui-kitten/Text';
import {useState} from 'react';
import {MatchesStackProps} from '../../navigation/NavigatorTypes';
import {BarcodeReading, BarcodeState} from '@frayt/sdk';
import FastImage, {ImageStyle} from 'react-native-fast-image';
import {Button} from '../../components/ui-kitten/Button';
import {useRequestPhoto} from '../../components/PhotoHelper';
import {
  selectAcceptedMatchById,
  sendBarcodesAction,
} from '../../slices/matches';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {handleError} from '../../lib/ErrorHelper';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import {useToken} from '../../lib/TokenHelper';

export function BarcodePhotosModal({
  route,
  navigation,
}: MatchesStackProps<'BarcodePhotos'>) {
  const styles = useStyleSheet(themedStyles);
  const {requestPhoto} = useRequestPhoto();
  const {matchId, neededBarcodes} = route.params;
  const match = useAppSelector(state =>
    selectAcceptedMatchById(state, matchId),
  );
  const sliceLoading = useAppSelector(state => state.matches.loading);
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const {token} = useToken();

  const [selectedIndex, setSelectedIndex] = useState<IndexPath | IndexPath[]>(
    new IndexPath(0),
  );
  const [neededBarcodeReadings, setNeededBarcodeReadings] = useState<
    BarcodeReading[]
  >([...neededBarcodes]);

  const SELECT_OPTIONS = neededBarcodeReadings.filter(
    reading => reading.state === BarcodeState.Missing,
  );

  const handleGetPhoto = async () => {
    try {
      if (!match) throw new Error('You are no longer assigned to this match');
      const {assets} = await requestPhoto();
      if (assets && assets[0] && assets[0].base64) {
        assignSpecificPhoto(assets[0].base64);
      } else {
        throw new Error('Did not receive photo from camera');
      }
    } catch (error: unknown) {
      handleError(error);
    }
  };

  function assignSpecificPhoto(photo: string) {
    const chosenIndex = neededBarcodeReadings.findIndex(
      reading =>
        reading.item.id ===
        SELECT_OPTIONS[(selectedIndex as IndexPath).row].item.id,
    );
    neededBarcodeReadings[chosenIndex].photo.data = photo;
    setNeededBarcodeReadings([...neededBarcodeReadings]);
  }

  function haveAllPhotos(): boolean {
    return neededBarcodeReadings.every(
      reading => reading.photo.data || reading.barcode,
    );
  }

  function getChosenPhoto(): string {
    return neededBarcodeReadings.find(reading => {
      return (
        reading.item.id ===
        SELECT_OPTIONS[(selectedIndex as IndexPath).row].item.id
      );
    })?.photo.data;
  }

  return (
    <ModalPanel>
      <Layout style={styles.container}>
        <View
          style={{
            alignItems: 'center',
            flex: 0.8,
          }}>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Text>Currently Scanning:</Text>
            <Select
              style={{flex: 1, marginLeft: 10}}
              selectedIndex={selectedIndex}
              value={
                SELECT_OPTIONS[(selectedIndex as IndexPath).row].item
                  .description ?? ''
              }
              onSelect={index => setSelectedIndex(index)}>
              {SELECT_OPTIONS.map(option => (
                <SelectItem
                  title={evaProps => (
                    <Text {...evaProps}>{option.item.description ?? ''}</Text>
                  )}
                />
              ))}
            </Select>
          </View>
          <Layout level="2" style={styles.photoWrapper}>
            {getChosenPhoto() ? (
              <FastImage
                resizeMode="contain"
                style={styles.photo as ImageStyle}
                source={{
                  uri: `data:image/png;base64,${getChosenPhoto()}`,
                }}
              />
            ) : (
              <Text>
                <Icon
                  name="box-open"
                  size={250}
                  color={theme['color-basic-500']}></Icon>
              </Text>
            )}
          </Layout>
          <Button
            onPress={async () => {
              await handleGetPhoto();
            }}>
            Get Photo
          </Button>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
          }}>
          <Button status="basic" onPress={() => navigation.goBack()}>
            GO BACK
          </Button>
          <Button
            disabled={!haveAllPhotos() || sliceLoading}
            onPress={async () => {
              try {
                await dispatch(
                  sendBarcodesAction({
                    token: token ?? '',
                    matchId: matchId,
                    barcodeReadings: neededBarcodeReadings,
                  }),
                ).unwrap();
                navigation.navigate('Accepted', {matchId: matchId});
              } catch (error) {
                handleError(error);
              }
            }}
            accessoryRight={props =>
              sliceLoading ? (
                <Text {...props}>
                  <Spinner status="basic" size="small" />
                </Text>
              ) : (
                <></>
              )
            }>
            Submit All Photos
          </Button>
        </View>
      </Layout>
    </ModalPanel>
  );
}

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    height: '100%',
    width: '100%',
    backgroundColor: 'transparent',
  },
  photoWrapper: {
    marginVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1 / 1,
    width: '100%',
    marginBottom: 10,
    padding: 10,
  },
});
