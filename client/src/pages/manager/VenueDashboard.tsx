import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  DollarSign,
  Gauge,
  InboxIcon,
  LoaderCircle,
  CalendarDays,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import "./VenueDashboard.css";
import {
  getVenueDashboardStats,
  getUpcomingReservations,
  getBookingByStatus,
  type UpcomingReservationItem,
} from "../../api/venueApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconClass: string;
  isLoading: boolean;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconClass,
  isLoading,
  suffix = "",
}) => (
  <div className="surface-card vd-stat-card">
    <div className={`vd-stat-icon ${iconClass}`}>{icon}</div>
    <div className="vd-stat-body">
      <span className="vd-stat-label">{label}</span>
      {isLoading ? (
        <div className="vd-skeleton vd-skeleton-value" />
      ) : (
        <span className="vd-stat-value">
          {value}
          {suffix}
        </span>
      )}
    </div>
  </div>
);

// ─── Custom Bar Tooltip ───────────────────────────────────────────────────────

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="vd-chart-tooltip">
      <p className="vd-tooltip-label">{label}</p>
      <p className="vd-tooltip-slots">{payload[0]?.value} slot{payload[0]?.value !== 1 ? "s" : ""}</p>
      {payload[1] && (
        <p className="vd-tooltip-revenue">
          ${Number(payload[1].value).toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      )}
    </div>
  );
};

// ─── Custom Pie Label ─────────────────────────────────────────────────────────

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Custom Pie Tooltip ───────────────────────────────────────────────────────

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="vd-chart-tooltip">
      <p className="vd-tooltip-label">{payload[0].name}</p>
      <p className="vd-tooltip-slots">{payload[0].value} slot{payload[0].value !== 1 ? "s" : ""}</p>
    </div>
  );
};

// ─── Bar colours for upcoming chart ──────────────────────────────────────────

const BAR_COLORS = [
  "#f97316","#3b82f6","#10b981","#8b5cf6",
  "#ef4444","#f59e0b","#06b6d4","#84cc16",
];

// ─── Main Component ───────────────────────────────────────────────────────────

const VenueDashboard: React.FC = () => {
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const managerId = useMemo(() => {
    const raw = localStorage.getItem("managerId");
    return raw ? Number(raw) : null;
  }, []);

  // ── State ─────────────────────────────────────────────────────────────────

  const [approvedBookings,  setApprovedBookings]  = useState(0);
  const [estimatedRevenue,  setEstimatedRevenue]  = useState(0);
  const [utilizationRate,   setUtilizationRate]   = useState(0);
  const [totalRequests,     setTotalRequests]      = useState(0);

  const [upcoming,       setUpcoming]       = useState<UpcomingReservationItem[]>([]);
  const [availableSlots, setAvailableSlots] = useState(0);
  const [bookedSlots,    setBookedSlots]    = useState(0);

  const [loadingStats,   setLoadingStats]   = useState(true);
  const [loadingChart,   setLoadingChart]   = useState(true);
  const [loadingStatus,  setLoadingStatus]  = useState(true);

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!managerId || Number.isNaN(managerId)) {
      showAlert("Manager ID not found. Please log in again.", "error");
      setLoadingStats(false);
      setLoadingChart(false);
      setLoadingStatus(false);
      return;
    }

    const loadStats = async () => {
      try {
        const res = await getVenueDashboardStats(managerId);
        setApprovedBookings(res.approvedBookings);
        setEstimatedRevenue(res.estimatedRevenue);
        setUtilizationRate(res.utilizationRate);
        setTotalRequests(res.totalRequests);
      } catch (err) {
        showAlert(err instanceof Error ? err.message : "Failed to load stats.", "error");
      } finally {
        setLoadingStats(false);
      }
    };

    const loadUpcoming = async () => {
      try {
        const res = await getUpcomingReservations(managerId);
        setUpcoming(res);
      } catch (err) {
        showAlert(err instanceof Error ? err.message : "Failed to load reservations.", "error");
      } finally {
        setLoadingChart(false);
      }
    };

    const loadStatus = async () => {
      try {
        const res = await getBookingByStatus(managerId);
        setAvailableSlots(res.available);
        setBookedSlots(res.booked);
      } catch (err) {
        showAlert(err instanceof Error ? err.message : "Failed to load status data.", "error");
      } finally {
        setLoadingStatus(false);
      }
    };

    loadStats();
    loadUpcoming();
    loadStatus();
  }, [managerId]);

  // ── Derived data ──────────────────────────────────────────────────────────

  const pieData = [
    { name: "Available", value: availableSlots },
    { name: "Booked",    value: bookedSlots },
  ];

  const PIE_COLORS = ["#10b981", "#f97316"];

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <AlertSnackbar open={open} message={message} severity={severity} onClose={handleClose} />

      <div className="page-shell">
        {/* Header */}
        <div className="page-header">
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">
            Monitor your venue bookings, revenue, and utilization at a glance.
          </p>
        </div>

        {/* ── 4 Stat Cards ── */}
        <div className="vd-stats-grid">
          <StatCard
            label="Approved Bookings"
            value={approvedBookings.toLocaleString()}
            icon={<CheckCircle2 size={21} />}
            iconClass="vd-icon-green"
            isLoading={loadingStats}
          />
          <StatCard
            label="Estimated Revenue"
            value={`$${estimatedRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<DollarSign size={21} />}
            iconClass="vd-icon-orange"
            isLoading={loadingStats}
          />
          <StatCard
            label="Venue Utilization"
            value={utilizationRate}
            suffix="%"
            icon={<Gauge size={21} />}
            iconClass="vd-icon-blue"
            isLoading={loadingStats}
          />
          <StatCard
            label="Total Requests"
            value={totalRequests.toLocaleString()}
            icon={<InboxIcon size={21} />}
            iconClass="vd-icon-purple"
            isLoading={loadingStats}
          />
        </div>

        {/* ── Bottom row: upcoming chart + booking status ── */}
        <div className="vd-bottom-grid">

          {/* Upcoming Reservations bar chart */}
          <div className="surface-card vd-chart-card">
            <div className="vd-card-header">
              <div className="vd-card-title-group">
                <TrendingUp size={17} className="vd-card-icon" />
                <h3 className="vd-card-title">Upcoming Reservations</h3>
              </div>
              {!loadingChart && upcoming.length > 0 && (
                <span className="vd-pill">{upcoming.length} date{upcoming.length !== 1 ? "s" : ""}</span>
              )}
            </div>

            {loadingChart ? (
              <div className="vd-chart-loading">
                <LoaderCircle size={22} className="vd-spin" />
                <span>Loading…</span>
              </div>
            ) : upcoming.length === 0 ? (
              <div className="vd-chart-empty">
                <CalendarDays size={32} />
                <p>No upcoming reservations.</p>
              </div>
            ) : (
              <div className="vd-chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={upcoming}
                    margin={{ top: 8, right: 12, left: 4, bottom: 48 }}
                    barCategoryGap="35%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-border, #e2e8f0)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "var(--color-text-muted, #64748b)", fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--color-text-muted, #94a3b8)" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                      width={36}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                    <Bar dataKey="slots" radius={[6, 6, 0, 0]} maxBarSize={52}>
                      {upcoming.map((_, i) => (
                        <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Revenue legend */}
                <div className="vd-upcoming-legend">
                  {upcoming.slice(0, 6).map((item, i) => (
                    <div key={item.date} className="vd-legend-item">
                      <span
                        className="vd-legend-dot"
                        style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
                      />
                      <span className="vd-legend-date">{item.date}</span>
                      <span className="vd-legend-revenue">
                        ${item.revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking by Status donut */}
          <div className="surface-card vd-status-card">
            <div className="vd-card-header">
              <div className="vd-card-title-group">
                <BarChart2 size={17} className="vd-card-icon" />
                <h3 className="vd-card-title">Booking by Status</h3>
              </div>
            </div>

            {loadingStatus ? (
              <div className="vd-chart-loading">
                <LoaderCircle size={20} className="vd-spin" />
                <span>Loading…</span>
              </div>
            ) : availableSlots === 0 && bookedSlots === 0 ? (
              <div className="vd-chart-empty">
                <BarChart2 size={28} />
                <p>No availability data yet.</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={88}
                      dataKey="value"
                      labelLine={false}
                      label={<PieLabel />}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend
                      iconType="circle"
                      iconSize={10}
                      formatter={(value) => (
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Summary rows */}
                <div className="vd-status-summary">
                  <div className="vd-status-row">
                    <span className="vd-status-dot" style={{ background: "#10b981" }} />
                    <span className="vd-status-label">Available slots</span>
                    <span className="vd-status-count">{availableSlots}</span>
                  </div>
                  <div className="vd-status-row">
                    <span className="vd-status-dot" style={{ background: "#f97316" }} />
                    <span className="vd-status-label">Booked slots</span>
                    <span className="vd-status-count">{bookedSlots}</span>
                  </div>
                  <div className="vd-status-row vd-status-row-total">
                    <span className="vd-status-label" style={{ fontWeight: 700 }}>Total</span>
                    <span className="vd-status-count vd-status-total">
                      {availableSlots + bookedSlots}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default VenueDashboard;