import React from 'react';
import AuthenticatedLayout from '../components/AuthenticatedLayout';

function DashboardPage(): React.ReactElement {
  return (
    <AuthenticatedLayout title="Admin Dashboard">
      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', color: 'var(--color-secondary)' }}>
        Welcome to the Admin Dashboard.
      </p>
    </AuthenticatedLayout>
  );
}

export default DashboardPage;
