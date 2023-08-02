import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import type {RootState} from '../store';
import {
  createUnapprovedUser,
  saveAccountUpdates,
  login,
  Driver,
  PersonalValues,
  ProfileValues,
  IdentityValues,
  VehiclePhotosValues,
  DriverData,
  createVehicle,
  Vehicle,
  updateVehicle,
  updateOneSignalId,
  chargeBackgroundCheck,
  type BackgroundCheckResult,
  UserDeviceResult,
  AgreementDocument,
  updateAgreements,
  saveLocationUpdates,
  updateUserCargoCapacity,
  createUserPaymentInfo,
  CargoCapacityMeasurements,
  DriverLocation,
  updateUserDocument,
  updateUserLoadUnload,
  getUser,
  DocumentType,
} from '@frayt/sdk';
import {AgreementValues} from '../screens/apply-to-drive/CreateAccount';
import {PaymentMethod, PaymentIntent} from '@stripe/stripe-react-native';
import {AxiosError} from 'axios';
import Intercom from '@intercom/intercom-react-native';
import DeviceInfo from 'react-native-device-info';
import {DeviceState} from 'react-native-onesignal';
import {Coords} from 'react-native-background-geolocation-android';
import BackgroundActions from 'react-native-background-actions';
import FullStory from '@fullstory/react-native';
import {handleError, rejectWithValueError} from '../lib/ErrorHelper';
import {upsertArray} from '../lib/Utilities';
import * as Sentry from '@sentry/react-native';
import {MigrationManifest, PersistedState} from 'redux-persist';
import {Image} from 'react-native';

type UserSliceState = {
  version: number;
  theme: 'Light' | 'Dark';
  token: string | null;
  driver: DriverData | null;
  loading: boolean;
  oneSignalNotificationId: string | null;
};

type CreateUnapprovedUserData = {
  market_id: string;
  vehicle_class: string;
  english_proficiency: string;
  agreements: AgreementValues[];
  signature: string;
  user: {
    password: string;
    email: string;
  };
};

export const migrations: MigrationManifest = {
  1: state => {
    const migratedState = {...state} as UserSliceState;
    if (!migratedState.theme) migratedState.theme = 'Dark';

    return migratedState as unknown as PersistedState;
  },
};

export const saveOnesignalId = createAsyncThunk<
  string,
  DeviceState,
  {rejectValue: Error | AxiosError}
>('saveOneSignalId', async (device, {rejectWithValue}) => {
  try {
    if (!device) throw new Error('Could not retrieve device information');
    await Intercom.sendTokenToIntercom(device?.pushToken);
    return device.userId;
  } catch (error) {
    return rejectWithValue(rejectWithValueError(error));
  }
});

export const updateOneSignalNotificationId = createAsyncThunk<
  UserDeviceResult | null,
  null,
  {
    state: RootState;
    rejectValue: Error | AxiosError;
  }
>(
  'updateOneSignalNotificationId',
  async (_, {getState, rejectWithValue, dispatch}) => {
    const delay = 1 * 60 * 1000;
    const retry = async () => {
      if (!(await dispatch(updateOneSignalNotificationId(null)).unwrap())) {
        setTimeout(retry, delay);
      }
    };

    try {
      const {
        user: {oneSignalNotificationId, token},
      } = getState();

      if (oneSignalNotificationId) {
        const payload = {
          device_uuid: await DeviceInfo.getUniqueId(),
          device_model: DeviceInfo.getDeviceId(),
          player_id: oneSignalNotificationId,
          os: DeviceInfo.getSystemName(),
          os_version: DeviceInfo.getSystemVersion(),
          is_tablet: DeviceInfo.isTablet(),
          is_location_enabled: await DeviceInfo.isLocationEnabled(),
          app_version: DeviceInfo.getVersion(),
          app_revision: '' /* TODO: Codepush can run `await getRevision()` */,
          app_build_number: DeviceInfo.getBuildNumber(),
        };

        const response = await updateOneSignalId(token || '', payload);

        return response;
      } else {
        setTimeout(retry, delay);
        return null;
      }
    } catch (error) {
      setTimeout(retry, delay);
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const loginUser = createAsyncThunk<
  {token: string; driver: DriverData},
  {email: string; password: string},
  {rejectValue: Error | AxiosError; state: RootState}
>('users/login', async ({email, password}, {rejectWithValue}) => {
  try {
    const {token, driver} = await login(email, password);
    // TODO: Remove Intercom.logout() once onboarding navigation
    // doesn't take user to LoginScreen if they're already logged in when booting app
    Intercom.loginUserWithUserAttributes({userId: driver.id});
    Intercom.updateUser({
      email: driver.email,
      name: `${driver.first_name} ${driver.last_name}`,
      phone: driver.phone_number ?? undefined,
      customAttributes: {
        contact_type: 'driver',
      },
    });
    Sentry.setUser({email: driver.email});

    return {token, driver};
  } catch (error) {
    return rejectWithValue(rejectWithValueError(error));
  }
});

export const getDriver = createAsyncThunk<
  {driver: DriverData},
  {token: string},
  {rejectValue: Error | AxiosError}
>('users/getUser', async ({token: token}, {rejectWithValue}) => {
  try {
    const {userData} = await getUser(token);
    return {driver: userData};
  } catch (error) {
    return rejectWithValue(rejectWithValueError(error));
  }
});

export const logoutUser = createAsyncThunk<{token: null; driver: null}>(
  'users/logout',
  async () => {
    const token = null;
    const driver = null;
    await BackgroundActions.stop();
    Intercom.logout();
    FullStory.anonymize();
    return {token, driver};
  },
);

export const createUser = createAsyncThunk<
  {token: string; driver: DriverData},
  {data: CreateUnapprovedUserData},
  {rejectValue: Error; state: RootState}
>('users/create', async ({data}, {rejectWithValue}) => {
  try {
    const {token, userData: driver} = await createUnapprovedUser(data);
    return {token, driver};
  } catch (error) {
    return rejectWithValue(rejectWithValueError(error));
  }
});

export const updateUser = createAsyncThunk<
  DriverData,
  {
    token: string;
    data:
      | PersonalValues
      | IdentityValues
      | {vehicle_photos: VehiclePhotosValues}
      | ProfileValues
      | {state: 'registered' | 'pending_approval'};
  },
  {rejectValue: Error}
>('users/updateUser', async ({token, data}, {rejectWithValue}) => {
  try {
    const result: DriverData = await saveAccountUpdates(data, token);
    return result;
  } catch (error) {
    return rejectWithValue(rejectWithValueError(error));
  }
});

export const createBackgroundChargePayment = createAsyncThunk<
  BackgroundCheckResult,
  {
    token: string | null;
    paymentMethod?: PaymentMethod.Result;
    paymentIntent?: PaymentIntent.Result;
  },
  {rejectValue: Error}
>(
  'users/createPaymentIntent',
  async ({token, paymentMethod, paymentIntent}, {rejectWithValue}) => {
    try {
      const result = await chargeBackgroundCheck(
        token,
        paymentMethod,
        paymentIntent,
      );
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const createDriverVehicle = createAsyncThunk<
  Vehicle,
  {token: string; data: any},
  {rejectValue: Error}
>('users/createVehicle', async ({token, data}, {rejectWithValue}) => {
  try {
    const result: Vehicle = await createVehicle(data, token);
    return result;
  } catch (error) {
    return rejectWithValue(rejectWithValueError(error));
  }
});

export const updateDriverVehicle = createAsyncThunk<
  Vehicle,
  {token: string; vehicleId: string; data: any},
  {rejectValue: Error}
>(
  'users/createVehicle',
  async ({vehicleId, token, data}, {rejectWithValue}) => {
    try {
      const result: Vehicle = await updateVehicle(vehicleId, data, token);
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const updateAgreementsList = createAsyncThunk<
  AgreementDocument[],
  {agreements: string[]; token: string},
  {rejectValue: Error}
>('users/updateAgreements', async ({agreements, token}, {rejectWithValue}) => {
  try {
    const {pending_agreements} = await updateAgreements(agreements, token);
    return pending_agreements;
  } catch (error) {
    return rejectWithValue(rejectWithValueError(error));
  }
});

export const updateDriverLocation = createAsyncThunk<
  DriverLocation,
  {location: Coords; token: string},
  {rejectValue: Error}
>('users/location', async ({location, token}, {rejectWithValue}) => {
  try {
    const {latitude, longitude} = location;
    const result: DriverLocation = await saveLocationUpdates(
      latitude.toString(),
      longitude.toString(),
      token,
    );
    return result;
  } catch (error) {
    return rejectWithValue(rejectWithValueError(error));
  }
});

export const updateCargoCapacity = createAsyncThunk<
  CargoCapacityMeasurements,
  {
    vehicleCapacity: CargoCapacityMeasurements;
    vehicleId: string;
    token: string;
  },
  {rejectValue: Error}
>(
  'users/updateCargoCapacity',
  async ({vehicleCapacity, vehicleId, token}, {rejectWithValue}) => {
    try {
      const {capacityMeasurements} = await updateUserCargoCapacity(
        vehicleCapacity,
        vehicleId,
        token,
      );
      return capacityMeasurements;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const createPaymentInfo = createAsyncThunk<
  any,
  {ssn: string | null; agree_to_tos: boolean; token: string},
  {rejectValue: Error}
>(
  'users/createPaymentInfo',
  async ({ssn, agree_to_tos, token}, {rejectWithValue}) => {
    try {
      const {wallet_state}: {wallet_state: any} = await createUserPaymentInfo(
        ssn,
        agree_to_tos,
        token,
      );
      return wallet_state;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const updateDriverDocument = createAsyncThunk<
  Document,
  {
    image: Image;
    expirationDate: moment.Moment;
    documentType: DocumentType;
    userId: string;
    token: string;
  },
  {rejectValue: Error}
>(
  'users/updateUserDocument',
  async (
    {image, expirationDate, documentType, userId, token},
    {rejectWithValue},
  ) => {
    try {
      const result = await updateUserDocument(
        image,
        expirationDate,
        documentType,
        userId,
        token,
      );
      return result;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error);
      }
      throw error;
    }
  },
);

export const updateLoadUnload = createAsyncThunk<
  any,
  {canLoad: boolean; token: string},
  {rejectValue: Error}
>('users/updateUserLoadUnload', async ({canLoad, token}, {rejectWithValue}) => {
  try {
    const userData = await updateUserLoadUnload(canLoad, token);
    return userData;
  } catch (error) {
    return rejectWithValue(rejectWithValueError(error));
  }
});

export const updateUserState = createAsyncThunk<
  DriverData,
  {
    data:
      | PersonalValues
      | IdentityValues
      | {vehicle_photos: VehiclePhotosValues}
      | ProfileValues
      | {state: 'registered' | 'pending_approval'};
  },
  {rejectValue: Error | AxiosError; state: RootState}
>('users/updateUserState', async ({data}, {getState, rejectWithValue}) => {
  try {
    const {
      user: {token},
    } = getState();

    const result: DriverData = await saveAccountUpdates(data, token || '');
    return result;
  } catch (error) {
    return rejectWithValue(rejectWithValueError(error));
  }
});

const driverSlice = createSlice({
  name: 'user',
  initialState: {
    version: 2,
    theme: 'Dark',
    token: null,
    driver: null,
    loading: false,
    oneSignalNotificationId: null,
  } as UserSliceState,
  reducers: {
    toggleTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(loginUser.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      const {token, driver} = action.payload;
      state.token = token;
      state.driver = driver;
      state.loading = false;
    });
    builder.addCase(loginUser.rejected, (state, _action) => {
      state.loading = false;
    });
    builder.addCase(getDriver.fulfilled, (state, action) => {
      const {driver} = action.payload;
      state.driver = driver;
    });
    builder.addCase(getDriver.rejected, (state, _action) => {
      state.driver = null;
      state.token = null;
    });
    builder.addCase(logoutUser.fulfilled, (state, action) => {
      const {token, driver} = action.payload;
      state.token = token;
      state.driver = driver;
    });
    builder.addCase(createUser.fulfilled, (state, action) => {
      const {token, driver} = action.payload;
      state.token = token;
      state.driver = driver;
    });
    builder.addCase(updateUser.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(updateUser.fulfilled, (state, action) => {
      state.driver = action.payload;
      state.loading = false;
    });
    builder.addCase(updateUser.rejected, (state, _action) => {
      state.loading = false;
    });
    builder.addCase(
      createBackgroundChargePayment.fulfilled,
      (state, action) => {
        const {driver} = action.payload;
        state.driver = driver;
      },
    );
    builder.addCase(saveOnesignalId.fulfilled, (state, action) => {
      state.oneSignalNotificationId = action.payload;
    });
    builder.addCase(
      updateOneSignalNotificationId.fulfilled,
      (state, action) => {
        const device = action.payload;
        if (device && state.driver) {
          state.driver.default_device_id = device.id;
          state.driver.devices = upsertArray(
            [...state.driver.devices],
            'id',
            device,
          );
        }
      },
    );
    builder.addCase(updateAgreementsList.fulfilled, (state, action) => {
      if (state.driver) state.driver.pending_agreements = action.payload;
    });
    builder.addCase(updateDriverLocation.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(updateDriverLocation.fulfilled, (state, action) => {
      if (state.driver) state.driver.current_location = action.payload;
      state.loading = false;
    });
    builder.addCase(updateDriverLocation.rejected, (state, action) => {
      state.loading = false;
      handleError(action.payload);
    });
    builder.addCase(updateCargoCapacity.fulfilled, (state, action) => {
      state.driver.vehicle = {
        ...state.driver?.vehicle,
        ...action.payload,
      };
    });
    builder.addCase(createPaymentInfo.fulfilled, (state, action) => {
      if (state.driver) state.driver.wallet_state = action.payload;
    });
    builder.addCase(updateDriverDocument.fulfilled, (state, action) => {
      state.driver.images = state.driver?.images.map(image =>
        image.type === action.payload.type ? action.payload : image,
      );
      state.driver.vehicle.images = state.driver?.vehicle?.images.map(image =>
        image.type === action.payload.type ? action.payload : image,
      );
    });
    builder.addCase(updateLoadUnload.fulfilled, (state, action) => {
      if (state.driver) state.driver.can_load = action.payload.can_laod;
    });
    builder.addCase(updateUserState.fulfilled, (state, action) => {
      state.driver = action.payload;
    });
  },
});

export const selectDriver = (state: RootState) =>
  state.user.driver ? new Driver(state.user.driver) : null;
export const selectToken = (state: RootState) => state.user.token;
export const selectOneSignalNotificationId = (state: RootState) =>
  state.user.oneSignalNotificationId;
export const selectDriverCoordinates = (state: RootState) =>
  state.user.driver?.current_location;
export const selectTheme = (state: RootState) => state.user.theme;

export const {toggleTheme} = driverSlice.actions;
export default driverSlice.reducer;
