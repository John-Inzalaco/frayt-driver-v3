import {getRecentlyNotifiedMatches, TotalPaymentsResult} from '@frayt/sdk';
import {Card, useStyleSheet, useTheme} from '@ui-kitten/components';
import {Alert, Dimensions, Platform, StyleSheet, View} from 'react-native';
import {Text} from '../ui-kitten/Text';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';
import {BarChart} from 'react-native-chart-kit';
import {useEffect, useState} from 'react';
import {useToken} from '../../lib/TokenHelper';
import {pastWeekdays} from '../../lib/Utils';

export default function MatchAvailabilityCard() {
  const theme = useTheme();
  const {token} = useToken();
  const [today] = useState(new Date());
  const [notifiedMatches, setNotifiedMatches] =
    useState<TotalPaymentsResult[]>();
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const styles = useStyleSheet(themedStyles);

  useEffect(() => {
    getRecentlyNotifiedMatches(token ?? '', 7)
      .then(result => {
        setNotifiedMatches(result);
      })
      .catch(reason => Alert.alert('Error loading match availability', reason));
  }, []);

  useEffect(() => {
    setChartData(getData());
  }, [notifiedMatches]);

  const getLabels = () => pastWeekdays(today.getDay(), 'shortname') as string[];

  const getData = (): number[] => {
    if (!notifiedMatches) return [0, 0, 0, 0, 0, 0, 0];
    const days = pastWeekdays(today.getDay(), 'fullname');
    const data = notifiedMatches;

    const notifiedMatchesData = days.map(day => {
      const filtered = data.filter(
        notifiedMatch => notifiedMatch.day_of_week_name == day,
      );
      const reduced = filtered.reduce(
        (total, notifiedMatch) => total + notifiedMatch.amount,
        0,
      );
      return reduced;
    });
    return notifiedMatchesData;
  };

  const data = {
    labels: getLabels(),
    datasets: [
      {
        data: chartData,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: () => theme['color-primary-500'],
    propsForBackgroundLines: {
      strokeDasharray: [0],
      stroke: theme['color-basic-1000'],
      x2: Dimensions.get('screen').width - 50,
      x: 40,
    },
    propsForVerticalLabels: {
      fill: '#A3A3A3',
    },
    propsForHorizontalLabels: {
      fill: '#A3A3A3',
    },
    decimalPlaces: 0,
  };

  return (
    <Card
      status="primary"
      style={styles.card}
      header={() => (
        <View style={{flexDirection: 'row'}}>
          <Text category="h6" style={styles.cardHeaderText}>
            Match Availability
          </Text>
          <FontAwesome5Pro
            name={'chart-pie'}
            style={styles.icon}
            solid
            size={18}
          />
        </View>
      )}>
      <View style={styles.cardBodyView}>
        <BarChart
          data={data}
          width={Dimensions.get('screen').width - 30}
          height={
            Dimensions.get('screen').height * 0.3 -
            (Platform.OS === 'ios' ? 90 : 70)
          }
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={chartConfig}
          style={styles.barchart}
        />
      </View>
    </Card>
  );
}

const themedStyles = StyleSheet.create({
  card: {
    marginHorizontal: 10,
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
    color: 'color-primary-100',
  },
  cardBodyView: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  barchart: {
    marginLeft: -50,
  },
});
