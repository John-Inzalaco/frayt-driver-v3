import {useRef, useState} from 'react';
import {
  Input,
  Layout,
  Spinner,
  useStyleSheet,
  useTheme,
} from '@ui-kitten/components';
import {Button} from '../../components/ui-kitten/Button';
import {MatchesStackProps} from '../../navigation/NavigatorTypes';
import SignatureScreen, {SignatureViewRef} from 'react-native-signature-canvas';
import {StyleSheet, View} from 'react-native';
import {selectDriver, selectToken} from '../../slices/user';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {selectMatchById, signMatchAction} from '../../slices/matches';
import {handleError} from '../../lib/ErrorHelper';
import {Text} from '../../components/ui-kitten/Text';
import {MatchSignature} from '@frayt/sdk';
import FastImage, {ImageStyle} from 'react-native-fast-image';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import {useRequestPhoto} from '../../components/PhotoHelper';

export function SignatureCaptureModal({
  route,
  navigation,
}: MatchesStackProps<'Signature'>) {
  const {matchId, stopId} = route.params;
  const signatureRef = useRef<SignatureViewRef>(null);
  const [printedName, setPrintedName] = useState('');
  const [signature, setSignature] = useState('');
  const token = useAppSelector(selectToken) || '';
  const driver = useAppSelector(selectDriver);
  const match = useAppSelector(state => selectMatchById(state, matchId));
  const currentStop = match?.stops.find(stop => stop.id === stopId);
  const dispatch = useAppDispatch();
  const sliceLoading = useAppSelector(state => state.matches.loading);
  const [uri, setUri] = useState<string | null>();
  const theme = useTheme();
  const {requestPhoto} = useRequestPhoto();
  const [confirmEnabled, setConfirmEnabled] = useState(false);
  const styles = useStyleSheet(themedStyles);
  const [navigating, setNavigating] = useState(false);

  const requiredValuesPresent = () => printedName && signature;

  const handleSubmitElectronicSign = async () => {
    try {
      if (!driver) throw new Error('No driver assigned to this match');
      if (!driver.current_location)
        throw new Error('Driver does not have their current location updated');
      const result = await dispatch(
        signMatchAction({
          token: token ?? '',
          matchId: matchId,
          stopId: stopId,
          signature: signature,
          printedName: printedName,
          location: driver.current_location,
        }),
      ).unwrap();

      if (result) {
        setNavigating(true);
        navigation.goBack();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleGetPhotoSign = async () => {
    try {
      if (!match) throw new Error('You are no longer assigned to this match');
      const {assets} = await requestPhoto();
      if (assets && assets[0] && assets[0].base64) {
        setUri(assets[0].base64);
        setConfirmEnabled(true);
      } else {
        throw new Error('Did not receive photo from camera');
      }
    } catch (error: unknown) {
      handleError(error);
      setConfirmEnabled(false);
    }
  };

  const handleSubmitPhotoSign = async () => {
    try {
      if (!driver) throw new Error('No driver assigned to this match');
      if (!driver.current_location)
        throw new Error('Driver does not have their current location updated');

      const result = await dispatch(
        signMatchAction({
          token: token ?? '',
          matchId: matchId,
          stopId: stopId,
          signature: uri ?? '',
          printedName: printedName,
          location: driver.current_location,
        }),
      ).unwrap();

      if (result) {
        setNavigating(true);
        navigation.goBack();
      } else {
        throw new Error('Error selecting photo');
      }
    } catch (error) {
      handleError(error, 'Error accessing camera');
    }
  };

  const renderElectronicSign = () => {
    return (
      <Layout level="1" style={styles.container}>
        {currentStop?.signature_instructions && (
          <Layout level="2" style={styles.instructionsLayout}>
            <Text category="label" style={styles.labelText}>
              SHIPPER INSTRUCTIONS
            </Text>
            <Text style={styles.instructionsText}>
              {currentStop.signature_instructions}
            </Text>
          </Layout>
        )}
        <View style={styles.printedNameField}>
          <Input
            value={printedName}
            style={styles.input}
            label="PRINTED NAME"
            placeholder="Enter here"
            secureTextEntry={false}
            onChangeText={nextValue => setPrintedName(nextValue)}
            textContentType="username"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <SignatureScreen
            ref={signatureRef}
            onOK={signature => {
              setSignature(signature.replace('data:image/png;base64,', ''));
            }}
            onEnd={() => {
              signatureRef.current?.readSignature();
            }}
            onClear={() => {
              setSignature('');
            }}
            autoClear={false}
            webStyle={signatureScreenWebStyle}
            dotSize={5}
          />
        </View>
        <Layout level="2" style={styles.buttonsContainer}>
          <Button onPress={() => navigation.goBack()}>GO BACK</Button>
          <Button
            onPress={() => {
              signatureRef.current?.clearSignature();
            }}
            status="primary">
            CLEAR
          </Button>
          <Button
            disabled={!requiredValuesPresent() || sliceLoading || navigating}
            onPress={() => {
              handleSubmitElectronicSign();
            }}
            accessoryRight={props =>
              sliceLoading ? (
                <Text {...props}>
                  <Spinner status="basic" size="small" />
                </Text>
              ) : (
                <></>
              )
            }>
            CONFIRM
          </Button>
        </Layout>
      </Layout>
    );
  };

  const renderPhotoSign = () => {
    return (
      <Layout style={styles.container}>
        <Layout level="2" style={styles.instructionsLayout}>
          <Text category="label" style={styles.labelText}>
            SHIPPER INSTRUCTIONS
          </Text>
          <Text style={styles.instructionsText}>
            {currentStop?.signature_instructions ?? ''}
          </Text>
        </Layout>
        <Layout level="2" style={styles.photoWrapper}>
          {uri ? (
            <FastImage
              resizeMode="contain"
              style={styles.photo as ImageStyle}
              source={{uri: `data:image/png;base64,${uri}`}}
            />
          ) : (
            <Text>
              <Icon
                name="file-signature"
                size={75}
                color={theme['color-basic-500']}></Icon>
            </Text>
          )}
        </Layout>
        <Layout level="2" style={styles.buttonsContainer}>
          <Button onPress={() => navigation.goBack()}>BACK</Button>
          <Button status="primary" onPress={() => handleGetPhotoSign()}>
            GET PHOTO
          </Button>
          <Button
            disabled={!confirmEnabled || sliceLoading || navigating}
            onPress={() => {
              handleSubmitPhotoSign();
            }}
            accessoryRight={props =>
              sliceLoading ? (
                <Text {...props}>
                  <Spinner status="basic" size="small" />
                </Text>
              ) : (
                <></>
              )
            }>
            CONFIRM
          </Button>
        </Layout>
      </Layout>
    );
  };

  if (currentStop && currentStop.signature_type === MatchSignature.Electronic) {
    return renderElectronicSign();
  } else {
    return renderPhotoSign();
  }
}

const signatureScreenWebStyle = `body,html {height: 100%; width: 100%;} .m-signature-pad--footer {display: none; margin: 0px;}`;

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    marginBottom: 15,
  },
  printedNameField: {
    flex: 0.85,
    marginVertical: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 4,
  },
  photoWrapper: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1 / 1,
    width: '100%',
    marginBottom: 10,
    padding: 10,
  },
  photo: {
    height: '100%',
    width: '100%',
    backgroundColor: 'transparent',
  },
  instructionsLayout: {
    width: '100%',
    marginBottom: 10,
    padding: 10,
    borderRadius: 4,
  },
  labelText: {
    color: 'color-basic-600',
  },
  instructionsText: {
    flexWrap: 'wrap',
  },
});
