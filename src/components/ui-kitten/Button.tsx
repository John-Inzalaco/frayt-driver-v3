import {
  Button as UIKittenButton,
  ButtonProps,
  Text,
} from '@ui-kitten/components';
import {Platform} from 'react-native';

/**
 * Button component to fix the font weight issue on Android.
 * It will use the correct bold font, as all Button text will be bold regardless of category.
 * On iOS, it does nothing but return the UI Kitten component
 * @param props - {@link ButtonProps} props to pass down to the underlying UIKitten Button component
 * @returns - {@link UIKittenButton}
 */
export const Button = (props: ButtonProps) => {
  if (Platform.OS !== 'android' || typeof props.children !== 'string')
    return <UIKittenButton {...props} />;

  const children = props.children;
  delete props.children;

  return (
    <UIKittenButton {...props}>
      {evaProps => (
        <Text
          {...evaProps}
          style={[
            evaProps?.style,
            {fontWeight: 'normal', fontFamily: 'Poppins-Bold'},
          ]}>
          {children}
        </Text>
      )}
    </UIKittenButton>
  );
};
