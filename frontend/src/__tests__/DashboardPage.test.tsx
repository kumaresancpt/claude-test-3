import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from '../pages/DashboardPage';

// Silence hook warnings from useSessionTimeout
jest.mock('../hooks/useSessionTimeout', () => () => ({
  showWarning: false,
  extendSession: jest.fn(),
}));

// Silence logout API call
jest.mock('../services/authService', () => ({
  logout: jest.fn().mockResolvedValue(undefined),
}));

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <DashboardPage />
    </MemoryRouter>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'fake-token');
  });

  afterEach(() => {
    localStorage.clear();
    jest.resetAllMocks();
  });

  test('renders page heading', () => {
    renderDashboard();
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
  });

  test('renders Add Visitor button', () => {
    renderDashboard();
    expect(screen.getByRole('button', { name: /add visitor/i })).toBeInTheDocument();
  });

  test('renders all 4 KPI card labels', () => {
    renderDashboard();
    expect(screen.getByText('Visitors Today')).toBeInTheDocument();
    expect(screen.getByText('Active Visitors')).toBeInTheDocument();
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
    expect(screen.getByText('Overstay Alerts')).toBeInTheDocument();
  });

  test('renders KPI values from mock data', () => {
    renderDashboard();
    expect(screen.getByText('1,284')).toBeInTheDocument();
    expect(screen.getByText('248')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  test('renders Visitor Trends chart section', () => {
    renderDashboard();
    expect(screen.getByText('Visitor Trends')).toBeInTheDocument();
    expect(screen.getByText('Last 7 days')).toBeInTheDocument();
  });

  test('renders Visit Purposes section with legend items', () => {
    renderDashboard();
    expect(screen.getByText('Visit Purposes')).toBeInTheDocument();
    expect(screen.getByText('Meeting')).toBeInTheDocument();
    expect(screen.getByText('Delivery')).toBeInTheDocument();
  });

  test('renders Recent Visitors table heading', () => {
    renderDashboard();
    expect(screen.getByText('Recent Visitors')).toBeInTheDocument();
  });

  test('renders table with 9 column headers', () => {
    renderDashboard();
    const headers = ['Name', 'Company', 'Host', 'Purpose', 'Check-in Time', 'Check-Out Time', 'Status', 'Badge', 'Action'];
    headers.forEach((header) => {
      expect(screen.getByText(header)).toBeInTheDocument();
    });
  });

  test('renders 10 visitor rows from mock data', () => {
    renderDashboard();
    expect(screen.getByText('Mathew')).toBeInTheDocument();
    expect(screen.getByText('Liam')).toBeInTheDocument();
    // 10 view buttons — one per row
    const viewButtons = screen.getAllByRole('button', { name: /view/i });
    expect(viewButtons).toHaveLength(10);
  });

  test('renders status dots for all 5 status types', () => {
    renderDashboard();
    // Status labels appear in the table
    expect(screen.getAllByText('Check in').length).toBeGreaterThan(0);
    expect(screen.getByText('Waiting')).toBeInTheDocument();
    expect(screen.getByText('Checked Out')).toBeInTheDocument();
    expect(screen.getByText('Expired Pass')).toBeInTheDocument();
    expect(screen.getByText('Pending Approval')).toBeInTheDocument();
  });

  test('renders pagination with page 1 active', () => {
    renderDashboard();
    expect(screen.getByText('of 32 Records')).toBeInTheDocument();
    const page1 = screen.getByRole('button', { name: 'Page 1' });
    expect(page1).toBeInTheDocument();
  });

  test('pagination changes active page on click', () => {
    renderDashboard();
    const page2 = screen.getByRole('button', { name: 'Page 2' });
    fireEvent.click(page2);
    // page 2 button now becomes "current"
    expect(page2).toHaveAttribute('aria-current', 'page');
  });

  test('renders footer copyright text', () => {
    renderDashboard();
    expect(
      screen.getByText('Copyright 2026 Changepond. All Rights Reserved.')
    ).toBeInTheDocument();
  });

  test('renders sidebar with all nav items', () => {
    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('All Visitor')).toBeInTheDocument();
    expect(screen.getByText('Gate Check-In')).toBeInTheDocument();
    expect(screen.getByText('Gate Check-Out')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  test('header renders welcome message with username', () => {
    renderDashboard();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByText('John!')).toBeInTheDocument();
  });

  test('header search bar has correct placeholder', () => {
    renderDashboard();
    expect(
      screen.getByPlaceholderText('Search Visitor, Passes')
    ).toBeInTheDocument();
  });
});
