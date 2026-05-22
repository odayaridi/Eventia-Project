import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io, type Socket } from "socket.io-client";
import {
  ArrowLeft,
  Send,
  LoaderCircle,
  MessageSquare,
  Search,
  Building2,
  UserRound,
  CircleAlert,
  Phone,
  PhoneCall,
} from "lucide-react";
import "./ChatRoom.css";
import {
  getVenuesChatting,
  createOrGetConversation,
  getConversationMessages,
  markConversationRead,
  type VenueChattingItem,
  type ConversationItem,
  type ChatMessageItem,
} from "../../api/eventApi";
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

const ChatRoom: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const {
    callState,
    isGlobalCallBusy,
    startCall: startGlobalCall,
  } = useWebRTC();

  const organizerId = useMemo(() => {
    const raw = localStorage.getItem("organizerId");
    return raw ? Number(raw) : null;
  }, []);

  const userId = useMemo(() => {
    const raw = localStorage.getItem("userId");
    return raw ? Number(raw) : null;
  }, []);

  const myUsername = useMemo(() => {
    return localStorage.getItem("username") || "You";
  }, []);

  const selectedVenueId = useMemo(() => {
    const raw = params.venueId;
    return raw ? Number(raw) : null;
  }, [params.venueId]);

  const [venues, setVenues] = useState<VenueChattingItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedVenue, setSelectedVenue] =
    useState<VenueChattingItem | null>(null);
  const [conversation, setConversation] =
    useState<ConversationItem | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [messageInput, setMessageInput] = useState("");

  const [isLoadingVenues, setIsLoadingVenues] = useState(true);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const activeConversationIdRef = useRef<number | null>(null);

  const filteredVenues = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return venues;

    return venues.filter(
      (venue) =>
        venue.venueName.toLowerCase().includes(query) ||
        venue.managerName.toLowerCase().includes(query)
    );
  }, [venues, search]);

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

  const refreshVenuesUnreadOnly = async () => {
    if (!organizerId || Number.isNaN(organizerId)) return;

    try {
      const data = await getVenuesChatting(organizerId);
      setVenues(data);
    } catch {
      // keep current UI
    }
  };

  const markCurrentConversationAsRead = async (conversationId: number) => {
    if (!userId || Number.isNaN(userId)) return;

    try {
      await markConversationRead({
        conversationId,
        readerUserId: userId,
      });

      setVenues((prev) =>
        prev.map((venue) =>
          Number(venue.conversationId) === Number(conversationId)
            ? { ...venue, unreadCount: 0 }
            : venue
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

  const loadVenues = async () => {
    if (!organizerId || Number.isNaN(organizerId)) {
      showAlert("Organizer ID was not found. Please log in again.", "error");
      setIsLoadingVenues(false);
      return;
    }

    try {
      setIsLoadingVenues(true);

      const data = await getVenuesChatting(organizerId);
      setVenues(data);

      if (data.length === 0) {
        setSelectedVenue(null);
        return;
      }

      if (selectedVenueId) {
        const matchedVenue = data.find(
          (item) => Number(item.venueId) === Number(selectedVenueId)
        );

        if (matchedVenue) {
          setSelectedVenue(matchedVenue);
          return;
        }
      }

      setSelectedVenue(data[0]);
      navigate(`/organizer/chat-room/venue/${data[0].venueId}`, {
        replace: true,
      });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to load venues.";
      showAlert(msg, "error");
      setVenues([]);
      setSelectedVenue(null);
    } finally {
      setIsLoadingVenues(false);
    }
  };

  const loadConversationForVenue = async (venue: VenueChattingItem) => {
    if (!organizerId || !venue) return;

    try {
      setIsLoadingConversation(true);

      const conversationData = await createOrGetConversation({
        organizerId,
        managerId: venue.managerId,
        venueId: venue.venueId,
      });

      setConversation(conversationData);
      activeConversationIdRef.current = conversationData.id;

      const messagesData = await getConversationMessages(conversationData.id);
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
        await refreshVenuesUnreadOnly();
      }
    });

    socket.on("unread_messages_updated", async () => {
      await refreshVenuesUnreadOnly();
    });

    loadVenues();

    return () => {
      socket.disconnect();
      socketRef.current = null;
      activeConversationIdRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (selectedVenue) {
      loadConversationForVenue(selectedVenue);
    }
  }, [selectedVenue?.venueId]);

  const handleSelectVenue = (venue: VenueChattingItem) => {
    setSelectedVenue(venue);
    navigate(`/organizer/chat-room/venue/${venue.venueId}`);
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

  const handleStartCall = async (targetVenue?: VenueChattingItem) => {
    const target = targetVenue || selectedVenue;

    if (!target) {
      showAlert("Please select a venue first.", "error");
      return;
    }

    if (!organizerId) {
      showAlert("Organizer ID was not found. Please log in again.", "error");
      return;
    }

    try {
      let activeConversation = conversation;

      if (
        !activeConversation ||
        Number(target.venueId) !== Number(selectedVenue?.venueId)
      ) {
        activeConversation = await createOrGetConversation({
          organizerId,
          managerId: target.managerId,
          venueId: target.venueId,
        });
      }

      await startGlobalCall({
        conversationId: activeConversation.id,
        remoteName: target.managerName,
      });
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Failed to start call.";
      showAlert(msg, "error");
    }
  };

  return (
    <>
      <div className="page-shell organizer-chat-page-shell">
        <div className="page-header">
          <h1 className="page-title">Chat Room</h1>
          <p className="page-subtitle">
            Communicate directly with venue managers through organized private
            conversations.
          </p>
        </div>

        <div className="organizer-chat-layout">
          <section className="surface-card organizer-chat-main-card">
            <div className="organizer-chat-topbar">
              <button
                type="button"
                className="organizer-chat-back-btn"
                onClick={() => navigate("/organizer/browse-venues")}
              >
                <ArrowLeft size={16} />
                <span>Browse Venues</span>
              </button>

              {callState.status !== "idle" && (
                <div className="organizer-chat-call-status-chip">
                  <PhoneCall size={14} />
                  <span>{callLabel}</span>
                </div>
              )}
            </div>

            {!selectedVenue ? (
              <div className="organizer-chat-empty-main">
                <div className="organizer-chat-empty-icon">
                  <CircleAlert size={28} />
                </div>
                <h3>No venue selected</h3>
                <p>
                  Choose a venue from the right panel to open its private chat.
                </p>
              </div>
            ) : isLoadingConversation ? (
              <div className="organizer-chat-loading-main">
                <LoaderCircle size={24} className="organizer-chat-spin" />
                <span>Loading conversation...</span>
              </div>
            ) : (
              <>
                <div className="organizer-chat-conversation-header">
                  <div className="organizer-chat-conversation-left">
                    <div className="organizer-chat-conversation-avatar">
                      <Building2 size={23} />
                    </div>

                    <div className="organizer-chat-conversation-meta">
                      <h2>{selectedVenue.venueName}</h2>

                      <div className="organizer-chat-conversation-submeta">
                        <span className="organizer-chat-conversation-subitem">
                          <UserRound size={14} />
                          {selectedVenue.managerName}
                        </span>

                        <span className="organizer-chat-conversation-subitem">
                          <MessageSquare size={14} />
                          Private conversation
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="organizer-chat-call-btn"
                    onClick={() => handleStartCall()}
                    disabled={!conversation || isGlobalCallBusy}
                  >
                    <Phone size={16} />
                    <span>Audio Call</span>
                  </button>
                </div>

                <div className="organizer-chat-messages-panel">
                  {messages.length === 0 ? (
                    <div className="organizer-chat-empty-messages">
                      <div className="organizer-chat-empty-icon">
                        <MessageSquare size={28} />
                      </div>
                      <h3>No messages yet</h3>
                      <p>
                        Start the conversation with {selectedVenue.managerName}.
                      </p>
                    </div>
                  ) : (
                    <div className="organizer-chat-messages-list">
                      {messages.map((msg) => {
                        const isMine = Number(msg.senderId) === Number(userId);

                        return (
                          <div
                            key={msg.id}
                            className={`organizer-chat-message-row ${
                              isMine ? "organizer-chat-message-row-mine" : ""
                            }`}
                          >
                            <div
                              className={`organizer-chat-message-bubble ${
                                isMine
                                  ? "organizer-chat-message-bubble-mine"
                                  : ""
                              }`}
                            >
                              <div className="organizer-chat-message-meta">
                                <span className="organizer-chat-message-author">
                                  {isMine ? myUsername : msg.senderUsername}
                                </span>

                                <span className="organizer-chat-message-time">
                                  {formatMessageTime(msg.createdAt)}
                                </span>
                              </div>

                              <p className="organizer-chat-message-text">
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

                <div className="organizer-chat-composer">
                  <textarea
                    rows={1}
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${selectedVenue.managerName}.`}
                  />

                  <button
                    type="button"
                    className="organizer-chat-send-btn"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || isSending}
                  >
                    {isSending ? (
                      <>
                        <LoaderCircle
                          size={16}
                          className="organizer-chat-spin"
                        />
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

          <aside className="surface-card organizer-chat-sidebar">
            <div className="organizer-chat-sidebar-header">
              <h3>Venues</h3>
              <p>
                Select a venue manager conversation or call directly from the
                list.
              </p>
            </div>

            <div className="organizer-chat-search-wrap">
              <Search size={16} className="organizer-chat-search-icon" />
              <input
                type="text"
                placeholder="Search venue or manager."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {isLoadingVenues ? (
              <div className="organizer-chat-sidebar-state">
                <LoaderCircle size={22} className="organizer-chat-spin" />
                <span>Loading venues...</span>
              </div>
            ) : filteredVenues.length === 0 ? (
              <div className="organizer-chat-sidebar-state organizer-chat-sidebar-empty">
                <CircleAlert size={22} />
                <span>No venues found</span>
              </div>
            ) : (
              <div className="organizer-chat-venues-list">
                {filteredVenues.map((item) => {
                  const isActive =
                    Number(selectedVenue?.venueId) === Number(item.venueId);

                  const unreadCount = Number(item.unreadCount || 0);

                  return (
                    <div
                      key={`${item.venueId}-${item.managerId}`}
                      className={`organizer-chat-venue-item ${
                        isActive ? "organizer-chat-venue-item-active" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className="organizer-chat-venue-select-btn"
                        onClick={() => handleSelectVenue(item)}
                      >
                        <div className="organizer-chat-venue-avatar">
                          <Building2 size={17} />
                        </div>

                        <div className="organizer-chat-venue-info">
                          <div className="organizer-chat-venue-name">
                            {item.venueName}
                          </div>

                          <div className="organizer-chat-manager-name">
                            {item.managerName}
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        className="organizer-chat-list-call-btn"
                        onClick={() => handleStartCall(item)}
                        disabled={isGlobalCallBusy}
                        title={`Call ${item.managerName}`}
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

export default ChatRoom;