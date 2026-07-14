import React from 'react';
import AuthenticatedLayout from '../components/AuthenticatedLayout';

function VisitorEntryPage(): React.ReactElement {
  return (
    <AuthenticatedLayout title="Visitor Entry">
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'var(--color-secondary)' }}>
        Welcome to Visitor Entry. Receptionists can log new visitors here.
      </p>
    </AuthenticatedLayout>
  );
}

export default VisitorEntryPage;
