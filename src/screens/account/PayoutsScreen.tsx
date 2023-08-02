import React, {useEffect, useState, useCallback} from 'react';
import {Layout, useStyleSheet} from '@ui-kitten/components';
import {StyleSheet, View, ScrollView} from 'react-native';
import {Text} from '../../components/ui-kitten/Text';
import BranchLogoSVG from '../../images/BranchLogoSVG';
import {DividerGray} from '../../components/ui-kitten/DividerGray';
import {getMatchPayments, type MatchPaymentsResult} from '@frayt/sdk';
import moment from 'moment';
import {useToken} from '../../lib/TokenHelper';

export const PayoutsScreen = (): React.ReactElement => {
  const styles = useStyleSheet(themedStyles);
  const {token: token} = useToken();
  const [paymentHistory, setPaymentHistory] = useState<MatchPaymentsResult[]>(
    [],
  );

  useEffect(() => {
    const getHistory = async () => {
      const result = await getMatchPayments(1000, token ?? '');
      setPaymentHistory(result);
    };

    getHistory();
  }, []);

  const currencyFormatter = useCallback((amount: number) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    return formatter.format(amount / 100);
  }, []);

  const renderPayouts = () => {
    if (paymentHistory && paymentHistory.length > 0) {
      const payouts = paymentHistory.map(payment => (
        <View style={styles.payoutView}>
          <View>
            <Text category="s1">PAYOUT #{payment.match.shortcode}</Text>
          </View>
          <View>
            <Text>{moment(payment.date).format('MM/DD/YYYY')}</Text>
            <Text>{currencyFormatter(payment.amount)}</Text>
          </View>
        </View>
      ));

      return payouts;
    } else {
      return <Text>No payout history available.</Text>;
    }
  };

  return (
    <Layout level="3" style={styles.container}>
      <View style={styles.SVGView}>
        <BranchLogoSVG />
      </View>
      <Text category="p1">
        Payouts are handled through our payment partner, Branch. If you need to
        make any changes to your payouts, you can do so in the{' '}
        <Text category="s1">Branch app</Text>.
      </Text>
      <DividerGray style={styles.divider} />
      <Text category="h4">Payout History</Text>
      <ScrollView>{renderPayouts()}</ScrollView>
    </Layout>
  );
};

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 26,
    paddingHorizontal: 10,
  },
  SVGView: {
    alignItems: 'center',
    marginBottom: 15,
  },
  divider: {
    marginVertical: 15,
  },
  payoutView: {
    height: 86,
    marginTop: 15,
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 4,
    backgroundColor: 'color-basic-700',
  },
});
