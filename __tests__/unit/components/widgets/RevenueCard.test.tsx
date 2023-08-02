import {Driver} from '@frayt/sdk';
import * as React from 'react';
import RevenueCard from '../../../../src/components/widgets/RevenueCard';
import {render, screen} from '../../../test-utils';

describe('Weekly Revenue Widget', () => {
  it('Shows revenue made in the past week by day', () => {
    const driver = new Driver({} as any);
    render(<RevenueCard driver={driver} />);

    expect(screen.getByText('Weekly Revenue')).toBeTruthy();
  });
});
