import React from 'react';
import {
  Layout,
  Menu,
  MenuItem,
  IndexPath,
  useStyleSheet,
} from '@ui-kitten/components';
import {StyleSheet, View, Linking} from 'react-native';
import {Text} from '../../components/ui-kitten/Text';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';
import {Button} from '../../components/ui-kitten/Button';
import {DividerGray} from '../../components/ui-kitten/DividerGray';
import Intercom from '@intercom/intercom-react-native';

const ICON_SIZE = 15;
const ICON_CONTAINER_WIDTH = 24;

export const SupportScreen = (): React.ReactElement => {
  const styles = useStyleSheet(themedStyles);
  const [selectedIndex, setSelectedIndex] = React.useState(new IndexPath(0));

  const openChat = () => {
    Intercom.present();
  };

  return (
    <Layout level="3" style={styles.container}>
      <Layout level="2" style={styles.chatLayout}>
        <View style={styles.chatView}>
          <Text category="h5" style={styles.chatHeaderText}>
            <FontAwesome5Pro name="ticket-alt" size={22} solid /> Chat
          </Text>
          <Text category="p2">
            Our chatbot is available 24/7. For issues with live orders, you can
            get support anytime during regular business hours.
          </Text>
          <DividerGray style={styles.chatDivider} />
          <Button onPress={openChat}>GET HELP</Button>
        </View>
      </Layout>
      <DividerGray />
      <Text category="h4">Resources</Text>
      <View>
        <Menu
          selectedIndex={selectedIndex}
          onSelect={index => setSelectedIndex(index)}>
          <MenuItem
            title="Driver's Guide"
            onPress={() => Linking.openURL('https://www.frayt.com/guide/')}
            accessoryLeft={evaProps => {
              return (
                <View
                  style={{
                    width: ICON_CONTAINER_WIDTH,
                    alignItems: 'center',
                    marginHorizontal: evaProps?.style?.marginHorizontal,
                  }}>
                  <FontAwesome5Pro
                    name="book-open"
                    solid
                    size={ICON_SIZE}
                    color={evaProps?.style?.tintColor}
                  />
                </View>
              );
            }}
          />
          <MenuItem
            title="Frequently Asked Questions"
            onPress={() => Linking.openURL('https://www.frayt.com/driver-faq/')}
            accessoryLeft={evaProps => {
              return (
                <View
                  style={{
                    width: ICON_CONTAINER_WIDTH,
                    alignItems: 'center',
                    marginHorizontal: evaProps?.style?.marginHorizontal,
                  }}>
                  <FontAwesome5Pro
                    name="question-circle"
                    solid
                    size={ICON_SIZE}
                    color={evaProps?.style?.tintColor}
                  />
                </View>
              );
            }}
          />
          <MenuItem
            title="Driver Agreement"
            onPress={() =>
              Linking.openURL(
                'https://api.frayt.com/files/agreements/accbdb3a-37e3-453f-94aa-ce9ec03c9740',
              )
            }
            accessoryLeft={evaProps => {
              return (
                <View
                  style={{
                    width: ICON_CONTAINER_WIDTH,
                    alignItems: 'center',
                    marginHorizontal: evaProps?.style?.marginHorizontal,
                  }}>
                  <FontAwesome5Pro
                    name="shield"
                    solid
                    size={ICON_SIZE}
                    color={evaProps?.style?.tintColor}
                  />
                </View>
              );
            }}
          />
          <MenuItem
            title="End User License Agreement"
            onPress={() =>
              Linking.openURL(
                'http://www.frayt.com/end-user-license-agreement/',
              )
            }
            accessoryLeft={evaProps => {
              return (
                <View
                  style={{
                    width: ICON_CONTAINER_WIDTH,
                    alignItems: 'center',
                    marginHorizontal: evaProps?.style?.marginHorizontal,
                  }}>
                  <FontAwesome5Pro
                    name="file"
                    solid
                    size={ICON_SIZE}
                    color={evaProps?.style?.tintColor}
                  />
                </View>
              );
            }}
          />
          <MenuItem
            title="Privacy Policy"
            onPress={() =>
              Linking.openURL('https://www.frayt.com/privacy-policy/')
            }
            accessoryLeft={evaProps => {
              return (
                <View
                  style={{
                    width: ICON_CONTAINER_WIDTH,
                    alignItems: 'center',
                    marginHorizontal: evaProps?.style?.marginHorizontal,
                  }}>
                  <FontAwesome5Pro
                    name="eye"
                    solid
                    size={ICON_SIZE}
                    color={evaProps?.style?.tintColor}
                  />
                </View>
              );
            }}
          />
        </Menu>
      </View>
    </Layout>
  );
};

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 26,
    paddingBottom: 14,
  },
  chatLayout: {
    height: 218,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatView: {
    width: 310,
  },
  chatHeaderText: {
    marginBottom: 10,
    alignSelf: 'center',
  },
  chatDivider: {
    marginVertical: 10,
  },
});
