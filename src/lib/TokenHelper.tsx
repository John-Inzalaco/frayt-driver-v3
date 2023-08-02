import {useSelector} from 'react-redux';
import {selectToken} from '../slices/user';

export function useToken(): {token: string | null} {
  const token = useSelector(selectToken);

  return {token: token};
}
