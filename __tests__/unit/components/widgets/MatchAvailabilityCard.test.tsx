import {Driver} from '@frayt/sdk';
import * as React from 'react';
import MatchAvailabilityCard from '../../../../src/components/widgets/MatchAvailabilityCard';
import {render, screen} from '../../../test-utils';

describe('Match Availability Widget', () => {
  it('Shows how many notifications for matches were sent to the driver in the past week by day', () => {
    const driver = new Driver({} as any);
    render(<MatchAvailabilityCard driver={driver} />);

    expect(screen.getByText('Match Availability')).toBeTruthy();
  });
});
