import {Input} from '@ui-kitten/components';
import React from 'react';
import {
  NativeSyntheticEvent,
  TextInputProps,
  TextStyle,
  TextInputFocusEventData,
} from 'react-native';

type Props = {
  inputStyle?: TextStyle;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
};

export default function PhoneInputTextField({inputStyle, onBlur}: Props) {
  return (props: TextInputProps) => {
    return <Input {...props} onBlur={onBlur} style={inputStyle} />;
  };
}
