import {Card} from '@ui-kitten/components';
import {Image, StyleSheet, View} from 'react-native';
import {Text} from '../ui-kitten/Text';
import FontAwesome5Pro from 'react-native-vector-icons/FontAwesome5Pro';
import {useSelector} from 'react-redux';
import {selectDriver} from '../../slices/user';
import {useEffect, useState} from 'react';

export default function ProfileCard() {
  const user = useSelector(selectDriver);
  const [fullName, setFullName] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [rating, setRating] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (!user) return;
    setFullName(`${user.first_name} ${user.last_name}`);
    setVehicle(
      `${user.vehicle?.vehicle_year} ${user.vehicle?.vehicle_make} ${user.vehicle?.vehicle_model}`,
    );
    setRating(`${user.rating}`);
    setLocation(`${user.address?.city}, ${user.address?.state_code}`);
  }, [user]);

  return (
    <Card
      style={styles.card}
      status="primary"
      header={() => (
        <View style={styles.cardHeaderView}>
          <Text category="h6" style={styles.cardHeaderText}>
            Profile
          </Text>
          <FontAwesome5Pro name={'user'} style={styles.icon} solid size={18} />
        </View>
      )}>
      <View style={styles.cardBodyView}>
        <View style={styles.nameView}>
          <Image
            style={styles.image}
            source={
              user && user.getProfileImage()
                ? {
                    uri: user.getProfileImage(),
                  }
                : require('../../images/profile_pic_placeholder.png')
            }
          />
          <Text category="p1" style={styles.nameText}>
            {fullName}
          </Text>
        </View>

        <View style={styles.cardInfoView}>
          <View style={styles.cardInfoComponentView}>
            <Text category="label">VEHICLE</Text>
            <Text category="p2">{vehicle}</Text>
          </View>
          <View style={styles.cardInfoComponentView}>
            <Text category="label">RATING</Text>
            <Text category="p2">
              <FontAwesome5Pro name="star" size={13} solid />
              {rating}
            </Text>
          </View>
          <View style={styles.cardInfoComponentView}>
            <Text category="label">DOCUMENTS</Text>
            <Text category="p2">
              {user?.needsUpdatedDocuments() ? 'Out Of Date' : 'Up To Date'}
            </Text>
          </View>
          <View style={styles.cardInfoComponentView}>
            <Text category="label">LOCATION</Text>
            <Text category="p2">{location}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 10,
  },
  cardHeaderView: {
    flexDirection: 'row',
  },
  cardHeaderText: {
    marginVertical: 10,
    marginHorizontal: 15,
    flex: 1,
  },
  icon: {
    marginVertical: 10,
    marginHorizontal: 15,
    alignSelf: 'center',
    color: '#CCE8FF',
  },
  cardBodyView: {
    alignSelf: 'center',
    paddingHorizontal: 15,
  },
  nameView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  nameText: {
    marginVertical: 4.5,
    marginLeft: 5,
  },
  image: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
  },
  cardInfoView: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  cardInfoComponentView: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '50%',
    marginVertical: 15,
  },
});
