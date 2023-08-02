import {MatchStop} from '@frayt/sdk';
import {useTheme} from '@ui-kitten/components';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {Button} from '../ui-kitten/Button';
import {Text} from '../ui-kitten/Text';
import {useEffect, useState} from 'react';

interface StopListItemProps {
  stop: MatchStop;
  index: number;
  chosenStop: MatchStop | -1;
  stops: MatchStop[];
  chooseStopCallback?: (stop: MatchStop) => void;
}

export default function StopListItem({
  stop,
  index,
  stops,
  chosenStop,
  chooseStopCallback,
}: StopListItemProps): JSX.Element {
  const theme = useTheme();
  const [isChosenStop, setIsChosenStop] = useState(
    chosenStop !== -1 && chosenStop.index === index,
  );

  useEffect(() => {
    setIsChosenStop(chosenStop !== -1 && chosenStop.index === index);
  }, [stop, chosenStop]);

  return (
    <View
      key={index}
      style={[
        styles.stopsListItem,
        {
          marginBottom: index === stops.length - 1 ? 0 : 10,
        },
      ]}>
      <TouchableOpacity
        style={styles.numberAndIcon}
        onPress={() => chooseStopCallback && chooseStopCallback(stop)}>
        <View
          style={[
            styles.stopNumberView,
            {
              backgroundColor: isChosenStop
                ? 'white'
                : theme['color-primary-500'],
            },
          ]}>
          <Text category="label" style={styles.stopNumberText}>
            {
              // FIXME: `index + 2` is to account for the pickup currently being outside the MatchStops array
              // we only account for one pickup in a match, and the state of the pickup is stored in the
              // MatchState. when we refactor all stops (pickups included) to be in the MatchStops
              // array, change `index + 2` to `index + 1`.
            }
            {index + 2}
          </Text>
        </View>
        <Icon
          name={stop.type == 'pickup' ? 'arrow-from-bottom' : 'arrow-from-top'}
          size={15}
          color={isChosenStop ? 'white' : theme['color-primary-500']}
        />
      </TouchableOpacity>
      <View style={styles.stopAddressAndNameView}>
        <Text category="p1">
          {`${stop.destination_address.address}`}
          <Text category="p2" style={styles.stopNameText}>
            {stop.destination_address.name
              ? ` (${stop.destination_address.name})`
              : ''}
          </Text>
        </Text>
      </View>
      <Button
        size="tiny"
        status={isChosenStop ? 'basic' : 'primary'}
        style={styles.stopButton}
        onPress={() => chooseStopCallback && chooseStopCallback(stop)}>
        {isChosenStop ? 'ACTIVE' : 'SELECT'}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  stopsListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stopNumberView: {
    height: 15,
    width: 15,
    borderRadius: 15,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopNumberText: {
    color: 'color-basic-1000',
  },
  stopAddressAndNameView: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
    marginHorizontal: 5,
  },
  stopNameText: {
    color: 'color-basic-600',
  },
  stopButton: {
    height: 24,
  },
  numberAndIcon: {
    flexDirection: 'row',
  },
});
