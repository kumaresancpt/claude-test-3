import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';

/* ════════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════════ */

type VisitorStatus = 'Check in' | 'Waiting' | 'Checked Out' | 'Expired Pass' | 'Pending Approval';
type BadgeStatus = 'QR Generated' | 'Pending' | 'Badge Printed' | 'Badge Expired';
type VisitPurpose = 'Meeting' | 'Official' | 'Interview' | 'Delivery' | 'Maintenance' | 'Event';

interface VisitorRow {
  id: number;
  name: string;
  company: string;
  host: string;
  purpose: string;
  checkIn: string;
  checkOut: string;
  status: VisitorStatus;
  badge: BadgeStatus;
}

interface KpiCard {
  label: string;
  value: string;
  iconBg: string;
  iconBorder: string;
  icon: React.ReactElement;
}

interface ChartPoint {
  date: string;
  value: number;
}

interface PurposeLegendItem {
  label: VisitPurpose;
  color: string;
  count: number;
}

/* ════════════════════════════════════════════════════════════════
   MOCK DATA
════════════════════════════════════════════════════════════════ */

const CHART_DATA: ChartPoint[] = [
  { date: '1 May 26', value: 22 },
  { date: '2 May 26', value: 14 },
  { date: '3 May 26', value: 35 },
  { date: '4 May 26', value: 28 },
  { date: '5 May 26', value: 52 },
  { date: '6 May 26', value: 44 },
  { date: '7 May 26', value: 48 },
];

const CHART_MAX = 60;
const CHART_Y_LABELS = [60, 50, 40, 30, 20, 10, 0];

const PURPOSE_LEGEND: PurposeLegendItem[] = [
  { label: 'Meeting', color: 'var(--dash-chart-meeting)', count: 14 },
  { label: 'Official', color: 'var(--dash-chart-official)', count: 13 },
  { label: 'Interview', color: 'var(--dash-chart-interview)', count: 15 },
  { label: 'Delivery', color: 'var(--dash-chart-delivery)', count: 25 },
  { label: 'Maintenance', color: 'var(--dash-chart-maintenance)', count: 12 },
  { label: 'Event', color: 'var(--dash-chart-event)', count: 10 },
];

const DONUT_TOTAL = 86;

const VISITORS: VisitorRow[] = [
  { id: 1,  name: 'Mathew',  company: 'Amazon',    host: 'Arun Kumar',     purpose: 'Meeting',     checkIn: '13:25', checkOut: '-',     status: 'Check in',       badge: 'QR Generated' },
  { id: 2,  name: 'Sarah',   company: 'Google',    host: 'Jessica Lee',    purpose: 'Meeting',     checkIn: '10:00', checkOut: '-',     status: 'Waiting',        badge: 'Pending' },
  { id: 3,  name: 'John',    company: 'Microsoft', host: 'Michael Smith',  purpose: 'Interview',   checkIn: '15:00', checkOut: '17:00', status: 'Checked Out',    badge: 'Badge Printed' },
  { id: 4,  name: 'Emily',   company: 'Facebook',  host: 'Tina Brown',     purpose: 'Interview',   checkIn: '09:30', checkOut: '-',     status: 'Check in',       badge: 'QR Generated' },
  { id: 5,  name: 'David',   company: 'Apple',     host: 'Mark Johnson',   purpose: 'Maintenance', checkIn: '11:45', checkOut: '13:15', status: 'Expired Pass',   badge: 'Badge Expired' },
  { id: 6,  name: 'James',   company: 'IBM',       host: 'Linda Garcia',   purpose: 'Maintenance', checkIn: '14:10', checkOut: '-',     status: 'Pending Approval', badge: 'Pending' },
  { id: 7,  name: 'Sophia',  company: 'Tesla',     host: 'Nina Patel',     purpose: 'Event',       checkIn: '16:20', checkOut: '-',     status: 'Check in',       badge: 'QR Generated' },
  { id: 8,  name: 'Daniel',  company: 'Netflix',   host: 'Oliver Wilson',  purpose: 'Delivery',    checkIn: '12:15', checkOut: '-',     status: 'Check in',       badge: 'QR Generated' },
  { id: 9,  name: 'Olivia',  company: 'Spotify',   host: 'Emma Davis',     purpose: 'Meeting',     checkIn: '17:30', checkOut: '-',     status: 'Check in',       badge: 'QR Generated' },
  { id: 10, name: 'Liam',    company: 'Adobe',     host: 'Jacob Martinez', purpose: 'Meeting',     checkIn: '08:50', checkOut: '-',     status: 'Check in',       badge: 'QR Generated' },
];

const TOTAL_RECORDS = 32;
const PAGE_SIZE = 10;
const TOTAL_PAGES = Math.ceil(TOTAL_RECORDS / PAGE_SIZE);

/* ════════════════════════════════════════════════════════════════
   SMALL HELPER COMPONENTS
════════════════════════════════════════════════════════════════ */

/* Status dot + label */
function StatusDot({ status }: { status: VisitorStatus }): React.ReactElement {
  const colorMap: Record<VisitorStatus, string> = {
    'Check in': 'var(--dash-status-checkin)',
    'Waiting': 'var(--dash-status-waiting)',
    'Checked Out': 'var(--dash-status-checkedout)',
    'Expired Pass': 'var(--dash-status-expired)',
    'Pending Approval': 'var(--dash-status-pending)',
  };
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: colorMap[status],
          flexShrink: 0,
        }}
      />
      <span>{status}</span>
    </span>
  );
}

/* Eye icon */
function EyeActionIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M12 5c-5.5 0-9.8 4.4-10.8 7 1 2.6 5.3 7 10.8 7s9.8-4.4 10.8-7c-1-2.6-5.3-7-10.8-7Z"
        stroke="#727272" strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="12" r="3" stroke="#727272" strokeWidth="1.8" fill="none" />
    </svg>
  );
}

/* Edit icon */
function EditActionIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="#727272" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"
        stroke="#727272" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* Chevron down */
function ChevronDown(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M6 9l6 6 6-6" stroke="#252525" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   KPI SECTION ICONS
════════════════════════════════════════════════════════════════ */

function PersonIcon(): React.ReactElement {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="12" cy="7" r="4" fill="#5b21b6" />
      <path d="M3 21c0-4 4-7 9-7s9 3 9 7" stroke="#5b21b6" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function CheckboxActiveIcon(): React.ReactElement {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#2cbd00" />
      <path d="M7 12l3.5 3.5L17 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PendingAccountIcon(): React.ReactElement {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <circle cx="10" cy="7" r="4" fill="#d2b200" />
      <path d="M2 21c0-3.9 3.6-7 8-7" stroke="#d2b200" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="18" cy="17" r="4" stroke="#d2b200" strokeWidth="2" fill="none" />
      <path d="M18 15v2.5l1.5 1.5" stroke="#d2b200" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WarningIcon(): React.ReactElement {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        stroke="rgba(255,77,79,0.9)" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="13" stroke="rgba(255,77,79,0.9)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="12" cy="16.5" r="0.8" fill="rgba(255,77,79,0.9)" />
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   VISITOR TRENDS CHART (pure SVG/HTML canvas-less)
════════════════════════════════════════════════════════════════ */

function VisitorTrendsChart({ data }: { data: ChartPoint[] }): React.ReactElement {
  const W = 460; // viewBox width for the polyline area
  const H = 140; // viewBox height for the polyline area

  // Convert data values to SVG coordinates
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (d.value / CHART_MAX) * H;
    return { x, y };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Build a closed fill path
  const fillPath =
    `M${points[0].x},${H} ` +
    points.map((p) => `L${p.x},${p.y}`).join(' ') +
    ` L${points[points.length - 1].x},${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: '130px', display: 'block', overflow: 'visible' }}
      aria-label="Visitor trend line chart"
      role="img"
    >
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b21b6" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#5b21b6" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <path d={fillPath} fill="url(#chartGradient)" />

      {/* Grid lines */}
      {CHART_Y_LABELS.map((val) => {
        const y = H - (val / CHART_MAX) * H;
        return (
          <line
            key={val}
            x1="0"
            y1={y}
            x2={W}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="0.8"
            strokeDasharray="4 3"
          />
        );
      })}

      {/* Polyline */}
      <polyline
        points={polylinePoints}
        fill="none"
        stroke="#5b21b6"
        strokeWidth="2.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Data point dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#5b21b6" />
      ))}
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════════
   DONUT CHART (CSS conic-gradient)
════════════════════════════════════════════════════════════════ */

function DonutChart({ items, total }: { items: PurposeLegendItem[]; total: number }): React.ReactElement {
  // Build conic-gradient segments
  let cumulative = 0;
  const segments = items.map((item) => {
    const pct = (item.count / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { color: item.color, start, end: cumulative };
  });

  const gradient = segments
    .map((s) => `${s.color} ${s.start.toFixed(1)}% ${s.end.toFixed(1)}%`)
    .join(', ');

  return (
    <div
      style={{ position: 'relative', width: '160px', height: '160px', flexShrink: 0 }}
      role="img"
      aria-label={`Donut chart showing ${total} total visits by purpose`}
    >
      {/* Outer ring */}
      <div
        style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: `conic-gradient(${gradient})`,
          position: 'absolute',
        }}
      />
      {/* Inner cutout */}
      <div
        style={{
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: '#ffffff',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-family-inter)',
            fontSize: '10px',
            fontWeight: 500,
            color: 'var(--dash-color-text-primary)',
          }}
        >
          Total
        </span>
        <span
          style={{
            fontFamily: 'var(--font-family-inter)',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--dash-color-text-primary)',
            lineHeight: 1.1,
          }}
        >
          {total}
        </span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   DASHBOARD PAGE
════════════════════════════════════════════════════════════════ */

function DashboardPage(): React.ReactElement {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [showEntries, setShowEntries] = useState(10);

  /* KPI cards definition */
  const KPI_CARDS: KpiCard[] = [
    {
      label: 'Visitors Today',
      value: '1,284',
      iconBg: 'var(--dash-kpi-purple-bg)',
      iconBorder: 'var(--dash-kpi-purple-border)',
      icon: <PersonIcon />,
    },
    {
      label: 'Active Visitors',
      value: '248',
      iconBg: 'var(--dash-kpi-green-bg)',
      iconBorder: 'var(--dash-kpi-green-border)',
      icon: <CheckboxActiveIcon />,
    },
    {
      label: 'Pending Approvals',
      value: '18',
      iconBg: 'var(--dash-kpi-yellow-bg)',
      iconBorder: 'var(--dash-kpi-yellow-border)',
      icon: <PendingAccountIcon />,
    },
    {
      label: 'Overstay Alerts',
      value: '5',
      iconBg: 'var(--dash-kpi-red-bg)',
      iconBorder: 'var(--dash-kpi-red-border)',
      icon: <WarningIcon />,
    },
  ];

  /* Table column widths */
  const COL_WIDTHS = {
    name: '120px',
    company: '110px',
    host: '120px',
    purpose: '110px',
    checkIn: '110px',
    checkOut: '110px',
    status: '130px',
    badge: '110px',
    action: '85px',
  };

  const cellStyle: React.CSSProperties = {
    fontFamily: 'var(--font-family-inter)',
    fontSize: '12px',
    color: 'var(--dash-color-text-primary)',
    letterSpacing: '-0.12px',
    padding: '0 8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    fontWeight: 600,
    color: 'var(--dash-color-text-secondary)',
    padding: '10px 8px',
  };

  return (
    <DashboardLayout userName="John">
      <div
        style={{
          padding: '24px 24px 24px 24px',
          boxSizing: 'border-box',
          minHeight: '100%',
        }}
      >
        {/* ── Page title row ─────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: 'var(--font-family-inter)',
              fontWeight: 500,
              fontSize: '24px',
              color: 'var(--dash-color-text-primary)',
            }}
          >
            Dashboard Overview
          </h1>
          <button
            type="button"
            onClick={() => { void navigate('/visitor-entry'); }}
            style={{
              background: 'var(--color-primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--dash-radius-button)',
              padding: '11px 16px',
              fontFamily: 'var(--font-family-inter)',
              fontWeight: 600,
              fontSize: '16px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Add Visitor
          </button>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px',
          }}
        >
          {KPI_CARDS.map((card) => (
            <div
              key={card.label}
              style={{
                flex: '1 0 200px',
                background: '#ffffff',
                borderRadius: 'var(--dash-radius-card)',
                padding: '16px 24px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                boxShadow: 'var(--dash-shadow-card)',
                minWidth: '180px',
              }}
            >
              {/* Text */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-family-inter)',
                    fontWeight: 500,
                    fontSize: '16px',
                    color: 'var(--dash-color-text-secondary)',
                    opacity: 0.8,
                  }}
                >
                  {card.label}
                </p>
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-family-inter)',
                    fontWeight: 700,
                    fontSize: '28px',
                    color: 'var(--dash-color-text-primary)',
                    letterSpacing: '1px',
                  }}
                >
                  {card.value}
                </p>
              </div>
              {/* Icon badge */}
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--dash-radius-badge)',
                  background: card.iconBg,
                  border: `0.5px solid ${card.iconBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                {card.icon}
              </div>
            </div>
          ))}
        </div>

        {/* ── Analytics row (Trends + Purposes) ─────────────────── */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          {/* Visitor Trends panel */}
          <div
            style={{
              flex: '2 1 380px',
              background: '#ffffff',
              borderRadius: 'var(--dash-radius-panel)',
              boxShadow: 'var(--dash-shadow-panel)',
              padding: '20px 20px 16px',
              minWidth: '300px',
              boxSizing: 'border-box',
            }}
          >
            {/* Panel header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-family-inter)',
                  fontWeight: 500,
                  fontSize: '16px',
                  color: 'var(--dash-color-text-primary)',
                }}
              >
                Visitor Trends
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--dash-color-bg-dropdown)',
                  borderRadius: 'var(--dash-radius-button)',
                  padding: '8px 12px',
                  cursor: 'pointer',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-family-inter)',
                    fontWeight: 500,
                    fontSize: '13px',
                    color: 'var(--dash-color-text-primary)',
                    letterSpacing: '0.5px',
                  }}
                >
                  Last 7 days
                </span>
                <ChevronDown />
              </div>
            </div>

            {/* Chart area */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Y-axis labels */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  paddingBottom: '28px',
                }}
              >
                {CHART_Y_LABELS.map((label) => (
                  <span
                    key={label}
                    style={{
                      fontFamily: 'var(--font-family-inter)',
                      fontSize: '11px',
                      color: 'var(--dash-color-text-primary)',
                      width: '22px',
                      textAlign: 'right',
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Chart + X-axis */}
              <div style={{ flex: 1, position: 'relative' }}>
                {/* Rotated Y-axis title */}
                <div
                  style={{
                    position: 'absolute',
                    left: '-28px',
                    top: '50%',
                    transform: 'translateY(-50%) rotate(-90deg)',
                    transformOrigin: 'center center',
                    fontFamily: 'var(--font-family-inter)',
                    fontSize: '10px',
                    color: 'var(--dash-color-text-primary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  No of Visitor
                </div>

                <VisitorTrendsChart data={CHART_DATA} />

                {/* X-axis labels */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '6px',
                  }}
                >
                  {CHART_DATA.map((d) => (
                    <span
                      key={d.date}
                      style={{
                        fontFamily: 'var(--font-family-inter)',
                        fontSize: '10px',
                        color: 'var(--dash-color-text-primary)',
                        textAlign: 'center',
                      }}
                    >
                      {d.date}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Visit Purposes panel */}
          <div
            style={{
              flex: '1 1 280px',
              background: '#ffffff',
              borderRadius: 'var(--dash-radius-panel)',
              boxShadow: 'var(--dash-shadow-panel)',
              padding: '20px',
              minWidth: '260px',
              boxSizing: 'border-box',
            }}
          >
            <p
              style={{
                margin: '0 0 16px 0',
                fontFamily: 'var(--font-family-inter)',
                fontWeight: 500,
                fontSize: '16px',
                color: 'var(--dash-color-text-primary)',
              }}
            >
              Visit Purposes
            </p>

            <div
              style={{
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {/* Donut chart */}
              <DonutChart items={PURPOSE_LEGEND} total={DONUT_TOTAL} />

              {/* Legend grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '16px 24px',
                  flex: 1,
                  minWidth: '160px',
                }}
              >
                {PURPOSE_LEGEND.map((item) => (
                  <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        aria-hidden="true"
                        style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '34px',
                          background: item.color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-family-inter)',
                          fontSize: '12px',
                          color: 'var(--dash-color-text-secondary)',
                          fontWeight: 400,
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: 'var(--font-family-inter)',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: 'var(--dash-color-text-primary)',
                        paddingLeft: '14px',
                      }}
                    >
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Visitors Table ──────────────────────────────── */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--dash-radius-panel)',
            boxShadow: 'var(--dash-shadow-panel)',
            overflow: 'hidden',
          }}
        >
          {/* Table title */}
          <div style={{ padding: '20px 20px 0' }}>
            <p
              style={{
                margin: 0,
                fontFamily: 'var(--font-family-inter)',
                fontWeight: 500,
                fontSize: '16px',
                color: 'var(--dash-color-text-primary)',
              }}
            >
              Recent Visitors
            </p>
          </div>

          {/* Scrollable table wrapper */}
          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                tableLayout: 'fixed',
                minWidth: '860px',
              }}
              aria-label="Recent visitors"
            >
              <colgroup>
                <col style={{ width: COL_WIDTHS.name }} />
                <col style={{ width: COL_WIDTHS.company }} />
                <col style={{ width: COL_WIDTHS.host }} />
                <col style={{ width: COL_WIDTHS.purpose }} />
                <col style={{ width: COL_WIDTHS.checkIn }} />
                <col style={{ width: COL_WIDTHS.checkOut }} />
                <col style={{ width: COL_WIDTHS.status }} />
                <col style={{ width: COL_WIDTHS.badge }} />
                <col style={{ width: COL_WIDTHS.action }} />
              </colgroup>
              <thead>
                <tr
                  style={{
                    background: 'var(--dash-color-bg-table-header)',
                    borderBottom: `1px solid var(--dash-color-border-table-header)`,
                  }}
                >
                  {(['Name', 'Company', 'Host', 'Purpose', 'Check-in Time', 'Check-Out Time', 'Status', 'Badge', 'Action'] as const).map(
                    (col, i) => (
                      <th
                        key={col}
                        scope="col"
                        style={{
                          ...headerCellStyle,
                          textAlign: i === 8 ? 'center' : 'left',
                        }}
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {VISITORS.map((row) => (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: `1px solid var(--dash-color-border-table-row)`,
                    }}
                  >
                    <td style={{ ...cellStyle, padding: '16px 8px' }}>{row.name}</td>
                    <td style={{ ...cellStyle, padding: '16px 8px' }}>{row.company}</td>
                    <td style={{ ...cellStyle, padding: '16px 8px' }}>{row.host}</td>
                    <td style={{ ...cellStyle, padding: '16px 8px' }}>{row.purpose}</td>
                    <td style={{ ...cellStyle, padding: '16px 8px' }}>{row.checkIn}</td>
                    <td style={{ ...cellStyle, padding: '16px 8px' }}>{row.checkOut}</td>
                    <td style={{ ...cellStyle, padding: '16px 8px' }}>
                      <StatusDot status={row.status} />
                    </td>
                    <td style={{ ...cellStyle, padding: '16px 8px' }}>{row.badge}</td>
                    <td style={{ ...cellStyle, padding: '16px 8px', textAlign: 'center' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                        }}
                      >
                        <button
                          type="button"
                          aria-label={`View ${row.name}`}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '2px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <EyeActionIcon />
                        </button>
                        <button
                          type="button"
                          aria-label={`Edit ${row.name}`}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '2px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <EditActionIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination row ──────────────────────────────────── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {/* Show entries */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--dash-color-bg-dropdown)',
                  borderRadius: 'var(--dash-radius-button)',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  minWidth: '100px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-family-inter)',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: 'var(--dash-color-text-dark-alt)',
                    letterSpacing: '0.5px',
                    flex: 1,
                  }}
                >
                  Show {showEntries}
                </span>
                <ChevronDown />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-family-inter)',
                  fontSize: '14px',
                  color: 'var(--dash-color-text-dark-alt)',
                  letterSpacing: '0.5px',
                  whiteSpace: 'nowrap',
                }}
              >
                of {TOTAL_RECORDS} Records
              </span>
            </div>

            {/* Page buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Previous */}
              <button
                type="button"
                onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); }}
                disabled={currentPage === 1}
                aria-label="Previous page"
                style={{
                  width: '30px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid var(--dash-color-border-pagination)`,
                  borderRadius: 'var(--dash-radius-pagination)',
                  background: 'var(--dash-color-bg-pagination-inactive)',
                  color: 'var(--dash-color-text-pagination)',
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '12px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                }}
              >
                {'<'}
              </button>

              {/* Page numbers */}
              {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((page) => {
                const isActive = page === currentPage;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => { setCurrentPage(page); }}
                    aria-label={`Page ${page}`}
                    aria-current={isActive ? 'page' : undefined}
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${isActive ? 'var(--color-primary)' : 'var(--dash-color-border-pagination)'}`,
                      borderRadius: 'var(--dash-radius-pagination)',
                      background: isActive ? 'var(--color-primary)' : 'var(--dash-color-bg-pagination-inactive)',
                      color: isActive ? '#ffffff' : 'var(--dash-color-text-pagination)',
                      fontFamily: 'var(--font-family-inter)',
                      fontWeight: 500,
                      fontSize: '12px',
                      cursor: 'pointer',
                      letterSpacing: '-0.12px',
                    }}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Next */}
              <button
                type="button"
                onClick={() => { setCurrentPage((p) => Math.min(TOTAL_PAGES, p + 1)); }}
                disabled={currentPage === TOTAL_PAGES}
                aria-label="Next page"
                style={{
                  width: '30px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid var(--dash-color-border-pagination)`,
                  borderRadius: 'var(--dash-radius-pagination)',
                  background: 'var(--dash-color-bg-pagination-inactive)',
                  color: 'var(--dash-color-text-pagination)',
                  fontFamily: "'Poppins', 'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: '12px',
                  cursor: currentPage === TOTAL_PAGES ? 'not-allowed' : 'pointer',
                  opacity: currentPage === TOTAL_PAGES ? 0.5 : 1,
                }}
              >
                {'>'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
