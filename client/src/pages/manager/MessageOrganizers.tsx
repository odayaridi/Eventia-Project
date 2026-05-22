// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { io, type Socket } from "socket.io-client";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   MessageSquare,
//   Search,
//   LoaderCircle,
//   CircleAlert,
//   UserRound,
//   Building2,
//   Send,
// } from "lucide-react";
// import "./MessageOrganizers.css";
// import {
//   getOrganizersChatting,
//   createOrGetConversationForVenue,
//   getConversationMessagesForVenue,
//   type OrganizerChattingItem,
//   type ConversationItem,
//   type ChatMessageItem,
// } from "../../api/venueApi";
// import AlertSnackbar from "../../components/common/AlertSnackbar";
// import { useAlert } from "../../hooks/useAlert";

// const SOCKET_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

// const formatMessageTime = (dateString: string) => {
//   if (!dateString) return "";
//   const parsed = new Date(dateString.replace(" ", "T"));
//   if (Number.isNaN(parsed.getTime())) return dateString;

//   return parsed.toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// const formatPreviewDate = (dateString: string | null) => {
//   if (!dateString) return "";
//   const parsed = new Date(dateString.replace(" ", "T"));
//   if (Number.isNaN(parsed.getTime())) return "";

//   return parsed.toLocaleDateString([], {
//     month: "short",
//     day: "numeric",
//   });
// };

// const MessageOrganizers: React.FC = () => {
//   const { open, message, severity, showAlert, handleClose } = useAlert();
//   const navigate = useNavigate();
//   const params = useParams();

//   const managerId = useMemo(() => {
//     const raw = localStorage.getItem("managerId");
//     return raw ? Number(raw) : null;
//   }, []);

//   const userId = useMemo(() => {
//     const raw = localStorage.getItem("userId");
//     return raw ? Number(raw) : null;
//   }, []);

//   const myUsername = useMemo(() => {
//     return localStorage.getItem("username") || "You";
//   }, []);

//   const selectedOrganizerIdFromRoute = useMemo(() => {
//     const raw = params.organizerId;
//     return raw ? Number(raw) : null;
//   }, [params.organizerId]);

//   const [organizers, setOrganizers] = useState<OrganizerChattingItem[]>([]);
//   const [selectedOrganizer, setSelectedOrganizer] =
//     useState<OrganizerChattingItem | null>(null);

//   const [conversation, setConversation] = useState<ConversationItem | null>(null);
//   const [messages, setMessages] = useState<ChatMessageItem[]>([]);
//   const [messageInput, setMessageInput] = useState("");
//   const [search, setSearch] = useState("");

//   const [isLoadingOrganizers, setIsLoadingOrganizers] = useState(true);
//   const [isLoadingConversation, setIsLoadingConversation] = useState(false);
//   const [isSending, setIsSending] = useState(false);

//   const socketRef = useRef<Socket | null>(null);
//   const bottomRef = useRef<HTMLDivElement | null>(null);

//   const filteredOrganizers = useMemo(() => {
//     const query = search.trim().toLowerCase();
//     if (!query) return organizers;

//     return organizers.filter(
//       (item) =>
//         item.organizerName.toLowerCase().includes(query) ||
//         (item.venueName || "").toLowerCase().includes(query)
//     );
//   }, [organizers, search]);

//   const scrollToBottom = () => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const loadOrganizers = async () => {
//     if (!managerId || Number.isNaN(managerId)) {
//       showAlert("Manager ID was not found. Please log in again.", "error");
//       setIsLoadingOrganizers(false);
//       return;
//     }

//     try {
//       setIsLoadingOrganizers(true);

//       const data = await getOrganizersChatting(managerId);
//       setOrganizers(data);

//       if (data.length === 0) {
//         setSelectedOrganizer(null);
//         return;
//       }

//       if (selectedOrganizerIdFromRoute) {
//         const matchedOrganizer = data.find(
//           (item) => Number(item.organizerId) === Number(selectedOrganizerIdFromRoute)
//         );

//         if (matchedOrganizer) {
//           setSelectedOrganizer(matchedOrganizer);
//           return;
//         }
//       }

//       setSelectedOrganizer(data[0]);
//       navigate(`/venue/message-organizers/organizer/${data[0].organizerId}`, {
//         replace: true,
//       });
//     } catch (error) {
//       const msg =
//         error instanceof Error ? error.message : "Failed to load organizers.";
//       showAlert(msg, "error");
//       setOrganizers([]);
//       setSelectedOrganizer(null);
//     } finally {
//       setIsLoadingOrganizers(false);
//     }
//   };

//   const loadConversation = async (organizer: OrganizerChattingItem) => {
//     if (!managerId || !organizer) return;

//     try {
//       setIsLoadingConversation(true);

//       const conversationData = await createOrGetConversationForVenue({
//         organizerId: organizer.organizerId,
//         managerId,
//         venueId: organizer.venueId,
//       });

//       setConversation(conversationData);

//       const messagesData = await getConversationMessagesForVenue(conversationData.id);
//       setMessages(messagesData);

//       if (!socketRef.current) {
//         const socket = io(SOCKET_BASE_URL, {
//           transports: ["websocket"],
//         });

//         socketRef.current = socket;

//         socket.on("receive_message", (incomingMessage: ChatMessageItem) => {
//           setMessages((prev) => {
//             if (
//               Number(incomingMessage.conversationId) !== Number(conversationData.id)
//             ) {
//               return prev;
//             }

//             const exists = prev.some((msg) => msg.id === incomingMessage.id);
//             if (exists) return prev;

//             return [...prev, incomingMessage];
//           });

//           setOrganizers((prev) =>
//             [...prev]
//               .map((item) =>
//                 item.conversationId === conversationData.id
//                   ? {
//                       ...item,
//                       lastMessagePreview: incomingMessage.message,
//                       lastMessageAt: incomingMessage.createdAt,
//                     }
//                   : item
//               )
//               .sort((a, b) => {
//                 const timeA = a.lastMessageAt
//                   ? new Date(a.lastMessageAt.replace(" ", "T")).getTime()
//                   : 0;
//                 const timeB = b.lastMessageAt
//                   ? new Date(b.lastMessageAt.replace(" ", "T")).getTime()
//                   : 0;
//                 return timeB - timeA;
//               })
//           );
//         });
//       }

//       socketRef.current.emit("join_conversation", {
//         conversationId: conversationData.id,
//       });
//     } catch (error) {
//       const msg =
//         error instanceof Error ? error.message : "Failed to load conversation.";
//       showAlert(msg, "error");
//       setConversation(null);
//       setMessages([]);
//     } finally {
//       setIsLoadingConversation(false);
//     }
//   };

//   useEffect(() => {
//     loadOrganizers();

//     return () => {
//       socketRef.current?.disconnect();
//       socketRef.current = null;
//     };
//   }, []);

//   useEffect(() => {
//     if (!organizers.length) return;

//     if (!selectedOrganizerIdFromRoute) return;

//     const matchedOrganizer = organizers.find(
//       (item) => Number(item.organizerId) === Number(selectedOrganizerIdFromRoute)
//     );

//     if (matchedOrganizer) {
//       setSelectedOrganizer((prev) => {
//         if (
//           prev &&
//           Number(prev.organizerId) === Number(matchedOrganizer.organizerId)
//         ) {
//           return prev;
//         }
//         return matchedOrganizer;
//       });
//     }
//   }, [organizers, selectedOrganizerIdFromRoute]);

//   useEffect(() => {
//     if (selectedOrganizer) {
//       loadConversation(selectedOrganizer);
//     }
//   }, [selectedOrganizer?.organizerId]);

//   const handleSelectOrganizer = (organizer: OrganizerChattingItem) => {
//     setSelectedOrganizer(organizer);
//     navigate(`/venue/message-organizers/organizer/${organizer.organizerId}`);
//   };

//   const handleSendMessage = async () => {
//     if (!messageInput.trim() || !conversation || !userId || !socketRef.current || isSending) {
//       return;
//     }

//     try {
//       setIsSending(true);
//       const trimmed = messageInput.trim();

//       await new Promise<void>((resolve, reject) => {
//         socketRef.current?.emit(
//           "send_message",
//           {
//             conversationId: conversation.id,
//             senderId: userId,
//             message: trimmed,
//           },
//           (response: {
//             success: boolean;
//             message: string;
//             data?: ChatMessageItem;
//           }) => {
//             if (!response?.success) {
//               reject(new Error(response?.message || "Failed to send message."));
//               return;
//             }

//             resolve();
//           }
//         );
//       });

//       setMessageInput("");

//       setOrganizers((prev) =>
//         [...prev]
//           .map((item) =>
//             item.conversationId === conversation.id
//               ? {
//                   ...item,
//                   lastMessagePreview: trimmed,
//                   lastMessageAt: new Date().toISOString().slice(0, 19).replace("T", " "),
//                 }
//               : item
//           )
//           .sort((a, b) => {
//             const timeA = a.lastMessageAt
//               ? new Date(a.lastMessageAt.replace(" ", "T")).getTime()
//               : 0;
//             const timeB = b.lastMessageAt
//               ? new Date(b.lastMessageAt.replace(" ", "T")).getTime()
//               : 0;
//             return timeB - timeA;
//           })
//       );
//     } catch (error) {
//       const msg =
//         error instanceof Error ? error.message : "Failed to send message.";
//       showAlert(msg, "error");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleKeyDown = async (
//     e: React.KeyboardEvent<HTMLTextAreaElement>
//   ) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       await handleSendMessage();
//     }
//   };

//   return (
//     <>
//       <div className="page-shell venue-chat-page-shell">
//         <div className="page-header">
//           <h1 className="page-title">Message Organizers</h1>
//           <p className="page-subtitle">
//             Review and continue your organizer conversations in one professional workspace.
//           </p>
//         </div>

//         <div className="venue-chat-layout">
//           <section className="surface-card venue-chat-main-card">
//             {!selectedOrganizer ? (
//               <div className="venue-chat-empty-main">
//                 <div className="venue-chat-empty-icon">
//                   <CircleAlert size={28} />
//                 </div>
//                 <h3>No organizer selected</h3>
//                 <p>Select an organizer from the right panel to open the conversation.</p>
//               </div>
//             ) : isLoadingConversation ? (
//               <div className="venue-chat-loading-main">
//                 <LoaderCircle size={24} className="venue-chat-spin" />
//                 <span>Loading conversation...</span>
//               </div>
//             ) : (
//               <>
//                 <div className="venue-chat-conversation-header">
//                   <div className="venue-chat-conversation-avatar">
//                     <MessageSquare size={20} />
//                   </div>

//                   <div className="venue-chat-conversation-meta">
//                     <h2>{selectedOrganizer.organizerName}</h2>

//                     <div className="venue-chat-conversation-submeta">
//                       <div className="venue-chat-conversation-subitem">
//                         <UserRound size={14} />
//                         <span>Event Organizer</span>
//                       </div>

//                       {selectedOrganizer.venueName && (
//                         <div className="venue-chat-conversation-subitem">
//                           <Building2 size={14} />
//                           <span>{selectedOrganizer.venueName}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="venue-chat-messages-panel">
//                   {messages.length === 0 ? (
//                     <div className="venue-chat-empty-messages">
//                       <div className="venue-chat-empty-icon">
//                         <MessageSquare size={24} />
//                       </div>
//                       <h3>No messages yet</h3>
//                       <p>Continue the conversation with this organizer.</p>
//                     </div>
//                   ) : (
//                     <div className="venue-chat-messages-list">
//                       {messages.map((msg) => {
//                         const isMine = Number(msg.senderId) === Number(userId);

//                         return (
//                           <div
//                             key={msg.id}
//                             className={`venue-chat-message-row ${
//                               isMine ? "venue-chat-message-row-mine" : ""
//                             }`}
//                           >
//                             <div
//                               className={`venue-chat-message-bubble ${
//                                 isMine ? "venue-chat-message-bubble-mine" : ""
//                               }`}
//                             >
//                               <div className="venue-chat-message-meta">
//                                 <span className="venue-chat-message-author">
//                                   {isMine ? myUsername : msg.senderUsername}
//                                 </span>
//                                 <span className="venue-chat-message-time">
//                                   {formatMessageTime(msg.createdAt)}
//                                 </span>
//                               </div>

//                               <p className="venue-chat-message-text">{msg.message}</p>
//                             </div>
//                           </div>
//                         );
//                       })}
//                       <div ref={bottomRef} />
//                     </div>
//                   )}
//                 </div>

//                 <div className="venue-chat-composer">
//                   <textarea
//                     rows={1}
//                     value={messageInput}
//                     onChange={(e) => setMessageInput(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     placeholder={`Message ${selectedOrganizer.organizerName}...`}
//                   />
//                   <button
//                     type="button"
//                     className="venue-chat-send-btn"
//                     onClick={handleSendMessage}
//                     disabled={!messageInput.trim() || isSending}
//                   >
//                     {isSending ? (
//                       <>
//                         <LoaderCircle size={16} className="venue-chat-spin" />
//                         <span>Sending...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Send size={16} />
//                         <span>Send</span>
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </>
//             )}
//           </section>

//           <aside className="surface-card venue-chat-sidebar">
//             <div className="venue-chat-sidebar-header">
//               <h3>Organizers</h3>
//               <p>Only organizers who already started a conversation appear here.</p>
//             </div>

//             <div className="venue-chat-search-wrap">
//               <Search size={16} className="venue-chat-search-icon" />
//               <input
//                 type="text"
//                 placeholder="Search organizer..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//               />
//             </div>

//             {isLoadingOrganizers ? (
//               <div className="venue-chat-sidebar-state">
//                 <LoaderCircle size={22} className="venue-chat-spin" />
//                 <span>Loading organizers...</span>
//               </div>
//             ) : filteredOrganizers.length === 0 ? (
//               <div className="venue-chat-sidebar-state venue-chat-sidebar-empty">
//                 <CircleAlert size={22} />
//                 <span>No organizers found</span>
//               </div>
//             ) : (
//               <div className="venue-chat-organizers-list">
//                 {filteredOrganizers.map((item) => {
//                   const isActive =
//                     Number(selectedOrganizer?.organizerId) ===
//                     Number(item.organizerId);

//                   return (
//                     <button
//                       key={item.conversationId}
//                       type="button"
//                       className={`venue-chat-organizer-item ${
//                         isActive ? "venue-chat-organizer-item-active" : ""
//                       }`}
//                       onClick={() => handleSelectOrganizer(item)}
//                     >
//                       <div className="venue-chat-organizer-top">
//                         <div className="venue-chat-organizer-name">
//                           {item.organizerName}
//                         </div>
//                         <div className="venue-chat-organizer-date">
//                           {formatPreviewDate(item.lastMessageAt)}
//                         </div>
//                       </div>

//                       <div className="venue-chat-organizer-preview">
//                         {item.lastMessagePreview || "No messages yet"}
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </aside>
//         </div>
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

// export default MessageOrganizers;







// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { io, type Socket } from "socket.io-client";
// import { useNavigate, useParams } from "react-router-dom";
// import {
//   MessageSquare,
//   Search,
//   LoaderCircle,
//   CircleAlert,
//   UserRound,
//   Building2,
//   Send,
// } from "lucide-react";
// import "./MessageOrganizers.css";
// import {
//   getOrganizersChatting,
//   createOrGetConversationForVenue,
//   getConversationMessagesForVenue,
//   markConversationReadForVenue,
//   type OrganizerChattingItem,
//   type ConversationItem,
//   type ChatMessageItem,
// } from "../../api/venueApi";
// import AlertSnackbar from "../../components/common/AlertSnackbar";
// import { useAlert } from "../../hooks/useAlert";

// const SOCKET_BASE_URL =
//   import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ?? "http://localhost:3010";

// const formatMessageTime = (dateString: string) => {
//   if (!dateString) return "";
//   const parsed = new Date(dateString.replace(" ", "T"));
//   if (Number.isNaN(parsed.getTime())) return dateString;

//   return parsed.toLocaleTimeString([], {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// };

// const formatPreviewDate = (dateString: string | null) => {
//   if (!dateString) return "";
//   const parsed = new Date(dateString.replace(" ", "T"));
//   if (Number.isNaN(parsed.getTime())) return "";

//   return parsed.toLocaleDateString([], {
//     month: "short",
//     day: "numeric",
//   });
// };

// const MessageOrganizers: React.FC = () => {
//   const { open, message, severity, showAlert, handleClose } = useAlert();
//   const navigate = useNavigate();
//   const params = useParams();

//   const managerId = useMemo(() => {
//     const raw = localStorage.getItem("managerId");
//     return raw ? Number(raw) : null;
//   }, []);

//   const userId = useMemo(() => {
//     const raw = localStorage.getItem("userId");
//     return raw ? Number(raw) : null;
//   }, []);

//   const myUsername = useMemo(() => {
//     return localStorage.getItem("username") || "You";
//   }, []);

//   const selectedOrganizerIdFromRoute = useMemo(() => {
//     const raw = params.organizerId;
//     return raw ? Number(raw) : null;
//   }, [params.organizerId]);

//   const [organizers, setOrganizers] = useState<OrganizerChattingItem[]>([]);
//   const [selectedOrganizer, setSelectedOrganizer] =
//     useState<OrganizerChattingItem | null>(null);

//   const [conversation, setConversation] = useState<ConversationItem | null>(null);
//   const [messages, setMessages] = useState<ChatMessageItem[]>([]);
//   const [messageInput, setMessageInput] = useState("");
//   const [search, setSearch] = useState("");

//   const [isLoadingOrganizers, setIsLoadingOrganizers] = useState(true);
//   const [isLoadingConversation, setIsLoadingConversation] = useState(false);
//   const [isSending, setIsSending] = useState(false);

//   const socketRef = useRef<Socket | null>(null);
//   const bottomRef = useRef<HTMLDivElement | null>(null);
//   const activeConversationIdRef = useRef<number | null>(null);

//   const filteredOrganizers = useMemo(() => {
//     const query = search.trim().toLowerCase();
//     if (!query) return organizers;

//     return organizers.filter(
//       (item) =>
//         item.organizerName.toLowerCase().includes(query) ||
//         (item.venueName || "").toLowerCase().includes(query)
//     );
//   }, [organizers, search]);

//   const scrollToBottom = () => {
//     bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const refreshOrganizersUnreadOnly = async () => {
//     if (!managerId || Number.isNaN(managerId)) return;

//     try {
//       const data = await getOrganizersChatting(managerId);
//       setOrganizers(data);
//     } catch {
//       // keep current UI
//     }
//   };

//   const markCurrentConversationAsRead = async (conversationId: number) => {
//     if (!userId || Number.isNaN(userId)) return;

//     try {
//       await markConversationReadForVenue({
//         conversationId,
//         readerUserId: userId,
//       });

//       setOrganizers((prev) =>
//         prev.map((item) =>
//           Number(item.conversationId) === Number(conversationId)
//             ? { ...item, unreadCount: 0 }
//             : item
//         )
//       );

//       socketRef.current?.emit("mark_conversation_read", {
//         conversationId,
//         readerUserId: userId,
//       });
//     } catch {
//       // do not block chat if mark-read fails
//     }
//   };

//   const loadOrganizers = async () => {
//     if (!managerId || Number.isNaN(managerId)) {
//       showAlert("Manager ID was not found. Please log in again.", "error");
//       setIsLoadingOrganizers(false);
//       return;
//     }

//     try {
//       setIsLoadingOrganizers(true);

//       const data = await getOrganizersChatting(managerId);
//       setOrganizers(data);

//       if (data.length === 0) {
//         setSelectedOrganizer(null);
//         return;
//       }

//       if (selectedOrganizerIdFromRoute) {
//         const matchedOrganizer = data.find(
//           (item) => Number(item.organizerId) === Number(selectedOrganizerIdFromRoute)
//         );

//         if (matchedOrganizer) {
//           setSelectedOrganizer(matchedOrganizer);
//           return;
//         }
//       }

//       setSelectedOrganizer(data[0]);
//       navigate(`/venue/message-organizers/organizer/${data[0].organizerId}`, {
//         replace: true,
//       });
//     } catch (error) {
//       const msg =
//         error instanceof Error ? error.message : "Failed to load organizers.";
//       showAlert(msg, "error");
//       setOrganizers([]);
//       setSelectedOrganizer(null);
//     } finally {
//       setIsLoadingOrganizers(false);
//     }
//   };

//   const loadConversation = async (organizer: OrganizerChattingItem) => {
//     if (!managerId || !organizer) return;

//     try {
//       setIsLoadingConversation(true);

//       const conversationData = await createOrGetConversationForVenue({
//         organizerId: organizer.organizerId,
//         managerId,
//         venueId: organizer.venueId,
//       });

//       setConversation(conversationData);
//       activeConversationIdRef.current = conversationData.id;

//       const messagesData = await getConversationMessagesForVenue(conversationData.id);
//       setMessages(messagesData);

//       socketRef.current?.emit("join_conversation", {
//         conversationId: conversationData.id,
//       });

//       await markCurrentConversationAsRead(conversationData.id);
//     } catch (error) {
//       const msg =
//         error instanceof Error ? error.message : "Failed to load conversation.";
//       showAlert(msg, "error");
//       setConversation(null);
//       setMessages([]);
//       activeConversationIdRef.current = null;
//     } finally {
//       setIsLoadingConversation(false);
//     }
//   };

//   useEffect(() => {
//     const socket = io(SOCKET_BASE_URL, {
//       query: userId ? { userId } : {},
//       transports: ["websocket"],
//     });

//     socketRef.current = socket;

//     socket.on("receive_message", async (incomingMessage: ChatMessageItem) => {
//       const isActive =
//         Number(incomingMessage.conversationId) ===
//         Number(activeConversationIdRef.current);

//       if (isActive) {
//         setMessages((prev) => {
//           const exists = prev.some((msg) => msg.id === incomingMessage.id);
//           if (exists) return prev;
//           return [...prev, incomingMessage];
//         });

//         setOrganizers((prev) =>
//           [...prev]
//             .map((item) =>
//               Number(item.conversationId) === Number(incomingMessage.conversationId)
//                 ? {
//                     ...item,
//                     lastMessagePreview: incomingMessage.message,
//                     lastMessageAt: incomingMessage.createdAt,
//                   }
//                 : item
//             )
//             .sort((a, b) => {
//               const timeA = a.lastMessageAt
//                 ? new Date(a.lastMessageAt.replace(" ", "T")).getTime()
//                 : 0;
//               const timeB = b.lastMessageAt
//                 ? new Date(b.lastMessageAt.replace(" ", "T")).getTime()
//                 : 0;
//               return timeB - timeA;
//             })
//         );

//         if (Number(incomingMessage.senderId) !== Number(userId)) {
//           await markCurrentConversationAsRead(incomingMessage.conversationId);
//         }
//       } else {
//         await refreshOrganizersUnreadOnly();
//       }
//     });

//     socket.on("unread_messages_updated", async () => {
//       await refreshOrganizersUnreadOnly();
//     });

//     loadOrganizers();

//     return () => {
//       socket.disconnect();
//       socketRef.current = null;
//       activeConversationIdRef.current = null;
//     };
//   }, []);

//   useEffect(() => {
//     if (!organizers.length) return;
//     if (!selectedOrganizerIdFromRoute) return;

//     const matchedOrganizer = organizers.find(
//       (item) => Number(item.organizerId) === Number(selectedOrganizerIdFromRoute)
//     );

//     if (matchedOrganizer) {
//       setSelectedOrganizer((prev) => {
//         if (
//           prev &&
//           Number(prev.organizerId) === Number(matchedOrganizer.organizerId)
//         ) {
//           return prev;
//         }
//         return matchedOrganizer;
//       });
//     }
//   }, [organizers, selectedOrganizerIdFromRoute]);

//   useEffect(() => {
//     if (selectedOrganizer) {
//       loadConversation(selectedOrganizer);
//     }
//   }, [selectedOrganizer?.organizerId]);

//   const handleSelectOrganizer = (organizer: OrganizerChattingItem) => {
//     setSelectedOrganizer(organizer);
//     navigate(`/venue/message-organizers/organizer/${organizer.organizerId}`);
//   };

//   const handleSendMessage = async () => {
//     if (!messageInput.trim() || !conversation || !userId || !socketRef.current || isSending) {
//       return;
//     }

//     try {
//       setIsSending(true);
//       const trimmed = messageInput.trim();

//       await new Promise<void>((resolve, reject) => {
//         socketRef.current?.emit(
//           "send_message",
//           {
//             conversationId: conversation.id,
//             senderId: userId,
//             message: trimmed,
//           },
//           (response: {
//             success: boolean;
//             message: string;
//             data?: ChatMessageItem;
//           }) => {
//             if (!response?.success) {
//               reject(new Error(response?.message || "Failed to send message."));
//               return;
//             }

//             resolve();
//           }
//         );
//       });

//       setMessageInput("");

//       setOrganizers((prev) =>
//         [...prev]
//           .map((item) =>
//             Number(item.conversationId) === Number(conversation.id)
//               ? {
//                   ...item,
//                   lastMessagePreview: trimmed,
//                   lastMessageAt: new Date().toISOString().slice(0, 19).replace("T", " "),
//                 }
//               : item
//           )
//           .sort((a, b) => {
//             const timeA = a.lastMessageAt
//               ? new Date(a.lastMessageAt.replace(" ", "T")).getTime()
//               : 0;
//             const timeB = b.lastMessageAt
//               ? new Date(b.lastMessageAt.replace(" ", "T")).getTime()
//               : 0;
//             return timeB - timeA;
//           })
//       );
//     } catch (error) {
//       const msg =
//         error instanceof Error ? error.message : "Failed to send message.";
//       showAlert(msg, "error");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleKeyDown = async (
//     e: React.KeyboardEvent<HTMLTextAreaElement>
//   ) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       await handleSendMessage();
//     }
//   };

//   return (
//     <>
//       <div className="page-shell venue-chat-page-shell">
//         <div className="page-header">
//           <h1 className="page-title">Message Organizers</h1>
//           <p className="page-subtitle">
//             Review and continue your organizer conversations in one professional workspace.
//           </p>
//         </div>

//         <div className="venue-chat-layout">
//           <section className="surface-card venue-chat-main-card">
//             {!selectedOrganizer ? (
//               <div className="venue-chat-empty-main">
//                 <div className="venue-chat-empty-icon">
//                   <CircleAlert size={28} />
//                 </div>
//                 <h3>No organizer selected</h3>
//                 <p>Select an organizer from the right panel to open the conversation.</p>
//               </div>
//             ) : isLoadingConversation ? (
//               <div className="venue-chat-loading-main">
//                 <LoaderCircle size={24} className="venue-chat-spin" />
//                 <span>Loading conversation...</span>
//               </div>
//             ) : (
//               <>
//                 <div className="venue-chat-conversation-header">
//                   <div className="venue-chat-conversation-avatar">
//                     <MessageSquare size={20} />
//                   </div>

//                   <div className="venue-chat-conversation-meta">
//                     <h2>{selectedOrganizer.organizerName}</h2>

//                     <div className="venue-chat-conversation-submeta">
//                       <div className="venue-chat-conversation-subitem">
//                         <UserRound size={14} />
//                         <span>Event Organizer</span>
//                       </div>

//                       {selectedOrganizer.venueName && (
//                         <div className="venue-chat-conversation-subitem">
//                           <Building2 size={14} />
//                           <span>{selectedOrganizer.venueName}</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="venue-chat-messages-panel">
//                   {messages.length === 0 ? (
//                     <div className="venue-chat-empty-messages">
//                       <div className="venue-chat-empty-icon">
//                         <MessageSquare size={24} />
//                       </div>
//                       <h3>No messages yet</h3>
//                       <p>Continue the conversation with this organizer.</p>
//                     </div>
//                   ) : (
//                     <div className="venue-chat-messages-list">
//                       {messages.map((msg) => {
//                         const isMine = Number(msg.senderId) === Number(userId);

//                         return (
//                           <div
//                             key={msg.id}
//                             className={`venue-chat-message-row ${
//                               isMine ? "venue-chat-message-row-mine" : ""
//                             }`}
//                           >
//                             <div
//                               className={`venue-chat-message-bubble ${
//                                 isMine ? "venue-chat-message-bubble-mine" : ""
//                               }`}
//                             >
//                               <div className="venue-chat-message-meta">
//                                 <span className="venue-chat-message-author">
//                                   {isMine ? myUsername : msg.senderUsername}
//                                 </span>
//                                 <span className="venue-chat-message-time">
//                                   {formatMessageTime(msg.createdAt)}
//                                 </span>
//                               </div>

//                               <p className="venue-chat-message-text">{msg.message}</p>
//                             </div>
//                           </div>
//                         );
//                       })}
//                       <div ref={bottomRef} />
//                     </div>
//                   )}
//                 </div>

//                 <div className="venue-chat-composer">
//                   <textarea
//                     rows={1}
//                     value={messageInput}
//                     onChange={(e) => setMessageInput(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     placeholder={`Message ${selectedOrganizer.organizerName}...`}
//                   />
//                   <button
//                     type="button"
//                     className="venue-chat-send-btn"
//                     onClick={handleSendMessage}
//                     disabled={!messageInput.trim() || isSending}
//                   >
//                     {isSending ? (
//                       <>
//                         <LoaderCircle size={16} className="venue-chat-spin" />
//                         <span>Sending...</span>
//                       </>
//                     ) : (
//                       <>
//                         <Send size={16} />
//                         <span>Send</span>
//                       </>
//                     )}
//                   </button>
//                 </div>
//               </>
//             )}
//           </section>

//           <aside className="surface-card venue-chat-sidebar">
//             <div className="venue-chat-sidebar-header">
//               <h3>Organizers</h3>
//               <p>Only organizers who already started a conversation appear here.</p>
//             </div>

//             <div className="venue-chat-search-wrap">
//               <Search size={16} className="venue-chat-search-icon" />
//               <input
//                 type="text"
//                 placeholder="Search organizer..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//               />
//             </div>

//             {isLoadingOrganizers ? (
//               <div className="venue-chat-sidebar-state">
//                 <LoaderCircle size={22} className="venue-chat-spin" />
//                 <span>Loading organizers...</span>
//               </div>
//             ) : filteredOrganizers.length === 0 ? (
//               <div className="venue-chat-sidebar-state venue-chat-sidebar-empty">
//                 <CircleAlert size={22} />
//                 <span>No organizers found</span>
//               </div>
//             ) : (
//               <div className="venue-chat-organizers-list">
//                 {filteredOrganizers.map((item) => {
//                   const isActive =
//                     Number(selectedOrganizer?.organizerId) ===
//                     Number(item.organizerId);

//                   const unreadCount = Number(item.unreadCount || 0);

//                   return (
//                     <button
//                       key={item.conversationId}
//                       type="button"
//                       className={`venue-chat-organizer-item ${
//                         isActive ? "venue-chat-organizer-item-active" : ""
//                       }`}
//                       onClick={() => handleSelectOrganizer(item)}
//                     >
//                       {unreadCount > 0 && (
//                         <span className="chat-list-unread-badge">
//                           {unreadCount > 99 ? "99+" : unreadCount}
//                         </span>
//                       )}

//                       <div className="venue-chat-organizer-top">
//                         <div className="venue-chat-organizer-name">
//                           {item.organizerName}
//                         </div>
//                         <div className="venue-chat-organizer-date">
//                           {formatPreviewDate(item.lastMessageAt)}
//                         </div>
//                       </div>

//                       <div className="venue-chat-organizer-preview">
//                         {item.lastMessagePreview || "No messages yet"}
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </aside>
//         </div>
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

// export default MessageOrganizers;






import React, { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import {
  MessageSquare,
  Search,
  LoaderCircle,
  CircleAlert,
  UserRound,
  Building2,
  Send,
  Phone,
  PhoneCall,
} from "lucide-react";
import "./MessageOrganizers.css";
import {
  getOrganizersChatting,
  createOrGetConversationForVenue,
  getConversationMessagesForVenue,
  markConversationReadForVenue,
  type OrganizerChattingItem,
  type ConversationItem,
  type ChatMessageItem,
} from "../../api/venueApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";
import { useAlert } from "../../hooks/useAlert";
import { useWebRTC } from "../../context/webrtc";

const SOCKET_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace("/api", "") ??
  "http://localhost:3010";

const formatMessageTime = (dateString: string) => {
  if (!dateString) return "";

  const parsed = new Date(dateString.replace(" ", "T"));

  if (Number.isNaN(parsed.getTime())) return dateString;

  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatPreviewDate = (dateString: string | null) => {
  if (!dateString) return "";

  const parsed = new Date(dateString.replace(" ", "T"));

  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

const MessageOrganizers: React.FC = () => {
  const { open, message, severity, showAlert, handleClose } = useAlert();
  const navigate = useNavigate();
  const params = useParams();

  const {
    callState,
    isGlobalCallBusy,
    startCall: startGlobalCall,
  } = useWebRTC();

  const managerId = useMemo(() => {
    const raw = localStorage.getItem("managerId");
    return raw ? Number(raw) : null;
  }, []);

  const userId = useMemo(() => {
    const raw = localStorage.getItem("userId");
    return raw ? Number(raw) : null;
  }, []);

  const myUsername = useMemo(() => {
    return localStorage.getItem("username") || "You";
  }, []);

  const selectedOrganizerIdFromRoute = useMemo(() => {
    const raw = params.organizerId;
    return raw ? Number(raw) : null;
  }, [params.organizerId]);

  const [organizers, setOrganizers] = useState<OrganizerChattingItem[]>([]);
  const [selectedOrganizer, setSelectedOrganizer] =
    useState<OrganizerChattingItem | null>(null);

  const [conversation, setConversation] =
    useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [search, setSearch] = useState("");

  const [isLoadingOrganizers, setIsLoadingOrganizers] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const activeConversationIdRef = useRef<number | null>(null);

  const filteredOrganizers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return organizers;

    return organizers.filter(
      (item) =>
        item.organizerName.toLowerCase().includes(query) ||
        (item.venueName || "").toLowerCase().includes(query)
    );
  }, [organizers, search]);

  const callLabel =
    callState.status === "calling"
      ? `Calling ${callState.remoteName}...`
      : callState.status === "connecting"
      ? "Connecting call..."
      : callState.status === "active"
      ? `In call with ${callState.remoteName}`
      : callState.status === "incoming"
      ? `Incoming call from ${callState.remoteName}`
      : "";

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const emitWithAck = <T,>(
    eventName: string,
    payload: Record<string, unknown>
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const socket = socketRef.current;

      if (!socket || !socket.connected) {
        reject(new Error("Chat socket is not connected."));
        return;
      }

      socket.emit(
        eventName,
        payload,
        (response: T & { success: boolean; message: string }) => {
          if (!response?.success) {
            reject(new Error(response?.message || "Socket request failed."));
            return;
          }

          resolve(response);
        }
      );
    });
  };

  const refreshOrganizersUnreadOnly = async () => {
    if (!managerId || Number.isNaN(managerId)) return;

    try {
      const data = await getOrganizersChatting(managerId);
      setOrganizers(data);
    } catch {
      // keep current UI
    }
  };

  const markCurrentConversationAsRead = async (conversationId: number) => {
    if (!userId || Number.isNaN(userId)) return;

    try {
      await markConversationReadForVenue({
        conversationId,
        readerUserId: userId,
      });

      setOrganizers((prev) =>
        prev.map((item) =>
          Number(item.conversationId) === Number(conversationId)
            ? { ...item, unreadCount: 0 }
            : item
        )
      );

      socketRef.current?.emit("mark_conversation_read", {
        conversationId,
        readerUserId: userId,
      });
    } catch {
      // do not block chat if mark-read fails
    }
  };

  const loadOrganizers = async () => {
    if (!managerId || Number.isNaN(managerId)) {
      showAlert("Manager ID was not found. Please log in again.", "error");
      setIsLoadingOrganizers(false);
      return;
    }

    try {
      setIsLoadingOrganizers(true);

      const data = await getOrganizersChatting(managerId);
      setOrganizers(data);

      if (data.length === 0) {
        setSelectedOrganizer(null);
        return;
      }

      if (selectedOrganizerIdFromRoute) {
        const matchedOrganizer = data.find(
          (item) =>
            Number(item.organizerId) === Number(selectedOrganizerIdFromRoute)
        );

        if (matchedOrganizer) {
          setSelectedOrganizer(matchedOrganizer);
          return;
        }
      }

      setSelectedOrganizer(data[0]);
      navigate(`/venue/message-organizers/organizer/${data[0].organizerId}`, {
        replace: true,
      });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load organizers.";
      showAlert(msg, "error");
      setOrganizers([]);
      setSelectedOrganizer(null);
    } finally {
      setIsLoadingOrganizers(false);
    }
  };

  const loadConversation = async (organizer: OrganizerChattingItem) => {
    if (!managerId || !organizer) return;

    try {
      setIsLoadingConversation(true);

      const conversationData = await createOrGetConversationForVenue({
        organizerId: organizer.organizerId,
        managerId,
        venueId: organizer.venueId,
      });

      setConversation(conversationData);
      activeConversationIdRef.current = conversationData.id;

      const messagesData = await getConversationMessagesForVenue(
        conversationData.id
      );
      setMessages(messagesData);

      socketRef.current?.emit("join_conversation", {
        conversationId: conversationData.id,
      });

      await markCurrentConversationAsRead(conversationData.id);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load conversation.";
      showAlert(msg, "error");
      setConversation(null);
      setMessages([]);
      activeConversationIdRef.current = null;
    } finally {
      setIsLoadingConversation(false);
    }
  };

  useEffect(() => {
    const socket = io(SOCKET_BASE_URL, {
      query: userId ? { userId } : {},
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("receive_message", async (incomingMessage: ChatMessageItem) => {
      const isActive =
        Number(incomingMessage.conversationId) ===
        Number(activeConversationIdRef.current);

      if (isActive) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === incomingMessage.id);
          if (exists) return prev;
          return [...prev, incomingMessage];
        });

        if (Number(incomingMessage.senderId) !== Number(userId)) {
          await markCurrentConversationAsRead(incomingMessage.conversationId);
        }
      } else {
        await refreshOrganizersUnreadOnly();
      }
    });

    socket.on("unread_messages_updated", async () => {
      await refreshOrganizersUnreadOnly();
    });

    loadOrganizers();

    return () => {
      socket.disconnect();
      socketRef.current = null;
      activeConversationIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (selectedOrganizer) {
      loadConversation(selectedOrganizer);
    }
  }, [selectedOrganizer?.organizerId, selectedOrganizer?.venueId]);

  const handleSelectOrganizer = (organizer: OrganizerChattingItem) => {
    setSelectedOrganizer(organizer);
    navigate(`/venue/message-organizers/organizer/${organizer.organizerId}`);
  };

  const handleSendMessage = async () => {
    if (
      !messageInput.trim() ||
      !conversation ||
      !userId ||
      !socketRef.current ||
      isSending
    ) {
      return;
    }

    try {
      setIsSending(true);

      const trimmed = messageInput.trim();

      await emitWithAck("send_message", {
        conversationId: conversation.id,
        senderId: userId,
        message: trimmed,
      });

      setMessageInput("");

      setOrganizers((prev) =>
        [...prev]
          .map((item) =>
            Number(item.conversationId) === Number(conversation.id)
              ? {
                  ...item,
                  lastMessagePreview: trimmed,
                  lastMessageAt: new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace("T", " "),
                }
              : item
          )
          .sort((a, b) => {
            const timeA = a.lastMessageAt
              ? new Date(a.lastMessageAt.replace(" ", "T")).getTime()
              : 0;

            const timeB = b.lastMessageAt
              ? new Date(b.lastMessageAt.replace(" ", "T")).getTime()
              : 0;

            return timeB - timeA;
          })
      );
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to send message.";
      showAlert(msg, "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSendMessage();
    }
  };

  const handleStartCall = async (targetOrganizer?: OrganizerChattingItem) => {
    const target = targetOrganizer || selectedOrganizer;

    if (!target) {
      showAlert("Please select an organizer first.", "error");
      return;
    }

    if (!managerId) {
      showAlert("Manager ID was not found. Please log in again.", "error");
      return;
    }

    try {
      let activeConversation = conversation;

      if (
        !activeConversation ||
        Number(activeConversation.id) !== Number(target.conversationId)
      ) {
        activeConversation = await createOrGetConversationForVenue({
          organizerId: target.organizerId,
          managerId,
          venueId: target.venueId,
        });
      }

      await startGlobalCall({
        conversationId: activeConversation.id,
        remoteName: target.organizerName,
      });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to start call.";
      showAlert(msg, "error");
    }
  };

  return (
    <>
      <div className="page-shell venue-chat-page-shell">
        <div className="page-header">
          <h1 className="page-title">Message Organizers</h1>
          <p className="page-subtitle">
            Review and continue your organizer conversations in one professional
            workspace.
          </p>
        </div>

        <div className="venue-chat-layout">
          <section className="surface-card venue-chat-main-card">
            {callState.status !== "idle" && (
              <div className="venue-chat-call-status-bar">
                <PhoneCall size={15} />
                <span>{callLabel}</span>
              </div>
            )}

            {!selectedOrganizer ? (
              <div className="venue-chat-empty-main">
                <div className="venue-chat-empty-icon">
                  <CircleAlert size={28} />
                </div>
                <h3>No organizer selected</h3>
                <p>
                  Select an organizer from the right panel to open the
                  conversation.
                </p>
              </div>
            ) : isLoadingConversation ? (
              <div className="venue-chat-loading-main">
                <LoaderCircle size={24} className="venue-chat-spin" />
                <span>Loading conversation...</span>
              </div>
            ) : (
              <>
                <div className="venue-chat-conversation-header">
                  <div className="venue-chat-conversation-left">
                    <div className="venue-chat-conversation-avatar">
                      <MessageSquare size={20} />
                    </div>

                    <div className="venue-chat-conversation-meta">
                      <h2>{selectedOrganizer.organizerName}</h2>

                      <div className="venue-chat-conversation-submeta">
                        <div className="venue-chat-conversation-subitem">
                          <UserRound size={14} />
                          <span>Event Organizer</span>
                        </div>

                        {selectedOrganizer.venueName && (
                          <div className="venue-chat-conversation-subitem">
                            <Building2 size={14} />
                            <span>{selectedOrganizer.venueName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="venue-chat-call-btn"
                    onClick={() => handleStartCall()}
                    disabled={!conversation || isGlobalCallBusy}
                    title="Start audio call"
                  >
                    <Phone size={17} />
                    <span>Audio Call</span>
                  </button>
                </div>

                <div className="venue-chat-messages-panel">
                  {messages.length === 0 ? (
                    <div className="venue-chat-empty-messages">
                      <div className="venue-chat-empty-icon">
                        <MessageSquare size={24} />
                      </div>
                      <h3>No messages yet</h3>
                      <p>Continue the conversation with this organizer.</p>
                    </div>
                  ) : (
                    <div className="venue-chat-messages-list">
                      {messages.map((msg) => {
                        const isMine = Number(msg.senderId) === Number(userId);

                        return (
                          <div
                            key={msg.id}
                            className={`venue-chat-message-row ${
                              isMine ? "venue-chat-message-row-mine" : ""
                            }`}
                          >
                            <div
                              className={`venue-chat-message-bubble ${
                                isMine ? "venue-chat-message-bubble-mine" : ""
                              }`}
                            >
                              <div className="venue-chat-message-meta">
                                <span className="venue-chat-message-author">
                                  {isMine ? myUsername : msg.senderUsername}
                                </span>

                                <span className="venue-chat-message-time">
                                  {formatMessageTime(msg.createdAt)}
                                </span>
                              </div>

                              <p className="venue-chat-message-text">
                                {msg.message}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      <div ref={bottomRef} />
                    </div>
                  )}
                </div>

                <div className="venue-chat-composer">
                  <textarea
                    rows={1}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${selectedOrganizer.organizerName}.`}
                  />

                  <button
                    type="button"
                    className="venue-chat-send-btn"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || isSending}
                  >
                    {isSending ? (
                      <>
                        <LoaderCircle size={16} className="venue-chat-spin" />
                        <span>Sending</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </section>

          <aside className="surface-card venue-chat-sidebar">
            <div className="venue-chat-sidebar-header">
              <h3>Organizers</h3>
              <p>
                Select an organizer conversation or start a direct audio call.
              </p>
            </div>

            <div className="venue-chat-search-wrap">
              <Search size={16} className="venue-chat-search-icon" />
              <input
                type="text"
                placeholder="Search organizer or venue."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {isLoadingOrganizers ? (
              <div className="venue-chat-sidebar-state">
                <LoaderCircle size={22} className="venue-chat-spin" />
                <span>Loading organizers...</span>
              </div>
            ) : filteredOrganizers.length === 0 ? (
              <div className="venue-chat-sidebar-state venue-chat-sidebar-empty">
                <CircleAlert size={22} />
                <span>No organizers found</span>
              </div>
            ) : (
              <div className="venue-chat-organizers-list">
                {filteredOrganizers.map((item) => {
                  const isActive =
                    Number(selectedOrganizer?.organizerId) ===
                      Number(item.organizerId) &&
                    Number(selectedOrganizer?.venueId) === Number(item.venueId);

                  const unreadCount = Number(item.unreadCount || 0);

                  return (
                    <div
                      key={`${item.conversationId}-${item.organizerId}-${item.venueId}`}
                      className={`venue-chat-organizer-item ${
                        isActive ? "venue-chat-organizer-item-active" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="venue-chat-organizer-select-btn"
                        onClick={() => handleSelectOrganizer(item)}
                      >
                        <div className="venue-chat-organizer-avatar">
                          <UserRound size={17} />
                        </div>

                        <div className="venue-chat-organizer-content">
                          <div className="venue-chat-organizer-top">
                            <div className="venue-chat-organizer-name">
                              {item.organizerName}
                            </div>

                            <div className="venue-chat-organizer-date">
                              {formatPreviewDate(item.lastMessageAt)}
                            </div>
                          </div>

                          {item.venueName && (
                            <div className="venue-chat-organizer-venue">
                              {item.venueName}
                            </div>
                          )}

                          <div className="venue-chat-organizer-preview">
                            {item.lastMessagePreview || "No messages yet"}
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        className="venue-chat-list-call-btn"
                        onClick={() => handleStartCall(item)}
                        disabled={isGlobalCallBusy}
                        title={`Call ${item.organizerName}`}
                      >
                        <Phone size={15} />
                      </button>

                      {unreadCount > 0 && (
                        <span className="chat-list-unread-badge">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
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

export default MessageOrganizers;