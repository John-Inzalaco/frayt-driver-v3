import {useTheme} from '@ui-kitten/components';
import {
  Svg,
  Defs,
  LinearGradient,
  Stop,
  Rect,
  SvgProps,
} from 'react-native-svg';

export function TopFader(props: SvgProps) {
  const theme = useTheme();
  const fadersColor = theme['color-basic-1000'];

  return (
    <Svg {...props}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={fadersColor} stopOpacity="1" />
          <Stop offset="1" stopColor={fadersColor} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Rect width={props.width} height={props.height} fill="url(#grad)" />
    </Svg>
  );
}

export function BottomFader(props: SvgProps) {
  const theme = useTheme();
  const fadersColor = theme['color-basic-1000'];

  return (
    <Svg {...props}>
      <Defs>
        <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={fadersColor} stopOpacity="0" />
          <Stop offset="1" stopColor={fadersColor} stopOpacity="1" />
        </LinearGradient>
      </Defs>
      <Rect width={props.width} height={props.height} fill="url(#grad)" />
    </Svg>
  );
}
