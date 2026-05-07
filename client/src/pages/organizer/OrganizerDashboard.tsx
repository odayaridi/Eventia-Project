import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Ticket,
  DollarSign,
  Users,
  LoaderCircle,
  MapPin,
  Bell,
  Star,
  CalendarDays,
  TrendingUp,
  Activity,
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
} from "recharts";
import "./OrganizerDashboard.css";
import {
  getDashboardTotalEvents,
  getDashboardTicketsSold,
  getDashboardTotalRevenue,
  getDashboardAvgAttendance,
  getDashboardRevenuePerEvent,
  getDashboardEventsThisMonth,
  getDashboardPendingVenueRequests,
  getDashboardTotalAnnouncements,
  getDashboardTotalFeedbacks,
  type DashboardRevenuePerEventItem,
} from "../../api/eventApi";
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
  <div className="surface-card od-stat-card">
    <div className={`od-stat-icon ${iconClass}`}>{icon}</div>
    <div className="od-stat-body">
      <span className="od-stat-label">{label}</span>
      {isLoading ? (
        <div className="od-stat-skeleton" />
      ) : (
        <span className="od-stat-value">
          {value}
          {suffix}
        </span>
      )}
    </div>
  </div>
);

// ─── Quick Stat Row ───────────────────────────────────────────────────────────

interface QuickStatRowProps {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: number | string;
  isLoading: boolean;
}

const QuickStatRow: React.FC<QuickStatRowProps> = ({
  icon,
  iconClass,
  label,
  value,
  isLoading,
}) => (
  <div className="od-quick-row">
    <div className={`od-quick-icon ${iconClass}`}>{icon}</div>
    <span className="od-quick-label">{label}</span>
    {isLoading ? (
      <div className="od-quick-skeleton" />
    ) : (
      <span className="od-quick-value">{value}</span>
    )}
  </div>
);

// ─── Custom Bar Tooltip ───────────────────────────────────────────────────────

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="od-chart-tooltip">
      <p className="od-tooltip-label">{label}</p>
      <p className="od-tooltip-revenue">
        ${Number(payload[0]?.value || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>
      {payload[0]?.payload?.percentage !== undefined && (
        <p className="od-tooltip-pct">{payload[0].payload.percentage}% of total</p>
      )}
    </div>
  );
};

// ─── Chart bar colours cycling ────────────────────────────────────────────────

const BAR_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#f59e0b"];

// ─── Main Component ───────────────────────────────────────────────────────────

const OrganizerDashboard: React.FC = () => {
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const organizerId = useMemo(() => {
    const raw = localStorage.getItem("organizerId");
    return raw ? Number(raw) : null;
  }, []);

  // ── Stat card states ───────────────────────────────────────────────────────
  const [totalEvents, setTotalEvents] = useState(0);
  const [ticketsSold, setTicketsSold] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgAttendance, setAvgAttendance] = useState(0);

  // ── Bar chart state ────────────────────────────────────────────────────────
  const [revenuePerEvent, setRevenuePerEvent] = useState<DashboardRevenuePerEventItem[]>([]);
  const [chartTotalRevenue, setChartTotalRevenue] = useState(0);

  // ── Quick stats states ─────────────────────────────────────────────────────
  const [eventsThisMonth, setEventsThisMonth] = useState(0);
  const [pendingVenueReqs, setPendingVenueReqs] = useState(0);
  const [totalAnnouncements, setTotalAnnouncements] = useState(0);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);

  // ── Loading flags ──────────────────────────────────────────────────────────
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingChart, setLoadingChart] = useState(true);
  const [loadingQuick, setLoadingQuick] = useState(true);

  // ── Load all ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!organizerId || Number.isNaN(organizerId)) {
      showAlert("Organizer ID not found. Please log in again.", "error");
      setLoadingStats(false);
      setLoadingChart(false);
      setLoadingQuick(false);
      return;
    }

    // Stat cards — parallel
    const loadStats = async () => {
      try {
        const [eventsRes, ticketsRes, revenueRes, attendanceRes] = await Promise.all([
          getDashboardTotalEvents(organizerId),
          getDashboardTicketsSold(organizerId),
          getDashboardTotalRevenue(organizerId),
          getDashboardAvgAttendance(organizerId),
        ]);
        setTotalEvents(eventsRes.totalEvents);
        setTicketsSold(ticketsRes.totalTicketsSold);
        setTotalRevenue(revenueRes.totalRevenue);
        setAvgAttendance(attendanceRes.avgAttendanceRate);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load stats.";
        showAlert(msg, "error");
      } finally {
        setLoadingStats(false);
      }
    };

    // Bar chart
    const loadChart = async () => {
      try {
        const res = await getDashboardRevenuePerEvent(organizerId);
        setRevenuePerEvent(res.revenuePerEvent);
        setChartTotalRevenue(res.totalRevenue);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load chart data.";
        showAlert(msg, "error");
      } finally {
        setLoadingChart(false);
      }
    };

    // Quick stats — parallel
    const loadQuick = async () => {
      try {
        const [monthRes, venueRes, annRes, feedRes] = await Promise.all([
          getDashboardEventsThisMonth(organizerId),
          getDashboardPendingVenueRequests(organizerId),
          getDashboardTotalAnnouncements(organizerId),
          getDashboardTotalFeedbacks(organizerId),
        ]);
        setEventsThisMonth(monthRes.eventsThisMonth);
        setPendingVenueReqs(venueRes.pendingVenueRequests);
        setTotalAnnouncements(annRes.totalAnnouncements);
        setTotalFeedbacks(feedRes.totalFeedbacks);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load quick stats.";
        showAlert(msg, "error");
      } finally {
        setLoadingQuick(false);
      }
    };

    loadStats();
    loadChart();
    loadQuick();
  }, [organizerId]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <AlertSnackbar open={open} message={message} severity={severity} onClose={handleClose} />

      <div className="page-shell">
        {/* Page header */}
        <div className="page-header">
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">
            Track your event performance and stay on top of key metrics.
          </p>
        </div>

        {/* ── 4 Stat Cards ── */}
        <div className="od-stats-grid">
          <StatCard
            label="Total Events"
            value={totalEvents}
            icon={<Calendar size={20} />}
            iconClass="od-icon-orange"
            isLoading={loadingStats}
          />
          <StatCard
            label="Tickets Sold"
            value={ticketsSold.toLocaleString()}
            icon={<Ticket size={20} />}
            iconClass="od-icon-blue"
            isLoading={loadingStats}
          />
          <StatCard
            label="Total Revenue"
            value={`$${Number(totalRevenue).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<DollarSign size={20} />}
            iconClass="od-icon-green"
            isLoading={loadingStats}
          />
          <StatCard
            label="Avg Attendance"
            value={avgAttendance}
            suffix="%"
            icon={<Users size={20} />}
            iconClass="od-icon-purple"
            isLoading={loadingStats}
          />
        </div>

        {/* ── Bottom row: chart + quick stats ── */}
        <div className="od-bottom-grid">
          {/* Bar Chart card */}
          <div className="surface-card od-chart-card">
            <div className="od-card-header">
              <div className="od-card-title-group">
                <TrendingUp size={18} className="od-card-title-icon" />
                <h3 className="od-card-title">Revenue per Event</h3>
              </div>
              {!loadingChart && chartTotalRevenue > 0 && (
                <span className="od-chart-total-pill">
                  Total: ${chartTotalRevenue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              )}
            </div>

            {loadingChart ? (
              <div className="od-chart-loading">
                <LoaderCircle size={22} className="od-spin" />
                <span>Loading chart…</span>
              </div>
            ) : revenuePerEvent.length === 0 ? (
              <div className="od-chart-empty">
                <TrendingUp size={28} />
                <p>No revenue data available yet.</p>
              </div>
            ) : (
              <div className="od-chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    data={revenuePerEvent}
                    margin={{ top: 8, right: 16, left: 8, bottom: 48 }}
                    barCategoryGap="35%"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="var(--color-border, #e2e8f0)"
                    />
                    <XAxis
                      dataKey="eventName"
                      tick={{ fontSize: 12, fill: "var(--color-text-muted, #64748b)", fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      angle={-30}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--color-text-muted, #64748b)" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) =>
                        v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                      }
                      width={56}
                    />
                    <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                    <Bar dataKey="revenue" radius={[6, 6, 0, 0]} maxBarSize={52}>
                      {revenuePerEvent.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={BAR_COLORS[index % BAR_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>

                {/* Legend with percentage labels */}
                <div className="od-chart-legend">
                  {revenuePerEvent.map((item, i) => (
                    <div key={item.eventId} className="od-legend-item">
                      <span
                        className="od-legend-dot"
                        style={{ background: BAR_COLORS[i % BAR_COLORS.length] }}
                      />
                      <span className="od-legend-name">{item.eventName}</span>
                      <span className="od-legend-pct">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats card */}
          <div className="surface-card od-quick-card">
            <div className="od-card-header">
              <div className="od-card-title-group">
                <Activity size={18} className="od-card-title-icon" />
                <h3 className="od-card-title">Quick Stats</h3>
              </div>
            </div>

            <div className="od-quick-list">
              <QuickStatRow
                icon={<CalendarDays size={16} />}
                iconClass="od-icon-orange"
                label="Events this month"
                value={eventsThisMonth}
                isLoading={loadingQuick}
              />
              <QuickStatRow
                icon={<MapPin size={16} />}
                iconClass="od-icon-blue"
                label="Pending venue requests"
                value={pendingVenueReqs}
                isLoading={loadingQuick}
              />
              <QuickStatRow
                icon={<Bell size={16} />}
                iconClass="od-icon-purple"
                label="Total announcements"
                value={totalAnnouncements}
                isLoading={loadingQuick}
              />
              <QuickStatRow
                icon={<Star size={16} />}
                iconClass="od-icon-green"
                label="Total feedbacks"
                value={totalFeedbacks}
                isLoading={loadingQuick}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizerDashboard;