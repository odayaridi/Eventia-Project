import React, { useMemo, useRef, useState, useEffect } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import "./ManagerAIAssistant.css";
import { useAlert } from "../../hooks/useAlert";
import { askVenueChatbot } from "../../api/venueApi";
import AlertSnackbar from "../../components/common/AlertSnackbar";

type ChatMessage = {
  id: string;
  sender: "user" | "assistant";
  text: string;
};

const ManagerAIAssistant: React.FC = () => {
  const { open, message, severity, showAlert, handleClose } = useAlert();

  const initialMessages = useMemo<ChatMessage[]>(
    () => [
      {
        id: "assistant-welcome",
        sender: "assistant",
        text: "Hello! I’m Eventia Venue AI Support. Ask me anything about venues, venue setup, availability, and venue-related platform features.",
      },
    ],
    []
  );

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [prompt, setPrompt] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isTypingText, setIsTypingText] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: isTypingText ? "auto" : "smooth",
      });
    }
  }, [messages, isSending, isTypingText]);

  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    };
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        150
      )}px`;
    }
  };

  const typeWriter = (messageId: string, fullText: string) => {
    return new Promise<void>((resolve) => {
      let index = 0;
      const speed = 15;

      typingIntervalRef.current = setInterval(() => {
        index++;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, text: fullText.slice(0, index) }
              : msg
          )
        );

        if (index >= fullText.length) {
          if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
          resolve();
        }
      }, speed);
    });
  };

  const handleSendMessage = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmedPrompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsSending(true);

    try {
      const reply = await askVenueChatbot(trimmedPrompt);

      setIsSending(false);
      setIsTypingText(true);

      const assistantMessageId = `assistant-${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        { id: assistantMessageId, sender: "assistant", text: "" },
      ]);

      await typeWriter(assistantMessageId, reply);
    } catch (error) {
      setIsSending(false);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to connect to Venue AI Support.";
      showAlert(errorMessage, "error");
    } finally {
      setIsTypingText(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isSending && !isTypingText && prompt.trim()) {
        handleSendMessage();
      }
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">AI Assistant</h1>
        <p className="page-subtitle">
          Get instant answers about venues, availability, and venue-related platform features.
        </p>
      </div>

      <div className="surface-card ai-chat-container">
        <div className="ai-chat-header">
          <div className="ai-chat-header-info">
            <div className="ai-chat-icon-wrapper">
              <Sparkles size={18} />
            </div>
            <div>
              <h2>Eventia Venue AI Support</h2>
              <div className="ai-status-indicator">
                <span className="status-dot"></span>
                <span>Online and ready to help</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ai-chat-body">
          <div className="ai-chat-messages-wrapper">
            {messages.map((chat) => (
              <div key={chat.id} className={`ai-message-row ${chat.sender}`}>
                {chat.sender === "assistant" && (
                  <div className="ai-avatar assistant">
                    <Bot size={18} />
                  </div>
                )}

                <div className="ai-message-content">
                  <span className="ai-sender-name">
                    {chat.sender === "user" ? "You" : "Eventia AI"}
                  </span>
                  <div className={`ai-bubble ${chat.sender}`}>
                    <p>{chat.text}</p>
                  </div>
                </div>

                {chat.sender === "user" && (
                  <div className="ai-avatar user">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}

            {isSending && (
              <div className="ai-message-row assistant">
                <div className="ai-avatar assistant">
                  <Bot size={18} />
                </div>
                <div className="ai-message-content">
                  <span className="ai-sender-name">Eventia AI</span>
                  <div className="ai-bubble assistant typing">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="ai-chat-footer">
          <div className="ai-input-wrapper">
            <textarea
              ref={textareaRef}
              className="ai-textarea"
              placeholder={isTypingText ? "AI is typing..." : "Message Venue AI..."}
              value={prompt}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isSending || isTypingText}
              autoFocus
            />
            <button
              type="button"
              className={`ai-send-button ${prompt.trim() && !isTypingText ? "active" : ""}`}
              onClick={handleSendMessage}
              disabled={isSending || isTypingText || !prompt.trim()}
              aria-label="Send message"
            >
              <Send size={16} className="send-icon" />
            </button>
          </div>

          <div className="ai-footer-note">
            AI generated content may be inaccurate or incomplete.
          </div>
        </div>
      </div>

      <AlertSnackbar
        open={open}
        message={message}
        severity={severity}
        onClose={handleClose}
      />
    </div>
  );
};

export default ManagerAIAssistant;