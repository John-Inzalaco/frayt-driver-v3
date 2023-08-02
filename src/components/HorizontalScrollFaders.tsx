import {useTheme} from '@ui-kitten/components';
import {
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  SvgProps,
} from 'react-native-svg';

export function LeftFader(props: SvgProps) {
  const theme = useTheme();
  const fadersColor = theme['color-basic-1000'];

  return (
    <Svg width={props.width} height={props.height} style={props.style}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={fadersColor} stopOpacity="1" />
          <Stop offset="1" stopColor={fadersColor} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect width={props.width} height={props.height} fill="url(#grad)" />
    </Svg>
  );
}

export function RightFader(props: SvgProps) {
  const theme = useTheme();
  const fadersColor = theme['color-basic-1000'];

  return (
    <Svg width={props.width} height={props.height} style={props.style}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor={fadersColor} stopOpacity="0" />
          <Stop offset="1" stopColor={fadersColor} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width={props.width} height={props.height} fill="url(#grad)" />
    </Svg>
  );
}
