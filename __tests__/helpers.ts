import {DocumentType, Document, DocumentState} from '@frayt/sdk';

const documents = (state = 'approved') => {
  const types = [
    'license',
    'registration',
    'insurance',
    'profile',
    'passengers_side',
    'drivers_side',
    'cargo_area',
    'front',
    'back',
    'vehicle_type',
    'carrier_agreement',
  ];

  return types.map((docType): Document => {
    return {
      type: docType as DocumentType,
      state: state as DocumentState,
      expires_at: '2030-01-01T23:59:59Z',
    };
  });
};

export const approvedDocuments = () => documents();
export const waitingApprovalDocuments = () => documents('pending_approval');
export const rejectedDocuments = () => documents('rejected');
