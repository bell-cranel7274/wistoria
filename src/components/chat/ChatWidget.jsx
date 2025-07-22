import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Wifi, WifiOff, Settings, Mic } from 'lucide-react';
import { useChatContext } from '../../context/ChatContext';

export const ChatWidget = () => {
  const {
    messages,
    availableModels,
    selectedModel,
    setSelectedModel,
    isLoading,
    isConnected,
    isChatOpen,
    sendMessage,
    clearMessages,
    toggleChat,
    checkHealth,
    startVoiceInput
  } = useChatContext();
  const [isListening, setIsListening] = useState(false);
  const handleVoiceInput = () => {
    setIsListening(true);
    startVoiceInput(
      (text) => {
        setInputMessage(text);
        setIsListening(false);
      },
      (error) => {
        // Optionally show error to user
        setIsListening(false);
      }
    );
  };

  const [inputMessage, setInputMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoading) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (!isChatOpen) {
    return (
      <button
        onClick={toggleChat}
        className="relative p-2 rounded-md hover:bg-muted transition-colors"
        title="Open AI Chat"
      >
        <MessageCircle className="w-5 h-5" />
        {!isConnected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
        )}
      </button>
    );
  }

  return (
    <div className="fixed top-16 right-4 w-96 h-[600px] bg-card border border-border rounded-lg shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">AI Assistant</h3>
          <div className="flex items-center gap-1">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" title="Connected" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" title="Disconnected" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 rounded hover:bg-muted"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={clearMessages}
            className="p-1 rounded hover:bg-muted text-red-500"
            title="Clear Chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={toggleChat}
            className="p-1 rounded hover:bg-muted"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="p-4 border-b border-border bg-muted/50">
          <div className="space-y-2">
            <label className="text-sm font-medium">AI Model:</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-2 rounded border bg-background text-sm"
            >
              {availableModels.map(model => (
                <option key={model.name} value={model.name}>
                  {model.name}
                </option>
              ))}
            </select>
            <button
              onClick={checkHealth}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Refresh connection
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Start a conversation with your AI assistant</p>
            {!isConnected && (
              <p className="text-xs text-red-500 mt-2">
                Server not connected. Check if Ollama is running on localhost:5000
              </p>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.text}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-xs opacity-70">
                    {formatTime(message.timestamp)}
                  </div>
                  {message.sender === 'ai' && message.model && (
                    <div className="text-xs opacity-70">
                      {message.model}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-xs text-muted-foreground ml-2">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Type your message..." : "Server disconnected..."}
            disabled={!isConnected || isLoading}
            className="flex-1 p-2 border rounded-md bg-background resize-none h-10 text-sm"
            rows={1}
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={!isConnected || isLoading || isListening}
            className={`p-2 rounded-md ${isListening ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-muted'} hover:bg-primary/20 disabled:opacity-50`}
            title={isListening ? 'Listening...' : 'Voice input'}
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!inputMessage.trim() || !isConnected || isLoading}
            className="p-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
