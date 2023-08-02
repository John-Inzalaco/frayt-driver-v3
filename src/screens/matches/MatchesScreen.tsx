import {
  Layout,
  Spinner,
  Toggle,
  useStyleSheet,
  useTheme,
} from '@ui-kitten/components';
import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  LayoutRectangle,
  Animated,
  Platform,
  FlatList,
  RefreshControl,
} from 'react-native';
import {Button} from '../../components/ui-kitten/Button';
import {Text} from '../../components/ui-kitten/Text';
import {HomeTabScreenProps} from '../../navigation/NavigatorTypes';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import MatchListItem from '../../components/matches/MatchListItem';
import {LeftFader, RightFader} from '../../components/HorizontalScrollFaders';
import {useToken} from '../../lib/TokenHelper';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {useSelector} from 'react-redux';
import {selectDriver} from '../../slices/user';
import {
  getAvailable,
  getLive,
  selectAvailableMatches,
  selectAcceptedMatches,
  selectCompletedMatches,
  getCompleted,
} from '../../slices/matches';
import {Match} from '@frayt/sdk';
import BackgroundGeolocation from 'react-native-background-geolocation-android';
import MatchPagination, {
  MatchListTypes,
  getPaginatedMatches,
} from '../../components/matches/MatchPagination';

const FADER_WIDTH = 36;
const HORIZONTAL_PADDING = 10;
const FILTER_BUTTONS_SIZE = 'small';

const DISABLE_UPDATE_TIMER = 15000;

export function MatchesScreen({
  navigation,
}: HomeTabScreenProps<'MatchesStack'>): React.ReactElement {
  const user = useSelector(selectDriver);
  const matchesAvailable = useAppSelector(selectAvailableMatches);
  const availableMatchesToBeShown = matchesAvailable.filter(
    match =>
      !match?.preferred_driver_id || match?.preferred_driver_id === user?.id,
  );

  const matchesAccepted = useAppSelector(selectAcceptedMatches);
  const matchesCompleted = useAppSelector(selectCompletedMatches);
  const matchesLoading = useAppSelector(state => state.matches.loading);
  const locationLoading = useAppSelector(state => state.user.loading);

  const theme = useTheme();
  const styles = useStyleSheet(themedStyles);

  const [checked, setChecked] = useState(false);
  const [filter, setFilter] = useState<MatchListTypes>('Available');
  const [currentMatches, setCurrentMatches] = useState<Match[]>(
    availableMatchesToBeShown,
  );
  const [updateMatchesDisabled, setUpdateMatchesDisabled] = useState(false);
  const [updateLocDisabled, setUpdateLocDisabled] = useState(false);
  const [scrollViewportDims, setScrollViewportDims] = useState({
    width: 0,
  } as LayoutRectangle);
  const [scrollContentWidth, setScrollContentWidth] = useState(0);
  const currentPage = useAppSelector(state => state.matches.currentPage);
  const dispatch = useAppDispatch();
  const {token} = useToken();
  const onCheckedChange = (isChecked: React.SetStateAction<boolean>) => {
    setChecked(isChecked);
  };

  const faderPosX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    switch (filter) {
      case 'Available':
        return setCurrentMatches(availableMatchesToBeShown);
      case 'Accepted':
        return setCurrentMatches(matchesAccepted);
      case 'Completed':
        return setCurrentMatches(matchesCompleted);
    }
  }, [filter, matchesAvailable, matchesAccepted, matchesCompleted]);

  function getEmptyText(type: MatchListTypes) {
    let emptyText = '';

    switch (type) {
      case 'Available':
        emptyText = 'There are no available matches near you.';
        break;
      case 'Accepted':
        emptyText = 'You have not accepted any matches yet.';
        break;
      case 'Completed':
        emptyText = 'You have not completed any matches yet.';
        break;
    }

    return emptyText;
  }

  async function refreshMatches() {
    if (!updateMatchesDisabled) {
      setUpdateMatchesDisabled(true);
      setTimeout(() => {
        setUpdateMatchesDisabled(false);
      }, DISABLE_UPDATE_TIMER);
      await dispatch(getAvailable({token: token ?? ''})).unwrap();
      await dispatch(getLive({token: token ?? ''})).unwrap();
      await dispatch(getCompleted({token: token ?? ''})).unwrap();
    }
  }

  async function refreshDriverLocation() {
    if (!updateLocDisabled) {
      setUpdateLocDisabled(true);
      setTimeout(() => {
        setUpdateLocDisabled(false);
      }, DISABLE_UPDATE_TIMER);
      try {
        await BackgroundGeolocation.getCurrentPosition({
          desiredAccuracy: 10,
          extras: {requestType: 'adhoc'},
        });
      } catch (error) {
        console.info(error);
      }
    }
  }

  useEffect(() => {
    if (token !== null) {
      dispatch(getAvailable({token: token}));
      dispatch(getLive({token: token}));
      dispatch(getCompleted({token: token}));
    }
  }, []);

  return (
    <Layout level="3" style={styles.container}>
      <View>
        <View style={styles.viewForScroll}>
          <Animated.ScrollView
            horizontal={true}
            onLayout={event => {
              setScrollViewportDims(event.nativeEvent.layout);
            }}
            onContentSizeChange={width => {
              setScrollContentWidth(width);
            }}
            onScroll={Animated.event(
              [
                {
                  nativeEvent: {
                    contentOffset: {
                      x: faderPosX,
                    },
                  },
                },
              ],
              {useNativeDriver: true},
            )}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}>
            <Button
              style={styles.filterButton}
              size={FILTER_BUTTONS_SIZE}
              status={filter === 'Available' ? 'basic' : 'primary'}
              onPress={() => {
                setFilter('Available');
              }}
              accessoryRight={evaProps => {
                return (
                  <Text
                    category="s1"
                    style={{
                      color: evaProps?.style.tintColor,
                      marginHorizontal: evaProps?.style.marginHorizontal,
                    }}>
                    {availableMatchesToBeShown?.length}
                  </Text>
                );
              }}>
              {evaProps => {
                return (
                  <Text
                    category="s1"
                    style={{
                      color: evaProps?.style.color,
                      marginHorizontal: evaProps?.style.marginHorizontal,
                    }}>
                    Available
                  </Text>
                );
              }}
            </Button>
            <View style={styles.viewDivider}></View>
            <Button
              style={styles.filterButton}
              size={FILTER_BUTTONS_SIZE}
              status={filter === 'Accepted' ? 'basic' : 'primary'}
              onPress={() => {
                setFilter('Accepted');
              }}
              accessoryRight={evaProps => {
                return (
                  <Text
                    category="s1"
                    style={{
                      color: evaProps?.style.tintColor,
                      marginHorizontal: evaProps?.style.marginHorizontal,
                    }}>
                    {matchesAccepted.length}
                  </Text>
                );
              }}>
              {evaProps => {
                return (
                  <Text
                    category="s1"
                    style={{
                      color: evaProps?.style.color,
                      marginHorizontal: evaProps?.style.marginHorizontal,
                    }}>
                    Accepted
                  </Text>
                );
              }}
            </Button>
            <View style={styles.viewDivider}></View>
            <Button
              style={styles.filterButton}
              size={FILTER_BUTTONS_SIZE}
              status={filter === 'Completed' ? 'basic' : 'primary'}
              onPress={() => {
                setFilter('Completed');
              }}>
              {evaProps => {
                return (
                  <Text
                    category="s1"
                    style={{
                      color: evaProps?.style.color,
                      marginHorizontal: evaProps?.style.marginHorizontal,
                    }}>
                    Completed
                  </Text>
                );
              }}
            </Button>
          </Animated.ScrollView>
        </View>
        <View pointerEvents="none" style={styles.viewForFaders}>
          <Animated.View
            style={{
              right: FADER_WIDTH,
              transform: [
                {
                  translateX: faderPosX.interpolate({
                    inputRange: [
                      0,
                      Math.abs(scrollContentWidth - scrollViewportDims.width),
                    ],
                    outputRange: [0, FADER_WIDTH],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            }}>
            <LeftFader width={FADER_WIDTH} height="100%" />
          </Animated.View>
          <Animated.View
            style={{
              left: Platform.OS === 'android' ? 1 : 0,
              transform: [
                {
                  translateX: faderPosX.interpolate({
                    inputRange: [
                      0,
                      Math.abs(scrollContentWidth - scrollViewportDims.width),
                    ],
                    outputRange: [0, FADER_WIDTH],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            }}>
            <RightFader width={FADER_WIDTH} height="100%" />
          </Animated.View>
        </View>
        <View style={styles.optionsView}>
          <Toggle checked={checked} onChange={onCheckedChange}>
            {() => (
              <Text category="s1" style={styles.toggleText}>
                Full Details
              </Text>
            )}
          </Toggle>
          <View style={styles.reloadButtonsView}>
            {
              // refresh matches button
            }
            <Button
              size="small"
              style={styles.reloadButton}
              disabled={updateMatchesDisabled || matchesLoading}
              accessoryRight={props => {
                if (matchesLoading) {
                  return <Spinner size="tiny" status="basic" />;
                } else {
                  return (
                    <Icon
                      name="redo"
                      color={props?.style.tintColor}
                      style={styles.icon}
                      solid
                    />
                  );
                }
              }}
              onPress={async () => await refreshMatches()}>
              REFRESH
            </Button>
            {
              // update location button
            }
            <Button
              size="small"
              style={styles.reloadButton}
              disabled={updateLocDisabled || locationLoading}
              accessoryRight={props => {
                if (locationLoading) {
                  return <Spinner size="tiny" status="basic" />;
                } else {
                  return (
                    <Icon
                      name="map-marker-alt"
                      color={props?.style.tintColor}
                      style={styles.icon}
                      solid
                    />
                  );
                }
              }}
              onPress={() => {
                refreshDriverLocation();
              }}>
              UPDATE
            </Button>
          </View>
        </View>
      </View>
      {
        // matches list
      }
      <FlatList
        style={styles.flatlist}
        data={
          filter === 'Completed'
            ? currentMatches
            : getPaginatedMatches(currentMatches)[currentPage[filter]]
        }
        refreshControl={
          <RefreshControl
            refreshing={matchesLoading}
            onRefresh={() => {
              refreshMatches();
              refreshDriverLocation();
            }}
            tintColor={theme['color-basic-500']}
            colors={[theme['color-basic-500']]}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>{getEmptyText(filter)}</Text>
        }
        renderItem={item => (
          <MatchListItem
            key={`${item.item.shortcode}-${item.index}`}
            index={item.index}
            match={item.item}
            type={filter}
            navigation={navigation}
            detail={checked}
            driverId={user?.id}
          />
        )}
      />
      <MatchPagination
        currentPage={currentPage}
        filter={filter}
        matches={currentMatches}
      />
    </Layout>
  );
}

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 25,
    paddingBottom: 30,
  },
  viewForScroll: {
    marginBottom: 12,
  },
  viewForFaders: {
    width: '100%',
    height: 32,
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewDivider: {
    width: 8,
  },
  filterButton: {
    borderRadius: 25,
  },
  optionsView: {
    flexDirection: 'row',
  },
  toggleText: {
    marginLeft: 8,
  },
  reloadButtonsView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  reloadButton: {
    marginLeft: 11,
  },
  icon: {
    bottom: 1,
  },

  flatlist: {
    flex: 1,
    marginVertical: 10,
  },
  emptyText: {
    alignSelf: 'center',
    marginTop: 20,
  },
});
