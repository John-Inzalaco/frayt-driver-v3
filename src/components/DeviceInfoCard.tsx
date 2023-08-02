import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Layout, useStyleSheet} from '@ui-kitten/components';
import {Text} from './ui-kitten/Text';

type DeviceInfoCardProps = {
  id: string;
  device_model: string;
  os: string;
  os_version: string;
};

export function DeviceInfoCard({
  id,
  device_model,
  os,
  os_version,
}: DeviceInfoCardProps) {
  const styles = useStyleSheet(themedStyles);

  return (
    <Layout level="2" style={styles.deviceInfo}>
      <View style={styles.deviceID}>
        <Text category="label">Device ID</Text>
        <Text category="p1">{id}</Text>
      </View>
      <View style={styles.deviceOther}>
        <Text category="label">Phone</Text>
        <Text category="p1">{device_model}</Text>
      </View>
      <View style={styles.deviceOther}>
        <Text category="label">OS</Text>
        <Text category="p1">{`${os} ${os_version}`}</Text>
      </View>
    </Layout>
  );
}

const themedStyles = StyleSheet.create({
  deviceInfo: {
    width: '100%',
    borderLeftWidth: 2,
    marginBottom: 15,
    paddingLeft: 11,
    paddingVertical: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderColor: 'color-primary-500',
  },
  deviceID: {
    width: '100%',
    marginBottom: 12,
  },
  deviceOther: {
    width: '50%',
  },
});
