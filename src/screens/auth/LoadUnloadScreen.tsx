import React, {useState} from 'react';
import {Alert, StyleSheet} from 'react-native';
import {
  Layout,
  useStyleSheet,
  Radio,
  RadioGroup,
  Text,
} from '@ui-kitten/components';
import {AuthStackProps} from '../../navigation/NavigatorTypes';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {logoutUser, selectToken, updateLoadUnload} from '../../slices/user';
import {useLoginHelper} from '../../lib/LoginHelper';
import {DividerGray} from '../../components/ui-kitten/DividerGray';
import {Button} from '../../components/ui-kitten/Button';

export default function ({
  navigation,
  route: _route,
}: AuthStackProps<'LoadUnloadScreen'>): React.ReactElement {
  const styles = useStyleSheet(themedStyles);
  const dispatch = useAppDispatch();
  const {getAuthRoute} = useLoginHelper();
  const token = useAppSelector(selectToken);

  const [canLoad, setCanLoad] = useState<boolean>(false);

  const handleContinue = async () => {
    try {
      if (!token) throw new Error('Missing user token');

      const userData = await dispatch(
        updateLoadUnload({canLoad, token}),
      ).unwrap();

      if (userData) {
        const {route, screen} = await getAuthRoute();
        if (route === 'Home') {
          return navigation.navigate(route, {screen: screen});
        }
        navigation.navigate(route, {screen: screen});
      }
    } catch (error) {
      if (typeof error === 'string') {
        Alert.alert('Submission Error', error);
      } else if (error instanceof Error) {
        Alert.alert('Submission Error', error.message);
      }
    }
  };

  const handleChange = (index: number) => {
    setCanLoad(index == 0 ? true : false);
  };

  const handleLogout = async () => {
    const {token} = await dispatch(logoutUser()).unwrap();
    if (!token) {
      navigation.navigate('Auth', {screen: 'Login'});
    }
  };

  return (
    <Layout level="3" style={styles.container}>
      <Text category="h4" style={[styles.heading, styles.space]}>
        Load/Unload
      </Text>
      <Text category="p1" style={styles.space}>
        Are you willing to load and unload your vehicle by hand?
      </Text>
      <RadioGroup
        selectedIndex={canLoad == true ? 0 : 1}
        onChange={index => handleChange(index)}
        style={styles.space}>
        <Radio>Yes, I will load and unload</Radio>
        <Radio>No, I won't load or unload</Radio>
      </RadioGroup>
      <Button onPress={handleContinue} style={styles.space}>
        CONTINUE
      </Button>
      <DividerGray style={styles.space} />
      <Button status="danger" onPress={handleLogout}>
        SIGN OUT
      </Button>
    </Layout>
  );
}

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  heading: {
    marginTop: 15,
    alignSelf: 'center',
  },
  space: {
    marginBottom: 15,
  },
});
