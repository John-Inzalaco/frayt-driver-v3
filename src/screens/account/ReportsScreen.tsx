import React from 'react';
import {StyleSheet} from 'react-native';
import {Layout, useStyleSheet} from '@ui-kitten/components';
import RevenueCard from '../../components/widgets/RevenueCard';
import MatchAvailabilityCard from '../../components/widgets/MatchAvailabilityCard';
import {DividerGray} from '../../components/ui-kitten/DividerGray';

export const ReportsScreen = (): React.ReactElement => {
  const styles = useStyleSheet(themedStyles);

  return (
    <Layout level="3" style={styles.container}>
      <RevenueCard />
      <DividerGray style={styles.divider} />
      <MatchAvailabilityCard />
    </Layout>
  );
};

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 26,
    paddingHorizontal: 10,
  },
  headerView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 11,
    marginHorizontal: 15,
  },
  cardBodyView: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  lineChart: {
    marginLeft: -48,
  },
  divider: {
    marginVertical: 15,
  },
});
