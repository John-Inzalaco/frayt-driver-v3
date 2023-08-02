import {useEffect, useState} from 'react';
import {StyleSheet, View, Pressable} from 'react-native';
import {
  Layout,
  Toggle,
  useStyleSheet,
  Tooltip,
  Spinner,
} from '@ui-kitten/components';
import {MatchesStackProps} from '../../navigation/NavigatorTypes';
import {
  BarcodeReading,
  BarcodeState,
  BarcodeType,
  Match,
  MatchItem,
  MatchState,
  MatchStop,
  StopState,
} from '@frayt/sdk';
import {Button} from '../ui-kitten/Button';
import {Text} from '../ui-kitten/Text';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import {ConfirmCancelModal} from '../ConfirmCancelModal';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {updateCurrentMatch} from '../../slices/matches';

interface DropoffInputProps extends MatchesStackProps<'Accepted'> {
  match: Match;
  stop: MatchStop;
  setMatchStateCallback: (state: MatchState, reason: string) => void;
  setStopStateCallback: (state: StopState, reason?: string) => void;
}

const CanceledStates = [
  MatchState.Canceled,
  MatchState.AdminCanceled,
  MatchState.DriverCanceled,
] as const;

const PickupStates = [
  MatchState.Accepted,
  MatchState.EnRouteToPickup,
  MatchState.ArrivedAtPickup,
  MatchState.PickedUp,
] as const;

const DropoffStates = [
  StopState.Pending,
  StopState.EnRoute,
  StopState.Arrived,
  StopState.Signed,
  StopState.Delivered,
] as const;

const ReturnStates = [
  StopState.Undeliverable,
  MatchState.EnRouteToReturn,
  MatchState.ArrivedAtReturn,
  StopState.Returned,
] as const;

type CanceledTypes = typeof CanceledStates[number];
type PickupTypes = typeof PickupStates[number];
type DropoffTypes = typeof DropoffStates[number];
type ReturnTypes = typeof ReturnStates[number];

export function DropoffInputs({
  match,
  stop,
  setMatchStateCallback,
  setStopStateCallback,
  navigation,
}: DropoffInputProps) {
  const styles = useStyleSheet(themedStyles);
  const sliceLoading = useAppSelector(state => state.matches.loading);
  const dispatch = useAppDispatch();

  const temporaryStop = useAppSelector(state =>
    state.matches.currentMatch.stops?.find(
      otherStop => otherStop.id === stop.id,
    ),
  );

  useEffect(() => {
    dispatch(updateCurrentMatch(match));
  }, []);

  function isPickupAt(checkState: PickupTypes) {
    return (
      PickupStates.indexOf(match.state as PickupTypes) >=
      PickupStates.indexOf(checkState)
    );
  }

  function isDropoffAt(checkState: DropoffTypes) {
    return (
      DropoffStates.indexOf(stop.state as DropoffTypes) >=
      DropoffStates.indexOf(checkState)
    );
  }

  function isReturnAt(checkState: ReturnTypes) {
    if (
      checkState === StopState.Undeliverable ||
      checkState === StopState.Returned
    ) {
      return (
        ReturnStates.indexOf(stop.state as ReturnTypes) >=
        ReturnStates.indexOf(checkState)
      );
    } else {
      return (
        ReturnStates.indexOf(match.state as ReturnTypes) >=
        ReturnStates.indexOf(checkState)
      );
    }
  }

  function shouldEnableDropoff() {
    if (isDropoffAt(StopState.Signed)) {
      if (
        (stop.destination_photo_required &&
          (!stop.destination_photo || !temporaryStop?.destination_photo)) ||
        (doesAnyDropoffItemNeedBarcode() && !haveAllDropoffBarcodes())
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  function doesAnyDropoffItemNeedBarcode() {
    return match.stops.some(stop =>
      stop.items.some(item => item.barcode_delivery_required),
    );
  }

  // first scan for dropoff items that need barcodes, then
  // check if a dropoff scan exists
  // an item can have 0-2 readings
  function haveAllDropoffBarcodes(): boolean {
    return dropoffItemsThatNeedBarcodes().every(item => {
      return item.barcode_readings.some(
        reading => reading.type === BarcodeType.Delivery,
      );
    });
  }

  function dropoffItemsThatNeedBarcodes(): MatchItem[] {
    const barcodeItems: MatchItem[] = [];
    match.stops.forEach(stop => {
      stop.items.forEach(stopItem => {
        if (stopItem.barcode_delivery_required) {
          // FIXME: match.stops[n].items[n].stop_id is missing,
          // and so here we have to manually assign it from the stop.
          // needs to be fixed in frayt_SDK or frayt_elixir
          barcodeItems.push({...stopItem, stop_id: stop.id});
        }
      });
    });
    return barcodeItems;
  }

  function dropoffBarcodesNeeded(): Array<BarcodeReading> {
    const neededDropoffBarcodes: Array<BarcodeReading> = [];
    dropoffItemsThatNeedBarcodes().forEach(item => {
      neededDropoffBarcodes.push({
        type: BarcodeType.Delivery,
        state: BarcodeState.Missing,
        barcode: '',
        item: item,
        // photo.data comes from react-native-image-crop-picker
        photo: {data: null},
      });
    });
    return neededDropoffBarcodes;
  }

  function getDeliverTooltipText() {
    if (stop.destination_photo_required) {
      return 'Do you have all photos?';
    } else {
      return 'Have you arrived at the dropoff?';
    }
  }

  const [tooltipsVisible, setTooltipsVisible] = useState({
    dropoffEnRoute: false,
    dropoffArrive: false,
    dropoffSignature: false,
    dropoffCargoPhoto: false,
    dropoffBarcode: false,
    dropoffDone: false,
    returnEnRoute: false,
    returnArrive: false,
    returnDone: false,
  });

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [toggleChecked, setToggleChecked] = useState<Array<boolean>>(
    match.stops.map(
      thisStop =>
        DropoffStates.indexOf(thisStop.state as DropoffTypes) >=
        DropoffStates.indexOf(StopState.EnRoute),
    ),
  );
  const [currentLoading, setCurrentLoading] = useState<
    'toggle' | 'arrive_at_dropoff' | 'deliver' | 'arrive_at_return' | 'return'
  >('toggle');

  const renderReturnWarning = () => (
    <Layout level="2" style={styles.stopButtonsLayout}>
      <Text category="c1">
        Please continue the route before returning the undeliverable items.
      </Text>
    </Layout>
  );

  const shouldRenderReturnButtons = () =>
    match.stops.every(
      otherStop =>
        otherStop.state === StopState.Undeliverable ||
        otherStop.state === StopState.Delivered,
    );

  const renderReturnButtons = () => {
    if (
      ReturnStates.includes(stop.state as ReturnTypes) ||
      ReturnStates.includes(match.state as ReturnTypes)
    ) {
      if (!shouldRenderReturnButtons()) {
        return renderReturnWarning();
      } else {
        return (
          <Layout level="2" style={styles.stopButtonsLayout}>
            {!match.isComplete() && (
              <View
                pointerEvents={
                  isReturnAt(MatchState.ArrivedAtReturn) ? 'none' : 'auto'
                }>
                <Button
                  size="small"
                  status={
                    isReturnAt(MatchState.ArrivedAtReturn)
                      ? 'success'
                      : 'primary'
                  }
                  onPress={() => {
                    setMatchStateCallback(MatchState.ArrivedAtReturn, '');
                  }}>
                  {props => {
                    if (
                      isReturnAt(MatchState.ArrivedAtReturn) ||
                      match.isComplete()
                    ) {
                      return (
                        <Text {...props}>
                          <Icon name="check" />
                          ARRIVED AT RETURN
                        </Text>
                      );
                    } else {
                      return <Text {...props}>ARRIVE AT RETURN</Text>;
                    }
                  }}
                </Button>
              </View>
            )}
            {
              // return cargo button
            }
            <Tooltip
              visible={tooltipsVisible.returnDone}
              onBackdropPress={() =>
                setTooltipsVisible({
                  ...tooltipsVisible,
                  returnDone: false,
                })
              }
              backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.25)'}}
              anchor={() => (
                <Pressable
                  onPress={() => {
                    if (!isReturnAt(MatchState.ArrivedAtReturn)) {
                      setTooltipsVisible({
                        ...tooltipsVisible,
                        returnDone: true,
                      });
                    }
                  }}
                  pointerEvents={
                    isReturnAt(StopState.Returned) ? 'auto' : 'box-none'
                  }>
                  <View
                    pointerEvents={
                      isReturnAt(StopState.Returned) ? 'none' : 'auto'
                    }>
                    <Button
                      size="small"
                      status={
                        isReturnAt(StopState.Returned) ? 'success' : 'primary'
                      }
                      appearance={
                        match.isComplete() || isReturnAt(StopState.Returned)
                          ? 'outline'
                          : 'filled'
                      }
                      style={styles.progressButton}
                      disabled={!isReturnAt(MatchState.ArrivedAtReturn)}
                      onPress={() => {
                        setStopStateCallback(StopState.Returned);
                      }}>
                      {props => {
                        if (isReturnAt(StopState.Returned)) {
                          return (
                            <Text {...props}>
                              <Icon name="check" />
                              CARGO RETURNED
                            </Text>
                          );
                        } else {
                          return <Text {...props}>RETURN CARGO</Text>;
                        }
                      }}
                    </Button>
                  </View>
                </Pressable>
              )}>
              You need to arrive at the return first!
            </Tooltip>
          </Layout>
        );
      }
    }
  };

  const renderEnRouteToDropoffToggle = () => (
    <Layout level="2" style={styles.toggleLayout}>
      <Tooltip
        visible={tooltipsVisible.dropoffEnRoute}
        onBackdropPress={() =>
          setTooltipsVisible({
            ...tooltipsVisible,
            dropoffEnRoute: false,
          })
        }
        backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.25)'}}
        anchor={() => (
          <Pressable
            onPressIn={() => {
              if (!isPickupAt(MatchState.PickedUp)) {
                setTooltipsVisible({
                  ...tooltipsVisible,
                  dropoffEnRoute: true,
                });
              }
            }}>
            <View
              pointerEvents={isPickupAt(MatchState.PickedUp) ? 'auto' : 'none'}>
              <Toggle
                disabled={
                  isDropoffAt(StopState.Arrived) ||
                  !isPickupAt(MatchState.PickedUp) ||
                  sliceLoading
                }
                checked={toggleChecked[stop.index]}
                onChange={isChecked => {
                  setCurrentLoading('toggle');
                  if (isChecked) {
                    setStopStateCallback(StopState.EnRoute);
                    toggleChecked[stop.index] = true;
                    setToggleChecked([...toggleChecked]);
                  } else {
                    setStopStateCallback(StopState.Pending);
                    toggleChecked[stop.index] = false;
                    setToggleChecked([...toggleChecked]);
                  }
                }}>
                <Text>
                  En Route to Dropoff{'   '}
                  {sliceLoading && currentLoading === 'toggle' ? (
                    <Spinner status="basic" size="tiny" />
                  ) : (
                    <></>
                  )}
                </Text>
              </Toggle>
            </View>
          </Pressable>
        )}>
        You must complete the pickup first!
      </Tooltip>
    </Layout>
  );

  const renderArrivedAtDropoffButton = () => (
    <Tooltip
      visible={tooltipsVisible.dropoffArrive}
      onBackdropPress={() =>
        setTooltipsVisible({
          ...tooltipsVisible,
          dropoffArrive: false,
        })
      }
      backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.25)'}}
      anchor={() => (
        <Pressable
          onPress={() => {
            if (!isDropoffAt(StopState.EnRoute)) {
              setTooltipsVisible({
                ...tooltipsVisible,
                dropoffArrive: true,
              });
            }
          }}
          pointerEvents={isDropoffAt(StopState.EnRoute) ? 'auto' : 'box-none'}>
          <View
            pointerEvents={isDropoffAt(StopState.Arrived) ? 'none' : 'auto'}>
            <Button
              status={isDropoffAt(StopState.Arrived) ? 'success' : 'primary'}
              disabled={
                !isDropoffAt(StopState.EnRoute) ||
                (sliceLoading && currentLoading === 'arrive_at_dropoff')
              }
              size="small"
              onPress={() => {
                setCurrentLoading('arrive_at_dropoff');
                setStopStateCallback(StopState.Arrived);
              }}
              accessoryRight={props =>
                sliceLoading && currentLoading === 'arrive_at_dropoff' ? (
                  <Text {...props}>
                    <Spinner status="basic" size="small" />
                  </Text>
                ) : (
                  <></>
                )
              }>
              {props => {
                if (isDropoffAt(StopState.Arrived)) {
                  return (
                    <Text {...props}>
                      <Icon name="check" /> ARRIVED AT DROPOFF
                    </Text>
                  );
                } else {
                  return <Text {...props}>ARRIVE AT DROPOFF</Text>;
                }
              }}
            </Button>
          </View>
        </Pressable>
      )}>
      You must be en route and near the dropoff!
    </Tooltip>
  );

  const renderScanBarcodesButton = () => (
    <Tooltip
      visible={tooltipsVisible.dropoffBarcode}
      onBackdropPress={() =>
        setTooltipsVisible({
          ...tooltipsVisible,
          dropoffBarcode: false,
        })
      }
      backdropStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
      }}
      anchor={() => (
        <Pressable
          onPress={() => {
            if (!isDropoffAt(StopState.Arrived)) {
              setTooltipsVisible({
                ...tooltipsVisible,
                dropoffBarcode: true,
              });
            }
          }}
          pointerEvents={isDropoffAt(StopState.Arrived) ? 'auto' : 'box-none'}>
          <View pointerEvents={haveAllDropoffBarcodes() ? 'none' : 'auto'}>
            <Button
              testID="ScanBarcode"
              status={haveAllDropoffBarcodes() ? 'success' : 'primary'}
              disabled={!isDropoffAt(StopState.Arrived)}
              size="small"
              style={styles.progressButton}
              onPress={() => {
                navigation.navigate('Barcode', {
                  matchId: match.id,
                  neededBarcodes: dropoffBarcodesNeeded(),
                });
              }}>
              {props => {
                if (haveAllDropoffBarcodes()) {
                  return (
                    <Text {...props}>
                      <Icon name="check" /> HAVE ALL BARCODES
                    </Text>
                  );
                } else {
                  return (
                    <Text {...props}>
                      {`SCAN ${dropoffBarcodesNeeded().length} BARCODE${
                        dropoffBarcodesNeeded().length > 1 ? 'S' : ''
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

  const renderGetSignatureButton = () => (
    <Tooltip
      visible={tooltipsVisible.dropoffSignature}
      onBackdropPress={() =>
        setTooltipsVisible({
          ...tooltipsVisible,
          dropoffSignature: false,
        })
      }
      backdropStyle={{backgroundColor: 'rgba(0, 0, 0, 0.25)'}}
      anchor={() => (
        <Pressable
          onPress={() => {
            if (!isDropoffAt(StopState.Arrived)) {
              setTooltipsVisible({
                ...tooltipsVisible,
                dropoffSignature: true,
              });
            }
          }}
          pointerEvents={isDropoffAt(StopState.Arrived) ? 'auto' : 'box-none'}>
          <View pointerEvents={isDropoffAt(StopState.Signed) ? 'none' : 'auto'}>
            <Button
              status={isDropoffAt(StopState.Signed) ? 'success' : 'primary'}
              disabled={
                !isDropoffAt(StopState.Arrived) || !haveAllDropoffBarcodes()
              }
              size="small"
              style={styles.progressButton}
              onPress={() => {
                navigation.navigate('Signature', {
                  matchId: match.id,
                  stopId: stop.id,
                });
              }}>
              {props => {
                if (stop.signature_photo) {
                  return (
                    <Text {...props}>
                      <Icon name="check" /> HAVE SIGNATURE
                    </Text>
                  );
                } else {
                  return <Text {...props}>GET SIGNATURE</Text>;
                }
              }}
            </Button>
          </View>
        </Pressable>
      )}>
      You must be at the dropoff to get a signature!
    </Tooltip>
  );

  const renderCargoPhotoButton = () => (
    <Tooltip
      visible={tooltipsVisible.dropoffCargoPhoto}
      onBackdropPress={() =>
        setTooltipsVisible({
          ...tooltipsVisible,
          dropoffCargoPhoto: false,
        })
      }
      backdropStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
      }}
      anchor={() => (
        <Pressable
          onPress={() => {
            if (!isDropoffAt(StopState.Signed)) {
              setTooltipsVisible({
                ...tooltipsVisible,
                dropoffCargoPhoto: true,
              });
            }
          }}
          pointerEvents={isDropoffAt(StopState.Signed) ? 'auto' : 'box-none'}>
          <View
            pointerEvents={
              stop.destination_photo || temporaryStop?.destination_photo
                ? 'none'
                : 'auto'
            }>
            <Button
              status={
                stop.destination_photo || temporaryStop?.destination_photo
                  ? 'success'
                  : 'primary'
              }
              disabled={!isDropoffAt(StopState.Signed)}
              size="small"
              style={styles.progressButton}
              onPress={() => {
                navigation.navigate('Photo', {
                  documentType: 'Cargo',
                  matchId: match.id,
                  stopId: stop.id,
                });
              }}>
              {props => {
                if (
                  stop.destination_photo ||
                  temporaryStop?.destination_photo
                ) {
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
      You must get a signature first!
    </Tooltip>
  );

  const renderDeliverCargoButton = () => (
    <Tooltip
      visible={tooltipsVisible.dropoffDone}
      onBackdropPress={() =>
        setTooltipsVisible({
          ...tooltipsVisible,
          dropoffDone: false,
        })
      }
      backdropStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
      }}
      anchor={() => (
        <Pressable
          onPress={() => {
            if (!shouldEnableDropoff()) {
              setTooltipsVisible({
                ...tooltipsVisible,
                dropoffDone: true,
              });
            }
          }}
          pointerEvents={!shouldEnableDropoff() ? 'auto' : 'box-none'}>
          <View
            pointerEvents={isDropoffAt(StopState.Delivered) ? 'none' : 'auto'}>
            <Button
              status={isDropoffAt(StopState.Delivered) ? 'success' : 'primary'}
              appearance={match.isComplete() ? 'outline' : 'filled'}
              disabled={
                !shouldEnableDropoff() ||
                (sliceLoading && currentLoading === 'deliver')
              }
              size="small"
              style={styles.progressButton}
              onPress={() => {
                setCurrentLoading('deliver');
                setStopStateCallback(StopState.Delivered);
              }}
              accessoryRight={props =>
                sliceLoading && currentLoading === 'deliver' ? (
                  <Text {...props}>
                    <Spinner status="basic" size="small" />
                  </Text>
                ) : (
                  <></>
                )
              }>
              {props => {
                if (isDropoffAt(StopState.Delivered)) {
                  return (
                    <Text {...props}>
                      <Icon name="check" /> DELIVERY CONFIRMED
                    </Text>
                  );
                } else {
                  return <Text {...props}>DELIVER CARGO</Text>;
                }
              }}
            </Button>
          </View>
        </Pressable>
      )}>
      {getDeliverTooltipText()}
    </Tooltip>
  );

  return (
    <View>
      {!CanceledStates.includes(match.state as CanceledTypes) &&
        !ReturnStates.includes(match.state as ReturnTypes) &&
        !ReturnStates.includes(stop.state as ReturnTypes) && (
          <View>
            {!match.isComplete() && renderEnRouteToDropoffToggle()}
            <Layout
              level={match.isComplete() ? '1' : '2'}
              style={styles.stopButtonsLayout}>
              {!match.isComplete() && renderArrivedAtDropoffButton()}

              {!match.isComplete() &&
                doesAnyDropoffItemNeedBarcode() &&
                renderScanBarcodesButton()}

              {!match.isComplete() && renderGetSignatureButton()}

              {!match.isComplete() &&
                stop.destination_photo_required &&
                renderCargoPhotoButton()}

              {renderDeliverCargoButton()}
            </Layout>
          </View>
        )}
      {
        // unable to deliver button
      }
      {!isDropoffAt(StopState.Delivered) &&
        isDropoffAt(StopState.EnRoute) &&
        !ReturnStates.includes(stop.state as ReturnTypes) &&
        !ReturnStates.includes(match.state as ReturnTypes) && (
          <Layout level="2" style={styles.unableToDeliverLayout}>
            <Button
              size="small"
              status="danger"
              onPress={() => {
                setCancelModalVisible(true);
              }}>
              UNABLE TO DELIVER
            </Button>
          </Layout>
        )}
      {
        // return progress section
      }
      {renderReturnButtons()}
      {
        // canceled button, only shows match canceled state for dropoff stops, should not be pressable
      }
      {CanceledStates.includes(match.state as CanceledTypes) && (
        <Layout level="2" style={styles.unableToDeliverLayout}>
          <Button size="small" status="danger" disabled>
            MATCH CANCELED
          </Button>
        </Layout>
      )}
      <ConfirmCancelModal
        cancelType="dropoff"
        isVisible={cancelModalVisible}
        setVisibleCallback={isVisible => setCancelModalVisible(isVisible)}
        setStateCallback={(state, reason) =>
          setStopStateCallback(state as StopState, reason)
        }
      />
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
  unableToDeliverLayout: {
    borderRadius: 4,
    padding: 8,
    marginTop: 10,
  },
});
