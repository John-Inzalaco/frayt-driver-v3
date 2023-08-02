import {View, StyleSheet} from 'react-native';

import {Marker} from 'react-native-maps';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';

import moment from 'moment';
import {Text} from '../ui-kitten/Text';
import {useStyleSheet, useTheme} from '@ui-kitten/components';
import {Coordinates} from './MapHelper';
import {useEffect} from 'react';

type Props = {
  coordinate: Coordinates | null;
  label?: string | number;
  icon?: string;
  callout?: JSX.Element;
};

const MapMarker = ({coordinate, callout, label, icon}: Props) => {
  const theme = useTheme();
  const styles = useStyleSheet(themedStyles);

  useEffect(() => {
    if (!coordinate) console.warn('Missing coordinates in MapMarker');
  }, [coordinate]);

  const renderMarker = () => {
    if (!coordinate) return <></>;
    return (
      <Marker
        key={`${moment().unix()}`}
        coordinate={coordinate}
        tracksViewChanges={false}
        centerOffset={{x: 0, y: -44 / 2}}>
        <View style={styles.markerShadow}></View>
        <View style={styles.markerBorder}>
          <View style={styles.marker}>
            {label ? (
              <Text style={styles.markerLabel}>{label}</Text>
            ) : (
              icon && (
                <FontAwesome5Pro
                  name={icon}
                  color={theme['color-primary-800']}
                />
              )
            )}
          </View>
        </View>
        <View style={styles.markerCaret}></View>
        {callout}
      </Marker>
    );
  };

  return renderMarker();
};

export default MapMarker;

const themedStyles = StyleSheet.create({
  markerShadow: {
    shadowColor: '#000',
    shadowRadius: 3,
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 0},
    width: 32,
    height: 32,
    zIndex: 9,
    borderRadius: 16,
    backgroundColor: '#000',
    position: 'absolute',
  },
  marker: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerBorder: {
    padding: 0,
    borderRadius: 16,
    borderWidth: 4,
    width: 32,
    height: 32,
    overflow: 'hidden',
    borderColor: '#0066ff',
    zIndex: 11,
  },
  markerLabel: {
    color: '#0066ff',
    fontWeight: 'bold',
  },
  markerCaret: {
    left: 7,
    top: -3,
    width: 0,
    height: 0,
    zIndex: 10,
    borderTopWidth: 12,
    borderRightWidth: 9,
    borderBottomWidth: 0,
    borderLeftWidth: 9,
    borderColor: 'transparent',
    borderTopColor: '#0066ff',
  },
});
