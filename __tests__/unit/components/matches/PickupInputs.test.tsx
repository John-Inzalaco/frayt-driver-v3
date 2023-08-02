import {Match, MatchState} from '@frayt/sdk';
import {PickupInputs} from '../../../../src/components/matches/PickupInputs';
import matchResponse from '../../../matchResponse.js';
import {fireEvent, render, screen} from '../../../test-utils';

describe('PickupInputs', () => {
  it('should toggle the match state between "Accepted" and "En Route To Pickup".', () => {
    const match = new Match(matchResponse);
    const navigate = jest.fn();
    const route = jest.fn();
    const callback = jest.fn((state: MatchState) => (match.state = state));
    const {debug} = render(
      <PickupInputs
        match={match}
        navigation={{navigate}}
        route={{route}}
        setMatchStateCallback={callback}
      />,
    );
    fireEvent(screen.getByTestId('EnRouteToPickup'), 'onChange', true);
    expect(match.state).toBe(MatchState.EnRouteToPickup);
    fireEvent(screen.getByTestId('EnRouteToPickup'), 'onChange', false);
    expect(match.state).toBe(MatchState.Accepted);
  });
});
