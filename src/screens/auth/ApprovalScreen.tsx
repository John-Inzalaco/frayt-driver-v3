import React from 'react';
import {Layout} from '@ui-kitten/components';
import {Image, StyleSheet} from 'react-native';
import {AuthStackProps} from '../../navigation/NavigatorTypes';
import {ApprovalContent} from '../../components/ApprovalContent';

export default function ApprovalScreen({
  navigation: _nav,
  route: _route,
}: AuthStackProps<'Approval'>): React.ReactElement {
  return (
    <Layout style={styles.container} level="3">
      <Image
        style={styles.logo}
        source={require('../../images/frayt-badge.png')}
      />
      <ApprovalContent />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logo: {
    alignSelf: 'center',
    width: 135,
    height: 160,
  },
});
