import {Layout} from '@ui-kitten/components';
import {Platform, StyleSheet, View} from 'react-native';
import {Button} from '../ui-kitten/Button';
import {Text} from '../ui-kitten/Text';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import {Match} from '@frayt/sdk';
import {Moment} from 'moment';
import {useTheme} from '@ui-kitten/components';

type MatchListItemProps = {
  index: number;
  match: Match;
  type: 'Available' | 'Accepted' | 'Completed';
  navigation: any;
  detail: boolean;
  driverId: string | undefined;
};

export default function MatchListItem({
  index,
  match,
  type = 'Available',
  navigation,
  detail,
  driverId,
}: MatchListItemProps): JSX.Element {
  const theme = useTheme();
  const destination = match.getDestinationAddress();
  const isPreferredDriver = match.isPreferredDriver(driverId);

  const getPickupTime = (pickup_at: string | Moment | null): string => {
    if (pickup_at) {
      return typeof pickup_at === 'string'
        ? pickup_at
        : pickup_at.format('MMMM D, h:mm A z') +
            ' (' +
            pickup_at.fromNow() +
            ')';
    } else {
      return 'Now';
    }
  };

  if (type === 'Completed') type = 'Accepted';

  return (
    <Layout
      style={[
        styles.container,
        {
          backgroundColor:
            theme[index % 2 ? 'color-basic-900' : 'color-basic-800'],
          paddingTop: Platform.OS === 'ios' ? undefined : 5,
        },
      ]}>
      <View>
        {type === 'Available' && isPreferredDriver && (
          <View style={styles.preferredContainer}>
            <Text style={styles.preferredTitle}>Preferred Driver</Text>
          </View>
        )}
        <Text category="s1" style={styles.space}>
          {`${match.origin_address?.city}, ${match.origin_address?.state_code} > ${destination.city}, ${destination.state_code}`}
        </Text>
        <View style={[styles.matchDetailView, styles.space]}>
          <Text category="p2" style={styles.matchDetailText}>
            ${match.driver_total_pay.toFixed(2)}
          </Text>
          <Text category="p2" style={styles.matchDetailText}>
            <Icon name="map-marker-alt" />
            {` ${match.distance} mi`}
          </Text>
          <Text category="p2" style={styles.matchDetailText}>
            <Icon name="weight-hanging" /> {`${match.total_weight} lbs`}
          </Text>
          <Text category="p2" style={styles.matchDetailText}>
            <Icon name="clock" />{' '}
            {match.service_level === 2 ? 'Same Day' : 'Dash'}
          </Text>
        </View>
        {detail && (
          <View style={styles.matchDetailView}>
            <Text category="p2" style={styles.matchDetailText}>
              <Icon name="car-alt" /> {match.vehicle_class}
            </Text>
            <Text category="p2" style={styles.matchDetailText}>
              <Icon name="calendar-alt" /> {getPickupTime(match.pickup_at)}
            </Text>
          </View>
        )}
      </View>
      <Button
        size="small"
        testID="MatchListItem.AvailableButton"
        onPress={() =>
          navigation.navigate(type, {
            matchId: match.id,
            isPreferredDriver,
          })
        }
        accessoryLeft={props => (
          <Icon
            name="chevron-right"
            size={12}
            color={props.style.tintColor}
            solid
          />
        )}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 13,
  },
  space: {
    marginBottom: 8,
  },
  matchDetailView: {
    flexDirection: 'row',
  },
  matchDetailText: {
    marginRight: 10,
  },
  preferredContainer: {
    backgroundColor: '#0066FF',
    width: 110,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  preferredTitle: {
    fontSize: 12,
  },
});
