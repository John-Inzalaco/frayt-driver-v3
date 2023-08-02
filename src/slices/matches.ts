import {
  acceptMatch,
  toggleEnRouteToPickup,
  DriverLocation,
  getAvailableMatches,
  Match,
  arriveAtPickup,
  pickupMatch,
  toggleEnRouteToDropoff,
  arriveAtDropoff,
  signMatch,
  getLiveMatches,
  cancel,
  MatchState,
  arriveAtReturn,
  getCompletedMatches,
  getMatch,
  stopUndeliverable,
  unableToPickup,
  returned,
  sendBarcodes,
  BarcodeReading,
  rejectMatch,
} from '@frayt/sdk';
import {createAsyncThunk, createSelector, createSlice} from '@reduxjs/toolkit';
import {AxiosError} from 'axios';
import {RootState} from '../store';
import {deliver} from '@frayt/sdk';
import {rejectWithValueError} from '../lib/ErrorHelper';
import {
  FilterPages,
  MatchListTypes,
} from '../components/matches/MatchPagination';
import {MigrationManifest, PersistedState} from 'redux-persist';

type MatchesSliceState = {
  version: number;
  availableMatches: Match[];
  acceptedMatches: Match[];
  completedMatches: Match[];
  completedMatchesTotalPages: number;
  currentPage: FilterPages;
  loading: boolean;
  currentMatch: Partial<Match>;
};

export const migrations: MigrationManifest = {
  1: state => {
    const migratedState = {...state} as MatchesSliceState;
    migratedState.completedMatchesTotalPages = 1;
    migratedState.currentPage = {
      Available: 0,
      Accepted: 0,
      Completed: 0,
    };

    return migratedState as unknown as PersistedState;
  },
  3: state => {
    const migratedState = {...state} as MatchesSliceState;
    migratedState.currentMatch = {};
    return migratedState as unknown as PersistedState;
  },
};

export const getAvailable = createAsyncThunk<
  {matches: Match[]},
  {token: string},
  {rejectValue: Error | AxiosError}
>(
  'matches/getAvailable',
  async ({token}: {token: string}, {rejectWithValue}) => {
    try {
      const result = await getAvailableMatches(token);
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const getLive = createAsyncThunk<
  {matches: Match[]},
  {token: string},
  {rejectValue: Error | AxiosError}
>('matches/getLive', async ({token}: {token: string}, {rejectWithValue}) => {
  try {
    const result = await getLiveMatches(token);
    return result;
  } catch (error) {
    return rejectWithValue(rejectWithValueError(error));
  }
});

export const getCompleted = createAsyncThunk<
  {matches: Match[]; totalPages: number},
  {token: string},
  {rejectValue: Error | AxiosError}
>(
  'matches/getCompleted',
  async ({token}: {token: string}, {rejectWithValue}) => {
    try {
      const {matches, total_pages: totalPages} = await getCompletedMatches(
        token,
        0,
        6,
      );
      return {matches: matches, totalPages: totalPages};
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const acceptAction = createAsyncThunk<
  Match,
  {token: string; matchId: string; location: DriverLocation},
  {rejectValue: Error | AxiosError}
>('matches/accept', async ({token, matchId, location}, {rejectWithValue}) => {
  try {
    const result = await acceptMatch(token, matchId, location);
    return result;
  } catch (error) {
    return rejectWithValue(rejectWithValueError(error));
  }
});

export const rejectAction = createAsyncThunk<
  Match,
  {token: string; matchId: string; location: DriverLocation},
  {rejectValue: Error | AxiosError}
>('matches/reject', async ({token, matchId, location}, {rejectWithValue}) => {
  try {
    const result = await rejectMatch(token, matchId, location);
    return result;
  } catch (error) {
    return rejectWithValue(rejectWithValueError(error));
  }
});

export const toggleEnRouteToPickupAction = createAsyncThunk<
  Match,
  {token: string; matchId: string; location: DriverLocation},
  {rejectValue: Error | AxiosError}
>(
  'matches/enRouteToPickup',
  async ({token, matchId, location}, {rejectWithValue}) => {
    try {
      const result = await toggleEnRouteToPickup(token, matchId, location);
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const arriveAtPickupAction = createAsyncThunk<
  Match,
  {token: string; matchId: string; location: DriverLocation},
  {rejectValue: Error | AxiosError}
>(
  'matches/arriveAtPickup',
  async ({token, matchId, location}, {rejectWithValue}) => {
    try {
      const result = await arriveAtPickup(token, matchId, location);
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const pickupCargoAction = createAsyncThunk<
  Match,
  {
    token: string;
    matchId: string;
    userId: string;
    location: DriverLocation;
    photos: {
      originPhoto?: string;
      billOfLading?: string;
    };
  },
  {rejectValue: Error | AxiosError}
>(
  'matches/pickupCargo',
  async ({token, matchId, userId, location, photos}, {rejectWithValue}) => {
    try {
      const result = await pickupMatch(
        token,
        matchId,
        userId,
        location,
        photos.originPhoto,
        photos.billOfLading,
      );
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const toggleEnRouteToDropoffAction = createAsyncThunk<
  Match,
  {token: string; matchId: string; stopId: string; location: DriverLocation},
  {rejectValue: Error | AxiosError}
>(
  'matches/enRouteToDropoff',
  async ({token, matchId, stopId, location}, {rejectWithValue}) => {
    try {
      const result = await toggleEnRouteToDropoff(
        token,
        matchId,
        stopId,
        location,
      );
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const arriveAtDropoffAction = createAsyncThunk<
  Match,
  {token: string; matchId: string; stopId: string; location: DriverLocation},
  {rejectValue: Error | AxiosError}
>(
  'matches/arriveAtDropoff',
  async ({token, matchId, stopId, location}, {rejectWithValue}) => {
    try {
      const result = await arriveAtDropoff(token, matchId, stopId, location);
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const signMatchAction = createAsyncThunk<
  Match,
  {
    token: string;
    matchId: string;
    stopId: string;
    signature: string;
    printedName: string;
    location: DriverLocation;
  },
  {rejectValue: Error | AxiosError}
>(
  'matches/signMatch',
  async (
    {token, matchId, stopId, signature, printedName, location},
    {rejectWithValue},
  ) => {
    try {
      const result = await signMatch(
        token,
        matchId,
        stopId,
        signature,
        printedName,
        location,
      );
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const deliverMatch = createAsyncThunk<
  Match,
  {
    token: string;
    matchId: string;
    stopId: string;
    userId: string;
    location: DriverLocation;
    photos?: {
      destinationPhoto?: string;
    };
  },
  {rejectValue: Error | AxiosError}
>(
  'matches/deliver',
  async (
    {token, matchId, stopId, userId, location, photos},
    {rejectWithValue},
  ) => {
    try {
      const result = await deliver(
        token,
        matchId,
        stopId,
        userId,
        location,
        photos?.destinationPhoto,
      );
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const unableToPickupMatch = createAsyncThunk<
  Match,
  {
    token: string;
    matchId: string;
    reason: string;
    location: DriverLocation;
  },
  {rejectValue: Error | AxiosError}
>(
  'matches/unableToPickupMatch',
  async ({token, matchId, reason, location}, {rejectWithValue}) => {
    try {
      const result = await unableToPickup(token, matchId, location, reason);
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const cancelMatch = createAsyncThunk<
  Match,
  {
    token: string;
    matchId: string;
    reason: string;
    location: DriverLocation;
  },
  {rejectValue: Error | AxiosError}
>(
  'matches/cancelMatch',
  async ({token, matchId, reason, location}, {rejectWithValue}) => {
    try {
      const result = await cancel(token, matchId, location, reason);
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const enRouteToReturn = createAsyncThunk<
  Match,
  {
    token: string;
    matchId: string;
    location: DriverLocation;
  },
  {rejectValue: Error | AxiosError; state: RootState}
>(
  'matches/enRouteToReturn',
  async ({token, matchId, location}, {rejectWithValue, getState}) => {
    try {
      const state = getState();
      const match = getMatchById(state.matches.acceptedMatches, matchId);
      if (match?.state === MatchState.EnRouteToPickup) return new Match(match);
      const result = await toggleEnRouteToPickup(token, matchId, location);
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const arriveAtReturnAction = createAsyncThunk<
  Match,
  {
    token: string;
    matchId: string;
    location: DriverLocation;
  },
  {rejectValue: Error | AxiosError}
>(
  'matches/arriveAtReturn',
  async ({token, matchId, location}, {rejectWithValue}) => {
    try {
      await arriveAtReturn(token, matchId, location);
      // TODO: The droppoff input does not get the updated stop until the app is reoponed
      // Immediately requesting the match again does fix it though
      const result = await getMatch(token, matchId);
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const returnMatch = createAsyncThunk<
  Match,
  {token: string; matchId: string; location: DriverLocation},
  {rejectValue: Error | AxiosError}
>(
  'matches/returnMatch',
  async ({token, matchId, location}, {rejectWithValue}) => {
    try {
      const result = await returned(token, matchId, location);
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const updatePhoto = createAsyncThunk<
  Match,
  {
    matchId: string;
    type: 'BoL' | 'Cargo';
    photo: string;
    index: number;
  },
  {rejectValue: Error; state: RootState}
>(
  'matches/updatePhoto',
  async ({matchId, type, photo, index}, {rejectWithValue, getState}) => {
    try {
      const rootState = getState();
      const state = rootState.matches as MatchesSliceState;

      const match = state.acceptedMatches.find(match => match.id === matchId);
      if (!match)
        throw new Error('Could not find an accepted match with this ID.');
      if (index >= 0) {
        if (type === 'BoL') throw new Error('Dropoffs do not need BoL photos');
        const stop = match.stops.find(
          (_stop, stopIndex) => stopIndex === index,
        );
        if (!stop)
          throw new Error('Could not find a stop at the specified index');

        stop.destination_photo = photo;
        match.stops[index] = stop;
      } else {
        if (type === 'BoL') match.bill_of_lading_photo = photo;
        else match.origin_photo = photo;
      }
      return match;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const sendBarcodesAction = createAsyncThunk<
  Match,
  {
    token: string;
    matchId: string;
    barcodeReadings: BarcodeReading[];
  },
  {rejectValue: Error | AxiosError}
>(
  'matches/sendBarcodes',
  async ({token, matchId, barcodeReadings}, {rejectWithValue}) => {
    try {
      const result = await sendBarcodes(token, matchId, barcodeReadings);
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const getPage = createAsyncThunk<
  {
    type: MatchListTypes;
    matches: Match[];
    newPageIndex: number;
    totalPages?: number;
  },
  {token: string; type: MatchListTypes; direction: number},
  {rejectValue: Error; state: RootState}
>(
  'matches/getPage',
  async ({token, type, direction}, {rejectWithValue, getState}) => {
    try {
      const rootState = getState();
      const {
        currentPage,
        availableMatches,
        acceptedMatches,
        completedMatchesTotalPages,
        completedMatches,
      } = rootState.matches;
      const newPageIndex =
        direction > 0 ? currentPage[type] + 1 : currentPage[type] - 1;

      switch (type) {
        case 'Available':
          return {
            type: type,
            matches: availableMatches,
            newPageIndex: newPageIndex,
          };
        case 'Accepted':
          return {
            type: type,
            matches: acceptedMatches,
            newPageIndex: newPageIndex,
          };
        case 'Completed': {
          if (direction > 0 && newPageIndex > completedMatchesTotalPages) {
            return {
              type: type,
              matches: completedMatches,
              newPageIndex: currentPage[type],
            };
          } else if (direction < 0 && currentPage[type] - 1 < 0) {
            return {
              type: type,
              matches: completedMatches,
              newPageIndex: currentPage[type],
            };
          }
          const {matches: pageResult, total_pages} = await getCompletedMatches(
            token,
            newPageIndex,
            6,
          );

          return {
            type: type,
            matches: pageResult,
            newPageIndex: newPageIndex,
            totalPages: total_pages,
          };
        }
        default:
          throw new Error('Encountered an unknown error.');
      }
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

export const getMatchAction = createAsyncThunk<
  Match,
  {matchId: string},
  {rejectValue: Error; state: RootState}
>('matches/getMatchAction', async ({matchId}, {rejectWithValue, getState}) => {
  try {
    const {
      user: {token},
    } = getState();
    const match = await getMatch(token || '', matchId);

    return match;
  } catch (err) {
    return rejectWithValue(rejectWithValueError(err));
  }
});
export const undeliverStop = createAsyncThunk<
  Match,
  {
    token: string;
    matchId: string;
    stopId: string;
    location: DriverLocation;
    reason: string;
  },
  {rejectValue: Error | AxiosError}
>(
  'matches/stopUndeliverable',
  async ({token, matchId, stopId, location, reason}, {rejectWithValue}) => {
    try {
      const result = await stopUndeliverable(
        token,
        matchId,
        stopId,
        location,
        reason,
      );
      return result;
    } catch (error) {
      return rejectWithValue(rejectWithValueError(error));
    }
  },
);

const matchesSlice = createSlice({
  name: 'matches',
  initialState: {
    version: 3,
    availableMatches: [],
    acceptedMatches: [],
    completedMatches: [],
    completedMatchesTotalPages: 1,
    currentPage: {
      Available: 0,
      Accepted: 0,
      Completed: 0,
    },
    loading: false,
    currentMatch: {},
  } as MatchesSliceState,
  reducers: {
    updateCurrentMatch: (state, action) => {
      state.currentMatch = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(getAvailable.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(getAvailable.fulfilled, (state, action) => {
      const {matches} = action.payload;
      const availableMatches = matches.filter(
        match => match.state === MatchState.AssigningDriver,
      );
      state.availableMatches = availableMatches;
      state.currentPage['Available'] = 0;
      state.loading = false;
    });
    builder.addCase(getAvailable.rejected, (state, _action) => {
      state.loading = false;
    });
    builder.addCase(getLive.fulfilled, (state, action) => {
      const {matches} = action.payload;
      const acceptedMatches = matches.filter(match =>
        new Match(match).isLive(),
      );
      state.acceptedMatches = acceptedMatches;
      state.currentPage['Accepted'] = 0;
    });
    builder.addCase(getCompleted.fulfilled, (state, action) => {
      const {matches, totalPages} = action.payload;
      state.completedMatches = matches;
      state.completedMatchesTotalPages = totalPages;
      state.currentPage['Completed'] = 0;
    });
    builder.addCase(getPage.fulfilled, (state, action) => {
      const {type, newPageIndex, matches, totalPages} = action.payload;
      switch (type) {
        case 'Available':
          state.availableMatches = matches;
          break;
        case 'Accepted':
          state.acceptedMatches = matches;
          break;
        case 'Completed':
          state.completedMatches = matches;
          state.completedMatchesTotalPages = totalPages ?? 1;
          break;
      }
      state.currentPage[type] = newPageIndex;
    });
    builder.addCase(acceptAction.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(acceptAction.fulfilled, (state, action) => {
      const match = action.payload;
      state.availableMatches = state.availableMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
      state.acceptedMatches.push(match);
      state.loading = false;
    });
    builder.addCase(acceptAction.rejected, (state, _action) => {
      state.loading = false;
    });

    builder.addCase(rejectAction.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(rejectAction.fulfilled, (state, _action) => {
      state.loading = false;
    });
    builder.addCase(rejectAction.rejected, (state, _action) => {
      state.loading = false;
    });
    builder.addCase(toggleEnRouteToPickupAction.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(toggleEnRouteToPickupAction.fulfilled, (state, action) => {
      const match = action.payload;
      state.acceptedMatches = state.acceptedMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
      state.acceptedMatches.push(match);
      state.loading = false;
    });
    builder.addCase(toggleEnRouteToPickupAction.rejected, (state, _action) => {
      state.loading = false;
    });
    builder.addCase(arriveAtPickupAction.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(arriveAtPickupAction.fulfilled, (state, action) => {
      const match = action.payload;
      state.acceptedMatches = state.acceptedMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
      state.acceptedMatches.push(match);
      state.loading = false;
    });
    builder.addCase(arriveAtPickupAction.rejected, (state, _action) => {
      state.loading = false;
    });
    builder.addCase(pickupCargoAction.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(pickupCargoAction.fulfilled, (state, action) => {
      const match = action.payload;
      state.acceptedMatches = state.acceptedMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
      state.acceptedMatches.push(match);
      state.loading = false;
    });
    builder.addCase(pickupCargoAction.rejected, (state, _action) => {
      state.loading = false;
    });
    builder.addCase(toggleEnRouteToDropoffAction.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(toggleEnRouteToDropoffAction.fulfilled, (state, action) => {
      const match = action.payload;
      state.acceptedMatches = state.acceptedMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
      state.acceptedMatches.push(match);
      state.loading = false;
    });
    builder.addCase(toggleEnRouteToDropoffAction.rejected, (state, _action) => {
      state.loading = false;
    });
    builder.addCase(arriveAtDropoffAction.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(arriveAtDropoffAction.fulfilled, (state, action) => {
      const match = action.payload;
      state.acceptedMatches = state.acceptedMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
      state.acceptedMatches.push(match);
      state.loading = false;
    });
    builder.addCase(arriveAtDropoffAction.rejected, (state, _action) => {
      state.loading = false;
    });
    builder.addCase(signMatchAction.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(signMatchAction.fulfilled, (state, action) => {
      const match = action.payload;
      state.acceptedMatches = state.acceptedMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
      state.acceptedMatches.push(match);
      state.loading = false;
    });
    builder.addCase(signMatchAction.rejected, (state, _action) => {
      state.loading = false;
    });
    builder.addCase(deliverMatch.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(deliverMatch.fulfilled, (state, action) => {
      const match = action.payload;
      state.acceptedMatches = state.acceptedMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
      state.completedMatches.push(match);
      state.loading = false;
    });
    builder.addCase(deliverMatch.rejected, (state, _action) => {
      state.loading = false;
    });
    builder.addCase(cancelMatch.fulfilled, (state, action) => {
      const match = action.payload;
      state.acceptedMatches = state.acceptedMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
    });
    builder.addCase(unableToPickupMatch.fulfilled, (state, action) => {
      const match = action.payload;
      state.acceptedMatches = state.acceptedMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
    });
    builder.addCase(enRouteToReturn.fulfilled, (state, action) => {
      const match = action.payload;
      state.acceptedMatches = state.acceptedMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
      state.acceptedMatches.push(match);
    });
    builder.addCase(arriveAtReturnAction.fulfilled, (state, action) => {
      const match = action.payload;
      state.acceptedMatches = state.acceptedMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
      state.acceptedMatches.push(match);
    });
    builder.addCase(returnMatch.fulfilled, (state, action) => {
      const match = action.payload;
      state.acceptedMatches = state.acceptedMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
    });
    builder.addCase(updatePhoto.fulfilled, (state, action) => {
      const match = action.payload;
      state.currentMatch = match;
    });
    builder.addCase(sendBarcodesAction.pending, (state, _action) => {
      state.loading = true;
    });
    builder.addCase(sendBarcodesAction.fulfilled, (state, action) => {
      const match = action.payload;
      state.acceptedMatches = state.acceptedMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
      state.acceptedMatches.push(match);
      state.loading = false;
    });
    builder.addCase(sendBarcodesAction.rejected, (state, _action) => {
      state.loading = false;
    });
    builder.addCase(getMatchAction.fulfilled, (state, action) => {
      const match = action.payload;

      let matchIdx = -1;
      if (new Match(match).isLive()) {
        matchIdx = state.acceptedMatches.findIndex(
          acceptedMatch => match.id === acceptedMatch.id,
        );
        if (matchIdx === -1) {
          state.acceptedMatches.push(match);
        } else {
          state.acceptedMatches.splice(matchIdx, 1, match);
        }
      } else {
        matchIdx = state.availableMatches.findIndex(
          availableMatch => match.id === availableMatch.id,
        );
        if (matchIdx === -1) {
          state.availableMatches.push(match);
        } else {
          state.availableMatches.splice(matchIdx, 1, match);
        }
      }
      state.loading = false;
    });
    builder.addCase(undeliverStop.fulfilled, (state, action) => {
      const match = action.payload;
      state.acceptedMatches = state.acceptedMatches.filter(
        filterMatch => match.id !== filterMatch.id,
      );
      state.acceptedMatches.push(match);
    });
  },
});

export const selectAvailableMatchByID = createSelector(
  [
    // Usual first input - extract value from `state`
    state => state.matches.availableMatches,
    // Take the second arg, `id`, and forward it to the output selector
    (state, id) => id,
  ],
  // Output selector gets (`matches, id)` as args
  (availableMatches, id) => {
    const match = getMatchById(availableMatches, id);
    return match ? new Match(match) : undefined;
  },
);

export const selectAcceptedMatchById = createSelector(
  [
    // Usual first input - extract value from `state`
    state => state.matches.acceptedMatches,
    // Take the second arg, `id`, and forward it to the output selector
    (state, id) => id,
  ],
  // Output selector gets (`matches, id)` as args
  (acceptedMatches, id) => {
    const match = getMatchById(acceptedMatches, id);
    return match ? new Match(match) : undefined;
  },
);

export const selectMatchById = createSelector(
  [
    // Usual first input - extract value from `state`
    state => [
      ...state.matches.completedMatches,
      ...state.matches.availableMatches,
      ...state.matches.acceptedMatches,
    ],
    // Take the second arg, `id`, and forward it to the output selector
    (state, id) => id,
  ],
  // Output selector gets (`matches, id)` as args
  (matches, id) => {
    const match = getMatchById(matches, id);
    return match ? new Match(match) : undefined;
  },
);

export const selectAvailableMatches = (state: RootState) =>
  state.matches.availableMatches.map(match => new Match(match));
export const selectAcceptedMatches = (state: RootState) =>
  state.matches.acceptedMatches.map(match => new Match(match));
export const selectCompletedMatches = (state: RootState) =>
  state.matches.completedMatches.map(match => new Match(match));
export default matchesSlice.reducer;
export const {updateCurrentMatch} = matchesSlice.actions;

const getMatchById = (matches: Match[], matchId: string) => {
  return matches.find((match: Match) => match?.id === matchId);
};
