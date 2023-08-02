import {
  Divider as UIKittenDivider,
  DividerProps,
  useStyleSheet,
} from '@ui-kitten/components';
import {ReactElement} from 'react';
import {StyleSheet} from 'react-native';

/**
 * Divider component, wraps and returns a UI Kitten Divider component. Setting anything in mapping breaks the divider in
 * the Card component. This allows us to customize the default divider outside mapping. Currently
 * only background color is overridden
 * @param props {@link DividerProps} props to pass down to underlying UI Kitten Divider
 * @returns - {@link UIKittenDivider}
 */
export const DividerGray = (
  props: DividerProps,
): ReactElement<UIKittenDivider> => {
  const styles = useStyleSheet(themedStyles);

  return <UIKittenDivider {...props} style={[props.style, styles.divider]} />;
};

const themedStyles = StyleSheet.create({
  divider: {
    width: '100%',
    backgroundColor: 'color-basic-700',
  },
});
