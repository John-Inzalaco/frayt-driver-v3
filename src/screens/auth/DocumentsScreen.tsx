import React from 'react';
import {Document, DocumentType} from '@frayt/sdk';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Layout, useStyleSheet} from '@ui-kitten/components';
import {AuthStackProps} from '../../navigation/NavigatorTypes';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {selectDriver, selectToken, logoutUser} from '../../slices/user';
import {Text} from '../../components/ui-kitten/Text';
import {DividerGray} from '../../components/ui-kitten/DividerGray';
import {Button} from '../../components/ui-kitten/Button';
import FastImage from 'react-native-fast-image';
import moment from 'moment';

export default function ({
  navigation,
}: AuthStackProps<'DocumentsScreen'>): React.ReactElement {
  const styles = useStyleSheet(themedStyles);
  const dispatch = useAppDispatch();

  const driver = useAppSelector(selectDriver);
  const token = useAppSelector(selectToken);

  const driverDocs = driver?.images || [];
  const vehicleDocs = driver?.vehicle?.images || [];
  const docs = [...driverDocs, ...vehicleDocs];

  const handleLogOut = async () => {
    const {token} = await dispatch(logoutUser()).unwrap();
    if (!token) {
      navigation.navigate('Auth', {screen: 'Login'});
    }
  };

  type PreviewDocumentType = Exclude<
    DocumentType,
    'carrier_agreement' | 'vehicle_type'
  >;

  const documentTypes: {[key in PreviewDocumentType]: string} = {
    [DocumentType.Profile]: "Driver's Profile",
    [DocumentType.License]: "Driver's License",
    [DocumentType.Registration]: 'Vehicle Registration',
    [DocumentType.Insurance]: 'Vehicle Insurance',
    [DocumentType.Front]: 'Vehicle Front',
    [DocumentType.DriverSide]: 'Vehicle Driver Side',
    [DocumentType.PassengersSide]: 'Vehicle Passenger Side',
    [DocumentType.Back]: 'Vehicle Back',
    [DocumentType.CargoArea]: 'Vehicle Cargo Area',
  };

  const dateIsExpired = (date: moment.MomentInput) => {
    if (!date) return true;
    const today = moment().startOf('day');
    const referenceDate = moment(date).startOf('day');

    return today.isAfter(referenceDate);
  };

  const renderDocument = (doc: Document, index: number) => {
    let statusText = '',
      additionalText = '',
      expiredLabel = 'Expires',
      statusTextStyle = styles.documentStatusText;

    const expiresAt = doc?.expires_at
      ? moment(doc.expires_at).startOf('day')
      : null;

    const isExpired = expiresAt && dateIsExpired(expiresAt);

    if (isExpired) {
      statusText = 'Awaiting';
      additionalText = 'replacement document';
      expiredLabel = 'Expired';
      statusTextStyle = {...statusTextStyle, ...styles.expiredTextColor};
    } else if (doc?.state === 'approved') {
      statusText = 'Approved';
      additionalText = 'and up-to-date';
      statusTextStyle = {...statusTextStyle, ...styles.successTextColor};
    } else if (doc?.state === 'pending_approval') {
      statusText = '';
      additionalText = 'Replacement received; awaiting approval';
      statusTextStyle = {...statusTextStyle, ...styles.successTextColor};
    } else if (doc?.state === 'rejected') {
      statusText = 'Rejected';
      statusTextStyle = {...statusTextStyle, ...styles.expiredTextColor};
    }

    const expirationStyles = isExpired
      ? {...styles.documentExpirationText, ...styles.expiredTextColor}
      : {...styles.documentExpirationText, ...styles.successTextColor};

    return (
      <View key={index}>
        <View style={styles.documentItemHeader}>
          <Text style={styles.documentHeaderText}>
            {documentTypes[doc.type as PreviewDocumentType]}
          </Text>
          <Text>
            <Text style={styles.documentHeaderText}>{expiredLabel}:</Text>{' '}
            <Text style={expirationStyles}>
              {(expiresAt && expiresAt.format('M/D/YY')) || 'N/A'}
            </Text>
          </Text>
        </View>
        <Layout level="2" style={styles.photoWrapper}>
          <FastImage
            resizeMode="contain"
            style={styles.photo}
            source={{uri: doc.document}}
          />
        </Layout>

        {!!doc.state && (
          <View style={styles.documentStatus}>
            <Text style={statusTextStyle}>{statusText}</Text>
            <Text style={styles.documentStatusText}>
              &nbsp;{additionalText}
            </Text>
          </View>
        )}

        {doc.state === 'rejected' && doc.notes && (
          <Text style={[styles.documentStatus, styles.documentStatusText]}>
            &nbsp;{doc.notes}
          </Text>
        )}

        {(isExpired || doc.state === 'rejected') && (
          <Button
            style={styles.uploadButton}
            onPress={() => {
              navigation.navigate('DocumentCaptureModal', {
                userId: driver?.id as string,
                documentType: doc.type,
                token: token as string,
              });
            }}>
            UPLOAD REPLACEMENT
          </Button>
        )}
        <DividerGray style={styles.space} />
      </View>
    );
  };

  const mapDocuments = (docs: Document[]) => {
    const types = Object.keys(documentTypes);

    return types.map((type, index) => {
      const defaultDoc = {type} as Document;
      const doc = docs.find(d => d.type === type) || defaultDoc;

      return renderDocument(doc, index);
    });
  };

  return (
    <Layout level="3" style={styles.container}>
      <ScrollView>
        <Text category="h4" style={[styles.heading, styles.space]}>
          Update Documents
        </Text>
        <Text category="p1" style={styles.space}>
          You have document(s) which have expired or been rejected.
        </Text>
        <Text category="p1" style={styles.space}>
          Please submit your updated documents for review.
        </Text>
        <DividerGray style={styles.space} />
        {mapDocuments(docs)}
        <Button onPress={handleLogOut} style={styles.signOutButton}>
          SIGN OUT
        </Button>
      </ScrollView>
    </Layout>
  );
}

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
  },
  heading: {
    marginTop: 25,
    alignSelf: 'center',
  },
  space: {
    marginBottom: 15,
  },
  documentItemHeader: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  documentHeaderText: {
    color: 'color-basic-600',
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  documentExpirationText: {
    fontWeight: '600',
    textTransform: 'uppercase',
    fontSize: 12,
  },
  documentStatus: {
    paddingBottom: 10,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  documentStatusTextLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  documentStatusText: {
    color: 'color-basic-600',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  expiredTextColor: {
    color: 'color-danger-500',
  },
  photo: {
    height: '100%',
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 4,
  },
  photoWrapper: {
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1.5 / 1,
    width: '100%',
    marginBottom: 10,
    backgroundColor: 'color-basic-500',
  },
  signOutButton: {
    backgroundColor: 'color-danger-500',
    marginBottom: 20,
  },
  successTextColor: {
    color: 'color-success-500',
  },
  uploadButton: {
    marginBottom: 15,
    width: '100%',
  },
});
