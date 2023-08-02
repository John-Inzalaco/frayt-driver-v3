import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Text} from '@ui-kitten/components';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';
import {disableNextButton} from '../lib/DisableNextButton';

type ApplyToDriverHeaderProps = {
  previousAction: () => void;
  nextAction: () => void;
  step: number;
  disableNext: boolean;
  disableBack?: boolean;
};

const ArrowRightIcon = props => ArrowIcon(props, 'right');
const ArrowLeftIcon = props => ArrowIcon(props, 'left');

const ArrowIcon = (props, direction: string) => {
  const color = props.style.tintColor;
  return (
    <FontAwesome5Pro
      key={direction}
      {...props}
      color={color}
      name={`chevron-${direction}`}
    />
  );
};

export const ApplyToDriveFooter = ({
  nextAction,
  previousAction,
  step,
  disableNext = true,
  disableBack = false,
}: ApplyToDriverHeaderProps) => (
  <View style={styles.container}>
    <View style={styles.buttonContainer}>
      <Button
        size="tiny"
        accessoryLeft={ArrowLeftIcon}
        testID="ApplyToDriveFooter.PreviousButton"
        disabled={disableBack}
        style={styles.previous}
        onPress={previousAction}>
        PREVIOUS
      </Button>
    </View>

    <Text style={{}}>Step {step} of 9</Text>
    <View style={styles.buttonContainer}>
      <Button
        accessoryRight={ArrowRightIcon}
        testID="ApplyToDriverFooter.NextButton"
        onPress={nextAction}
        size="tiny"
        disabled={disableNextButton(disableNext)}
        style={styles.next}>
        NEXT
      </Button>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    marginTop: 15,
    alignSelf: 'flex-end',
  },
  buttonContainer: {
    flexBasis: 0,
    flexGrow: 1,
  },
  previous: {
    width: 100,
  },
  next: {
    width: 100,
    alignSelf: 'flex-end',
  },
});
