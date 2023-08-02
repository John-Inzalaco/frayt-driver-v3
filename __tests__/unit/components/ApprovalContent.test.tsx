import * as React from 'react';
import {Driver, DocumentType} from '@frayt/sdk';
import {screen} from '@testing-library/react-native';
import {ApprovalContent} from '../../../src/components/ApprovalContent';
import {render} from '../../test-utils';
import {
  approvedDocuments,
  rejectedDocuments,
  waitingApprovalDocuments,
} from '../../helpers';
import {NavigationContainer} from '@react-navigation/native';

describe('Approved', () => {
  it('Show application approved if driver is approved with valid documents', () => {
    const driver = new Driver({
      state: 'approved',
      images: approvedDocuments(),
      vehicle: {images: approvedDocuments()},
    } as any);
    render(
      <NavigationContainer>
        <ApprovalContent testDriver={driver} />
      </NavigationContainer>,
    );

    expect(
      screen.getByText('You have been approved to drive for FRAYT!'),
    ).toBeTruthy();
  });

  it('Show documents in review if driver is approved but documents have not yet been approved', () => {
    const driver = new Driver({
      state: 'approved',
      images: waitingApprovalDocuments(),
      vehicle: {images: waitingApprovalDocuments()},
    } as any);
    render(
      <NavigationContainer>
        <ApprovalContent testDriver={driver} />
      </NavigationContainer>,
    );
    expect(screen.getByText('Documents Are In Review')).toBeTruthy();
  });

  it('Show documents need to be reuploaded if driver is approved but document(s) are rejected', () => {
    const driver = new Driver({
      state: 'approved',
      images: rejectedDocuments(),
      vehicle: {images: approvedDocuments()},
    } as any);
    render(
      <NavigationContainer>
        <ApprovalContent testDriver={driver} />
      </NavigationContainer>,
    );

    expect(
      screen.getByText(
        'Some of your documents on file are expired or rejected.',
      ),
    ).toBeTruthy();
  });
});

describe('Registered', () => {
  it('Show application approved if driver is registered with valid documents', () => {
    const driver = new Driver({
      state: 'registered',
      images: approvedDocuments(),
      vehicle: {images: approvedDocuments()},
    } as any);
    render(
      <NavigationContainer>
        <ApprovalContent testDriver={driver} />
      </NavigationContainer>,
    );

    expect(
      screen.getByText('You have been approved to drive for FRAYT!'),
    ).toBeTruthy();
  });

  it('Show documents in review if driver is registered but documents have not yet been approved', () => {
    const driver = new Driver({
      state: 'registered',
      images: waitingApprovalDocuments(),
      vehicle: {images: waitingApprovalDocuments()},
    } as any);
    render(
      <NavigationContainer>
        <ApprovalContent testDriver={driver} />
      </NavigationContainer>,
    );
    expect(screen.getByText('Documents Are In Review')).toBeTruthy();
  });

  it('Show documents need to be reuploaded if driver is registered but document(s) are rejected', () => {
    const driver = new Driver({
      state: 'registered',
      images: rejectedDocuments(),
      vehicle: {images: approvedDocuments()},
    } as any);
    render(
      <NavigationContainer>
        <ApprovalContent testDriver={driver} />
      </NavigationContainer>,
    );

    expect(
      screen.getByText(
        'Some of your documents on file are expired or rejected.',
      ),
    ).toBeTruthy();
  });
});

describe('Applying', () => {
  it('Show application completed if driver is applying and documents are approved', () => {
    const driver = new Driver({
      state: 'applying',
      images: approvedDocuments(),
      vehicle: {images: approvedDocuments()},
    } as any);
    render(
      <NavigationContainer>
        <ApprovalContent testDriver={driver} />
      </NavigationContainer>,
    );
    expect(screen.getByText('Application Completed!')).toBeTruthy();
  });

  it('Show application completed but documents need updated if driver is applying and documents are rejected', () => {
    const driver = new Driver({
      state: 'applying',
      images: rejectedDocuments(),
      vehicle: {images: approvedDocuments()},
    } as any);
    render(
      <NavigationContainer>
        <ApprovalContent testDriver={driver} />
      </NavigationContainer>,
    );
    expect(
      screen.getByText(
        'Some of your documents on file are expired or rejected. Please submit your updated documents below and for further review. Thanks for applying at FRAYT!',
      ),
    ).toBeTruthy();
  });
});

describe('Pending Approval', () => {
  it('Show application completed if driver is pending approval and documents are approved', () => {
    const driver = new Driver({
      state: 'pending_approval',
      images: approvedDocuments(),
      vehicle: {images: approvedDocuments()},
    } as any);
    render(
      <NavigationContainer>
        <ApprovalContent testDriver={driver} />
      </NavigationContainer>,
    );
    expect(screen.getByText('Application Completed!')).toBeTruthy();
  });

  it('Show application completed but documents need updated if driver is applying and documents are rejected', () => {
    const driver = new Driver({
      state: 'pending_approval',
      images: rejectedDocuments(),
      vehicle: {images: approvedDocuments()},
    } as any);
    render(
      <NavigationContainer>
        <ApprovalContent testDriver={driver} />
      </NavigationContainer>,
    );
    expect(
      screen.getByText(
        'Some of your documents on file are expired or rejected. Please submit your updated documents below and for further review. Thanks for applying at FRAYT!',
      ),
    ).toBeTruthy();
  });
});

describe('Screening', () => {
  it('Show application completed if driver is pending approval and documents are approved', () => {
    const driver = new Driver({
      state: 'screening',
      images: approvedDocuments(),
      vehicle: {images: approvedDocuments()},
    } as any);
    render(
      <NavigationContainer>
        <ApprovalContent testDriver={driver} />
      </NavigationContainer>,
    );
    expect(screen.getByText('Application Completed!')).toBeTruthy();
  });

  it('Show application completed but documents need updated if driver is applying and documents are rejected', () => {
    const driver = new Driver({
      state: 'screening',
      images: rejectedDocuments(),
      vehicle: {images: approvedDocuments()},
    } as any);
    render(
      <NavigationContainer>
        <ApprovalContent testDriver={driver} />
      </NavigationContainer>,
    );
    expect(
      screen.getByText(
        'Some of your documents on file are expired or rejected. Please submit your updated documents below and for further review. Thanks for applying at FRAYT!',
      ),
    ).toBeTruthy();
  });
});

describe('Rejected', () => {
  it('Show application rejected if driver is rejected', () => {
    const driver = new Driver({
      state: 'rejected',
      images: approvedDocuments(),
      vehicle: {images: approvedDocuments()},
    } as any);
    render(
      <NavigationContainer>
        <ApprovalContent testDriver={driver} />
      </NavigationContainer>,
    );
    expect(
      screen.getByText('You are not approved to drive for FRAYT'),
    ).toBeTruthy();
  });
});

describe('Disabled', () => {
  it('Show account disabled if driver is disabled', () => {
    const driver = new Driver({
      state: 'disabled',
      images: approvedDocuments(),
      vehicle: {images: approvedDocuments()},
    } as any);
    render(
      <NavigationContainer>
        <ApprovalContent testDriver={driver} />
      </NavigationContainer>,
    );
    screen.debug();
    expect(screen.getByText('Your account has been suspended')).toBeTruthy();
  });
});
