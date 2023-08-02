import React, {useEffect, useState} from 'react';
import {
  Layout,
  Spinner,
  Toggle,
  useStyleSheet,
  useTheme,
} from '@ui-kitten/components';
import {MatchesStackProps} from '../../navigation/NavigatorTypes';
import {StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import {Text} from '../../components/ui-kitten/Text';
import {ScrollView} from 'react-native-gesture-handler';
import {Button} from '../../components/ui-kitten/Button';
import {Divider} from '@ui-kitten/components';
import {CardCollapsible} from '../../components/CardCollapsible';
import MapView from 'react-native-maps';
import MapMarker from '../../components/matches/MapMarker';
import {getInitialRegion} from '../../components/matches/MapHelper';
import {
  acceptAction,
  getAvailable,
  getCompleted,
  getLive,
  selectAvailableMatches,
  selectMatchById,
  rejectAction,
} from '../../slices/matches';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {useToken} from '../../lib/TokenHelper';
import {handleError} from '../../lib/ErrorHelper';
import {selectDriver} from '../../slices/user';
import moment, {Moment} from 'moment';
import {Match} from '@frayt/sdk';

export const AvailableScreen = ({
  navigation,
  route,
}: MatchesStackProps<'Available'>): React.ReactElement => {
  const theme = useTheme();
  const styles = useStyleSheet(themedStyles);
  const dispatch = useAppDispatch();
  const {token: token} = useToken();
  const driver = useAppSelector(selectDriver);
  const sliceLoading = useAppSelector(state => state.matches.loading);
  const isPreferredDriver = route.params.isPreferredDriver;

  const match = useAppSelector(state =>
    selectMatchById(state, route.params.matchId),
  );
  const matchesAvailableIDs = useAppSelector(selectAvailableMatches).map(
    match => match.id,
  );
  const MAP_BODY_HEIGHT = 201;
  const INITIAL_REGION = getInitialRegion(match);
  const [toggleChecked, setToggleChecked] = useState(false);
  const onCheckedChange = (isChecked: React.SetStateAction<boolean>) => {
    setToggleChecked(isChecked);
  };

  const formatScheduledTime = (date: string | Moment | undefined) => {
    let eta = '';
    const today = moment();
    const tomorrow = moment().add(1, 'days');
    if (date === undefined) {
      eta = '--';
    } else {
      if (moment(date).isSame(today, 'day')) {
        eta = moment(date).format('h:mma') + ' Today';
      } else if (moment(date).isSame(tomorrow, 'day')) {
        eta = moment(date).format('h:mma') + ' Tomorrow';
      } else {
        eta = moment(date).format('h:mma MM/DD');
      }
    }
    return eta;
  };

  useEffect(() => {
    if (match) navigation.setOptions({title: `#${match.shortcode}`});
  }, [match]);

  useEffect(() => {
    if (token !== null) {
      dispatch(getAvailable({token: token}));
      dispatch(getLive({token: token ?? ''}));
      dispatch(getCompleted({token: token ?? ''}));
    }
  }, []);

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

  if (match && matchesAvailableIDs.includes(match.id)) {
    return (
      <Layout level="3" style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.header,
              {backgroundColor: theme['color-primary-500']},
            ]}>
            <View style={styles.messageIcon}>
              <Icon
                name={isPreferredDriver ? 'star' : 'envelope'}
                size={16}
                color={theme['color-primary-500']}
              />
            </View>
            {isPreferredDriver ? (
              <View>
                <Text category="s1">Preferred Driver</Text>
                <Text category="c1">
                  The shipper has requested you specifically
                </Text>
              </View>
            ) : (
              <View>
                <Text category="s1">Available</Text>
                <Text category="c1">
                  We're looking for a driver for this order.
                </Text>
              </View>
            )}
          </View>
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
                    Pickup
                    <Text style={styles.matchDetailsLabelFade}>
                      {match.pickup_at
                        ? ` by ${formatScheduledTime(match.pickup_at ?? '')}`
                        : ' ASAP'}
                    </Text>
                  </Text>
                  <Text category="p2" style={styles.matchDetailsValue}>
                    {`${match.origin_address?.city}, ${match.origin_address?.state_code} ${match.origin_address?.zip}`}
                  </Text>
                </View>
              </View>
              {match.stops.map((stop, index) => {
                return (
                  <View key={`AcceptedScreen.Logistics-${index}`}>
                    <Divider style={styles.matchDivider} />
                    <View style={styles.matchDetails}>
                      <View style={styles.matchDetailsText}>
                        <Text category="label" style={styles.matchDetailsLabel}>
                          Dropoff
                          <Text style={styles.matchDetailsLabelFade}>
                            {stop.dropoff_by
                              ? ` by ${formatScheduledTime(
                                  stop.dropoff_by ?? '',
                                )}`
                              : match.dropoff_at
                              ? ` by ${formatScheduledTime(
                                  match.dropoff_at ?? '',
                                )}`
                              : ' ASAP'}
                          </Text>
                        </Text>
                        <Text category="p2" style={styles.matchDetailsValue}>
                          {`${stop.destination_address.city}, ${stop.destination_address.state_code} ${stop.destination_address.zip}`}
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
                    <Text category="p2">{`${(match.total_volume / 1728).toFixed(
                      1,
                    )}`}</Text>
                    <Text category="p2" style={styles.matchDetailsFade}>
                      {' '}
                      ft³ /{' '}
                    </Text>
                    <Text>{`${match.total_weight}`}</Text>
                    <Text category="p2" style={styles.matchDetailsFade}>
                      {`${match.total_weight === 1 ? ' lb' : ' lbs'}`}
                    </Text>
                  </Text>
                </View>
              </View>
              <View>
                <Divider style={styles.matchDivider} />
                <View style={styles.matchDetails}>
                  <View style={styles.matchDetailsText}>
                    <Text category="label" style={styles.matchDetailsLabel}>
                      Services
                    </Text>
                    <Text category="p2" style={styles.matchDetailsValue}>
                      {match.stops.some(stop => stop.has_load_fee)
                        ? 'Load/Unload'
                        : '-'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </CardCollapsible>
          <CardCollapsible
            expandHeight={MAP_BODY_HEIGHT}
            title="Map"
            iconName="map-marker-alt"
            startExpanded={false}
            style={styles.card}>
            <MapView
              style={{height: MAP_BODY_HEIGHT}}
              initialRegion={INITIAL_REGION}>
              <MapMarker
                key={0}
                coordinate={{
                  latitude: match.origin_address?.lat ?? 39.103119,
                  longitude: match.origin_address?.lng ?? -84.512016,
                }}
                label="P"
              />
              {match.stops.map((stop, index) => (
                <MapMarker
                  key={index + 1}
                  coordinate={{
                    latitude: stop.destination_address.lat,
                    longitude: stop.destination_address.lng,
                  }}
                  label={index + 1}
                />
              ))}
            </MapView>
          </CardCollapsible>
          <CardCollapsible
            title="Acceptance"
            iconName="check-square"
            startExpanded={true}
            style={styles.card}>
            <View style={styles.acceptBody}>
              <Text category="p2" style={styles.acceptText}>
                I confirm that the weight and dimensions will fit in my vehicle.
                I am able to arrive at the pickup within 60 minutes or by the
                prescheduled time.
              </Text>
              <Toggle
                checked={toggleChecked}
                onChange={onCheckedChange}
                style={styles.acceptToggle}>
                I Agree
              </Toggle>
              <Button
                size="giant"
                status="success"
                disabled={!toggleChecked || sliceLoading}
                style={styles.acceptButton}
                onPress={async () => {
                  try {
                    if (!driver)
                      throw new Error('No driver assigned to this match');
                    if (!driver.current_location)
                      throw new Error(
                        'Driver does not have their current location updated',
                      );
                    const acceptedMatch = await dispatch(
                      acceptAction({
                        token: token ?? '',
                        matchId: match.id,
                        location: driver.current_location,
                      }),
                    ).unwrap();
                    navigation.navigate('Accepted', {
                      matchId: acceptedMatch.id,
                    });
                  } catch (error) {
                    handleError(error);
                  }
                }}
                accessoryRight={props =>
                  sliceLoading ? (
                    <Text {...props}>
                      <Spinner status="basic" />
                    </Text>
                  ) : (
                    <></>
                  )
                }>
                ACCEPT
              </Button>

              <Button
                size="giant"
                status="danger"
                disabled={sliceLoading}
                style={styles.rejectButton}
                onPress={async () => {
                  try {
                    if (!driver)
                      throw new Error('No driver assigned to this match');
                    if (!driver.current_location)
                      throw new Error(
                        'Driver does not have their current location updated',
                      );
                    await dispatch(
                      rejectAction({
                        token: token ?? '',
                        matchId: match?.id,
                        location: driver.current_location,
                      }),
                    ).unwrap();
                    await dispatch(getAvailable({token: token ?? ''})).unwrap();
                    navigation.goBack();
                  } catch (error) {
                    handleError(error);
                  }
                }}>
                REJECT
              </Button>
            </View>
          </CardCollapsible>
        </ScrollView>
      </Layout>
    );
  } else {
    return (
      <Layout level="3" style={styles.container}>
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
  }
};

const themedStyles = StyleSheet.create({
  container: {
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
  card: {
    marginBottom: 10,
  },
  matchCardBodyView: {
    marginHorizontal: 15,
  },
  matchProps: {
    marginVertical: 10,
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
  matchDetails: {
    flexDirection: 'row',
    marginBottom: 10,
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
  acceptBody: {
    marginVertical: 10,
    marginHorizontal: 15,
    alignItems: 'flex-start',
  },
  acceptText: {
    marginBottom: 10,
  },
  acceptToggle: {
    marginBottom: 15,
  },
  acceptButton: {
    width: '100%',
  },
  rejectButton: {
    marginTop: 10,
    width: '100%',
  },
  cardBodyView: {
    marginHorizontal: 15,
    marginVertical: 15,
  },
  matchDetailsLabel: {
    textTransform: 'uppercase',
    fontSize: 11,
    color: 'color-basic-600',
  },
  matchDetailsValue: {
    fontSize: 15,
  },
  matchDetailsFade: {
    color: 'color-basic-600',
  },
  matchDetailsLabelFade: {
    textTransform: 'none',
    fontSize: 11,
    color: 'color-basic-600',
    fontWeight: '400',
  },
});
