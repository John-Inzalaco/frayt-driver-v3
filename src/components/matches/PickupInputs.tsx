import {useEffect, useState} from 'react';
import {
  BarcodeReading,
  BarcodeState,
  BarcodeType,
  Match,
  MatchState,
} from '@frayt/sdk';
import {StyleSheet, View, Pressable} from 'react-native';
import {
  Layout,
  Spinner,
  Toggle,
  Tooltip,
  useStyleSheet,
} from '@ui-kitten/components';
import {Button} from '../ui-kitten/Button';
import {Text} from '../ui-kitten/Text';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import {MatchesStackProps} from '../../navigation/NavigatorTypes';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {MatchItem} from '@frayt/sdk';
import {updateCurrentMatch} from '../../slices/matches';

interface PickupInputsProps extends MatchesStackProps<'Accepted'> {
  match: Match;
  setMatchStateCallback: (state: MatchState) => void;
}

const PickupStates = [
  MatchState.Accepted,
  MatchState.EnRouteToPickup,
  MatchState.ArrivedAtPickup,
  MatchState.PickedUp,
] as const;

type PickupTypes = typeof PickupStates[number];

export function PickupInputs({
  match,
  setMatchStateCallback,
  navigation,
}: PickupInputsProps) {
  const sliceLoading = useAppSelector(state => state.matches.loading);
  const dispatch = useAppDispatch();
  const temporaryMatch = useAppSelector(state => state.matches.currentMatch);

  useEffect(() => {
    dispatch(updateCurrentMatch(match));
  }, []);

  function shouldEnablePickup(): boolean {
    if (isPickupAt(MatchState.ArrivedAtPickup)) {
      if (
        (match.origin_photo_required &&
          !match.origin_photo &&
          !temporaryMatch.origin_photo) ||
        (match.bill_of_lading_required &&
          !match.bill_of_lading_photo &&
          !temporaryMatch.bill_of_lading_photo) ||
        (doesAnyPickupItemNeedBarcode() && !haveAllPickupBarcodes())
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  function doesAnyPickupItemNeedBarcode() {
    return match.stops.some(stop =>
      stop.items.some(item => item.barcode_pickup_required),
    );
  }

  function pickupItemsThatNeedBarcodes(): MatchItem[] {
    const barcodeItems: MatchItem[] = [];
    match.stops.forEach(stop => {
      stop.items.forEach(stopItem => {
        if (stopItem.barcode_pickup_required) {
          // FIXME: match.stops[n].items[n].stop_id is missing,
          // and so here we have to manually assign it from the stop.
          // needs to be fixed in frayt_SDK or frayt_elixir
          barcodeItems.push({...stopItem, stop_id: stop.id});
        }
      });
    });
    return barcodeItems;
  }

  function haveAllPickupBarcodes(): boolean {
    return pickupItemsThatNeedBarcodes().every(item => {
      return item.barcode_readings.some(
        reading => reading.type === BarcodeType.Pickup,
      );
    });
  }

  function pickupBarcodesNeeded(): Array<BarcodeReading> {
    const neededPickupBarcodes: Array<BarcodeReading> = [];
    pickupItemsThatNeedBarcodes().forEach(item => {
      neededPickupBarcodes.push({
        type: BarcodeType.Pickup,
        state: BarcodeState.Missing,
        barcode: '',
        item: item,
        // photo.data comes from react-native-image-crop-picker
        photo: {data: null},
      });
    });
    return neededPickupBarcodes;
  }

  function getPickupTooltipText() {
    if (match.origin_photo_required && match.bill_of_lading_required) {
      return `Do you have all photos${
        doesAnyPickupItemNeedBarcode() ? ' and barcodes' : ''
      }?`;
    } else if (match.origin_photo_required) {
      return `Do you have the cargo photo${
        doesAnyPickupItemNeedBarcode() ? ' and all barcode photos' : ''
      }?`;
    } else if (match.bill_of_lading_required) {
      return `Do you have the bill of lading photo${
        doesAnyPickupItemNeedBarcode() ? ' and all barcode photos' : ''
      }?`;
    } else if (doesAnyPickupItemNeedBarcode()) {
      return 'Do you have all barcode photos?';
    } else {
      return 'Have you arrived at the pickup?';
    }
  }

  function isPickupAt(checkState: PickupTypes) {
    return (
      PickupStates.indexOf(match.state as PickupTypes) >=
      PickupStates.indexOf(checkState)
    );
  }

  const [tooltipsVisible, setTooltipsVisible] = useState({
    pickupArrive: false,
    pickupCargoPhoto: false,
    pickupBoLPhoto: false,
    pickupBarcode: false,
    pickupDone: false,
  });

  const [toggleChecked, setToggleChecked] = useState(
    isPickupAt(MatchState.EnRouteToPickup),
  );
  const [currentLoading, setCurrentLoading] = useState<
    'toggle' | 'arrive' | 'pickup'
  >('toggle');

  const styles = useStyleSheet(themedStyles);

  const renderEnRouteToggle = () => (
    <Layout level="2" style={styles.toggleLayout}>
      <Toggle
        testID="EnRouteToPickup"
        disabled={isPickupAt(MatchState.ArrivedAtPickup) || sliceLoading}
        checked={toggleChecked}
        onChange={isChecked => {
          setCurrentLoading('toggle');
          if (isChecked) {
            setMatchStateCallback(MatchState.EnRouteToPickup);
            setToggleChecked(true);
          } else {
            setMatchStateCallback(MatchState.Accepted);
            setToggleChecked(false);
          }
        }}>
        <Text>
          En Route to Pickup{'   '}
          {sliceLoading && currentLoading === 'toggle' ? (
            <Spinner status="basic" size="tiny" />
          ) : (
            <></>
          )}
        </Text>
      </Toggle>
    </Layout>
  );

  const renderArriveAtPickupButton = () => (
    <Tooltip
      visible={tooltipsVisible.pickupArrive}
      onBackdropPress={() =>
        setTooltipsVisible({
          ...tooltipsVisible,
          pickupArrive: false,
        })
      }
      backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.25)'}}
      anchor={() => (
        <Pressable
          onPress={() => {
            if (!isPickupAt(MatchState.EnRouteToPickup)) {
              setTooltipsVisible({
                ...tooltipsVisible,
                pickupArrive: true,
              });
            }
          }}
          pointerEvents={
            isPickupAt(MatchState.EnRouteToPickup) ? 'auto' : 'box-none'
          }>
          <View
            pointerEvents={
              isPickupAt(MatchState.ArrivedAtPickup) ? 'none' : 'auto'
            }>
            <Button
              testID="ArriveAtPickup"
              status={
                isPickupAt(MatchState.ArrivedAtPickup) ? 'success' : 'primary'
              }
              disabled={
                !isPickupAt(MatchState.EnRouteToPickup) ||
                (sliceLoading && currentLoading === 'arrive')
              }
              size="small"
              onPress={() => {
                setCurrentLoading('arrive');
                setMatchStateCallback(MatchState.ArrivedAtPickup);
              }}
              accessoryRight={props =>
                sliceLoading && currentLoading === 'arrive' ? (
                  <Text {...props}>
                    <Spinner status="basic" size="small" />
                  </Text>
                ) : (
                  <></>
                )
              }>
              {props => {
                if (isPickupAt(MatchState.ArrivedAtPickup)) {
                  return (
                    <Text {...props}>
                      <Icon name="check" /> ARRIVED AT PICKUP
                    </Text>
                  );
                } else {
                  return <Text {...props}>ARRIVE AT PICKUP</Text>;
                }
              }}
            </Button>
          </View>
        </Pressable>
      )}>
      You must be en route and near the pickup!
    </Tooltip>
  );

  const renderCargoPhotoButton = () => (
    <Tooltip
      visible={tooltipsVisible.pickupCargoPhoto}
      onBackdropPress={() =>
        setTooltipsVisible({
          ...tooltipsVisible,
          pickupCargoPhoto: false,
        })
      }
      backdropStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
      }}
      anchor={() => (
        <Pressable
          onPress={() => {
            if (!isPickupAt(MatchState.ArrivedAtPickup)) {
              setTooltipsVisible({
                ...tooltipsVisible,
                pickupCargoPhoto: true,
              });
            }
          }}
          pointerEvents={
            isPickupAt(MatchState.ArrivedAtPickup) ? 'auto' : 'box-none'
          }>
          <View
            pointerEvents={
              match.origin_photo || temporaryMatch.origin_photo
                ? 'none'
                : 'auto'
            }>
            <Button
              testID="CargoPhoto"
              status={
                match.origin_photo || temporaryMatch.origin_photo
                  ? 'success'
                  : 'primary'
              }
              disabled={!isPickupAt(MatchState.ArrivedAtPickup)}
              size="small"
              style={styles.progressButton}
              onPress={() => {
                navigation.navigate('Photo', {
                  documentType: 'Cargo',
                  matchId: match.id,
                  stopId: match.id,
                });
              }}>
              {props => {
                if (match.origin_photo || temporaryMatch.origin_photo) {
                  return (
                    <Text {...props}>
                      <Icon name="check" /> HAVE CARGO PHOTO
                    </Text>
                  );
                } else {
                  return <Text {...props}>GET CARGO PHOTO</Text>;
                }
              }}
            </Button>
          </View>
        </Pressable>
      )}>
      You must arrive before you can take photos!
    </Tooltip>
  );

  const renderBillOfLadingButton = () => (
    <Tooltip
      visible={tooltipsVisible.pickupBoLPhoto}
      onBackdropPress={() =>
        setTooltipsVisible({
          ...tooltipsVisible,
          pickupBoLPhoto: false,
        })
      }
      backdropStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
      }}
      anchor={() => (
        <Pressable
          onPress={() => {
            if (!isPickupAt(MatchState.ArrivedAtPickup)) {
              setTooltipsVisible({
                ...tooltipsVisible,
                pickupBoLPhoto: true,
              });
            }
          }}
          pointerEvents={
            isPickupAt(MatchState.ArrivedAtPickup) ? 'auto' : 'box-none'
          }>
          <View
            pointerEvents={
              match.bill_of_lading_photo || temporaryMatch.bill_of_lading_photo
                ? 'none'
                : 'auto'
            }>
            <Button
              testID="BillOfLadingPhoto"
              status={
                match.bill_of_lading_photo ||
                temporaryMatch.bill_of_lading_photo
                  ? 'success'
                  : 'primary'
              }
              disabled={!isPickupAt(MatchState.ArrivedAtPickup)}
              size="small"
              style={styles.progressButton}
              onPress={() => {
                navigation.navigate('Photo', {
                  documentType: 'BoL',
                  matchId: match.id,
                  stopId: match.id,
                });
              }}>
              {props => {
                if (
                  match.bill_of_lading_photo ||
                  temporaryMatch.bill_of_lading_photo
                ) {
                  return (
                    <Text {...props}>
                      <Icon name="check" /> HAVE BILL OF LADING PHOTO
                    </Text>
                  );
                } else {
                  return <Text {...props}>GET BILL OF LADING PHOTO</Text>;
                }
              }}
            </Button>
          </View>
        </Pressable>
      )}>
      You must arrive before you can take photos!
    </Tooltip>
  );

  const renderScanBarcodesButton = () => (
    <Tooltip
      visible={tooltipsVisible.pickupBarcode}
      onBackdropPress={() =>
        setTooltipsVisible({
          ...tooltipsVisible,
          pickupBarcode: false,
        })
      }
      backdropStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
      }}
      anchor={() => (
        <Pressable
          onPress={() => {
            if (!isPickupAt(MatchState.ArrivedAtPickup)) {
              setTooltipsVisible({
                ...tooltipsVisible,
                pickupBarcode: true,
              });
            }
          }}
          pointerEvents={
            isPickupAt(MatchState.ArrivedAtPickup) ? 'auto' : 'box-none'
          }>
          <View pointerEvents={haveAllPickupBarcodes() ? 'none' : 'auto'}>
            <Button
              testID="ScanBarcode"
              status={haveAllPickupBarcodes() ? 'success' : 'primary'}
              disabled={!isPickupAt(MatchState.ArrivedAtPickup)}
              size="small"
              style={styles.progressButton}
              onPress={() => {
                navigation.navigate('Barcode', {
                  matchId: match.id,
                  neededBarcodes: pickupBarcodesNeeded(),
                });
              }}>
              {props => {
                if (haveAllPickupBarcodes()) {
                  return (
                    <Text {...props}>
                      <Icon name="check" /> HAVE ALL BARCODES
                    </Text>
                  );
                } else {
                  return (
                    <Text {...props}>
                      {`SCAN ${pickupBarcodesNeeded().length} BARCODE${
                        pickupBarcodesNeeded().length > 1 ? 'S' : ''
                      }`}
                    </Text>
                  );
                }
              }}
            </Button>
          </View>
        </Pressable>
      )}>
      You must arrive before you can scan barcodes!
    </Tooltip>
  );

  const renderPickupCargoButton = () => (
    <Tooltip
      visible={tooltipsVisible.pickupDone}
      onBackdropPress={() =>
        setTooltipsVisible({
          ...tooltipsVisible,
          pickupDone: false,
        })
      }
      backdropStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
      }}
      anchor={() => (
        <Pressable
          onPress={() => {
            if (!shouldEnablePickup()) {
              setTooltipsVisible({
                ...tooltipsVisible,
                pickupDone: true,
              });
            }
          }}
          pointerEvents={!shouldEnablePickup() ? 'auto' : 'box-none'}>
          <View
            pointerEvents={isPickupAt(MatchState.PickedUp) ? 'none' : 'auto'}>
            <Button
              testID="PickUpCargo"
              status={isPickupAt(MatchState.PickedUp) ? 'success' : 'primary'}
              disabled={
                !shouldEnablePickup() ||
                (sliceLoading && currentLoading === 'pickup')
              }
              size="small"
              style={styles.progressButton}
              onPress={() => {
                setCurrentLoading('pickup');
                setMatchStateCallback(MatchState.PickedUp);
              }}
              accessoryRight={props =>
                sliceLoading && currentLoading === 'pickup' ? (
                  <Text {...props}>
                    <Spinner status="basic" size="small" />
                  </Text>
                ) : (
                  <></>
                )
              }>
              {props => {
                if (match.state === MatchState.PickedUp) {
                  return (
                    <Text {...props}>
                      <Icon name="check" /> CARGO PICKED UP
                    </Text>
                  );
                } else {
                  return <Text {...props}>PICK UP CARGO</Text>;
                }
              }}
            </Button>
          </View>
        </Pressable>
      )}>
      {getPickupTooltipText()}
    </Tooltip>
  );

  // TODO: currently match structure only allows for one pickup
  // eventually we want to allow for multiple pickups
  // all pickup states are handled in the match state, will eventually
  // be moved to stop state
  return (
    <View>
      {!match.isCanceled() &&
        !match.isComplete() &&
        match.state !== MatchState.UnableToPickup &&
        match.state !== MatchState.EnRouteToReturn &&
        match.state !== MatchState.ArrivedAtReturn && (
          <View>
            {renderEnRouteToggle()}
            <Layout
              level="2"
              style={[
                styles.stopButtonsLayout,
                {
                  marginBottom: isPickupAt(MatchState.PickedUp) ? 0 : 10,
                },
              ]}>
              {renderArriveAtPickupButton()}
              {match.origin_photo_required && renderCargoPhotoButton()}
              {match.bill_of_lading_required && renderBillOfLadingButton()}
              {doesAnyPickupItemNeedBarcode() && renderScanBarcodesButton()}
              {renderPickupCargoButton()}
            </Layout>
          </View>
        )}
    </View>
  );
}

const themedStyles = StyleSheet.create({
  toggleLayout: {
    alignItems: 'flex-start',
    borderRadius: 4,
    padding: 8,
    marginBottom: 10,
  },
  stopButtonsLayout: {
    borderRadius: 4,
    padding: 8,
  },
  progressButton: {
    marginTop: 10,
  },
});
