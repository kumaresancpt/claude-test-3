import React from 'react';
import AuthenticatedLayout from '../components/AuthenticatedLayout';

function GateEntryPage(): React.ReactElement {
  return (
    <AuthenticatedLayout title="Gate Entry">
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'var(--color-secondary)' }}>
        Welcome to Gate Entry. Security guards can verify visitor passes here.
      </p>
    </AuthenticatedLayout>
  );
}

export default GateEntryPage;
