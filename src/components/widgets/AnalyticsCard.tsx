import {useState, useEffect, useCallback} from 'react';
import {
  getTotalPayments,
  getRecentlyNotifiedMatches,
  TotalPaymentsResult,
  RecentlyNotifiedMatchesResult,
} from '@frayt/sdk';
import {Card, useStyleSheet} from '@ui-kitten/components';
import {StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {selectToken} from '../../slices/user';
import {Text} from '../ui-kitten/Text';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';
import moment from 'moment';

export default function AnalyticsCard() {
  const styles = useStyleSheet(themedStyles);

  const token = useSelector(selectToken);

  const [increase, setIncrease] = useState(0);
  const [weekRevenue, setWeekRevenue] = useState(0);
  const [weekMatches, setWeekMatches] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [monthMatches, setMonthMatches] = useState(0);

  const getTotalAmounts = useCallback(
    (data: Array<TotalPaymentsResult | RecentlyNotifiedMatchesResult>) => {
      return data.reduce((acc, each) => acc + each.amount, 0);
    },
    [],
  );

  const currencyFormatter = useCallback((amount: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    return formatter.format(amount / 100);
  }, []);

  useEffect(() => {
    const getAnalytics = async () => {
      if (token) {
        const [
          weekRevenueData,
          weekMatchesData,
          monthRevenueData,
          monthMatchesData,
          twoMonthsRevenueData,
        ] = await Promise.all([
          getTotalPayments(token, 'day', 7),
          getRecentlyNotifiedMatches(token, 7),
          getTotalPayments(token, 'month', 1),
          getRecentlyNotifiedMatches(
            token,
            moment().subtract(1, 'months').daysInMonth(),
          ),
          getTotalPayments(token, 'month', 2),
        ]);
        setWeekRevenue(getTotalAmounts(weekRevenueData));
        setWeekMatches(getTotalAmounts(weekMatchesData));
        setMonthRevenue(() => {
          const result = getTotalAmounts(monthRevenueData);
          setIncrease(
            Math.round(
              (result / (getTotalAmounts(twoMonthsRevenueData) - result) - 1) *
                100,
            ),
          );
          return result;
        });
        setMonthMatches(getTotalAmounts(monthMatchesData));
      }
    };

    getAnalytics();
  }, []);

  return (
    <Card
      status="primary"
      style={styles.card}
      header={() => (
        <View style={{flexDirection: 'row'}}>
          <Text category="h6" style={styles.cardHeaderText}>
            Analytics
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
        <View style={styles.percentageView}>
          <Text style={styles.positivePercent} category="p1">
            {increase && !Number.isNaN(increase) ? increase : '--'}%
          </Text>
          <Text category="p1"> over last month</Text>
        </View>
        <View style={styles.cardInfoView}>
          <View style={styles.cardInfoComponentView}>
            <Text category="label">WEEK REVENUE</Text>
            <Text category="p2">{currencyFormatter(weekRevenue)}</Text>
          </View>
          <View style={styles.cardInfoComponentView}>
            <Text category="label">WEEK MATCHES</Text>
            <Text category="p2">{currencyFormatter(weekMatches)}</Text>
          </View>
          <View style={styles.cardInfoComponentView}>
            <Text category="label">MONTH REVENUE</Text>
            <Text category="p2">{currencyFormatter(monthRevenue)}</Text>
          </View>
          <View style={styles.cardInfoComponentView}>
            <Text category="label">MONTH MATCHES</Text>
            <Text category="p2">{currencyFormatter(monthMatches)}</Text>
          </View>
        </View>
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
  positivePercent: {
    color: 'color-success-500',
  },
  cardBodyView: {
    alignSelf: 'center',
    paddingHorizontal: 15,
  },
  percentageView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  cardInfoView: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  cardInfoComponentView: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '50%',
    marginVertical: 15,
  },
});
