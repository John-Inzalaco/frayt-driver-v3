import {StyleSheet, View} from 'react-native';
import {Text} from './ui-kitten/Text';
import {Button} from './ui-kitten/Button';
import {MatchState, StopState} from '@frayt/sdk';
import {
  IndexPath,
  Select,
  SelectItem,
  useStyleSheet,
  Modal,
} from '@ui-kitten/components';
import {useState, useEffect} from 'react';

interface CancelModalProps {
  cancelType: 'match' | 'pickup' | 'dropoff' | undefined;
  isVisible: boolean;
  setVisibleCallback: (isVisible: boolean) => void;
  setStateCallback: (
    state: MatchState | StopState,
    reason: string,
    type: 'Match' | 'Stop',
  ) => void;
}

const REASONS = [
  'Select a reason...',
  "I couldn't find the pickup location",
  "I couldn't contact the shipper",
  'Unexpected traffic or weather',
  'I decided it was not worth it',
  'I had to do something else',
];
const unableToPickUpReasons = [
  'Select a reason...',
  'Customer Canceled',
  'Sent out with another Courier',
  'Order already picked up',
  'Sent out with a company driver',
  'Shipping location canceled',
  'Order too large for vehicle type requested',
  'Unable to accommodate',
  'Excessive wait time',
  'Unable to wait',
];

const unableToDeliverReasons = [
  'Select a reason...',
  'I couldn’t find the delivery location',
  'I was unable to access the delivery location',
  'Safety concern',
  'Missing Item',
];

export function ConfirmCancelModal({
  cancelType,
  isVisible,
  setVisibleCallback,
  setStateCallback,
}: CancelModalProps) {
  const styles = useStyleSheet(themedStyles);
  const [selectedReason, setSelectedReason] = useState(0);
  const [cancelReason, setCancelReasons] = useState<string[]>([]);

  useEffect(() => {
    if (cancelType === 'match') {
      setCancelReasons(REASONS);
    } else if (cancelType === 'pickup') {
      setCancelReasons(unableToPickUpReasons);
    } else if (cancelType === 'dropoff') {
      setCancelReasons(unableToDeliverReasons);
    }
  }, [cancelType]);

  return (
    <Modal visible={isVisible} style={styles.cancelModalContainer}>
      <View style={styles.cancelModalView}>
        <View style={styles.cancelModalInnerView}>
          <Text category="h5" style={styles.cancelModalHeader}>
            Are you sure?
          </Text>
          <Select
            style={styles.dropDownContainer}
            onSelect={index => {
              setSelectedReason((index as IndexPath).row);
            }}
            value={cancelReason[selectedReason]}
            label="Reason">
            {cancelReason.map((reason, index) => (
              <SelectItem
                key={`ConfirmCancelModal.SelectItem-${index}`}
                title={evaProps => <Text {...evaProps}>{reason}</Text>}
              />
            ))}
          </Select>
          <Button status="basic" onPress={() => setVisibleCallback(false)}>
            GO BACK
          </Button>
          <Button
            status="danger"
            style={styles.progressButton}
            disabled={selectedReason === 0}
            onPress={() => {
              const reason = cancelReason[selectedReason];
              switch (cancelType) {
                case 'match':
                  setStateCallback(MatchState.DriverCanceled, reason, 'Match');
                  break;
                case 'pickup':
                  setStateCallback(MatchState.UnableToPickup, reason, 'Match');
                  break;
                case 'dropoff':
                  setStateCallback(StopState.Undeliverable, reason, 'Stop');
                  break;
              }
              setVisibleCallback(false);
            }}>
            CONFIRM CANCEL
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const themedStyles = StyleSheet.create({
  cancelModalContainer: {
    width: '100%',
    height: '100%',
  },
  cancelModalView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  cancelModalInnerView: {
    backgroundColor: 'color-basic-800',
    borderRadius: 4,
    padding: 10,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    marginHorizontal: 20,
  },
  cancelModalHeader: {
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  progressButton: {
    marginTop: 10,
  },
  dropDownContainer: {
    marginBottom: 10,
  },
});
