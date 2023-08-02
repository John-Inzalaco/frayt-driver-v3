import {Text as UIKittenText, TextProps} from '@ui-kitten/components';
import {ReactElement} from 'react';
import {Platform, StyleSheet} from 'react-native';
import {getFontFamily} from './category-mapping';

/**
 * Text component to fix the font weight issue on Android.
 * It will find the correct font weight according to category prop on Android.
 * On iOS, it does nothing but return the UI Kitten component
 * @param props - {@link TextProps} props to pass down to the underlying UIKitten Text component
 * @returns - {@link UIKittenText}
 */
export const Text = (props: TextProps): ReactElement<Text> => {
  if (Platform.OS === 'ios') return <UIKittenText {...props} />;

  return (
    <UIKittenText {...props} style={[props.style, styles(props).android]} />
  );
};

const styles = (props: TextProps) =>
  StyleSheet.create({
    android: {
      fontWeight: 'normal',
      fontFamily: getFontFamily(props.category),
    },
  });
