import React from 'react';
import {Linking, TouchableOpacity, StyleSheet} from 'react-native';
import {CheckBox, useStyleSheet} from '@ui-kitten/components';
import {Text} from './ui-kitten/Text';
import {AgreementDocument} from '@frayt/sdk';

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
  agreement: AgreementDocument;
};
export const AgreementInput = ({
  value,
  onChange,
  agreement,
}: Props): React.ReactElement => {
  const styles = useStyleSheet(themeStyles);
  const {title, url} = agreement;
  return (
    <>
      <TouchableOpacity
        onPress={() => Linking.openURL(url)}
        style={styles.space}>
        <Text style={styles.link}>{title}</Text>
      </TouchableOpacity>
      <CheckBox onChange={onChange} checked={value} style={styles.space}>
        {evaProps => (
          <Text {...evaProps} category="label">
            I agree to {title}
          </Text>
        )}
      </CheckBox>
    </>
  );
};

const themeStyles = StyleSheet.create({
  space: {
    marginBottom: 15,
  },
  link: {
    color: 'color-primary-500',
  },
});
