import React from 'react';
import {StyleSheet, Image} from 'react-native';
import {Layout} from '@ui-kitten/components';
import {ApplyToDriveScreenProps} from '../../navigation/NavigatorTypes';
import {ScrollView} from 'react-native-gesture-handler';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';

export default function Complete({
  navigation: navigation,
}: ApplyToDriveScreenProps<'Complete'>): React.ReactElement {
  return (
    <Layout style={styles.container} level="3">
      <ScrollView>
        <Image
          style={styles.completeIcon}
          source={require('../../images/check.png')}
        />
        <Text style={[styles.text, styles.heading]} category="h5">
          Application Complete
        </Text>
        <Text style={styles.text} category="p1">
          Your application has been completed! Our team will be reviewing your
          application and if it looks good, you will receive a background check
          from Turn.
        </Text>
        <Text style={styles.text} category="p1">
          Once the background check comes back in line with our policy, you will
          be approved and able to get started on FRAYT.
        </Text>

        <Text style={styles.text} category="p1">
          You should expect to hear back from us in 1-2 weeks.
        </Text>

        <Text style={styles.text} category="p1">
          Thank you!
        </Text>
        <Text style={styles.text} category="p1">
          - The FRAYT Team
        </Text>
        <Button
          style={styles.started}
          onPress={() =>
            navigation.navigate('Auth', {
              screen: 'Approval',
            })
          }>
          Finish
        </Button>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 15,
  },
  started: {
    marginTop: 20,
    width: '100%',
  },
  heading: {
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 15,
  },
  text: {
    marginBottom: 15,
  },
  completeIcon: {
    width: 70,
    height: 70,
    marginTop: 60,
    marginBottom: 15,
    alignSelf: 'center',
  },
});
