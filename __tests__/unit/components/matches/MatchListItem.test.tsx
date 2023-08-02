import {Match} from '@frayt/sdk';
import MatchListItem from '../../../../src/components/matches/MatchListItem';
import {fireEvent, render, screen} from '../../../test-utils';
import match from '../../../matchResponse.js';

describe('MatchListItem', () => {
  it('Shows proper match data for match', () => {
    const newMatch = new Match(match);
    const navigate = jest.fn();
    const {debug} = render(
      <MatchListItem
        match={newMatch}
        navigation={{navigate}}
        index={1}
        type="Available"
        detail={false}
      />,
    );
    expect(screen.getByText('Cincinnati, OH > Cincinnati, OH')).toBeTruthy();
    expect(screen.getByText('$22.44')).toBeTruthy();
    expect(screen.getByText('0.7 mi', {exact: false})).toBeTruthy();
    expect(screen.getByText('1 lbs', {exact: false})).toBeTruthy();
    expect(screen.getByText('Dash', {exact: false})).toBeTruthy();

    fireEvent.press(screen.getByTestId('MatchListItem.AvailableButton'));
    expect(navigate).toHaveBeenCalledWith('Available', {
      matchId: '3be78271-9edc-4c02-9078-66faa9b9035b',
      isPreferredDriver: false,
    });
  });
});
