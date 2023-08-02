import {StyleProp} from 'react-native';
import {ImageProps} from 'react-native-svg';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';

type EvaImageProps = Partial<ImageProps> & {style: StyleProp<TextProps>};

export const FontAwesome5ProEva = ({
  eva,
  name,
}: {
  eva: Partial<EvaImageProps> | undefined;
  name: string;
}) => {
  if (!eva || !eva.style) {
    return <FontAwesome5Pro name={name} />;
  }
  const color = eva.style.tintColor;
  const margin = eva.style.marginHorizontal;
  return (
    <FontAwesome5Pro
      style={{color: color, marginHorizontal: margin}}
      name={name}
    />
  );
};
