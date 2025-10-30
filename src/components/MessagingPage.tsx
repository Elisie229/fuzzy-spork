import { useState, useEffect, useRef } from 'react';
import { Send, User } from 'lucide-react';
import { api } from '../utils/api';

interface MessagingPageProps {
  currentUser: any;
  selectedUserId?: string;
  initialMessage?: string;
  onNavigate: (page: string) => void;
}

export function MessagingPage({ currentUser, selectedUserId, initialMessage, onNavigate }: MessagingPageProps) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [newConversationUserId, setNewConversationUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialMessageRef = useRef(initialMessage);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (currentUser && currentUser.id && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadMessages();
    }
  }, [currentUser?.id]);

  useEffect(() => {
    // Set initial message only once
    if (initialMessageRef.current && messageText === '') {
      setMessageText(initialMessageRef.current);
      initialMessageRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (activeConversation) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!currentUser || !currentUser.id) {
      console.error('No current user found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.getMessages(currentUser.id);
      const convs = response.conversations || [];
      setConversations(convs);

      // If a user was selected, find or create that conversation
      if (selectedUserId) {
        const existingConv = convs.find((conv: any[]) =>
          conv && conv.length > 0 && conv.some((msg: any) => 
            msg && (msg.fromUserId === selectedUserId || msg.toUserId === selectedUserId)
          )
        );
        if (existingConv && existingConv.length > 0) {
          setActiveConversation(existingConv);
          setNewConversationUserId(null);
        } else {
          // No existing conversation, prepare for new one
          setNewConversationUserId(selectedUserId);
          setActiveConversation([]); // Empty conversation to show input
        }
      } else if (convs.length > 0) {
        // Auto-select first conversation if no specific user selected
        setActiveConversation(convs[0]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;
    if (!currentUser || !currentUser.id) {
      alert('Vous devez être connecté pour envoyer un message');
      return;
    }

    try {
      // Get the other user ID from the conversation or use the new conversation user
      let otherUserId;
      if (activeConversation && Array.isArray(activeConversation) && activeConversation.length > 0) {
        const firstMsg = activeConversation[0];
        if (firstMsg) {
          otherUserId = firstMsg.fromUserId === currentUser.id
            ? firstMsg.toUserId
            : firstMsg.fromUserId;
        }
      } else {
        otherUserId = newConversationUserId || selectedUserId;
      }

      if (!otherUserId) {
        console.error('No recipient user ID found');
        alert('Impossible d\'identifier le destinataire');
        return;
      }

      await api.sendMessage({
        fromUserId: currentUser.id,
        toUserId: otherUserId,
        message: messageText,
      });

      setMessageText('');
      setNewConversationUserId(null);
      
      // Reset the flag to allow fresh data load
      hasLoadedRef.current = false;
      await loadMessages();
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert('Erreur lors de l\'envoi du message: ' + (error.message || 'Erreur inconnue'));
    }
  };

  const getConversationPartner = (conversation: any[]) => {
    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return null;
    }
    const firstMsg = conversation[0];
    if (!firstMsg || !currentUser) {
      return null;
    }
    return firstMsg.fromUserId === currentUser.id
      ? firstMsg.toUserId
      : firstMsg.fromUserId;
  };

  if (!currentUser || !currentUser.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder à la messagerie</p>
          <button
            onClick={() => onNavigate('login')}
            className="text-purple-600 hover:underline"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  // Safety check
  if (!Array.isArray(conversations)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Erreur de chargement des conversations</p>
          <button
            onClick={() => {
              hasLoadedRef.current = false;
              loadMessages();
            }}
            className="text-purple-600 hover:underline"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl mb-8">Messagerie</h1>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-3 h-[600px]">
            {/* Conversations List */}
            <div className="border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b">
                <h2 className="text-lg">Conversations</h2>
              </div>
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Aucune conversation</p>
                </div>
              ) : (
                <div>
                  {conversations.map((conv, idx) => {
                    if (!conv || !Array.isArray(conv) || conv.length === 0) {
                      return null;
                    }
                    
                    const partnerId = getConversationPartner(conv);
                    const lastMessage = conv[conv.length - 1];
                    
                    if (!partnerId || !lastMessage) {
                      return null;
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveConversation(conv)}
                        className={`w-full p-4 border-b hover:bg-gray-50 transition text-left ${
                          activeConversation === conv ? 'bg-purple-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">
                              User {partnerId.slice(0, 8)}...
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {lastMessage.message || ''}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="md:col-span-2 flex flex-col">
              {activeConversation === null ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <p>Sélectionnez une conversation pour commencer</p>
                </div>
              ) : (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {activeConversation.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p className="text-center">
                          Nouvelle conversation<br />
                          <span className="text-sm">Écrivez votre premier message ci-dessous</span>
                        </p>
                      </div>
                    ) : (
                      activeConversation.map((msg: any, msgIdx: number) => {
                        if (!msg || !msg.id) {
                          return null;
                        }
                        const isCurrentUser = msg.fromUserId === currentUser?.id;
                        return (
                          <div
                            key={msg.id || msgIdx}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                isCurrentUser
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p className="break-words whitespace-pre-wrap">{msg.message || ''}</p>
                              {msg.timestamp && (
                                <p
                                  className={`text-xs mt-1 ${
                                    isCurrentUser ? 'text-purple-200' : 'text-gray-500'
                                  }`}
                                >
                                  {new Date(msg.timestamp).toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="border-t p-4">
                    {initialMessageRef.current && Array.isArray(activeConversation) && activeConversation.length === 0 && (
                      <div className="mb-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-sm text-purple-700">
                          💡 Message suggéré - Vous pouvez le modifier avant d'envoyer
                        </p>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <textarea
                        value={messageText || ''}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        placeholder="Écrivez votre message... (Shift+Entrée pour nouvelle ligne)"
                        rows={3}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!messageText.trim()}
                        className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed self-end"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
