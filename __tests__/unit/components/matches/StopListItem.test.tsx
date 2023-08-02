import {Match} from '@frayt/sdk';
import StopListItem from '../../../../src/components/matches/StopListItem';
import {render, screen} from '../../../test-utils';
import matchResponse from '../../../matchResponse.js';

describe('StopListItem', () => {
  it("Shows active status if chosen stop is the current stop", () => {
    const match = new Match(matchResponse);
    const {debug} = render(
      <StopListItem
        stop={match.stops[0]}
        index={0}
        chosenStop={match.stops[0]}
        stops={match.stops}
      />,
    );
    expect(screen.getByText('ACTIVE')).toBeTruthy();
    expect(
      screen.getByText(match.stops[0].destination_address.address, {
        exact: false,
      }),
    ).toBeTruthy();
  });

  it("Shows inactive status if chosen stop is not the stop's index", () => {
    const match = new Match(matchResponse);
    const {debug} = render(
      <StopListItem
        stop={match.stops[0]}
        index={0}
        chosenStop={match.stops[1]}
        stops={match.stops}
      />,
    );
    expect(screen.getByText('SELECT')).toBeTruthy();
  });
});
