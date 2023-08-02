import {combineReducers, configureStore} from '@reduxjs/toolkit';
import userReducer, {migrations as migrateUsersState} from './slices/user';
import matchesReducer, {
  migrations as migrateMatchesState,
} from './slices/matches';
import {createMigrate, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistUsersConfig = {
  key: 'usersSlice',
  version: 1,
  storage: AsyncStorage,
  migrate: createMigrate(migrateUsersState, {debug: true}),
};

const persistMatchesConfig = {
  key: 'matchesSlice',
  version: 3,
  storage: AsyncStorage,
  migrate: createMigrate(migrateMatchesState, {debug: true}),
};

const persistedUsersReducer = persistReducer(persistUsersConfig, userReducer);
const persistedMatchesReducer = persistReducer(
  persistMatchesConfig,
  matchesReducer,
);

const persistedReducer = combineReducers({
  user: persistedUsersReducer,
  matches: persistedMatchesReducer,
});

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
