import {Driver} from '@frayt/sdk';
import {PermissionStatus} from 'react-native-permissions';
import {usePermissions} from '../components/PermissionsHelper';
import {getDriver} from '../slices/user';
import {useAppDispatch} from '../hooks';
import {useToken} from './TokenHelper';
import {handleError} from './ErrorHelper';

export type AuthRouteCheck = [boolean, AuthRoute];

export type AuthRoute =
  | {
      route: 'Auth';
      screen:
        | 'Login'
        | 'Approval'
        | 'Permissions'
        | 'LoadUnloadScreen'
        | 'AgreementsScreen'
        | 'UpdateCargoCapacityScreen'
        | 'SetupWalletScreen';
    }
  | {route: 'Home'; screen: 'DriveStack'};

export function useLoginHelper() {
  const {checkLocation, checkNotification} = usePermissions();
  const {token: token} = useToken();
  const dispatch = useAppDispatch();

  const getAuthRoute = async (): Promise<AuthRoute> => {
    if (!token) return {route: 'Auth', screen: 'Login'};
    try {
      const {driver: driverData} = await dispatch(
        getDriver({token: token}),
      ).unwrap();
      const driver = new Driver(driverData);
      if (!driver) return {route: 'Auth', screen: 'Login'};
      const locationPermissions = await checkLocation();
      const notificationPermission = await checkNotification();
      const [needsDocumentCheck, stateResult] = byState(driver);
      if (!needsDocumentCheck) return stateResult;

      const [needsLoadCheck, documentResult] = byDocuments(driver, stateResult);
      if (!needsLoadCheck) return documentResult;

      const [needsAgreementsCheck, loadUnloadResult] = byLoadUnload(
        driver,
        documentResult,
      );
      if (!needsAgreementsCheck) return loadUnloadResult;

      const [needsCargoCapacityCheck, agreementsResult] = byAgreements(
        driver,
        loadUnloadResult,
      );
      if (!needsCargoCapacityCheck) return agreementsResult;

      const [needsWalletCheck, cargoCapacityResult] = byCargoCapacity(
        driver,
        agreementsResult,
      );
      if (!needsWalletCheck) return cargoCapacityResult;

      const [needsPermissionCheck, walletResult] = byWallet(
        driver,
        cargoCapacityResult,
      );
      if (!needsPermissionCheck) return walletResult;

      const [_, permissionsResult] = byPermissions(
        driver,
        cargoCapacityResult,
        locationPermissions,
        notificationPermission,
      );
      return permissionsResult;
    } catch (error) {
      handleError(error);
      return {route: 'Auth', screen: 'Login'};
    }
  };

  const byState = (driver: Driver): AuthRouteCheck => {
    switch (driver.state) {
      case 'rejected':
      case 'disabled':
      case 'applying':
      case 'screening':
      case 'pending_approval':
      case 'approved':
        return [false, {route: 'Auth', screen: 'Approval'}];
      case 'registered':
        return [true, {route: 'Home', screen: 'DriveStack'}];
      default:
        throw new Error('Driver is in an invalid state');
    }
  };

  const byDocuments = (driver: Driver, route: AuthRoute): AuthRouteCheck => {
    return driver.needsUpdatedDocuments()
      ? [false, {route: 'Auth', screen: 'Approval'}]
      : ([true, route] as AuthRouteCheck);
  };

  const byCargoCapacity = (
    driver: Driver,
    _: AuthRoute,
  ): [boolean, AuthRoute] => {
    const hasCargoCapacity = !!(
      driver.vehicle &&
      driver.vehicle.capacity_height &&
      driver.vehicle.capacity_length &&
      driver.vehicle.capacity_width &&
      driver.vehicle.capacity_door_height &&
      driver.vehicle.capacity_door_width &&
      (driver.vehicle.vehicle_class !== 3 ||
        (driver.vehicle.capacity_between_wheel_wells &&
          driver.vehicle.capacity_weight))
    );

    return !hasCargoCapacity
      ? [false, {route: 'Auth', screen: 'UpdateCargoCapacityScreen'}]
      : [true, {route: 'Home', screen: 'DriveStack'}];
  };

  const byLoadUnload = (driver: Driver, route: AuthRoute): AuthRouteCheck => {
    return driver.can_load !== true && driver.can_load !== false
      ? [false, {route: 'Auth', screen: 'LoadUnloadScreen'}]
      : ([true, route] as AuthRouteCheck);
  };

  const byAgreements = (driver: Driver, _: AuthRoute): AuthRouteCheck => {
    return driver.pending_agreements.length > 0
      ? [false, {route: 'Auth', screen: 'AgreementsScreen'}]
      : [true, {route: 'Home', screen: 'DriveStack'}];
  };

  const byWallet = (driver: Driver, _: AuthRoute): AuthRouteCheck => {
    switch (driver.wallet_state) {
      case 'UNCLAIMED':
      case 'ACTIVE':
        return [true, {route: 'Home', screen: 'DriveStack'}];
      default:
        return [false, {route: 'Auth', screen: 'SetupWalletScreen'}];
    }
  };

  const byPermissions = (
    _driver: Driver,
    _: AuthRoute,
    locationPermissions?: [PermissionStatus, PermissionStatus] | null,
    notificationPermission?: PermissionStatus | null,
  ): AuthRouteCheck => {
    if (!locationPermissions)
      return [false, {route: 'Auth', screen: 'Permissions'}];
    if (!notificationPermission)
      return [false, {route: 'Auth', screen: 'Permissions'}];

    const [locationPermission, backgroundPermission] = locationPermissions;
    if (
      locationPermission !== 'granted' ||
      backgroundPermission !== 'granted' ||
      notificationPermission !== 'granted'
    ) {
      return [false, {route: 'Auth', screen: 'Permissions'}];
    }
    return [false, {route: 'Home', screen: 'DriveStack'}];
  };

  return {
    getAuthRoute,
  };
}
