import {Card, useStyleSheet, useTheme} from '@ui-kitten/components';
import {Alert, Dimensions, StyleSheet, View, Platform} from 'react-native';
import {Text} from '../ui-kitten/Text';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';
import {getTotalPayments, type TotalPaymentsResult} from '@frayt/sdk';
import {LineChart} from 'react-native-chart-kit';
import {useEffect, useState} from 'react';
import {useToken} from '../../lib/TokenHelper';
import {pastWeekdays} from '../../lib/Utils';

const Settings = {
  PaymentRangeType: 'day',
  PaymentRange: 7,
} as const;

export default function RevenueCard() {
  const theme = useTheme();
  const {token} = useToken();
  const [today] = useState(new Date());
  const [payments, setPayments] = useState<TotalPaymentsResult[]>();
  const [chartData, setChartData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const styles = useStyleSheet(themedStyles);

  useEffect(() => {
    getTotalPayments(
      token ?? '',
      Settings.PaymentRangeType,
      Settings.PaymentRange,
    )
      .then(result => setPayments(result))
      .catch(reason => Alert.alert('Error loading payments', reason));
  }, []);

  useEffect(() => {
    const paymentInDollars: number[] =
      getData()?.map((payment: number) => {
        return payment / 100;
      }) || chartData;
    setChartData(paymentInDollars);
  }, [payments]);

  const getLabels = () => pastWeekdays(today.getDay(), 'shortname') as string[];

  const getData = (): number[] => {
    if (!payments) return [0, 0, 0, 0, 0, 0, 0];
    const days = pastWeekdays(today.getDay(), 'number');
    const data = payments;
    return days.map(day =>
      data
        ?.filter(payment => payment.day_of_week == day)
        .reduce((total, payment) => total + payment.amount, 0),
    );
  };

  return (
    <Card
      status="primary"
      style={styles.card}
      header={() => (
        <View style={{flexDirection: 'row'}}>
          <Text category="h6" style={styles.cardHeaderText}>
            Weekly Revenue
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
        <LineChart
          data={{
            labels: getLabels(),
            datasets: [
              {
                data: chartData,
              },
            ],
          }}
          height={
            Dimensions.get('screen').height * 0.3 -
            (Platform.OS === 'ios' ? 90 : 70)
          }
          width={Dimensions.get('screen').width}
          chartConfig={{
            backgroundGradientFromOpacity: 0,
            backgroundGradientToOpacity: 0,
            color: () => theme['color-primary-500'],
            propsForBackgroundLines: {
              strokeDasharray: [0],
              stroke: theme['color-basic-1000'],
              x2: Dimensions.get('screen').width - 30,
            },
            propsForVerticalLabels: {
              fill: '#A3A3A3',
            },
            propsForHorizontalLabels: {
              fill: '#A3A3A3',
            },
            decimalPlaces: 2,
          }}
          withShadow={false}
          fromZero={true}
          withVerticalLines={false}
          segments={3}
          bezier
          yLabelsOffset={10}
          style={styles.lineChart}
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
  lineChart: {
    marginLeft: -15,
  },
});
