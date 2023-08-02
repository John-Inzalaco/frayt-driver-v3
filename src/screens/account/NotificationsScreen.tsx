import React, {useEffect, useState} from 'react';
import DeviceInfo from 'react-native-device-info';
import {StyleSheet, View} from 'react-native';
import {sendTestNotification, Driver, Device} from '@frayt/sdk';
import {Layout, Toggle, useStyleSheet} from '@ui-kitten/components';
import {Text} from '../../components/ui-kitten/Text';
import {Button} from '../../components/ui-kitten/Button';
import {DividerGray} from '../../components/ui-kitten/DividerGray';
import {DeviceInfoCard} from '../../components/DeviceInfoCard';
import {
  selectDriver,
  selectToken,
  selectOneSignalNotificationId,
  updateOneSignalNotificationId,
} from '../../slices/user';
import {useAppDispatch, useAppSelector} from '../../hooks';

type UserDevice = {
  id: string;
  device_model: string;
  os: string;
  os_version: string;
};

export const NotificationsScreen = (): React.ReactElement => {
  const styles = useStyleSheet(themedStyles);
  const dispatch = useAppDispatch();
  const driver = useAppSelector(selectDriver);
  const token = useAppSelector(selectToken);
  const oneSignalNotificationId = useAppSelector(selectOneSignalNotificationId);

  const [checked, setChecked] = useState(false);
  const onCheckedChange = (isChecked: React.SetStateAction<boolean>) => {
    setChecked(isChecked);
  };

  const currentDevice = {
    id: oneSignalNotificationId || '',
    device_model: DeviceInfo.getModel(),
    os: DeviceInfo.getSystemName(),
    os_version: DeviceInfo.getSystemVersion(),
  };

  const [tab, setTab] = useState(1);
  const [userDevices, setUserDevices] = useState<UserDevice[]>([currentDevice]);
  const hasMultipleDevices: boolean = (driver?.devices || []).length > 1;

  const isDefaultDevice = (
    driver: Driver | null,
    oneSignalId: string | null,
  ) => {
    const defaultDeviceId = driver?.default_device_id;
    const defaultDevice = driver?.devices?.find(
      (device: Device) => device.id === defaultDeviceId,
    );
    const isDefault =
      defaultDevice?.device_uuid === DeviceInfo.getUniqueIdSync() &&
      defaultDevice?.player_id === oneSignalId;

    return isDefault;
  };

  const handleOnThis = () => {
    setUserDevices([currentDevice]);
  };

  const handleOnRegistered = () => {
    const registeredDevice = driver?.devices.find(
      each => each.id === driver?.default_device_id,
    );
    if (registeredDevice) {
      const {id, device_model, os, os_version} = registeredDevice;
      setUserDevices([{id, device_model, os, os_version}]);
    } else {
      setUserDevices([]);
    }
  };

  const handleOnOther = () => {
    const unregisteredDevices: UserDevice[] = [];
    driver?.devices.map(each => {
      const {id, device_model, os, os_version} = each;
      if (id !== driver?.default_device_id) {
        unregisteredDevices.push({id, device_model, os, os_version});
      }
    });
    setUserDevices(unregisteredDevices);
  };

  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    setIsDefault(isDefaultDevice(driver, oneSignalNotificationId));
  }, [driver]);

  useEffect(() => {
    switch (tab) {
      case 1:
        handleOnThis();
        break;
      case 2:
        handleOnRegistered();
        break;
      case 3:
        handleOnOther();
        break;
      default:
        break;
    }
  }, [driver, tab]);

  return (
    <Layout level="3" style={styles.container}>
      <Toggle checked={checked} onChange={onCheckedChange}>
        <Text category="s1" style={styles.toggleText}>
          Full Details
        </Text>
      </Toggle>
      <DividerGray style={styles.divider} />
      {hasMultipleDevices ? (
        <View style={styles.tinyButtonsView}>
          <Button
            {...(tab === 1 ? {} : {status: 'basic'})}
            size="tiny"
            style={styles.tinyButton}
            onPress={() => setTab(1)}>
            This Phone
          </Button>
          <Button
            {...(tab === 2 ? {} : {status: 'basic'})}
            size="tiny"
            style={styles.tinyButton}
            onPress={() => setTab(2)}>
            Registered Device
          </Button>
          <Button
            {...(tab === 3 ? {} : {status: 'basic'})}
            size="tiny"
            style={styles.tinyButton}
            onPress={() => setTab(3)}>
            Other Devices
          </Button>
        </View>
      ) : null}
      {userDevices.map(each => (
        <DeviceInfoCard
          key={each.id}
          id={each.id}
          device_model={each.device_model}
          os={each.os}
          os_version={each.os_version}
        />
      ))}
      {tab === 1 ? (
        <>
          <Button
            style={styles.button}
            disabled={isDefault}
            onPress={async () => {
              await dispatch(updateOneSignalNotificationId(null)).unwrap();
            }}>
            {isDefault ? 'THIS IS YOUR DEFAULT DEVICE' : 'USE THIS DEVICE'}
          </Button>
          <Button
            style={styles.button}
            onPress={() => {
              sendTestNotification(token ?? '');
            }}>
            SEND TEST NOTIFICATION
          </Button>
        </>
      ) : null}
    </Layout>
  );
};

const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 26,
    paddingHorizontal: 10,
    alignItems: 'flex-start',
  },
  toggleText: {
    marginLeft: 8,
  },
  divider: {
    marginVertical: 15,
  },
  tinyButtonsView: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tinyButton: {
    borderRadius: 50,
    marginRight: 8,
  },
  button: {width: '100%', marginBottom: 15},
});
