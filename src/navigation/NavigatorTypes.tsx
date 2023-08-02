import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {BarcodeReading} from '@frayt/sdk';

export type ApplyToDriveStackParamList = {
  Info: undefined;
  Questionnaire: undefined;
  Personal: undefined;
  CreateAccount: {
    market_id: string;
    vehicle_class: string;
    english_proficiency: string;
    email: string;
    phone_number: string;
  };
  Verify: undefined;
  Payouts: undefined;
  Vehicle: undefined;
  VehiclePhotos: undefined;
  BackgroundCheck: undefined;
  RMISScreen: undefined;
  Complete: undefined;
};

export type MatchesStackParamList = {
  Matches: undefined;
  Available: {
    matchId: string;
    isPreferredDriver: boolean;
  };
  Accepted: {
    matchId?: string;
    chosenCargoPhoto?: string;
    chosenCargoPhotoStop?: string;
    chosenBoLPhoto?: string;
    chosenBoLPhotoStop?: string;
  };
  BillOfLading: {
    matchId: string;
  };
  Cargo: {
    matchId: string;
    stopId?: string;
  };
  Signature: {
    matchId: string;
    stopId: string;
  };
  Photo: {
    matchId: string;
    stopId: string;
    documentType: 'Cargo' | 'BoL';
  };
  Barcode: {
    matchId: string;
    stopId?: string;
    neededBarcodes: BarcodeReading[];
  };
  BarcodePhotos: {
    matchId: string;
    stopId?: string;
    neededBarcodes: BarcodeReading[];
  };
};

export type AccountStackParamList = {
  Account: undefined;
  Profile: undefined;
  Vehicle: undefined;
  Payouts: undefined;
  Reports: undefined;
  Notifications: undefined;
  Password: undefined;
  DeliverPro: undefined;
  Logout: undefined;
};

export type SupportStackParamList = {
  Support: undefined;
  GetHelp: undefined;
};

export type HomeTabParamList = {
  DriveStack: undefined;
  MatchesStack: undefined;
  AccountStack: undefined;
  SupportStack: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Approval: undefined;
  Permissions: undefined;
  AgreementsScreen: undefined;
  UpdateCargoCapacityScreen: undefined;
  SetupWalletScreen: undefined;
  LoadUnloadScreen: undefined;
  DocumentsScreen: undefined;
  DocumentCaptureModal: {
    userId: string;
    documentType: string;
    token: string;
  };
  ForgotPassword: undefined;
  PasswordResetSuccess: undefined;
  UpdatePassword: {
    email: string;
    currentPassword: string;
  };
  PasswordUpdated: undefined;
};

export type RootStackParamList = {
  Home: NavigatorScreenParams<HomeTabParamList>;
  ApplyToDrive: NavigatorScreenParams<ApplyToDriveStackParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type HomeTabScreenProps<T extends keyof HomeTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<HomeTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type ApplyToDriveScreenProps<
  T extends keyof ApplyToDriveStackParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<ApplyToDriveStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type MatchesStackProps<T extends keyof MatchesStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<MatchesStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type AccountStackProps<T extends keyof AccountStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AccountStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type SupportStackProps<T extends keyof SupportStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SupportStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type AuthStackProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface RootParamList extends RootStackParamList {}
  }
}
