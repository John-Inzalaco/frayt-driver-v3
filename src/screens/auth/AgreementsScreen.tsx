import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Layout, useStyleSheet} from '@ui-kitten/components';
import {AuthStackProps} from '../../navigation/NavigatorTypes';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {
  selectDriver,
  selectToken,
  logoutUser,
  updateAgreementsList,
} from '../../slices/user';
import {useLoginHelper} from '../../lib/LoginHelper';
import {Text} from '../../components/ui-kitten/Text';
import {DividerGray} from '../../components/ui-kitten/DividerGray';
import {Button} from '../../components/ui-kitten/Button';
import {AgreementInput} from '../../components/AgreementInput';

export default function ({
  navigation,
}: AuthStackProps<'AgreementsScreen'>): React.ReactElement {
  const styles = useStyleSheet(themedStyles);
  const dispatch = useAppDispatch();
  const {getAuthRoute} = useLoginHelper();

  const driver = useAppSelector(selectDriver);
  const token = useAppSelector(selectToken);

  const [agreements, setAgreements] = useState<string[]>([]);

  const handleContinue = async () => {
    updateAgreements();
    setAgreements([]);
    const {route, screen} = await getAuthRoute();
    if (route === 'Home') return navigation.navigate(route, {screen: screen});
    navigation.navigate(route, {screen: screen});
  };

  const handleLogOut = async () => {
    const {token} = await dispatch(logoutUser()).unwrap();
    if (!token) {
      navigation.replace('Auth', {screen: 'Login'});
    }
  };

  const updateAgreements = async () => {
    if (token) await dispatch(updateAgreementsList({agreements, token}));
    else await handleLogOut();
  };

  return (
    <Layout level="3" style={styles.container}>
      <Text category="h4" style={[styles.heading, styles.space]}>
        Terms & Agreements
      </Text>
      <Text category="p1" style={styles.space}>
        You will need to agree to our most recent terms and conditions. Please
        read each one carefully by tapping the links below.
      </Text>
      <Text category="p1" style={styles.space}>
        If you do not agree, you can sign out.
      </Text>
      {driver?.pending_agreements.map(agreement => {
        const handleChange = (agreed: boolean) =>
          setAgreements(
            agreed
              ? [...agreements, agreement.id]
              : [...agreements].filter(
                  agreement_id => agreement_id != agreement.id,
                ),
          );

        return (
          <AgreementInput
            key={agreement.id}
            agreement={agreement}
            value={agreements.includes(agreement.id)}
            onChange={handleChange}
          />
        );
      })}
      <Button
        onPress={handleContinue}
        disabled={agreements.length !== driver?.pending_agreements.length}
        style={styles.space}>
        CONTINUE
      </Button>
      <DividerGray style={styles.space} />
      <Button status="danger" onPress={handleLogOut} style={styles.space}>
        SIGN OUT
      </Button>
    </Layout>
  );
}

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    marginTop: 25,
    alignSelf: 'center',
  },
  space: {
    marginBottom: 15,
  },
});
