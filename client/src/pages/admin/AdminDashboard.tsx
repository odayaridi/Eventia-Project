import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Calendar,
  MapPin,
  ShieldCheck,
  LoaderCircle,
  ArrowRight,
  UserCheck,
  Building2,
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
import "./AdminDashboard.css";
import {
  adminCountAllUsers,
  adminCountEventsAndVenues,
  adminCountPendingUsers,
  adminCountVenueManagers,
  adminCountEventOrganizers,
} from "../../api/adminApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconClass: string;
  isLoading: boolean;
  sub?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconClass,
  isLoading,
  sub,
}) => (
  <div className="surface-card ad-stat-card">
    <div className={`ad-stat-icon ${iconClass}`}>{icon}</div>
    <div className="ad-stat-body">
      <span className="ad-stat-label">{label}</span>
      {isLoading ? (
        <div className="ad-skeleton ad-skeleton-value" />
      ) : (
        <span className="ad-stat-value">{value}</span>
      )}
      {sub && !isLoading && <span className="ad-stat-sub">{sub}</span>}
    </div>
  </div>
);

// ─── Custom Pie Label ─────────────────────────────────────────────────────────

const PieLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Custom Pie Tooltip ───────────────────────────────────────────────────────

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ad-chart-tooltip">
      <p className="ad-tooltip-label">{payload[0].name}</p>
      <p className="ad-tooltip-value">{payload[0].value}</p>
    </div>
  );
};

// ─── Bar Tooltip ─────────────────────────────────────────────────────────────

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ad-chart-tooltip">
      <p className="ad-tooltip-label">{label}</p>
      <p className="ad-tooltip-value">{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

// ─── Colour constants ─────────────────────────────────────────────────────────

const BAR_COLORS  = ["#f97316", "#3b82f6", "#10b981"];
const PIE_APPROVED = "#10b981";
const PIE_PENDING  = "#f97316";

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { open, message, severity, showAlert, handleClose } = useAlert();

  // ── State ───────────────────────────────────────────────────────────────────

  const [totalUsers, setTotalUsers]       = useState(0);
  const [totalAttendees, setTotalAttendees]     = useState(0);
  const [totalOrganizers, setTotalOrganizers]   = useState(0);
  const [totalManagers, setTotalManagers]       = useState(0);

  const [totalEvents, setTotalEvents] = useState(0);
  const [totalVenues, setTotalVenues] = useState(0);

  const [pendingVM, setPendingVM] = useState(0);
  const [pendingEO, setPendingEO] = useState(0);
  const [totalPending, setTotalPending] = useState(0);

  const [approvedVM, setApprovedVM] = useState(0);
  const [rejectedVM, setRejectedVM] = useState(0);

  const [approvedEO, setApprovedEO] = useState(0);
  const [rejectedEO, setRejectedEO] = useState(0);

  const [loadingTop,   setLoadingTop]   = useState(true);
  const [loadingBar,   setLoadingBar]   = useState(true);
  const [loadingPie,   setLoadingPie]   = useState(true);
  const [loadingQuick, setLoadingQuick] = useState(true);

  // ── Load ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    // Top 3 stat cards — events + venues + user totals
    const loadTop = async () => {
      try {
        const [usersRes, evRes] = await Promise.all([
          adminCountAllUsers(),
          adminCountEventsAndVenues(),
        ]);
        setTotalUsers(usersRes.totalUsers);
        setTotalAttendees(usersRes.totalAttendees);
        setTotalOrganizers(usersRes.totalEventOrganizers);
        setTotalManagers(usersRes.totalVenueManagers);
        setTotalEvents(evRes.totalEvents);
        setTotalVenues(evRes.totalVenues);
      } catch (err) {
        showAlert(err instanceof Error ? err.message : "Failed to load stats.", "error");
      } finally {
        setLoadingTop(false);
        setLoadingBar(false);
      }
    };

    // Pie charts
    const loadPie = async () => {
      try {
        const [vmRes, eoRes] = await Promise.all([
          adminCountVenueManagers(),
          adminCountEventOrganizers(),
        ]);
        setApprovedVM(vmRes.approvedVenueManagers);
        setRejectedVM(vmRes.rejectedVenueManagers);
        setApprovedEO(eoRes.approvedEventOrganizers);
        setRejectedEO(eoRes.rejectedEventOrganizers);
      } catch (err) {
        showAlert(err instanceof Error ? err.message : "Failed to load approval data.", "error");
      } finally {
        setLoadingPie(false);
      }
    };

    // Quick stats
    const loadQuick = async () => {
      try {
        const res = await adminCountPendingUsers();
        setPendingVM(res.pendingVenueManagers);
        setPendingEO(res.pendingEventOrganizers);
        setTotalPending(res.totalPending);
      } catch (err) {
        showAlert(err instanceof Error ? err.message : "Failed to load pending data.", "error");
      } finally {
        setLoadingQuick(false);
      }
    };

    loadTop();
    loadPie();
    loadQuick();
  }, []);

  // ── Derived chart data ────────────────────────────────────────────────────────

  const barData = [
    { name: "Attendees",        count: totalAttendees },
    { name: "Event Organizers", count: totalOrganizers },
    { name: "Venue Owners",   count: totalManagers },
  ];

  const vmPieData = [
    { name: "Approved", value: approvedVM },
    { name: "Rejected", value: rejectedVM },
  ];

  const eoPieData = [
    { name: "Approved",     value: approvedEO },
    { name: "Rejected", value: rejectedEO },
  ];

  const vmTotal = approvedVM + rejectedVM;
  const eoTotal = approvedEO + rejectedEO;

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      <AlertSnackbar open={open} message={message} severity={severity} onClose={handleClose} />

      <div className="page-shell">
        {/* Header */}
        <div className="page-header">
          <h2 className="page-title">Dashboard</h2>
          <p className="page-subtitle">
            Platform overview — monitor users, events, venues, and approval statuses.
          </p>
        </div>

        {/* ── 3 Stat Cards ── */}
        <div className="ad-stats-grid">
          <StatCard
            label="Total Users"
            value={totalUsers.toLocaleString()}
            icon={<Users size={22} />}
            iconClass="ad-icon-orange"
            isLoading={loadingTop}
            sub={`${totalAttendees} attendees · ${totalOrganizers} organizers · ${totalManagers} managers`}
          />
          <StatCard
            label="Total Events"
            value={totalEvents.toLocaleString()}
            icon={<Calendar size={22} />}
            iconClass="ad-icon-blue"
            isLoading={loadingTop}
          />
          <StatCard
            label="Total Venues"
            value={totalVenues.toLocaleString()}
            icon={<MapPin size={22} />}
            iconClass="ad-icon-green"
            isLoading={loadingTop}
          />
        </div>

        {/* ── Middle row: bar chart + pie charts ── */}
        <div className="ad-middle-grid">

          {/* Bar chart — user breakdown */}
          <div className="surface-card ad-chart-card">
            <div className="ad-card-header">
              <div className="ad-card-title-group">
                <Users size={17} className="ad-card-icon" />
                <h3 className="ad-card-title">User Breakdown</h3>
              </div>
            </div>

            {loadingBar ? (
              <div className="ad-chart-loading">
                <LoaderCircle size={22} className="ad-spin" />
                <span>Loading…</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={barData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 8 }}
                  barCategoryGap="40%"
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="var(--color-border, #e2e8f0)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 13, fill: "var(--color-text-muted, #64748b)", fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--color-text-muted, #94a3b8)" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    width={40}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={64}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie charts stacked + quick stats */}
          <div className="ad-right-col">

            {/* Pie charts side by side */}
            <div className="surface-card ad-pie-card">
              <div className="ad-card-header">
                <div className="ad-card-title-group">
                  <ShieldCheck size={17} className="ad-card-icon" />
                  <h3 className="ad-card-title">Approval Status</h3>
                </div>
              </div>

              {loadingPie ? (
                <div className="ad-chart-loading">
                  <LoaderCircle size={20} className="ad-spin" />
                  <span>Loading…</span>
                </div>
              ) : (
                <div className="ad-pie-row">
                  {/* Venue Managers pie */}
                  <div className="ad-pie-block">
                    <p className="ad-pie-label">
                      <Building2 size={13} />
                      Venue Owners
                      <span className="ad-pie-total">({vmTotal})</span>
                    </p>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={vmPieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={72}
                          dataKey="value"
                          labelLine={false}
                          label={<PieLabel />}
                        >
                          <Cell fill={PIE_APPROVED} />
                          <Cell fill={PIE_PENDING} />
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend
                          iconType="circle"
                          iconSize={9}
                          formatter={(value) => (
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Event Organizers pie */}
                  <div className="ad-pie-block">
                    <p className="ad-pie-label">
                      <UserCheck size={13} />
                      Event Organizers
                      <span className="ad-pie-total">({eoTotal})</span>
                    </p>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={eoPieData}
                          cx="50%"
                          cy="50%"
                          outerRadius={72}
                          dataKey="value"
                          labelLine={false}
                          label={<PieLabel />}
                        >
                          <Cell fill={PIE_APPROVED} />
                          <Cell fill={PIE_PENDING} />
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                        <Legend
                          iconType="circle"
                          iconSize={9}
                          formatter={(value) => (
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="surface-card ad-quick-card">
              <div className="ad-card-header">
                <div className="ad-card-title-group">
                  <ShieldCheck size={17} className="ad-card-icon" />
                  <h3 className="ad-card-title">Pending Approvals</h3>
                </div>
                {!loadingQuick && totalPending > 0 && (
                  <span className="ad-pending-badge">{totalPending} pending</span>
                )}
              </div>

              {loadingQuick ? (
                <div className="ad-quick-loading">
                  <div className="ad-skeleton ad-skeleton-row" />
                  <div className="ad-skeleton ad-skeleton-row" />
                </div>
              ) : (
                <>
                  <div className="ad-quick-list">
                    <div className="ad-quick-row">
                      <div className="ad-quick-icon ad-icon-blue">
                        <Building2 size={15} />
                      </div>
                      <span className="ad-quick-label">Pending Venue Owners</span>
                      <span className="ad-quick-value">{pendingVM}</span>
                    </div>
                    <div className="ad-quick-row">
                      <div className="ad-quick-icon ad-icon-orange">
                        <UserCheck size={15} />
                      </div>
                      <span className="ad-quick-label">Pending Event Organizers</span>
                      <span className="ad-quick-value">{pendingEO}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="ad-review-btn"
                    onClick={() => navigate("/admin/pending-approvals")}
                  >
                    <ShieldCheck size={16} />
                    <span>Review Approvals</span>
                    <ArrowRight size={15} className="ad-review-arrow" />
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;