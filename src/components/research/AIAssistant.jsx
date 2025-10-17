import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2, BookOpen, Lightbulb, Search, TrendingUp, X, Minimize2, Maximize2 } from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import axios from 'axios';

export const AIAssistant = ({ notes = [], isMinimized = false, onToggleSize }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your research assistant. I can help you:\n\n• Ask questions about your research notes\n• Summarize your findings\n• Find connections between different topics\n• Generate insights and suggestions\n\nWhat would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // API configuration - using the existing Ollama server
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quick action suggestions based on research notes
  const suggestions = [
    {
      icon: <BookOpen className="w-4 h-4" />,
      label: 'Summarize all research',
      prompt: 'Please provide a comprehensive summary of all my research notes, highlighting the main themes and findings.'
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      label: 'Key insights',
      prompt: 'What are the key insights and patterns across all my research notes?'
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Research gaps',
      prompt: 'Based on my research notes, what gaps or areas need more investigation?'
    },
    {
      icon: <Search className="w-4 h-4" />,
      label: 'Find connections',
      prompt: 'What connections and relationships can you find between different topics in my research?'
    }
  ];

  // Prepare research context for AI
  const prepareResearchContext = () => {
    if (!notes || notes.length === 0) {
      return "No research notes available yet.";
    }

    return notes.map((note, index) => {
      return `
[Research Note ${index + 1}]
Title: ${note.title || 'Untitled'}
Category: ${note.category || 'N/A'}
Status: ${note.status || 'N/A'}
Project: ${note.project || 'N/A'}
Reference: ${note.referenceNumber || 'N/A'}

Content: ${note.content || 'No content'}

Methodology: ${note.methodology || 'Not specified'}

Key Findings: ${note.keyFindings || 'Not specified'}

Sources: ${note.sources || 'Not specified'}

Additional Notes: ${note.notes || 'None'}

---
`;
    }).join('\n');
  };

  const handleSendMessage = async (messageText = input) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create unique chat ID for this research session
    const chatId = 'research-' + Date.now();

    try {
      // Prepare the context with all research notes
      const researchContext = prepareResearchContext();
      
      // Create an enhanced message that includes the research context
      const enhancedMessage = `You are an AI research assistant analyzing research notes.

${researchContext}

Based on these research notes, answer this question: ${messageText}

Please cite specific research notes when possible (e.g., "Based on Research Note 2...").`;

      // Call the chat API with streaming
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: enhancedMessage,
          chatId: chatId,
          model: 'gemma3:latest'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      // Add a placeholder message that we'll update
      const aiMessageIndex = messages.length + 1;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true
      }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        aiResponse += chunk;
        
        // Update the message in real-time
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[aiMessageIndex] = {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date(),
            isStreaming: !done
          };
          return newMessages;
        });
      }

      // Final update with sources
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[aiMessageIndex] = {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
          sources: extractSourceReferences(aiResponse),
          isStreaming: false
        };
        return newMessages;
      });

    } catch (error) {
      console.error('Error calling AI:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error while processing your request. Please make sure the AI server is running and try again.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract which research notes were referenced in the response
  const extractSourceReferences = (content) => {
    const references = [];
    const regex = /Research Note (\d+)/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const noteIndex = parseInt(match[1]) - 1;
      if (notes[noteIndex]) {
        references.push({
          index: noteIndex,
          title: notes[noteIndex].title,
          referenceNumber: notes[noteIndex].referenceNumber
        });
      }
    }
    return references.length > 0 ? references : null;
  };

  const handleSuggestionClick = (suggestion) => {
    setSelectedSuggestion(suggestion);
    handleSendMessage(suggestion.prompt);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={onToggleSize}
          className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
        >
          <Sparkles className="w-6 h-6" />
          <span className="font-medium">AI Assistant</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-blue-50/50 dark:from-gray-900/50 dark:via-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-purple-200/50 dark:border-purple-800/50 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">AI Research Assistant</h3>
            <p className="text-xs text-muted-foreground">
              Analyzing {notes.length} research {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
        </div>
        {onToggleSize && (
          <button
            onClick={onToggleSize}
            className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="p-4 border-b border-purple-200/50 dark:border-purple-800/50">
          <p className="text-sm text-muted-foreground mb-3">Quick actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isLoading || notes.length === 0}
                className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200/50 dark:border-purple-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 text-left text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="text-purple-500">{suggestion.icon}</div>
                <span className="text-foreground font-medium">{suggestion.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : message.isError
                  ? 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
                  : 'bg-white dark:bg-gray-800 border border-purple-200/50 dark:border-purple-800/50 text-foreground'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
              
              {/* Source references */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-purple-200/50 dark:border-purple-800/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Referenced notes:</p>
                  <div className="space-y-1">
                    {message.sources.map((source, idx) => (
                      <div key={idx} className="text-xs bg-purple-50 dark:bg-purple-900/20 rounded px-2 py-1">
                        <span className="font-mono">{source.referenceNumber}</span>
                        {' - '}
                        <span>{source.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-2 text-xs opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-gray-800 border border-purple-200/50 dark:border-purple-800/50 rounded-lg p-4">
              <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-purple-200/50 dark:border-purple-800/50 bg-white/50 dark:bg-gray-900/50">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={notes.length === 0 ? "Add some research notes first..." : "Ask anything about your research..."}
            disabled={isLoading || notes.length === 0}
            className="flex-1 resize-none bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 rounded-lg p-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            rows="2"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading || notes.length === 0}
            className="px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AIAssistant;
