import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import {Layout, Text, useStyleSheet} from '@ui-kitten/components';
import {AuthStackProps} from '../../navigation/NavigatorTypes';
import {useLoginHelper} from '../../lib/LoginHelper';

export default function PasswordUpdateScreen({
  navigation,
}: AuthStackProps<'PasswordUpdated'>) {
  const styles = useStyleSheet(themedStyles);

  const {getAuthRoute} = useLoginHelper();

  useEffect(() => {
    const maybeNavigate = async () => {
      const {route, screen} = await getAuthRoute();
      if (route === 'Home') navigation.navigate(route, {screen: screen});
      else navigation.navigate(route, {screen: screen});
    };
    setTimeout(() => {
      maybeNavigate();
    }, 2000);
  }, []);

  return (
    <>
      <Layout style={styles.container}>
        <View style={styles.baseView}>
          <Text category="h5" style={styles.header}>
            Password Updated
          </Text>
          <Text category="p1" style={styles.text}>
            We will log you in momentarily.
          </Text>
        </View>
      </Layout>
    </>
  );
}

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  baseView: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  header: {
    textAlign: 'center',
  },
  text: {
    marginTop: 15,
  },
});
