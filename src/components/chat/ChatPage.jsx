import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Wifi, WifiOff, Settings, ArrowLeft, Bot, User, Copy, RotateCcw, Zap, Brain, Sparkles, Mic } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatContext } from '../../context/ChatContext';
import StarRating from '../ui/StarRating';

export const ChatPage = () => {
  const navigate = useNavigate();
  const {
    messages,
    availableModels,
    selectedModel,
    setSelectedModel,
    isLoading,
    isConnected,
    sendMessage,
    clearMessages,
    checkHealth,
    startVoiceInput,
    enableVoiceWake,
    sendFeedback
  } = useChatContext();
  
  // All state declarations at the top
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [wakeActive, setWakeActive] = useState(false);
  const [wakeListening, setWakeListening] = useState(false); // true when listening for message after hotword
  const [voiceError, setVoiceError] = useState('');
  const wakeCleanupRef = useRef(null);

  // Handler for regular voice input
  const handleVoiceInput = () => {
    setVoiceError(''); // Clear any previous errors
    setIsListening(true);
    console.log('Starting voice input...'); // Debug log
    
    startVoiceInput(
      (text) => {
        console.log('Voice input received:', text); // Debug log
        setInputMessage(text);
        setIsListening(false);
        setVoiceError(''); // Clear error on success
      },
      (error) => {
        console.error('Voice input error:', error); // Debug log
        // Don't show "aborted" errors to user as they're normal when stopping recognition
        if (error !== 'aborted') {
          setVoiceError(
            error === 'not-allowed' ?
              'Microphone access denied. Please allow mic permissions in your browser.' :
            error === 'no-speech' ?
              'No speech detected. Please try again.' :
            error === 'audio-capture' ?
              'No microphone was found. Please check your mic.' :
            error === 'network' ?
              'Network error with speech recognition.' :
            error ?
              `Voice recognition error: ${error}` :
              'Unknown voice recognition error.'
          );
        }
        setIsListening(false);
      }
    );
  };

  // Handler for hotword activation
  const handleToggleWake = () => {
    setVoiceError('');
    if (!wakeActive) {
      setWakeActive(true);
      setWakeListening(false);
      console.log('Starting voice wake...'); // Debug log
      
      wakeCleanupRef.current = enableVoiceWake(
        (text) => {
          console.log('Wake voice received:', text); // Debug log
          if (text) {
            setInputMessage(text); // Show recognized text in input
            setWakeListening(false);
            setTimeout(() => {
              sendMessage(text);
              setInputMessage('');
            }, 100); // Small delay to let user see the text
          }
        },
        (error) => {
          console.error('Wake voice error:', error); // Debug log
          // Don't show "aborted" errors to user as they're normal when stopping recognition
          if (error !== 'aborted') {
            setVoiceError(
              error === 'not-allowed' ?
                'Microphone access denied. Please allow mic permissions in your browser.' :
              error === 'no-speech' ?
                'No speech detected. Please try again.' :
              error === 'audio-capture' ?
                'No microphone was found. Please check your mic.' :
              error === 'network' ?
                'Network error with speech recognition.' :
              error ?
                `Voice recognition error: ${error}` :
                'Unknown voice recognition error.'
            );
          }
          setWakeListening(false);
        },
        // Optional: callback for when wake mode is actively listening for message
        () => setWakeListening(true)
      );
    } else {
      setWakeActive(false);
      setWakeListening(false);
      if (wakeCleanupRef.current) wakeCleanupRef.current();
    }
  };
  const [showSettings, setShowSettings] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when page loads
    inputRef.current?.focus();
  }, []);

  // Cleanup voice recognition when component unmounts
  useEffect(() => {
    return () => {
      if (wakeCleanupRef.current) {
        wakeCleanupRef.current();
      }
    };
  }, []);

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

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const quickPrompts = [
    { icon: '💻', text: 'Help me debug this code', prompt: 'Can you help me debug this code?' },
    { icon: '🚀', text: 'Optimize performance', prompt: 'How can I optimize the performance of my application?' },
    { icon: '🎨', text: 'UI/UX suggestions', prompt: 'Can you give me some UI/UX improvement suggestions?' },
    { icon: '📚', text: 'Best practices', prompt: 'What are the best practices for this technology?' },
    { icon: '🔧', text: 'Fix this error', prompt: 'I\'m getting an error, can you help me fix it?' },
    { icon: '🏗️', text: 'Architecture advice', prompt: 'Can you help me design the architecture for my project?' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Enhanced Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 group"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  {isConnected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI Assistant
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    {isConnected ? (
                      <>
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span>Connected • {selectedModel}</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="w-4 h-4 text-red-500" />
                        <span>Disconnected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {voiceError && (
                <div className="ml-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                  {voiceError}
                </div>
              )}
              <button
                onClick={handleToggleWake}
                className={`p-2 rounded-xl transition-all duration-200 ${wakeActive ? 'bg-blue-500 text-white animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'}`}
                title={wakeActive ? (wakeListening ? 'Say your message...' : 'Voice Wake Active (Say "Hey Eden")') : 'Enable Voice Wake (Say "Hey Eden")'}
              >
                <Mic className="w-5 h-5" />
                <span className="ml-2 text-xs font-medium">{wakeActive ? (wakeListening ? 'Say your message...' : 'Listening for "Hey Eden"') : 'Hey Eden'}</span>
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  showSettings 
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={clearMessages}
                className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600 transition-all duration-200"
                title="Clear Chat"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Enhanced Settings Panel */}
          {showSettings && (
            <div className="pb-4">
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      🤖 AI Model
                    </label>
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      {availableModels.map(model => (
                        <option key={model.name} value={model.name}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col justify-end">
                    <button
                      onClick={checkHealth}
                      className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 font-medium"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Refresh Connection
                    </button>
                  </div>
                  <div className="flex flex-col justify-center">
                    {!isConnected && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                          <WifiOff className="w-4 h-4" />
                          <span className="font-medium">Server Offline</span>
                        </div>
                        <p className="text-red-500 dark:text-red-400 text-xs mt-1">
                          Make sure Ollama Chat Server is running on localhost:5000
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Chat Container */}
      <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-80px)]">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-3xl flex items-center justify-center mb-6">
                <Sparkles className="w-12 h-12 text-blue-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-3">
                Welcome to AI Assistant
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Start a conversation with your AI coding assistant. I'm here to help with programming, debugging, and technical questions.
              </p>
              
              {/* Quick Prompts */}
              <div className="w-full max-w-3xl">
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 text-left">
                  💡 Quick Start Ideas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(prompt.prompt)}
                      className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{prompt.icon}</span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {prompt.text}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-8 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <span>Current Model:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedModel}</span>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-green-500 to-teal-600'
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    {message.sender === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  {/* Message Content */}
                  <div className={`flex-1 max-w-[80%] ${message.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`relative p-4 rounded-2xl shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-br from-green-500 to-teal-600 text-white ml-auto'
                          : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {/* Message Text */}
                      <div className="whitespace-pre-wrap break-words leading-relaxed">
                        {message.text}
                      </div>
                      
                      {/* Message Actions */}
                      {message.sender === 'ai' && message.text && (
                        <button
                          onClick={() => copyToClipboard(message.text, message.id)}
                          className={`absolute top-2 right-2 p-1.5 rounded-lg transition-all duration-200 ${
                            copiedMessageId === message.id
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                          }`}
                          title={copiedMessageId === message.id ? 'Copied!' : 'Copy message'}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    
                    {/* Timestamp, Model, and Rating */}
                    <div className={`flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400 ${
                      message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <span>{formatTime(message.timestamp)}</span>
                      {message.sender === 'ai' && message.model && (
                        <>
                          <span>•</span>
                          <span className="font-medium">{message.model}</span>
                        </>
                      )}
                      {message.sender === 'ai' && message.text && (
                        <>
                          <span>•</span>
                          <StarRating
                            messageId={message.id}
                            currentRating={message.rating || 0}
                            onRate={sendFeedback}
                            size="sm"
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Enhanced Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSendMessage} className="relative">
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                  className="w-full p-4 pr-16 border border-slate-200 dark:border-slate-600 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-800 dark:text-slate-200 placeholder-slate-500 dark:placeholder-slate-400 min-h-[60px] max-h-[200px] shadow-sm transition-all duration-200"
                  disabled={isLoading || !isConnected}
                  rows={1}
                  style={{
                    resize: 'none',
                    height: 'auto',
                    minHeight: '60px'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                  }}
                />
                
                {/* Voice Button */}
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isLoading || !isConnected || isListening}
                  className={`absolute right-14 bottom-3 p-2.5 rounded-xl transition-all duration-200 ${
                    isListening
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white animate-pulse'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  }`}
                  title={isListening ? 'Listening...' : 'Voice input'}
                >
                  <Mic className="w-5 h-5" />
                </button>
                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading || !isConnected}
                  className={`absolute right-3 bottom-3 p-2.5 rounded-xl transition-all duration-200 ${
                    inputMessage.trim() && !isLoading && isConnected
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
            
            {/* Status and Hints */}
            <div className="flex items-center justify-between mt-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                {!isConnected ? (
                  <div className="flex items-center gap-2 text-red-500">
                    <WifiOff className="w-4 h-4" />
                    <span>Please check your connection to the AI server</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Zap className="w-4 h-4" />
                    <span>Ready to assist you</span>
                  </div>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <span>Enter to send</span>
                <span>Shift+Enter for new line</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
