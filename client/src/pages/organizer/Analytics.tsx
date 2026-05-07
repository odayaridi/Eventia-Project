// import React, { useEffect, useMemo, useState } from "react";
// import {
//   BarChart3,
//   PieChart,
//   Ticket,
//   ChevronDown,
//   LoaderCircle,
//   CircleAlert,
//   CheckCircle2,
//   XCircle,
// } from "lucide-react";
// import "./Analytics.css";
// import AlertSnackbar from "../../components/common/AlertSnackbar";
// import { useAlert } from "../../hooks/useAlert";
// import {
//   getEndedEventNamesForAnalytics,
//   getEventAttendancePieChart,
//   getTotalTicketsQuantityAllEvents,
//   type EndedEventNameItem,
//   type EventAttendancePieChartResponse,
//   type EventTotalTicketsQuantityItem,
// } from "../../api/eventApi";

// const Analytics: React.FC = () => {
//   const { open, message, severity, showAlert, handleClose } = useAlert();

//   const [ticketStats, setTicketStats] = useState<EventTotalTicketsQuantityItem[]>([]);
//   const [endedEvents, setEndedEvents] = useState<EndedEventNameItem[]>([]);
//   const [selectedEventName, setSelectedEventName] = useState("");

//   const [pieData, setPieData] = useState<EventAttendancePieChartResponse>({
//     chart: {
//       attended: 0,
//       nonAttended: 0,
//     },
//   });

//   const [isLoadingTickets, setIsLoadingTickets] = useState(true);
//   const [isLoadingEndedEvents, setIsLoadingEndedEvents] = useState(true);
//   const [isLoadingPie, setIsLoadingPie] = useState(false);

//   const organizerId = useMemo(() => {
//     const raw = localStorage.getItem("organizerId");
//     return raw ? Number(raw) : null;
//   }, []);

//   const maxTotalQuantity = useMemo(() => {
//     if (ticketStats.length === 0) return 1;

//     return Math.max(
//       ...ticketStats.map(
//         (item) =>
//           Number(item.sumQuantitySold || 0) + Number(item.sumQuantityAvailable || 0)
//       ),
//       1
//     );
//   }, [ticketStats]);

//   const attendedAngle = useMemo(() => {
//     const attended = Number(pieData.chart.attended || 0);
//     return Math.max(0, Math.min(100, attended)) * 3.6;
//   }, [pieData]);

//   const loadTicketStats = async () => {
//     try {
//       setIsLoadingTickets(true);
//       const data = await getTotalTicketsQuantityAllEvents();
//       setTicketStats(data);
//     } catch (error) {
//       const msg =
//         error instanceof Error
//           ? error.message
//           : "Failed to load event ticket analytics.";
//       showAlert(msg, "error");
//       setTicketStats([]);
//     } finally {
//       setIsLoadingTickets(false);
//     }
//   };

//   const loadEndedEvents = async () => {
//     if (!organizerId || Number.isNaN(organizerId)) {
//       showAlert("Organizer ID was not found. Please log in again.", "error");
//       setEndedEvents([]);
//       setIsLoadingEndedEvents(false);
//       return;
//     }

//     try {
//       setIsLoadingEndedEvents(true);
//       const data = await getEndedEventNamesForAnalytics(organizerId);
//       setEndedEvents(data);

//       if (data.length > 0) {
//         setSelectedEventName(data[0].name);
//       }
//     } catch (error) {
//       const msg =
//         error instanceof Error
//           ? error.message
//           : "Failed to load ended event names.";
//       showAlert(msg, "error");
//       setEndedEvents([]);
//     } finally {
//       setIsLoadingEndedEvents(false);
//     }
//   };

//   const loadPieChart = async (eventName: string) => {
//     if (!eventName) {
//       setPieData({
//         chart: {
//           attended: 0,
//           nonAttended: 0,
//         },
//       });
//       return;
//     }

//     try {
//       setIsLoadingPie(true);
//       const data = await getEventAttendancePieChart(eventName);
//       setPieData(data);
//     } catch (error) {
//       const msg =
//         error instanceof Error
//           ? error.message
//           : "Failed to load attendance chart.";
//       showAlert(msg, "error");
//       setPieData({
//         chart: {
//           attended: 0,
//           nonAttended: 0,
//         },
//       });
//     } finally {
//       setIsLoadingPie(false);
//     }
//   };

//   useEffect(() => {
//     loadTicketStats();
//     loadEndedEvents();
//   }, []);

//   useEffect(() => {
//     if (selectedEventName) {
//       loadPieChart(selectedEventName);
//     }
//   }, [selectedEventName]);

//   return (
//     <>
//       <div className="page-shell analytics-page-shell">
//         <div className="page-header">
//           <h1 className="page-title">Analytics</h1>
//           <p className="page-subtitle">
//             Review event ticket performance and attendance insights through a
//             clean analytics workspace built for organizers.
//           </p>
//         </div>

//         <section className="surface-card analytics-section-card">
//           <div className="analytics-section-header">
//             <div className="analytics-header-left">
//               <div className="analytics-header-icon">
//                 <BarChart3 size={18} />
//               </div>
//               <div>
//                 <h3 className="analytics-section-title">Tickets Overview</h3>
//                 <p className="analytics-section-subtitle">
//                   Compare sold and available ticket quantities across all your events.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {isLoadingTickets ? (
//             <div className="analytics-state-box">
//               <LoaderCircle size={22} className="analytics-spin-icon" />
//               <span>Loading ticket analytics...</span>
//             </div>
//           ) : ticketStats.length === 0 ? (
//             <div className="analytics-empty-state">
//               <div className="analytics-empty-icon">
//                 <CircleAlert size={24} />
//               </div>
//               <h3>No ticket data found</h3>
//               <p>There are no ticket quantity analytics available yet.</p>
//             </div>
//           ) : (
//             <div className="analytics-bars-list">
//               {ticketStats.map((item) => {
//                 const sold = Number(item.sumQuantitySold || 0);
//                 const available = Number(item.sumQuantityAvailable || 0);
//                 const total = sold + available;

//                 const soldWidth = `${(sold / maxTotalQuantity) * 100}%`;
//                 const availableWidth = `${(available / maxTotalQuantity) * 100}%`;

//                 return (
//                   <div className="analytics-bar-card" key={item.eventId}>
//                     <div className="analytics-bar-card-top">
//                       <div className="analytics-bar-title-wrap">
//                         <div className="analytics-bar-title-icon">
//                           <Ticket size={15} />
//                         </div>
//                         <div>
//                           <h4>{item.eventName}</h4>
//                           <p>Total tickets: {total}</p>
//                         </div>
//                       </div>

//                       <div className="analytics-bar-stats">
//                         <div className="analytics-stat-pill analytics-stat-pill-sold">
//                           Sold: {sold}
//                         </div>
//                         <div className="analytics-stat-pill analytics-stat-pill-available">
//                           Available: {available}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="analytics-progress-wrap">
//                       <div className="analytics-progress-label-row">
//                         <span>Sold</span>
//                         <span>{sold}</span>
//                       </div>
//                       <div className="analytics-progress-track">
//                         <div
//                           className="analytics-progress-fill analytics-progress-fill-sold"
//                           style={{ width: soldWidth }}
//                         />
//                       </div>
//                     </div>

//                     <div className="analytics-progress-wrap">
//                       <div className="analytics-progress-label-row">
//                         <span>Available</span>
//                         <span>{available}</span>
//                       </div>
//                       <div className="analytics-progress-track">
//                         <div
//                           className="analytics-progress-fill analytics-progress-fill-available"
//                           style={{ width: availableWidth }}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </section>

//         <section className="surface-card analytics-section-card">
//           <div className="analytics-section-header">
//             <div className="analytics-header-left">
//               <div className="analytics-header-icon">
//                 <PieChart size={18} />
//               </div>
//               <div>
//                 <h3 className="analytics-section-title">Attendance Pie Chart</h3>
//                 <p className="analytics-section-subtitle">
//                   Select a finished event to view the attended and unattended percentages.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="analytics-filter-row">
//             <div className="analytics-field">
//               <label htmlFor="analytics-event-name">Ended Event</label>
//               <div className="analytics-select-wrap">
//                 <select
//                   id="analytics-event-name"
//                   value={selectedEventName}
//                   onChange={(e) => setSelectedEventName(e.target.value)}
//                   disabled={isLoadingEndedEvents || endedEvents.length === 0}
//                 >
//                   {isLoadingEndedEvents ? (
//                     <option value="">Loading events...</option>
//                   ) : endedEvents.length === 0 ? (
//                     <option value="">No ended events found</option>
//                   ) : (
//                     endedEvents.map((item, index) => (
//                       <option key={`${item.name}-${index}`} value={item.name}>
//                         {item.name}
//                       </option>
//                     ))
//                   )}
//                 </select>
//                 <ChevronDown size={16} className="analytics-select-icon" />
//               </div>
//             </div>
//           </div>

//           {isLoadingPie ? (
//             <div className="analytics-state-box">
//               <LoaderCircle size={22} className="analytics-spin-icon" />
//               <span>Loading attendance chart...</span>
//             </div>
//           ) : !selectedEventName ? (
//             <div className="analytics-empty-state analytics-empty-state-compact">
//               <div className="analytics-empty-icon">
//                 <CircleAlert size={24} />
//               </div>
//               <h3>No event selected</h3>
//               <p>Select an ended event to view attendance percentages.</p>
//             </div>
//           ) : (
//             <div className="analytics-pie-layout">
//               <div className="analytics-pie-wrap">
//                 <div
//                   className="analytics-pie-chart"
//                   style={{
//                     background: `conic-gradient(
//                       #f97316 0deg ${attendedAngle}deg,
//                       #e2e8f0 ${attendedAngle}deg 360deg
//                     )`,
//                   }}
//                 >
//                   <div className="analytics-pie-center">
//                     <strong>{selectedEventName}</strong>
//                     <span>Attendance</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="analytics-pie-legend">
//                 <div className="analytics-pie-stat-card analytics-pie-stat-card-attended">
//                   <div className="analytics-pie-stat-top">
//                     <CheckCircle2 size={18} />
//                     <span>Attended</span>
//                   </div>
//                   <strong>{Number(pieData.chart.attended || 0).toFixed(2)}%</strong>
//                   <p>Percentage of attendees who checked in.</p>
//                 </div>

//                 <div className="analytics-pie-stat-card analytics-pie-stat-card-unattended">
//                   <div className="analytics-pie-stat-top">
//                     <XCircle size={18} />
//                     <span>Unattended</span>
//                   </div>
//                   <strong>{Number(pieData.chart.nonAttended || 0).toFixed(2)}%</strong>
//                   <p>Percentage of attendees who did not attend.</p>
//                 </div>
//               </div>
//             </div>
//           )}
//         </section>
//       </div>

//       <AlertSnackbar
//         open={open}
//         message={message}
//         severity={severity}
//         onClose={handleClose}
//       />
//     </>
//   );
// };

// export default Analytics;





import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  PieChart,
  Ticket,
  ChevronDown,
  LoaderCircle,
  CircleAlert,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import "./Analytics.css";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";
import {
  getEndedEventNamesForAnalytics,
  getEventAttendancePieChart,
  getTotalTicketsQuantityAllEvents,
  type EndedEventNameItem,
  type EventAttendancePieChartResponse,
  type EventTotalTicketsQuantityItem,
} from "../../api/eventApi";

const Analytics: React.FC = () => {
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const [ticketStats, setTicketStats] = useState<EventTotalTicketsQuantityItem[]>([]);
  const [endedEvents, setEndedEvents] = useState<EndedEventNameItem[]>([]);
  const [selectedEventName, setSelectedEventName] = useState("");

  const [pieData, setPieData] = useState<EventAttendancePieChartResponse>({
    chart: {
      attended: 0,
      nonAttended: 0,
    },
  });

  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [isLoadingEndedEvents, setIsLoadingEndedEvents] = useState(true);
  const [isLoadingPie, setIsLoadingPie] = useState(false);

  const organizerId = useMemo(() => {
    const raw = localStorage.getItem("organizerId");
    return raw ? Number(raw) : null;
  }, []);

  const attendedAngle = useMemo(() => {
    const attended = Number(pieData.chart.attended || 0);
    return Math.max(0, Math.min(100, attended)) * 3.6;
  }, [pieData]);

  const loadTicketStats = async () => {
    try {
      setIsLoadingTickets(true);
      const data = await getTotalTicketsQuantityAllEvents();
      setTicketStats(data);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to load event ticket analytics.";
      showAlert(msg, "error");
      setTicketStats([]);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  const loadEndedEvents = async () => {
    if (!organizerId || Number.isNaN(organizerId)) {
      showAlert("Organizer ID was not found. Please log in again.", "error");
      setEndedEvents([]);
      setIsLoadingEndedEvents(false);
      return;
    }

    try {
      setIsLoadingEndedEvents(true);
      const data = await getEndedEventNamesForAnalytics(organizerId);
      setEndedEvents(data);

      if (data.length > 0) {
        setSelectedEventName(data[0].name);
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load ended event names.";
      showAlert(msg, "error");
      setEndedEvents([]);
    } finally {
      setIsLoadingEndedEvents(false);
    }
  };

  const loadPieChart = async (eventName: string) => {
    if (!eventName) {
      setPieData({
        chart: {
          attended: 0,
          nonAttended: 0,
        },
      });
      return;
    }

    try {
      setIsLoadingPie(true);
      const data = await getEventAttendancePieChart(eventName);
      setPieData(data);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load attendance chart.";
      showAlert(msg, "error");
      setPieData({
        chart: {
          attended: 0,
          nonAttended: 0,
        },
      });
    } finally {
      setIsLoadingPie(false);
    }
  };

  useEffect(() => {
    loadTicketStats();
    loadEndedEvents();
  }, []);

  useEffect(() => {
    if (selectedEventName) {
      loadPieChart(selectedEventName);
    }
  }, [selectedEventName]);

  return (
    <>
      <div className="page-shell analytics-page-shell">
        <div className="page-header">
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">
            Review event ticket performance and attendance insights through a clean
            analytics workspace built for organizers.
          </p>
        </div>

        <section className="surface-card analytics-section-card analytics-ticket-section">
          <div className="analytics-section-header analytics-section-header-balanced">
            <div className="analytics-header-left">
              <div className="analytics-header-icon">
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 className="analytics-section-title">Tickets Overview</h3>
                <p className="analytics-section-subtitle">
                  Monitor sold and available ticket quantities across your events.
                </p>
              </div>
            </div>

            {!isLoadingTickets && ticketStats.length > 0 && (
              <div className="analytics-section-badge">
                {ticketStats.length} event{ticketStats.length === 1 ? "" : "s"}
              </div>
            )}
          </div>

          {isLoadingTickets ? (
            <div className="analytics-state-box analytics-state-box-compact">
              <LoaderCircle size={22} className="analytics-spin-icon" />
              <span>Loading ticket analytics...</span>
            </div>
          ) : ticketStats.length === 0 ? (
            <div className="analytics-empty-state analytics-empty-state-compact">
              <div className="analytics-empty-icon">
                <CircleAlert size={24} />
              </div>
              <h3>No ticket data found</h3>
              <p>There are no ticket quantity analytics available yet.</p>
            </div>
          ) : (
            <div className="analytics-ticket-table-card">
              <div className="analytics-ticket-table-head">
                <span>Event</span>
                <span>Sold</span>
                <span>Available</span>
                <span>Total</span>
                <span>Progress</span>
              </div>

              <div className="analytics-ticket-table-body">
                {ticketStats.map((item) => {
                  const sold = Number(item.sumQuantitySold || 0);
                  const available = Number(item.sumQuantityAvailable || 0);
                  const total = sold + available;

                  const soldPercent = total > 0 ? (sold / total) * 100 : 0;
                  const availablePercent = total > 0 ? (available / total) * 100 : 0;

                  return (
                    <div className="analytics-ticket-row" key={item.eventId}>
                      <div className="analytics-ticket-event-cell">
                        <div className="analytics-ticket-event-icon">
                          <Ticket size={15} />
                        </div>
                        <div>
                          <strong>{item.eventName}</strong>
                          <span>Total tickets: {total}</span>
                        </div>
                      </div>

                      <div className="analytics-ticket-number-cell analytics-ticket-number-sold">
                        {sold}
                      </div>

                      <div className="analytics-ticket-number-cell analytics-ticket-number-available">
                        {available}
                      </div>

                      <div className="analytics-ticket-number-cell">{total}</div>

                      <div className="analytics-ticket-progress-cell">
                        <div className="analytics-ticket-progress-meta">
                          <span>{Math.round(soldPercent)}% sold</span>
                          <span>{Math.round(availablePercent)}% available</span>
                        </div>

                        <div className="analytics-ticket-stacked-track">
                          <div
                            className="analytics-ticket-stacked-sold"
                            style={{ width: `${soldPercent}%` }}
                          />
                          <div
                            className="analytics-ticket-stacked-available"
                            style={{ width: `${availablePercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        <section className="surface-card analytics-section-card">
          <div className="analytics-section-header">
            <div className="analytics-header-left">
              <div className="analytics-header-icon">
                <PieChart size={18} />
              </div>
              <div>
                <h3 className="analytics-section-title">Attendance Pie Chart</h3>
                <p className="analytics-section-subtitle">
                  Select a finished event to view the attended and unattended percentages.
                </p>
              </div>
            </div>
          </div>

          <div className="analytics-filter-row">
            <div className="analytics-field">
              <label htmlFor="analytics-event-name">Ended Event</label>
              <div className="analytics-select-wrap">
                <select
                  id="analytics-event-name"
                  value={selectedEventName}
                  onChange={(e) => setSelectedEventName(e.target.value)}
                  disabled={isLoadingEndedEvents || endedEvents.length === 0}
                >
                  {isLoadingEndedEvents ? (
                    <option value="">Loading events...</option>
                  ) : endedEvents.length === 0 ? (
                    <option value="">No ended events found</option>
                  ) : (
                    endedEvents.map((item, index) => (
                      <option key={`${item.name}-${index}`} value={item.name}>
                        {item.name}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown size={16} className="analytics-select-icon" />
              </div>
            </div>
          </div>

          {isLoadingPie ? (
            <div className="analytics-state-box">
              <LoaderCircle size={22} className="analytics-spin-icon" />
              <span>Loading attendance chart...</span>
            </div>
          ) : !selectedEventName ? (
            <div className="analytics-empty-state analytics-empty-state-compact">
              <div className="analytics-empty-icon">
                <CircleAlert size={24} />
              </div>
              <h3>No event selected</h3>
              <p>Select an ended event to view attendance percentages.</p>
            </div>
          ) : (
            <div className="analytics-pie-layout">
              <div className="analytics-pie-wrap">
                <div
                  className="analytics-pie-chart"
                  style={{
                    background: `conic-gradient(
                      #f97316 0deg ${attendedAngle}deg,
                      #e2e8f0 ${attendedAngle}deg 360deg
                    )`,
                  }}
                >
                  <div className="analytics-pie-center">
                    <strong>{selectedEventName}</strong>
                    <span>Attendance</span>
                  </div>
                </div>
              </div>

              <div className="analytics-pie-legend">
                <div className="analytics-pie-stat-card analytics-pie-stat-card-attended">
                  <div className="analytics-pie-stat-top">
                    <CheckCircle2 size={18} />
                    <span>Attended</span>
                  </div>
                 <strong>{Math.round(Number(pieData.chart.attended || 0))}%</strong>
                  <p>Percentage of attendees who checked in.</p>
                </div>

                <div className="analytics-pie-stat-card analytics-pie-stat-card-unattended">
                  <div className="analytics-pie-stat-top">
                    <XCircle size={18} />
                    <span>Unattended</span>
                  </div>
                  <strong>
                   {Math.round(Number(pieData.chart.nonAttended || 0))}%
                  </strong>
                  <p>Percentage of attendees who did not attend.</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <AlertSnackbar
        open={open}
        message={message}
        severity={severity}
        onClose={handleClose}
      />
    </>
  );
};

export default Analytics;