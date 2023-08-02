import * as React from 'react';
import {screen, fireEvent} from '@testing-library/react-native';
import {MarketPicker} from '../../../src/components/MarketPicker';
import {render} from '../../test-utils';
import {init} from '@frayt/sdk';
import {BASE_URL} from '../../../src/env';

// https://github.com/akveo/react-native-ui-kitten/blob/master/src/components/ui/select/select.spec.tsx#L41
// MarketPicker uses UI Kitten's Select under the hood, so we can reference their tests

jest.mock('react-native', () => {
  const ActualReactNative = jest.requireActual('react-native');

  ActualReactNative.UIManager.measureInWindow = (
    node: any,
    callback: (arg0: number, arg1: number, arg2: number, arg3: number) => void,
  ) => {
    callback(0, 0, 42, 42);
  };

  ActualReactNative.Animated = {
    ...ActualReactNative.Animated,
    timing: () => ({
      start: (callback: () => void) => {
        callback();
      },
    }),
  };

  return ActualReactNative;
});

const testMarkets = [
  {
    id: 'c41d8494-4a2f-4b37-a1ed-a427899400a7',
    name: 'Cincinnati, OH',
    region: 'OH',
  },
  {
    id: 'bc1833f0-0247-4713-ad65-a70dfeaeaf09',
    name: 'Fort Worth, TX',
    region: 'OH',
  },
];

describe('MarketPicker', () => {
  it('Can select', () => {
    init(BASE_URL);
    render(<MarketPicker onChange={v => v} testMarkets={testMarkets} />);

    fireEvent.press(screen.getByText('Select your state '));
    fireEvent.press(screen.getByText('OH'));
    fireEvent.press(screen.getByText('Select your market '));
    fireEvent.press(screen.getByText('Cincinnati, OH'));

    expect(screen.getByText('Cincinnati, OH')).toBeTruthy();
  });
});
