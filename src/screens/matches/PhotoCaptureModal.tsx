import React, {useCallback, useEffect, useState} from 'react';
import {Layout, useTheme} from '@ui-kitten/components';
import {Button} from '../../components/ui-kitten/Button';
import {Text} from '../../components/ui-kitten/Text';
import {MatchesStackProps} from '../../navigation/NavigatorTypes';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import {Alert, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useRequestPhoto} from '../../components/PhotoHelper';
import {handleError} from '../../lib/ErrorHelper';
import {useSelector} from 'react-redux';
import {selectAcceptedMatchById, updatePhoto} from '../../slices/matches';
import {useAppDispatch} from '../../hooks';
import {MatchStop} from '@frayt/sdk';

export function PhotoCaptureModal({
  route,
  navigation,
}: MatchesStackProps<'Photo'>) {
  const theme = useTheme();
  const {requestPhoto} = useRequestPhoto();

  const {documentType, stopId, matchId} = route.params;
  const [uri, setUri] = useState<string | null>();
  const [confirmEnabled, setConfirmEnabled] = useState(false);
  const match = useSelector(state => selectAcceptedMatchById(state, matchId));
  const dispatch = useAppDispatch();

  enum PlaceholderIcon {
    Cargo = 'box-open',
    BoL = 'file',
  }

  useEffect(() => {
    setUri(getPhoto());
  }, [match]);

  const getPhoto = () => {
    if (!match) return;
    if (stopId === match.id) {
      // Must be a pickup photo
      if (documentType === 'BoL') return match.bill_of_lading_photo;
      if (documentType === 'Cargo') return match.origin_photo;
      return null;
    }

    // Must be a dropoff photo
    const stop = match.stops.find(stop => stop.id === stopId);
    if (!stop) return null;
    if (documentType === 'BoL') return null; // stops do not have BoL photos
    if (documentType === 'Cargo') return stop.destination_photo;
    return null;
  };

  useEffect(() => {
    if (!match) {
      Alert.alert('You are no longer assigned to this match');
      navigation.navigate('Matches');
    }
  }, [match]);

  const handleConfirm = useCallback(async () => {
    if (!uri) throw new Error('Did not receive photo from camera');
    if (!match) throw new Error('You are no longer assigned to this match');

    let stopIndex = -1;
    if (stopId !== match.id) {
      const stop = match.stops.find((stop: MatchStop) => stop.id === stopId);
      if (!stop) throw new Error('Could not find the associated stop');
      stopIndex = stop.index;
    }
    return await dispatch(
      updatePhoto({
        matchId: matchId,
        type: documentType,
        photo: uri,
        index: stopIndex,
      }),
    ).unwrap();
  }, [uri]);

  return (
    <Layout level="1" style={styles.container}>
      <Layout level="2" style={styles.photoWrapper}>
        {uri ? (
          <FastImage
            resizeMode="contain"
            style={styles.photo}
            source={{uri: `data:image/png;base64,${uri}`}}
          />
        ) : (
          <Text>
            <Icon
              name={PlaceholderIcon[documentType]}
              size={250}
              color={theme['color-basic-500']}></Icon>
          </Text>
        )}
      </Layout>
      <Layout level="2" style={styles.buttonsContainer}>
        <Button onPress={() => navigation.goBack()}>GO BACK</Button>
        <Button
          status="primary"
          onPress={async () => {
            try {
              if (!match)
                throw new Error('You are no longer assigned to this match');
              const {assets} = await requestPhoto();
              setUri(assets ? assets[0].base64 : null);
              if (assets && assets[0] && assets[0].base64) {
                setConfirmEnabled(true);
              } else {
                throw new Error('Did not receive photo from camera');
              }
            } catch (error: unknown) {
              handleError(error, 'Error accessing camera');
              setConfirmEnabled(false);
            }
          }}>
          GET PHOTO
        </Button>
        <Button
          disabled={!confirmEnabled}
          onPress={async () => {
            await handleConfirm();
            navigation.navigate('Accepted', {
              matchId: matchId,
              [`chosen${documentType}PhotoStop`]: stopId,
              [`chosen${documentType}Photo`]: uri,
            });
          }}>
          CONFIRM
        </Button>
      </Layout>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoWrapper: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1 / 1,
    width: '100%',
    marginBottom: 20,
    padding: 10,
  },
  photo: {
    height: '100%',
    width: '100%',
    backgroundColor: 'transparent',
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 4,
  },
});
