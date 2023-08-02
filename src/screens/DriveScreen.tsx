import React, {useEffect} from 'react';
import {Layout, Card, useStyleSheet} from '@ui-kitten/components';
import {
  Dimensions,
  StyleSheet,
  View,
  Animated,
  ScrollView,
  Platform,
} from 'react-native';
import SvgLogo from '../images/logo-svg';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';
import {SlidingDot} from 'react-native-animated-pagination-dots';
import PagerView, {
  PagerViewOnPageScrollEventData,
} from 'react-native-pager-view';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ProfileCard from '../components/widgets/ProfileCard';
import {useSelector} from 'react-redux';
import {selectDriver} from '../slices/user';
import {Text} from '../components/ui-kitten/Text';
import RevenueCard from '../components/widgets/RevenueCard';
import MatchAvailabilityCard from '../components/widgets/MatchAvailabilityCard';
import AnalyticsCard from '../components/widgets/AnalyticsCard';
import {useToken} from '../lib/TokenHelper';
import {useAppDispatch, useAppSelector} from '../hooks';
import {getAvailable, selectAvailableMatches} from '../slices/matches';
import MatchListItem from '../components/matches/MatchListItem';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../components/ui-kitten/Button';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

export function DriveScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  const {token} = useToken();
  const dispatch = useAppDispatch();
  const styles = useStyleSheet(themedStyles);

  useEffect(() => {
    if (token !== null) {
      dispatch(getAvailable({token: token}));
    }
  }, []);

  return (
    <Layout
      level="3"
      style={[
        styles.layout,
        {
          paddingTop: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}>
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{height: Platform.OS === 'ios' ? '67%' : '71%'}}
        contentContainerStyle={styles.scrollViewContentContainer}>
        <Widgets />
        <Matches />
      </ScrollView>
    </Layout>
  );
}

const Header = (): JSX.Element => {
  const user = useSelector(selectDriver);
  const styles = useStyleSheet(themedStyles);
  return (
    <View style={styles.headerView}>
      <SvgLogo style={styles.logo} />
      <Text style={styles.text} category="h5" testID="DriveScreen.WelcomeText">
        Welcome{user ? `, ${user.first_name}` : ''}!
      </Text>
      <Text style={styles.text} category="p2">
        <FontAwesome5Pro name="bullhorn" size={13} /> Welcome to the new FRAYT
        Driver App beta! We appreciate your feedback.
      </Text>
    </View>
  );
};

const Widgets = (): JSX.Element => {
  const styles = useStyleSheet(themedStyles);
  const dataList = [
    {Component: ProfileCard, key: 0},
    {Component: RevenueCard, key: 1},
    {Component: MatchAvailabilityCard, key: 2},
    {Component: AnalyticsCard, key: 3},
  ];
  const width = Dimensions.get('window').width;
  const pagerRef = React.useRef<PagerView>(null);
  const scrollOffsetAnimatedValue = React.useRef(new Animated.Value(0)).current;
  const positionAnimatedValue = React.useRef(new Animated.Value(0)).current;
  const inputRange = [0, dataList.length];
  const scrollX = Animated.add(
    scrollOffsetAnimatedValue,
    positionAnimatedValue,
  ).interpolate({
    inputRange,
    outputRange: [0, dataList.length * width],
  }) as Animated.Value;

  const onPageScroll = React.useMemo(
    () =>
      Animated.event<PagerViewOnPageScrollEventData>(
        [
          {
            nativeEvent: {
              offset: scrollOffsetAnimatedValue,
              position: positionAnimatedValue,
            },
          },
        ],
        {
          useNativeDriver: false,
        },
      ),
    [],
  );

  return (
    <View style={[styles.widgetView, {flex: Platform.OS === 'ios' ? 3 : 3.3}]}>
      <AnimatedPagerView
        initialPage={0}
        ref={pagerRef}
        style={styles.pagerView}
        onPageScroll={onPageScroll}>
        {dataList.map(({Component, key}) => (
          <Component key={key} />
        ))}
      </AnimatedPagerView>

      <SlidingDot
        data={dataList}
        scrollX={scrollX}
        dotSize={7}
        containerStyle={styles.dotContainer}
        slidingIndicatorStyle={styles.activeDot}
        dotStyle={styles.dot}
      />
    </View>
  );
};

const Matches = (): JSX.Element => {
  const {token} = useToken();
  const user = useSelector(selectDriver);
  const dispatch = useAppDispatch();
  const matchesAvailable = useAppSelector(selectAvailableMatches);
  const navigation = useNavigation();
  const styles = useStyleSheet(themedStyles);

  const matchesAvailableList =
    matchesAvailable.length > 3
      ? [matchesAvailable[0], matchesAvailable[1], matchesAvailable[2]]
      : matchesAvailable;

  const availableMatchesToBeShown = matchesAvailableList.filter(
    match =>
      !match?.preferred_driver_id || match?.preferred_driver_id === user?.id,
  );

  return (
    <View style={{flex: Platform.OS === 'ios' ? 4 : 3.7}}>
      <Card
        style={styles.card}
        status="primary"
        header={() => {
          return (
            <View style={styles.cardHeaderView}>
              <Text category="h6" style={styles.cardHeaderText}>
                Available Matches
              </Text>
              <FontAwesome5Pro
                name="layer-group"
                style={styles.icon}
                size={18}
              />
            </View>
          );
        }}>
        <View style={styles.flatlist}>
          {availableMatchesToBeShown?.length > 0 ? (
            availableMatchesToBeShown?.map((item, index) => {
              return (
                <Layout
                  key={`${item?.id}-${index}`}
                  level={((index % 2) + 1).toString()}
                  style={[
                    styles.matchItem,
                    {flexBasis: Platform.OS === 'ios' ? 80 : 65},
                  ]}>
                  <MatchListItem
                    driverId={user?.id || ''}
                    index={index}
                    match={item}
                    type={'Available'}
                    navigation={navigation}
                    detail={false}
                  />
                </Layout>
              );
            })
          ) : (
            <View style={styles.emptyListTextContainer}>
              <FontAwesome5Pro name="box" color={'#8F9BB3'} size={50} />
              <Text style={styles.noAvailableText}>
                There are no available orders near you.
              </Text>
              <Button
                size="tiny"
                style={styles.refreshContainer}
                onPress={() => {
                  dispatch(getAvailable({token: token}));
                }}
                accessoryRight={props => {
                  return (
                    <FontAwesome5Pro
                      name="redo"
                      color={props?.style.tintColor}
                      solid
                      size={8}
                    />
                  );
                }}>
                REFRESH
              </Button>
            </View>
          )}
        </View>
      </Card>
    </View>
  );
};

const themedStyles = StyleSheet.create({
  logo: {
    width: 140,
    height: 32,
  },
  layout: {
    flex: 1,
  },
  text: {
    textAlign: 'center',
  },
  headerView: {
    flex: 2,
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'space-evenly',
  },
  widgetView: {
    marginBottom: 5,
  },
  pagerView: {
    flex: 1,
    marginBottom: 15,
  },
  card: {
    flex: 1,
    margin: 10,
    width: Dimensions.get('window').width - 20,
  },
  cardHeaderView: {
    flexDirection: 'row',
  },
  cardHeaderText: {
    marginVertical: 10,
    marginHorizontal: 15,
    flex: 1,
  },
  icon: {
    marginVertical: 10,
    marginHorizontal: 15,
    alignSelf: 'center',
    color: '#FFF',
  },
  dot: {
    backgroundColor: '#8F9BB3',
    opacity: 48,
  },
  activeDot: {
    backgroundColor: '#FFF',
    left: 3,
  },
  dotContainer: {
    bottom: 0,
  },
  flatlistContainer: {
    height: '92%',
  },
  flatlist: {
    width: '100%',
  },
  flatListContentContainer: {
    flexGrow: 1,
  },
  matchItem: {
    width: '100%',
  },
  emptyText: {
    alignSelf: 'center',
  },
  scrollViewContentContainer: {
    flex: 1,
  },
  emptyListTextContainer: {
    width: '100%',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },
  noAvailableText: {
    marginTop: 13,
  },
});
