import React from 'react';
import {StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';
import {Input, Layout, useStyleSheet} from '@ui-kitten/components';
import {Text} from '../../components/ui-kitten/Text';
import {selectDriver} from '../../slices/user';

export const VehicleScreen = (): React.ReactElement => {
  const user = useSelector(selectDriver);
  const styles = useStyleSheet(themedStyles);

  return (
    <Layout level="3" style={styles.container}>
      <Input
        label="VEHICLE MAKE"
        value={user?.vehicle?.vehicle_make}
        style={styles.input}
        disabled
      />
      <Input
        label="VEHICLE MODEL"
        value={user?.vehicle?.vehicle_model}
        style={styles.input}
        disabled
      />
      <Input
        label="VEHICLE YEAR"
        value={user?.vehicle?.vehicle_year.toString()}
        style={styles.input}
        disabled
      />
      <Text category="p1">
        To update to a new vehicle or make a change, please reach out to our
        support team.
      </Text>
    </Layout>
  );
};

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 26,
    paddingHorizontal: 10,
  },
  input: {
    marginBottom: 15,
  },
});
