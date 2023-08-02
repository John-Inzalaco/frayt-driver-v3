import {
  IndexPath,
  Layout,
  Modal,
  ModalPanel,
  Select,
  SelectItem,
  Spinner,
  useStyleSheet,
} from '@ui-kitten/components';
import {MatchesStackProps} from '../../navigation/NavigatorTypes';
import {Alert, StyleSheet, View} from 'react-native';
import {sendBarcodesAction} from '../../slices/matches';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {Button} from '../../components/ui-kitten/Button';
import {useState} from 'react';
import {Text} from '../../components/ui-kitten/Text';
import {Camera, CameraType} from 'react-native-camera-kit';
import {BarcodeReading, BarcodeState} from '@frayt/sdk';
import {useToken} from '../../lib/TokenHelper';
import {handleError} from '../../lib/ErrorHelper';

const SCAN_INTERVAL = 5000;

type NextPage = 'goBack' | 'getPhotos';

export function BarcodeModal({
  route,
  navigation,
}: MatchesStackProps<'Barcode'>) {
  const styles = useStyleSheet(themedStyles);
  const dispatch = useAppDispatch();
  const {matchId, neededBarcodes} = route.params;
  const {token} = useToken();

  const [selectedIndex, setSelectedIndex] = useState<IndexPath | IndexPath[]>(
    new IndexPath(0),
  );
  const [scanEnabled, setScanEnabled] = useState(true);
  const [neededBarcodeReadings, setNeededBarcodeReadings] = useState<
    BarcodeReading[]
  >([...neededBarcodes]);
  const [modalVisible, setModalVisible] = useState(false);

  const SELECT_OPTIONS = [
    'Quick Scan',
    neededBarcodeReadings.map(barcode => barcode.item.description),
  ].flat();

  const sliceLoading = useAppSelector(state => state.matches.loading);

  // copying this from the react-native-camera-kit repo
  // because they didn't export this type for <some reason>
  type OnReadCodeData = {
    nativeEvent: {
      codeStringValue: string;
    };
  };

  /**
   * Searches for a matching needed barcode to assign the reading to, then assigns it
   * @param reading data read from the barcode scanner
   */
  function assignFindReading(reading: string) {
    if (
      // loop over every element until we find a match, returns false if match
      // found in order to break out of loop (basically a foreach with a break command)
      neededBarcodeReadings.every((readingNeeded, index) => {
        // if the barcode reading matches and we don't have one yet
        if (readingNeeded.item.barcode === reading && !readingNeeded.barcode) {
          neededBarcodeReadings[index].barcode = reading;
          neededBarcodeReadings[index].state = BarcodeState.Captured;
          setNeededBarcodeReadings([...neededBarcodeReadings]);
          return false;
        }
        return true;
      })
    ) {
      // if every returned true (meaning we didn't find a match), show an alert
      Alert.alert(
        'Invalid barcode',
        'Could not find an item for the barcode you scanned. Try scanning another item, or you can take a picture of the item later.',
      );
    }
  }

  function assignSpecificReading(reading: string) {
    const chosenIndex = (selectedIndex as IndexPath).row - 1;
    if (
      neededBarcodeReadings[chosenIndex].item.barcode === reading ||
      !neededBarcodeReadings[chosenIndex].item.barcode
    ) {
      neededBarcodeReadings[chosenIndex].barcode = reading;
      neededBarcodeReadings[chosenIndex].state = BarcodeState.Captured;
      setNeededBarcodeReadings([...neededBarcodeReadings]);
    } else {
      Alert.alert(
        'Invalid barcode',
        'Could not match the scanned barcode to the chosen item. Try scanning another item, or you can take a picture of the item later.',
      );
    }
  }

  /**
   *
   * @returns total number of barcodes read, both assigned and unassigned
   */
  function getReadingsCount() {
    return neededBarcodeReadings.filter(
      reading => reading.barcode && reading.state === BarcodeState.Captured,
    ).length;
  }

  function clearReadings() {
    setNeededBarcodeReadings(
      neededBarcodeReadings.map(reading => {
        reading.barcode = '';
        reading.state = BarcodeState.Missing;
        reading.item.barcode_readings = [];
        return reading;
      }),
    );
  }

  function handleReading(reading: string) {
    const chosenIndex = (selectedIndex as IndexPath).row;
    const chosenScan = SELECT_OPTIONS[chosenIndex];
    if (getReadingsCount() < neededBarcodeReadings.length && scanEnabled) {
      setScanEnabled(false);
      if (chosenScan === 'Quick Scan') {
        assignFindReading(reading);
      } else {
        assignSpecificReading(reading);
      }
      setTimeout(() => {
        setScanEnabled(true);
      }, SCAN_INTERVAL);
    }
  }

  async function handleSubmit(): Promise<NextPage> {
    // check if we have all the readings
    if (getReadingsCount() === neededBarcodeReadings.length) {
      // send codes to server
      await dispatch(
        sendBarcodesAction({
          token: token ?? '',
          matchId: matchId,
          barcodeReadings: neededBarcodeReadings,
        }),
      );
      return 'goBack';
    } else {
      return 'getPhotos';
    }
  }

  function renderNavModal() {
    return (
      <Modal visible={modalVisible} style={styles.navModalContainer}>
        <View style={styles.navModalView}>
          <View style={styles.navModalInnerView}>
            <Text category="h5" style={styles.navModalHeader}>
              Missing Barcodes
            </Text>
            <Text
              style={{
                alignSelf: 'center',
                textAlign: 'center',
                marginBottom: 10,
              }}>
              Not all barcodes are scanned. Please take a photo of each item
              that could not be scanned, or continue scanning.
            </Text>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Button status="basic" onPress={() => setModalVisible(false)}>
                CONTINUE SCANNING
              </Button>
              <Button
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('BarcodePhotos', {
                    matchId: matchId,
                    neededBarcodes: neededBarcodeReadings,
                  });
                }}>
                TAKE PHOTOS
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <ModalPanel>
      <Layout level="1" style={styles.container}>
        <View
          style={{
            width: '100%',
            flexDirection: 'row',
            marginBottom: 10,
          }}>
          <Button style={styles.button} onPress={() => navigation.goBack()}>
            GO BACK
          </Button>
          <Select
            style={{
              flex: 1,
            }}
            label={'SCAN MODE'}
            selectedIndex={selectedIndex}
            value={SELECT_OPTIONS[(selectedIndex as IndexPath).row] ?? ''}
            onSelect={index => setSelectedIndex(index)}>
            {SELECT_OPTIONS.map(option => (
              <SelectItem
                title={evaProps => <Text {...evaProps}>{option ?? ''}</Text>}
              />
            ))}
          </Select>
        </View>
        <View
          style={{
            flex: 0.8,
            width: '100%',
          }}>
          <Camera
            cameraType={CameraType.Back}
            scanBarcode={true}
            style={{flex: 1}}
            showFrame={true}
            flashMode={'off'}
            zoomMode={'off'}
            onReadCode={async (event: OnReadCodeData) => {
              handleReading(event.nativeEvent.codeStringValue);
            }}
          />
        </View>
        <View>
          <Text>{`Scanned ${getReadingsCount()} of ${
            neededBarcodeReadings.length
          } barcode${neededBarcodeReadings.length > 1 ? 's' : ''}`}</Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'space-between',
            marginTop: 10,
          }}>
          <Button status="danger" onPress={() => clearReadings()}>
            CLEAR READINGS
          </Button>
          <Button
            disabled={sliceLoading}
            onPress={async () => {
              try {
                const navPage = await handleSubmit();
                if (navPage === 'goBack') {
                  navigation.goBack();
                } else {
                  setModalVisible(true);
                }
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
            SUBMIT READINGS
          </Button>
        </View>
      </Layout>
      {renderNavModal()}
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
  button: {
    marginRight: 10,
    alignSelf: 'flex-end',
  },
  dropDownContainer: {
    marginBottom: 10,
  },
  navModalContainer: {
    width: '100%',
    height: '100%',
  },
  navModalView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  navModalInnerView: {
    backgroundColor: 'color-basic-800',
    borderRadius: 4,
    padding: 10,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    marginHorizontal: 20,
  },
  navModalHeader: {
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
});
