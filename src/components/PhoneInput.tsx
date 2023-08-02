import React from 'react';
import {TextInput, TextStyle} from 'react-native';
import RNPhoneInput from 'react-native-phone-input';
import PhoneInputTextField from './PhoneInputTextField';

type State = {
  phoneNumber: string | null;
  error: string | null;
  component: typeof TextInput | null;
};

type Props = {
  phoneNumber: string | null;
  onChange?: (value: string, error: string | null) => void;
  onBlur?: (value: string, error: string | null) => void;
  style?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
};

export default class PhoneInput extends React.Component<Props, State> {
  phoneNumberRef = React.createRef<RNPhoneInput>();

  constructor(props: Props) {
    super(props);
    const {phoneNumber, inputStyle} = this.props;

    const component = PhoneInputTextField({
      inputStyle,
      onBlur: _e => {
        this.handleBlur();
      },
    }) as unknown as typeof TextInput;

    this.state = {
      phoneNumber: this.sanitizePhone(phoneNumber),
      error: null,
      component: component,
    };

    this.handleChange = this.handleChange.bind(this);
  }

  sanitizePhone = (phone_number: string | null) => {
    return phone_number ? phone_number.replace(/[^\d+]/g, '') : '';
  };

  isValid() {
    const input = this.phoneNumberRef.current;
    if (!input) return;
    const isValid = input.isValidNumber(),
      type = input.getNumberType();

    return isValid && type !== 'FIXED_LINE';
  }

  async handleBlur() {
    const {onBlur} = this.props;
    const result = await this.validate();

    if (!result) return;
    onBlur && onBlur(result.phoneNumber, result.error);
  }

  async validate() {
    const input = this.phoneNumberRef.current;
    if (!input) return;

    const phoneNumber = this.sanitizePhone(input.getValue()),
      isValid = input.isValidNumber(),
      type = input.getNumberType();

    let error = null;

    if (!isValid) {
      error = 'Not a valid phone number';
    } else if (type === 'FIXED_LINE') {
      error = 'Cannot be a landline';
    }

    await this.setState({
      phoneNumber,
      error,
    });

    return {phoneNumber, error};
  }

  async handleChange() {
    const {onChange} = this.props;

    const result = await this.validate();
    if (!result) return;

    onChange && onChange(result.phoneNumber, result.error);
  }

  render() {
    const {component} = this.state;

    return (
      <RNPhoneInput
        ref={this.phoneNumberRef}
        textComponent={component ?? undefined}
        onChangePhoneNumber={() => this.handleChange()}
        onSelectCountry={() => this.handleChange()}
        initialCountry="us"
      />
    );
  }
}
