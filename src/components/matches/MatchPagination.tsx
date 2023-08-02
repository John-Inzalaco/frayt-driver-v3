import {StyleSheet, View} from 'react-native';
import {Button} from '../../components/ui-kitten/Button';
import {Text} from '../../components/ui-kitten/Text';
import Icon from 'react-native-vector-icons/FontAwesome5Pro';
import {useStyleSheet} from '@ui-kitten/components';
import {getPage} from '../../slices/matches';
import {Match} from '@frayt/sdk';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {useToken} from '../../lib/TokenHelper';

export type MatchListTypes = 'Available' | 'Accepted' | 'Completed';

export type FilterPages = {
  [key in MatchListTypes]: number;
};

type MatchPaginationProps = {
  currentPage: FilterPages;
  filter: MatchListTypes;
  matches: Match[];
};

export function getTotalPages(matches: Match[]) {
  return matches.length < 1 ? 0 : Math.ceil(matches.length / 6.0);
}

// paginate matches, 6 matches per page, returns an array of arrays of matches
export function getPaginatedMatches(matches: Match[]) {
  const newMatches = [];
  const lastPage = getTotalPages(matches);

  for (let page = 0; page < lastPage; page++) {
    if (page === lastPage) {
      newMatches.push(matches.slice(page * 6));
    } else {
      newMatches.push(matches.slice(page * 6, page * 6 + 6));
    }
  }

  return newMatches;
}

export default function MatchPagination({
  currentPage,
  filter,
  matches,
}: MatchPaginationProps): JSX.Element {
  const styles = useStyleSheet(themedStyles);
  const {token} = useToken();
  const dispatch = useAppDispatch();
  const completedMatchesTotalPages = useAppSelector(
    state => state.matches.completedMatchesTotalPages,
  );

  return (
    <View style={styles.viewForNavButtons}>
      <View style={styles.previousView}>
        <Button
          size="tiny"
          disabled={currentPage[filter] === 0}
          onPress={() => {
            dispatch(
              getPage({token: token ?? '', type: filter, direction: -1}),
            );
          }}
          accessoryLeft={props => {
            return (
              <Icon
                name="chevron-left"
                color={props?.style.tintColor}
                style={styles.icon}
                solid
              />
            );
          }}>
          PREVIOUS
        </Button>
      </View>
      <View style={styles.pageNumberView}>
        <Text category="p1">{`${currentPage[filter] + 1} of ${
          filter === 'Completed'
            ? completedMatchesTotalPages
            : getTotalPages(matches)
        }`}</Text>
      </View>
      <View style={styles.nextView}>
        <Button
          size="tiny"
          disabled={
            currentPage[filter] + 1 ===
            (filter === 'Completed'
              ? completedMatchesTotalPages
              : getTotalPages(matches))
          }
          onPress={async () => {
            dispatch(getPage({token: token ?? '', type: filter, direction: 1}));
          }}
          accessoryRight={props => {
            return (
              <Icon
                name="chevron-right"
                color={props?.style.tintColor}
                style={styles.icon}
                solid
              />
            );
          }}>
          NEXT
        </Button>
      </View>
    </View>
  );
}

const themedStyles = StyleSheet.create({
  previousView: {
    flex: 1,
    alignItems: 'flex-start',
  },
  pageNumberView: {
    flex: 1,
    alignItems: 'center',
  },
  nextView: {
    flex: 1,
    alignItems: 'flex-end',
  },
  viewForNavButtons: {
    flexDirection: 'row',
  },
  icon: {
    bottom: 1,
  },
});
