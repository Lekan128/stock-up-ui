import { useEffect, useRef, useState } from 'react';
import './ChatInterface.css';
import { ChatMessage, Role } from '../model/chat';
import axiosInstance from '../utils/axiosInstance';
import { useNotification } from '../contexts/NotificationContext';

interface ChatInterfaceProps {
    onClose: () => void;
}

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

const ChatInterface = ({ onClose }: ChatInterfaceProps) => {
    // Local extended message type to track status locally (pending/error/sent)
    type LocalMessage = ChatMessage & { status?: 'pending' | 'error' | 'sent'; id?: string };

    const [messages, setMessages] = useState<LocalMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { showNotification } = useNotification();

    // Use a ref for last activity so interval checks don't need to re-subscribe
    const lastActivityRef = useRef<number>(Date.now());
    const timeoutRef = useRef<number | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const updateActivity = () => {
        lastActivityRef.current = Date.now();
    };

    useEffect(() => {
        // Load initial chat history once on mount (don't re-fetch on every interaction)
        const fetchChatHistory = async () => {
            try {
                const response = await axiosInstance.get('/chat/history');
                // mark fetched messages as sent
                const mapped = (response.data as ChatMessage[]).map((m) =>
                    ({ ...(m as ChatMessage), status: 'sent' } as LocalMessage)
                );
                setMessages(mapped);
                scrollToBottom();
            } catch (error) {
                console.error('Failed to fetch chat history:', error);
                showNotification('Failed to load chat history', 'error');
            }
        };

        fetchChatHistory();

        // Set up inactivity timer that reads lastActivityRef
        const checkInactivity = () => {
            const now = Date.now();
            if (now - lastActivityRef.current >= INACTIVITY_TIMEOUT) {
                handleClearChat();
                showNotification('Chat cleared due to 15 minutes of inactivity', 'info');
            }
        };

        // check every 30s
        timeoutRef.current = window.setInterval(checkInactivity, 30 * 1000);

        return () => {
            if (timeoutRef.current !== null) {
                clearInterval(timeoutRef.current);
            }
        };
        // empty deps -> run once
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleClearChat = async () => {
        try {
            await axiosInstance.delete('/chat');
            setMessages([]);
            showNotification('Chat cleared', 'success');
            onClose();
        } catch (error) {
            console.error('Failed to clear chat:', error);
            showNotification('Failed to clear chat', 'error');
        }
    };

    const sendToBackend = async (text: string, placeholderId: string) => {
        try {
            const response = await axiosInstance.post('/chat', text);
            // update placeholder message with actual content
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === placeholderId ? { ...m, content: response.data, status: 'sent' } : m
                )
            );
            setIsTyping(false);
        } catch (error) {
            console.error('Failed to send message:', error);
            setIsTyping(false);
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === placeholderId
                        ? { ...m, content: 'Failed to get response. Tap to retry.', status: 'error' }
                        : m
                )
            );
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        updateActivity();
        const text = newMessage.trim();

        // append user message immediately
        const userLocal: LocalMessage = {
            role: Role.USER,
            content: text,
            status: 'sent',
            id: `u_${Date.now()}`,
        };

        // placeholder for agent
        const placeholderId = `a_${Date.now()}`;
        const agentPlaceholder: LocalMessage = {
            role: Role.AGENT,
            content: '',
            status: 'pending',
            id: placeholderId,
        };

        setMessages((prev) => [...prev, userLocal, agentPlaceholder]);
        setNewMessage('');
        setIsTyping(true);

        // send to backend and update placeholder when response arrives
        await sendToBackend(text, placeholderId);
    };

    // retry handler when a placeholder failed
    const handleRetry = async (messageId: string) => {
        const originalUser = messages.slice().reverse().find((m) => m.role === Role.USER && m.id && m.id.startsWith('u_'));
        if (!originalUser) {
            showNotification('Original message not found for retry', 'error');
            return;
        }

        // set the message to pending again
        setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, status: 'pending', content: '' } : m)));
        setIsTyping(true);
        await sendToBackend(originalUser.content, messageId);
    };

    return (
        <div className="chat-container" onClick={updateActivity}>
            <div className="chat-header">
                <h3>AI Assistant</h3>
                <div className="chat-actions">
                    <button onClick={handleClearChat} className="clear-chat-btn">End Chat</button>
                    <button onClick={onClose} className="close-chat-btn">×</button>
                </div>
            </div>
            
            <div className="chat-messages">
                {messages.length === 0 && (
                    <div className="chat-welcome">
                        <p>Hello! How can I assist you today?</p>
                        <small>Chat will be cleared after 15 minutes of inactivity</small>
                    </div>
                )}
                
                {messages.map((message, index) => (
                    <div
                        key={message.id ?? index}
                        className={`message ${message.role === Role.USER ? 'user-message' : 'agent-message'}`}
                        onClick={() => {
                            // if it is an error agent message allow retry by tapping
                            if (message.status === 'error' && message.role === Role.AGENT && message.id) {
                                handleRetry(message.id);
                            }
                        }}
                    >
                        <div className="message-content">
                            {message.content}
                            {message.status === 'error' && (
                                <div className="retry-hint">Tap to retry</div>
                            )}
                        </div>
                    </div>
                ))}
                
                {isTyping && (
                    <div className="typing-indicator agent-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="chat-input"
                    disabled={isTyping}
                />
                <button 
                    type="submit" 
                    className="send-button"
                    disabled={isTyping || !newMessage.trim()}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatInterface;