import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Text} from '@ui-kitten/components';

type ApplyToDriverHeaderProps = {
  title: string;
  step: string;
};

export const ApplyToDriverHeader = ({
  title,
  step,
}: ApplyToDriverHeaderProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.step}>{step}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: 103,
    backgroundColor: '#222B45',
    justifyContent: 'center',
    alignContent: 'center',
    paddingTop: 30,
  },
  title: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 24,
  },
  step: {
    color: '#8F9BB3',
    textAlign: 'center',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 3,
  },
});
