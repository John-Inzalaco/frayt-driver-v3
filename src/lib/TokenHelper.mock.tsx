import {useEffect, useReducer} from 'react';
import {Alert} from 'react-native';
import {BASE_URL} from '../env';

export function useToken() {
  const initialState = {
    token: null,
    status: 'idle',
  };

  const [state, dispatch] = useReducer((state: any, action: any) => {
    switch (action.type) {
      case 'FETCHING':
        return {...state, status: 'fetching'};
      case 'FETCHED':
        return {...state, status: 'fetched', token: action.payload};
      case 'FETCH_ERROR':
        return {...state, status: 'error', error: action.payload};
      default:
        return state;
    }
  }, initialState);

  const tryToLogin = async () => {
    try {
      dispatch({type: 'FETCHING'});
      const result = await fetch(`${BASE_URL}sessions/drivers`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'user@frayt.com',
          password: 'password@1',
        }),
      });

      const jsonResult = await result.json();
      dispatch({type: 'FETCHED', payload: jsonResult.response.token});
    } catch (error) {
      dispatch({type: 'FETCH_ERROR', payload: error});
      if (typeof error === 'string') {
        Alert.alert('Login Error', error);
      } else if (error instanceof Error) {
        Alert.alert('Login error', error.message);
      } else {
        console.warn(error);
      }
    }
  };

  useEffect(() => {
    tryToLogin();
  }, []);

  return state;
}
