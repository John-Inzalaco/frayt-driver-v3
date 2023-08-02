import React, {useEffect, useRef, useState} from 'react';
import {Layout, useStyleSheet, useTheme} from '@ui-kitten/components';
import {MatchesStackProps} from '../../navigation/NavigatorTypes';
import {Divider} from '@ui-kitten/components';
import moment, {Moment} from 'moment';
import {
  ScrollView,
  View,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  StyleSheet,
  Clipboard,
  Alert,
  TouchableOpacity,
} from 'react-native';
import open from 'react-native-open-maps';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import {DividerGray} from '../../components/ui-kitten/DividerGray';
import {CardCollapsible} from '../../components/CardCollapsible';
import {TopFader, BottomFader} from '../../components/VerticalScrollFaders';
import MapView from 'react-native-maps';
import MapMarker from '../../components/matches/MapMarker';
import {getInitialRegion} from '../../components/matches/MapHelper';
import {useSelector} from 'react-redux';
import {
  toggleEnRouteToPickupAction,
  arriveAtPickupAction,
  pickupCargoAction,
  toggleEnRouteToDropoffAction,
  arriveAtDropoffAction,
  cancelMatch,
  enRouteToReturn,
  arriveAtReturnAction,
  deliverMatch,
  selectMatchById,
  getAvailable,
  getLive,
  getCompleted,
  undeliverStop,
  unableToPickupMatch,
  returnMatch,
} from '../../slices/matches';
import StopListItem from '../../components/matches/StopListItem';
import {PickupInputs} from '../../components/matches/PickupInputs';
import {Match, MatchState, MatchStop, StopState} from '@frayt/sdk';
import {DropoffInputs} from '../../components/matches/DropoffInputs';
import {handleError} from '../../lib/ErrorHelper';
import {useToken} from '../../lib/TokenHelper';
import {useAppDispatch} from '../../hooks';
import {selectDriver} from '../../slices/user';
import {ConfirmCancelModal} from '../../components/ConfirmCancelModal';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MAP_BODY_HEIGHT = 201;
const FADER_HEIGHT = 30;
const STOPS_LIST_VIEWPORT_HEIGHT = 160;

const PickupStates = [
  MatchState.Accepted,
  MatchState.EnRouteToPickup,
  MatchState.ArrivedAtPickup,
  MatchState.PickedUp,
] as const;

type PickupTypes = typeof PickupStates[number];

export const AcceptedScreen = ({
  navigation,
  route,
}: MatchesStackProps<'Accepted'>): React.ReactElement => {
  const styles = useStyleSheet(themedStyles);
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const {token} = useToken();

  const match = useSelector(state =>
    selectMatchById(state, route.params.matchId),
  );
  const driver = useSelector(selectDriver);
  const INITIAL_REGION = getInitialRegion(match, 0.33);

  const [chosenStop, setChosenStop] = useState<MatchStop | -1>(-1);

  const [stopListContentHeight, setStopListContentHeight] = useState(0);
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const [mapFullScreen, setMapFullScreen] = useState(false);
  const [mainViewHeight, setMainViewHeight] = useState(1);
  const [mapBodyHeight, setMapBodyHeight] = useState(
    mapCollapsed ? 0 : MAP_BODY_HEIGHT,
  );

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelType, setCancelType] = useState<
    'match' | 'pickup' | undefined
  >();

  const scrollY = useRef(new Animated.Value(0)).current;

  function isPickupAt(checkState: PickupTypes) {
    if (!match) throw new Error('This match does not exist');
    return (
      PickupStates.indexOf(match.state as PickupTypes) >=
      PickupStates.indexOf(checkState)
    );
  }

  function getMapButtonPosY() {
    if (mapFullScreen) {
      return mainViewHeight - 30;
    } else if (mapCollapsed) {
      return mapBodyHeight + 6;
    } else {
      return mapBodyHeight - 30;
    }
  }

  const copyToClipboard = () => {
    if (!match) return Alert.alert('Could not copy address to clipboard');
    const address =
      chosenStop === -1
        ? match.origin_address?.formatted_address
        : chosenStop.destination_address?.formatted_address;
    if (address) {
      Clipboard.setString(address);
      Alert.alert('Copied to clipboard!', address);
    }
  };

  const openMapWithAddress = () => {
    if (!match)
      return Alert.alert('Could not open navigation with this address');
    const address =
      chosenStop === -1
        ? match.origin_address?.formatted_address
        : chosenStop.destination_address?.formatted_address;
    if (address) open({query: address});
  };

  const formatETA = (date: string | Moment | undefined) => {
    let eta = undefined;
    const today = moment();
    const tomorrow = moment().add(1, 'days');

    if (moment(date).isSame(today, 'day')) {
      eta = `${moment(date).format('h:mma')} Today`;
    } else if (moment(date).isSame(tomorrow, 'day')) {
      eta = `${moment(date).format('h:mma')} Tomorrow`;
    } else {
      eta = `${moment(date).format('h:mma MM/DD)}')}`;
    }
    return eta;
  };

  const stopState = async (state: StopState.Undeliverable, reason?: string) => {
    try {
      if (!match) throw new Error('This match does not exist');
      if (!driver) throw new Error('No driver assigned to this match');
      if (!driver.current_location)
        throw new Error('Driver does not have their current location updated');
      if (!token) throw new Error('User is not logged in');
      if (chosenStop === -1)
        throw new Error('Cannot mark pickup as undeliverable');

      switch (state) {
        case StopState.Undeliverable:
          await dispatch(
            undeliverStop({
              token: token,
              matchId: match.id,
              stopId: chosenStop.id ?? '',
              location: driver.current_location,
              reason: reason || '',
            }),
          ).unwrap();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getTotalPieces = (match: Match) => {
    let totalPieces = 0;
    const matchItems = match.stops.map(stop => {
      const itemPieces = stop.items.map(item => {
        return item.pieces;
      });
      return itemPieces;
    });
    matchItems.forEach(item => {
      item.forEach(i => {
        totalPieces += i;
      });
    });
    return totalPieces;
  };

  const matchState = async (state: MatchState, reason?: string) => {
    try {
      if (!match) throw new Error('This match does not exist');
      if (!driver) throw new Error('No driver assigned to this match');
      if (!driver.current_location)
        throw new Error('Driver does not have their current location updated');
      if (!token) throw new Error('User is not logged in');

      const cargoPhoto = match.origin_photo ?? undefined;
      const boLPhoto = match.bill_of_lading_photo ?? undefined;
      switch (state) {
        case MatchState.Accepted:
        case MatchState.EnRouteToPickup:
          await dispatch(
            toggleEnRouteToPickupAction({
              token: token,
              matchId: match.id,
              location: driver.current_location,
            }),
          ).unwrap();
          break;
        case MatchState.ArrivedAtPickup:
          await dispatch(
            arriveAtPickupAction({
              token: token,
              matchId: match.id,
              location: driver.current_location,
            }),
          ).unwrap();
          break;
        case MatchState.PickedUp:
          await dispatch(
            pickupCargoAction({
              token: token,
              matchId: match.id,
              userId: driver?.id ?? '',
              location: driver.current_location,
              photos: {
                originPhoto: cargoPhoto,
                billOfLading: boLPhoto,
              },
            }),
          ).unwrap();
          break;
        case MatchState.UnableToPickup:
          await dispatch(
            unableToPickupMatch({
              token: token,
              matchId: match.id,
              reason: reason || '',
              location: driver.current_location,
            }),
          ).unwrap();
          break;
        case MatchState.DriverCanceled:
          await dispatch(
            cancelMatch({
              token: token,
              matchId: match.id,
              reason: reason || '',
              location: driver.current_location,
            }),
          ).unwrap();
          break;
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    if (match) navigation.setOptions({title: `#${match.shortcode}`});
    if (match && chosenStop !== -1) {
      const updatedStop = match.stops.find(stop => stop.id === chosenStop.id);
      if (!updatedStop) return console.warn('Could not find stop to update');
      setChosenStop(updatedStop);
    }
  }, [match]);

  useEffect(() => {
    if (token) {
      dispatch(getAvailable({token: token ?? ''}));
      dispatch(getLive({token: token ?? ''}));
      dispatch(getCompleted({token: token ?? ''}));
    }
  }, []);

  if (!match) {
    return (
      <Layout level="3" style={styles.flairContainer}>
        <View
          style={[styles.header, {backgroundColor: theme['color-danger-500']}]}>
          <View style={styles.messageIcon}>
            <Icon
              name="times-circle"
              size={16}
              color={theme['color-danger-500']}
            />
          </View>
          <View>
            <Text category="s1">Unavailable</Text>
            <Text category="c1">This match is no longer available.</Text>
          </View>
        </View>
      </Layout>
    );
  } else {
    return (
      <Layout
        level="3"
        onLayout={event => setMainViewHeight(event.nativeEvent.layout.height)}
        style={styles.container}>
        {
          // Map
        }
        <Animated.View
          style={[
            styles.mapView,
            {
              height: mapFullScreen ? mainViewHeight : mapBodyHeight,
            },
          ]}>
          <MapView
            style={styles.map}
            region={{
              ...INITIAL_REGION,
              latitudeDelta: INITIAL_REGION.latitudeDelta || 0.05,
              longitudeDelta: INITIAL_REGION.longitudeDelta || 0.05,
            }}>
            <MapMarker
              key={0}
              coordinate={
                match.origin_address && {
                  latitude: match.origin_address.lat,
                  longitude: match.origin_address.lng,
                }
              }
              label="1"
            />
            {match.stops.map((stop, index) => (
              <MapMarker
                key={`AcceptedScreen.MapMarker-${index}`}
                coordinate={{
                  latitude: stop.destination_address.lat,
                  longitude: stop.destination_address.lng,
                }}
                label={index + 2}
              />
            ))}
          </MapView>
          <Button
            size="tiny"
            style={[
              styles.mapButton,
              {opacity: mapFullScreen || !mapCollapsed ? 1 : 0},
            ]}
            onPress={() => {
              LayoutAnimation.easeInEaseOut();
              setMapFullScreen(!mapFullScreen);
            }}>
            {evaProps => {
              return (
                <Text {...evaProps}>
                  <Icon name={mapFullScreen ? 'compress' : 'expand'}></Icon>
                </Text>
              );
            }}
          </Button>
        </Animated.View>
        {
          // main scroll view
        }
        <ScrollView
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          style={styles.mainScrollView}>
          <View style={styles.stopsHeader}>
            {match.isComplete() && (
              <View
                style={[
                  styles.header,
                  {backgroundColor: theme['color-primary-500']},
                ]}>
                <View style={styles.messageIcon}>
                  <Icon
                    name="envelope"
                    size={16}
                    color={theme['color-primary-500']}
                  />
                </View>
                <View>
                  <Text category="s1">Completed</Text>
                  <Text category="c1">This match has been completed.</Text>
                </View>
              </View>
            )}
            <View>
              <Text category="h4">Stops</Text>
            </View>
            <View>
              {
                // stops list scrollview
              }
              <Animated.ScrollView
                style={styles.stopsScrollView}
                onContentSizeChange={(_width, height) =>
                  setStopListContentHeight(height)
                }
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                  [
                    {
                      nativeEvent: {
                        contentOffset: {
                          y: scrollY,
                        },
                      },
                    },
                  ],
                  {useNativeDriver: true},
                )}>
                {
                  // manual StopListItem for pick up stop, first stop is always a pickup
                  // every match only has one pickup
                }
                <View key={-1} style={styles.stopsListItem}>
                  <TouchableOpacity
                    style={styles.numberAndIcon}
                    onPress={() => {
                      setChosenStop(-1);
                    }}>
                    <View
                      style={[
                        styles.stopNumberView,
                        {
                          backgroundColor:
                            chosenStop === -1
                              ? 'white'
                              : theme['color-primary-500'],
                        },
                      ]}>
                      <Text category="label" style={styles.stopNumberText}>
                        1
                      </Text>
                    </View>
                    <Icon
                      name="arrow-from-bottom"
                      size={15}
                      color={
                        chosenStop === -1 ? 'white' : theme['color-primary-500']
                      }
                    />
                  </TouchableOpacity>
                  <View style={styles.stopAddressAndNameView}>
                    <Text category="p1">
                      {`${match.origin_address?.address}`}
                      <Text category="p2" style={styles.stopNameText}>
                        {match.origin_address?.name
                          ? ` (${match.origin_address?.name})`
                          : ''}
                      </Text>
                    </Text>
                  </View>
                  <Button
                    size="tiny"
                    status={chosenStop === -1 ? 'basic' : 'primary'}
                    style={styles.stopButton}
                    onPress={() => {
                      setChosenStop(-1);
                    }}>
                    {chosenStop === -1 ? 'ACTIVE' : 'SELECT'}
                  </Button>
                </View>
                {
                  // dropoff stops
                }
                {match.stops.map((stop, index, stops) => (
                  <StopListItem
                    key={`AcceptedScreen.DropoffList-${index}`}
                    stop={stop}
                    index={stop.index} // index -1 is the first stop (single pickup)
                    stops={stops}
                    chosenStop={chosenStop}
                    chooseStopCallback={(stop: MatchStop) => {
                      setChosenStop(stop);
                    }}
                  />
                ))}
              </Animated.ScrollView>
              {
                // stops list faders
              }
              <View pointerEvents="none" style={styles.fadersView}>
                <Animated.View
                  style={{
                    opacity:
                      match.stops.length > 5
                        ? scrollY.interpolate({
                            inputRange: [0, FADER_HEIGHT],
                            outputRange: [0, 1],
                          })
                        : 0,
                  }}>
                  <TopFader width="100%" height={FADER_HEIGHT} />
                </Animated.View>
                <Animated.View
                  style={{
                    opacity:
                      match.stops.length > 5
                        ? scrollY.interpolate({
                            inputRange: [
                              0,
                              Math.abs(
                                Math.abs(
                                  stopListContentHeight -
                                    STOPS_LIST_VIEWPORT_HEIGHT,
                                ) - FADER_HEIGHT,
                              ),
                              Math.abs(
                                stopListContentHeight -
                                  STOPS_LIST_VIEWPORT_HEIGHT,
                              ),
                            ],
                            outputRange: [1, 1, 0],
                          })
                        : 0,
                  }}>
                  <BottomFader width="100%" height={FADER_HEIGHT} />
                </Animated.View>
              </View>
            </View>
            {
              // stop details section
            }
            <Layout level="1" style={styles.stopLayout}>
              {
                // pickup stop details
              }
              {chosenStop === -1 && (
                <View>
                  <View style={styles.stopHeaderView}>
                    <View style={styles.stopDetailsStopNumberView}>
                      <Text
                        category="label"
                        style={styles.stopDetailsStopNumber}>
                        {
                          // FIXME: `1` is to account for the pickup currently being outside the MatchStops array
                          // we only account for one pickup in a match, and the state of the pickup is stored in the
                          // MatchState. when we refactor all stops (pickups included) to be in the MatchStops
                          // array, we will need to grab the index from the pickup stop.
                        }
                        {1}
                      </Text>
                    </View>
                    <Text category="s1">
                      <Icon
                        name="arrow-from-bottom"
                        size={15}
                        color={'white'}
                      />
                      {' Pickup'}
                    </Text>
                  </View>
                  <DividerGray style={styles.divider} />
                  <View style={styles.stopDetailsView}>
                    <View style={styles.stopDetailsSectionView}>
                      <View style={styles.addressLabelView}>
                        <Text category="label" appearance="hint">
                          ADDRESS
                        </Text>
                        <View style={styles.copyAndNavView}>
                          <Text
                            category="label"
                            style={styles.copyAndNavText}
                            onPress={() => copyToClipboard()}>
                            COPY
                          </Text>
                          <Text category="label" appearance="hint">
                            {' '}
                            |{' '}
                          </Text>
                          <Text
                            category="label"
                            style={styles.copyAndNavText}
                            onPress={() => openMapWithAddress()}>
                            NAVIGATION
                          </Text>
                        </View>
                      </View>
                      <Text category="p1">
                        {match.origin_address?.address2
                          ? `${match.origin_address?.address}\n${match.origin_address?.address2}\n${match.origin_address?.city}, ${match.origin_address?.state_code} ${match.origin_address?.zip}`
                          : `${match.origin_address?.address}\n${match.origin_address?.city}, ${match.origin_address?.state_code} ${match.origin_address?.zip}`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.stopDetailsLineView}>
                    <View style={styles.stopDetailsSectionView}>
                      <Text category="label" appearance="hint">
                        PICKUP TIME
                      </Text>
                      <Text>
                        {match.pickup_at
                          ? `${formatETA(match.pickup_at ?? '')}`
                          : 'ASAP'}
                      </Text>
                    </View>
                    <View style={styles.stopDetailsSectionView}>
                      <Text category="label" appearance="hint">
                        LOCATION
                      </Text>
                      <Text category="p1">
                        {match.origin_address?.name ?? '-'}
                      </Text>
                    </View>
                  </View>
                  {match.pickup_notes && (
                    <View style={styles.stopDetailsLineExtraView}>
                      <View style={styles.stopDetailsSectionView}>
                        <Text category="label" appearance="hint">
                          PICKUP NOTES
                        </Text>
                        <Text category="p1">{match.pickup_notes}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
              {
                // dropoff stop details
              }
              {chosenStop !== -1 && (
                <View>
                  <View style={styles.stopHeaderView}>
                    <View style={styles.stopDetailsStopNumberView}>
                      <Text
                        category="label"
                        style={styles.stopDetailsStopNumber}>
                        {
                          // FIXME: `index + 2` is to account for the pickup currently being outside the MatchStops array
                          // we only account for one pickup in a match, and the state of the pickup is stored in the
                          // MatchState. when we refactor all stops (pickups included) to be in the MatchStops
                          // array, change `index + 2` to `index + 1`.
                        }
                        {chosenStop.index + 2}
                      </Text>
                    </View>
                    <Text category="s1">
                      <Icon
                        name={
                          chosenStop.type == 'pickup'
                            ? 'arrow-from-bottom'
                            : 'arrow-from-top'
                        }
                        size={15}
                        color={'white'}
                      />
                      {chosenStop.type === 'pickup' ? ' Pickup' : ' Dropoff'}
                    </Text>
                  </View>
                  <DividerGray style={styles.divider} />
                  <View style={styles.stopDetailsView}>
                    <View style={styles.stopDetailsSectionView}>
                      <View style={styles.addressLabelView}>
                        <Text category="label" appearance="hint">
                          ADDRESS
                        </Text>
                        <View style={styles.copyAndNavView}>
                          <Text
                            category="label"
                            style={styles.copyAndNavText}
                            onPress={() => copyToClipboard()}>
                            COPY
                          </Text>
                          <Text category="label" appearance="hint">
                            {' '}
                            |{' '}
                          </Text>
                          <Text
                            category="label"
                            style={styles.copyAndNavText}
                            onPress={() => openMapWithAddress()}>
                            NAVIGATION
                          </Text>
                        </View>
                      </View>
                      <Text category="p1">
                        {chosenStop.destination_address.address2
                          ? `${chosenStop.destination_address.address}\n${chosenStop.destination_address.address2}\n${chosenStop.destination_address.city}, ${chosenStop.destination_address.state_code} ${chosenStop.destination_address.zip}`
                          : `${chosenStop.destination_address.address}\n${chosenStop.destination_address.city}, ${chosenStop.destination_address.state_code} ${chosenStop.destination_address.zip}`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.stopDetailsLineView}>
                    <View style={styles.stopDetailsSectionView}>
                      <Text category="label" appearance="hint">
                        DROPOFF TIME
                      </Text>
                      <Text>
                        {chosenStop.dropoff_by
                          ? `${formatETA(chosenStop.dropoff_by ?? '')}`
                          : match.dropoff_at
                          ? `${formatETA(match.dropoff_at ?? '')}`
                          : 'ASAP'}
                      </Text>
                    </View>
                    <View style={styles.stopDetailsSectionView}>
                      <Text category="label" appearance="hint">
                        LOCATION
                      </Text>
                      <Text category="p1">
                        {chosenStop.destination_address.name ?? '-'}
                      </Text>
                    </View>
                  </View>
                  {match.stops.length > 1 && (
                    <View>
                      <View style={styles.stopDetailsLineExtraView}>
                        <View style={styles.stopDetailsSectionView}>
                          <Text category="label" appearance="hint">
                            DIMENSIONS
                          </Text>
                          <Text category="p1">
                            {chosenStop.items.map((item, index, array) => {
                              return `• ${item.width}" x ${item.height}" x ${
                                item.length
                              }"${index === array.length - 1 ? '' : '\n'}`;
                            })}
                          </Text>
                        </View>
                        <View style={styles.stopDetailsSectionView}>
                          <Text category="label" appearance="hint">
                            PIECES
                          </Text>
                          <Text category="p1">
                            {chosenStop.items.map((item, index, array) => {
                              return `• ${item.pieces}${
                                index === array.length - 1 ? '' : '\n'
                              }`;
                            })}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.stopDetailsLineExtraView}>
                        <View style={styles.stopDetailsSectionView}>
                          <Text category="label" appearance="hint">
                            WEIGHT PER ITEM
                          </Text>
                          <Text category="p1">
                            {chosenStop.items.map((item, index, array) => {
                              return `• ${item.weight} ${
                                item.weight === 1 ? 'lb' : 'lbs'
                              }${index === array.length - 1 ? '' : '\n'}`;
                            })}
                          </Text>
                        </View>
                        <View style={styles.stopDetailsSectionView}>
                          <Text category="label" appearance="hint">
                            STOP TOTAL WEIGHT
                          </Text>
                          <Text category="p1">
                            {`${chosenStop.items
                              .reduce((total, item) => total + item.weight, 0)
                              .toPrecision(3)} ${
                              chosenStop.items.reduce(
                                (total, item) => total + item.weight,
                                0,
                              ) === 1
                                ? 'lb'
                                : 'lbs'
                            }`}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.stopDetailsLineExtraView}>
                        <View style={styles.stopDetailsSectionView}>
                          <Text category="label" appearance="hint">
                            SERVICES
                          </Text>
                          <Text category="p1">
                            {chosenStop.has_load_fee ? 'Load/Unload' : '-'}
                          </Text>
                        </View>
                        <View style={styles.stopDetailsSectionView}>
                          <Text category="label" appearance="hint">
                            PO/JOB#
                          </Text>
                          <Text category="p1">{chosenStop.po ?? '-'}</Text>
                        </View>
                      </View>
                      <View style={styles.stopDetailsLineExtraView}>
                        <View style={styles.stopDetailsSectionView}>
                          <Text category="label" appearance="hint">
                            DESCRIPTION
                          </Text>
                          <Text category="p1">
                            {chosenStop.items.map((item, index, array) => {
                              return `• ${item.description}${
                                index === array.length - 1 ? '' : '\n'
                              }`;
                            })}
                          </Text>
                        </View>
                      </View>
                      {chosenStop.delivery_notes && (
                        <View style={styles.stopDetailsLineExtraView}>
                          <View style={styles.stopDetailsSectionView}>
                            <Text category="label" appearance="hint">
                              DELIVERY NOTES
                            </Text>
                            <Text category="p1">
                              {chosenStop.delivery_notes ?? ''}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}
              {match.isLive() && <DividerGray style={styles.divider} />}
              {
                // Stop pickup progress section
              }
              {chosenStop === -1 && (
                <PickupInputs
                  match={match}
                  navigation={navigation}
                  route={route}
                  setMatchStateCallback={state => matchState(state)}
                />
              )}
              {
                // Stop dropoff progress section
              }
              {chosenStop !== -1 && (
                <DropoffInputs
                  match={match}
                  stop={chosenStop}
                  navigation={navigation}
                  route={route}
                  setMatchStateCallback={async (state, reason) => {
                    try {
                      if (!driver)
                        throw new Error('No driver assigned to this match');
                      if (!driver.current_location)
                        throw new Error(
                          'Driver does not have their current location updated',
                        );
                      switch (state) {
                        case MatchState.DriverCanceled:
                          await dispatch(
                            cancelMatch({
                              token: token ?? '',
                              matchId: match.id,
                              reason: reason,
                              location: driver.current_location,
                            }),
                          ).unwrap();
                          break;
                        case MatchState.EnRouteToReturn:
                          await dispatch(
                            enRouteToReturn({
                              token: token ?? '',
                              matchId: match.id,
                              location: driver.current_location,
                            }),
                          ).unwrap();
                          break;
                        case MatchState.ArrivedAtReturn:
                          await dispatch(
                            arriveAtReturnAction({
                              token: token ?? '',
                              matchId: match.id,
                              location: driver.current_location,
                            }),
                          ).unwrap();
                          break;
                      }
                    } catch (error) {
                      handleError(error);
                    }
                  }}
                  setStopStateCallback={async (state, reason) => {
                    try {
                      if (!driver)
                        throw new Error('No driver assigned to this match');
                      if (!driver.current_location)
                        throw new Error(
                          'Driver does not have their current location updated',
                        );
                      const cargoPhoto = chosenStop.destination_photo;
                      switch (state) {
                        case StopState.Pending:
                        case StopState.EnRoute:
                          await dispatch(
                            toggleEnRouteToDropoffAction({
                              token: token ?? '',
                              matchId: match.id,
                              stopId: chosenStop.id,
                              location: driver.current_location,
                            }),
                          ).unwrap();
                          break;
                        case StopState.Arrived:
                          await dispatch(
                            arriveAtDropoffAction({
                              token: token ?? '',
                              matchId: match.id,
                              stopId: chosenStop.id,
                              location: driver.current_location,
                            }),
                          ).unwrap();
                          break;
                        case StopState.Delivered:
                          await dispatch(
                            deliverMatch(
                              cargoPhoto
                                ? {
                                    token: token ?? '',
                                    matchId: match.id,
                                    stopId: chosenStop.id,
                                    userId: driver.id,
                                    location: driver.current_location,
                                    photos: {
                                      destinationPhoto: cargoPhoto,
                                    },
                                  }
                                : {
                                    token: token ?? '',
                                    matchId: match.id,
                                    stopId: chosenStop.id,
                                    userId: driver.id,
                                    location: driver.current_location,
                                  },
                            ),
                          ).unwrap();
                          break;
                        case StopState.Undeliverable:
                          await dispatch(
                            undeliverStop({
                              token: token ?? '',
                              matchId: match.id,
                              stopId: chosenStop.id,
                              location: driver.current_location,
                              reason: reason || '',
                            }),
                          ).unwrap();
                          break;
                        case StopState.Returned:
                          await dispatch(
                            returnMatch({
                              token: token ?? '',
                              matchId: match.id,
                              location: driver.current_location,
                            }),
                          );
                      }
                    } catch (error) {
                      handleError(error);
                    }
                  }}
                />
              )}
            </Layout>
            <CardCollapsible
              title="Logistics"
              iconName="road"
              startExpanded={false}
              style={styles.card}>
              <View style={styles.cardBodyView}>
                <View style={styles.matchDetails}>
                  <View style={styles.matchDetailsText}>
                    <Text category="label" style={styles.matchDetailsLabel}>
                      Service Level
                    </Text>
                    <Text category="p2" style={styles.matchDetailsValue}>
                      {match.service_level == 1 ? 'Dash' : 'Same Day'}
                    </Text>
                  </View>
                  <View style={styles.matchDetailsText}>
                    <Text category="label" style={styles.matchDetailsLabel}>
                      Distance
                    </Text>
                    <Text category="p2" style={styles.matchDetailsValue}>
                      {match.distance}
                      <Text style={styles.matchDetailsFade}> mi</Text>
                    </Text>
                  </View>
                  <View style={styles.matchDetailsText}>
                    <Text category="label" style={styles.matchDetailsLabel}>
                      Class
                    </Text>
                    <Text category="p2" style={styles.matchDetailsValue}>
                      {match.vehicle_class}
                    </Text>
                  </View>
                </View>
                <Divider style={styles.matchDivider} />
                <View style={styles.matchDetails}>
                  <View style={styles.matchDetailsText}>
                    <Text category="label" style={styles.matchDetailsLabel}>
                      Pickup{' '}
                      <Text style={styles.matchDetailsLabelFade}>
                        {match.pickup_at
                          ? ` by ${formatETA(match.pickup_at ?? '')}`
                          : ' ASAP'}
                      </Text>
                      <Text style={styles.matchDetailsLabelFade}></Text>
                    </Text>
                    <Text category="p2" style={styles.matchDetailsValue}>
                      {match.origin_address?.address2
                        ? `${match.origin_address?.address}\n${match.origin_address?.address2}\n${match.origin_address?.city}, ${match.origin_address?.state_code} ${match.origin_address?.zip}`
                        : `${match.origin_address?.address}\n${match.origin_address?.city}, ${match.origin_address?.state_code} ${match.origin_address?.zip}`}
                    </Text>
                  </View>
                </View>
                {match.stops.map((stop, index) => {
                  return (
                    <View key={`AcceptedScreen.Logistics-${index}`}>
                      <Divider style={styles.matchDivider} />
                      <View style={styles.matchDetails}>
                        <View style={styles.matchDetailsText}>
                          <Text
                            category="label"
                            style={styles.matchDetailsLabel}>
                            Dropoff{' '}
                            <Text style={styles.matchDetailsLabelFade}>
                              {stop.dropoff_by
                                ? ` by ${formatETA(stop.dropoff_by ?? '')}`
                                : match.dropoff_at
                                ? ` by ${formatETA(match.dropoff_at ?? '')}`
                                : ' ASAP'}
                            </Text>
                          </Text>
                          <Text category="p2" style={styles.matchDetailsValue}>
                            {stop.destination_address.address2
                              ? `${stop.destination_address.address}\n${stop.destination_address.address2}\n${stop.destination_address.city}, ${stop.destination_address.state_code} ${stop.destination_address.zip}`
                              : `${stop.destination_address.address}\n${stop.destination_address.city}, ${stop.destination_address.state_code} ${stop.destination_address.zip}`}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </CardCollapsible>
            <CardCollapsible
              title="Cargo"
              iconName="box"
              startExpanded={false}
              style={styles.card}>
              <View style={styles.cardBodyView}>
                <View style={styles.matchDetails}>
                  <View style={styles.matchDetailsText}>
                    <Text category="label" style={styles.matchDetailsLabel}>
                      SUMMARY
                    </Text>
                    <Text style={styles.matchDetailsText}>
                      <Text category="p2">{`${getTotalPieces(
                        match,
                      )} pieces`}</Text>
                      <Text category="p2" style={styles.matchDetailsFade}>
                        {' '}
                        @{' '}
                      </Text>
                      <Text category="p2">{`${(
                        match.total_volume / 1728
                      ).toFixed(1)}`}</Text>
                      <Text category="p2" style={styles.matchDetailsFade}>
                        {' '}
                        ft³ /{' '}
                      </Text>
                      <Text>{`${match.total_weight}`}</Text>
                      <Text category="p2" style={styles.matchDetailsFade}>{`${
                        match.total_weight === 1 ? ' lb' : ' lbs'
                      }`}</Text>
                    </Text>
                  </View>
                </View>
                {match.stops.length === 1 && (
                  <View>
                    <Divider style={styles.matchDivider} />
                    <View style={styles.matchDetails}>
                      <View style={styles.matchDetailsText}>
                        <Text category="label" style={styles.matchDetailsLabel}>
                          Services
                        </Text>
                        <Text category="p2" style={styles.matchDetailsValue}>
                          {match.stops[0].has_load_fee ? 'Load/Unload' : '-'}
                        </Text>
                      </View>
                      <View style={styles.matchDetailsText}>
                        <Text category="label" style={styles.matchDetailsLabel}>
                          PO/Job #
                        </Text>
                        <Text category="p2" style={styles.matchDetailsValue}>
                          {match.stops[0].po ?? '-'}
                        </Text>
                      </View>
                    </View>
                    <Divider style={styles.matchDivider} />
                    <View style={styles.matchDetails}>
                      <View style={styles.matchDetailsText}>
                        <Text category="label" style={styles.matchDetailsLabel}>
                          Description
                        </Text>
                        <Text category="p2" style={styles.matchDetailsValue}>
                          {
                            // currently if a match has 1 stop, that stop can only have 1 item
                            match.stops[0].items[0].description ?? '-'
                          }
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </CardCollapsible>
            <CardCollapsible
              title="Customer"
              iconName="user"
              startExpanded={false}
              style={styles.card}>
              <View style={styles.cardBodyView}>
                <View style={styles.matchDetails}>
                  <View style={styles.matchDetailsText}>
                    <Text category="label" style={styles.matchDetailsLabel}>
                      Shipper
                    </Text>
                    <Text category="p2" style={styles.matchDetailsValue}>
                      {match.shipper.name}
                    </Text>
                  </View>
                  <View style={styles.matchDetailsText}>
                    <Text category="label" style={styles.matchDetailsLabel}>
                      Company
                    </Text>
                    <Text category="p2" style={styles.matchDetailsValue}>
                      {match.shipper.company ?? '-'}
                    </Text>
                  </View>
                </View>
                <Divider style={styles.matchDivider} />
                <View style={styles.matchDetails}>
                  <View style={styles.matchDetailsText}>
                    <Text category="label" style={styles.matchDetailsLabel}>
                      Call
                    </Text>
                    <Text category="p2" style={styles.matchDetailsValue}>
                      <Text style={styles.matchDetailsLink}>
                        {match.shipper.phone.replace(
                          /(\d{3})(\d{3})(\d{4})/,
                          '$1-$2-$3',
                        )}
                      </Text>
                    </Text>
                  </View>
                  <View style={styles.matchDetailsText}>
                    <Text category="label" style={styles.matchDetailsLabel}>
                      Text
                    </Text>
                    <Text category="p2" style={styles.matchDetailsValue}>
                      <Text style={styles.matchDetailsLink}>
                        {match.shipper.phone.replace(
                          /(\d{3})(\d{3})(\d{4})/,
                          '$1-$2-$3',
                        )}
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            </CardCollapsible>
            <CardCollapsible
              title="Pay"
              iconName="money-bill"
              startExpanded={false}
              style={styles.card}>
              <View style={styles.cardBodyView}>
                <View style={styles.matchDetails}>
                  <View style={styles.matchDetailsText}>
                    <View style={{display: 'flex', flexDirection: 'row'}}>
                      <Text
                        category="label"
                        style={[styles.matchDetailsLabel, {flexGrow: 1}]}>
                        Name
                      </Text>
                      <Text
                        category="label"
                        style={[styles.matchDetailsLabelRight, {flexGrow: 1}]}>
                        Pay
                      </Text>
                    </View>
                    {match.fees.map((fee, index) => {
                      return (
                        <View
                          style={styles.matchReceiptLine}
                          key={`AcceptedScreen.Fees-${index}`}>
                          <Text category="p2" style={styles.matchDetailsValue}>
                            {`${fee.name}`}
                          </Text>
                          <View style={styles.dotsContainer}>
                            {Array.from({length: 100}).map((val, index) => {
                              return (
                                <View
                                  key={index}
                                  style={styles.matchDetailsEllipsis}
                                />
                              );
                            })}
                          </View>
                          <Text category="p2" style={styles.matchDetailsValue}>
                            {`$${fee.amount / 100}`}
                          </Text>
                        </View>
                      );
                    })}
                    <Divider style={styles.matchDivider} />
                    <View style={styles.matchReceiptLine}>
                      <Text
                        category="p2"
                        style={[styles.matchDetailsValue, {fontWeight: '800'}]}>
                        Total
                      </Text>
                      <View style={styles.dotsContainer}>
                        {Array.from({length: 100}).map((val, index) => {
                          return (
                            <View
                              key={index}
                              style={styles.matchDetailsEllipsis}
                            />
                          );
                        })}
                      </View>
                      <Text
                        category="p2"
                        style={[styles.matchDetailsValue, {fontWeight: '800'}]}>
                        {`$${match.driver_total_pay}`}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </CardCollapsible>

            {
              // cancel match button
            }
            {!match.isComplete() &&
              (!isPickupAt(MatchState.PickedUp) || match.isCanceled()) && (
                <Layout level="2" style={styles.stopButtonsLayout}>
                  <Button
                    testID="CancelMatch"
                    size="small"
                    status="danger"
                    onPress={() => {
                      setCancelModalVisible(true);
                      setCancelType('match');
                    }}
                    disabled={match.isCanceled()}>
                    {match.isCanceled() ? 'MATCH CANCELED' : 'CANCEL MATCH'}
                  </Button>
                  {
                    // unable to pickup button
                  }
                  {(match.state === MatchState.ArrivedAtPickup ||
                    match.state === MatchState.UnableToPickup) &&
                    !match.isCanceled() && (
                      <Button
                        testID="UnableToPickup"
                        size="small"
                        status="danger"
                        disabled={match.state === MatchState.UnableToPickup}
                        onPress={() => {
                          setCancelModalVisible(true);
                          setCancelType('pickup');
                        }}
                        style={styles.progressButton}>
                        {match.state === MatchState.UnableToPickup
                          ? 'PICKUP CANCELED'
                          : 'UNABLE TO PICKUP'}
                      </Button>
                    )}
                </Layout>
              )}
            <ConfirmCancelModal
              cancelType={cancelType}
              isVisible={cancelModalVisible}
              setVisibleCallback={isVisible => setCancelModalVisible(isVisible)}
              setStateCallback={(state, reason, type) =>
                type === 'Match'
                  ? matchState(state as MatchState, reason)
                  : stopState(state as StopState.Undeliverable, reason)
              }
            />
          </View>
        </ScrollView>
        {
          // Map drop down button
        }
        <Animated.View
          style={[
            styles.mapDropDownButtonView,
            {
              top: getMapButtonPosY(),
            },
          ]}>
          <Button
            size="tiny"
            status="basic"
            style={styles.mapDropDownButton}
            onPress={() => {
              if (mapCollapsed) {
                LayoutAnimation.easeInEaseOut();
                setMapBodyHeight(MAP_BODY_HEIGHT);
                setMapCollapsed(false);
              } else {
                LayoutAnimation.easeInEaseOut();
                setMapBodyHeight(0);
                setMapCollapsed(true);
                setMapFullScreen(false);
              }
            }}>
            {evaProps => (
              <Text {...evaProps}>
                <Icon name={mapCollapsed ? 'chevron-down' : 'chevron-up'} />
              </Text>
            )}
          </Button>
        </Animated.View>
      </Layout>
    );
  }
};

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  flairContainer: {
    flex: 1,
    paddingTop: 26,
    paddingHorizontal: 10,
  },
  header: {
    height: 72,
    borderRadius: 4,
    flexDirection: 'row',
    padding: 16,
    marginBottom: 10,
  },
  messageIcon: {
    backgroundColor: 'white',
    height: 40,
    width: 40,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  mainScrollView: {
    marginHorizontal: 10,
  },
  stopsHeader: {
    marginTop: 20,
  },
  stopsScrollView: {
    maxHeight: STOPS_LIST_VIEWPORT_HEIGHT,
    marginBottom: 10,
  },
  mapView: {
    width: '100%',
    backgroundColor: 'gray',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  mapButton: {
    margin: 6,
  },
  fadersView: {
    height: STOPS_LIST_VIEWPORT_HEIGHT,
    width: '100%',
    position: 'absolute',
    justifyContent: 'space-between',
  },
  stopLayout: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
  },
  stopHeaderView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopDetailsStopNumberView: {
    backgroundColor: 'white',
    height: 15,
    width: 15,
    borderRadius: 15,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopDetailsStopNumber: {
    color: 'color-basic-1000',
  },
  divider: {
    marginVertical: 10,
  },
  stopDetailsView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stopDetailsSectionView: {
    flex: 1,
  },
  addressLabelView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copyAndNavView: {
    flexDirection: 'row',
  },
  copyAndNavText: {
    color: 'color-primary-500',
  },
  stopDetailsLineView: {
    flexDirection: 'row',
  },
  stopDetailsLineExtraView: {
    flexDirection: 'row',
    marginTop: 10,
  },
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
  card: {
    marginBottom: 10,
    minWidth: '100%',
  },
  cardBodyView: {
    marginHorizontal: 15,
    marginVertical: 15,
  },
  matchProps: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  matchPropsButton: {
    borderRadius: 25,
    marginRight: 8,
  },
  matchMoneyAndMiles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchDetailsView: {
    flexDirection: 'row',
  },
  matchDetailsText: {
    flex: 1,
  },
  matchDetailsLabel: {
    textTransform: 'uppercase',
    fontSize: 11,
    color: 'color-basic-600',
  },
  matchDetailsLabelRight: {
    textTransform: 'uppercase',
    fontSize: 11,
    color: 'color-basic-600',
    textAlign: 'right',
  },
  matchDetailsLabelFade: {
    textTransform: 'none',
    fontSize: 11,
    color: 'color-basic-600',
    fontWeight: '400',
  },
  matchDetailsValue: {
    fontSize: 15,
  },
  matchDetailsFade: {
    color: 'color-basic-600',
  },
  matchDetailsLink: {
    color: 'color-primary-500',
  },
  matchDetails: {
    flexDirection: 'row',
  },
  matchDivider: {
    marginVertical: 10,
  },
  matchDestinationText: {
    flexDirection: 'row',
  },
  matchDestinationIcon: {
    transform: [{rotate: '90deg'}],
  },
  matchReceiptLine: {
    flexDirection: 'row',
  },
  dotsContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    width: '65%',
    overflow: 'hidden',
    marginHorizontal: 6,
  },
  matchDetailsEllipsis: {
    width: 3,
    height: 3,
    backgroundColor: 'color-basic-600',
    borderRadius: 50,
    marginLeft: 4,
    marginRight: 4,
    marginTop: 10,
  },
  mapDropDownButtonView: {
    position: 'absolute',
  },
  mapDropDownButton: {
    borderColor: 'color-primary-500',
    borderWidth: 0.5,
  },
  stopsListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stopNumberView: {
    height: 15,
    width: 15,
    borderRadius: 15,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopNumberText: {
    color: 'color-basic-1000',
  },
  stopAddressAndNameView: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 5,
  },
  stopNameText: {
    color: 'color-basic-600',
  },
  stopButton: {
    height: 24,
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  numberAndIcon: {
    flexDirection: 'row',
  },
});
