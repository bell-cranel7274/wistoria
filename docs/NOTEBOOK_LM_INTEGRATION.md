# NotebookLM-Style AI Assistant Integration

## Overview

We've successfully integrated a **NotebookLM-style AI Assistant** into the Research Notebook feature. This AI assistant can analyze your research notes, answer questions, find connections, and provide insights - similar to Google's NotebookLM but without the audio podcast feature.

## Features Implemented

### 1. **AI-Powered Research Analysis**
- Ask natural language questions about your research notes
- Get summaries of all research findings
- Find patterns and connections across different notes
- Identify research gaps and suggest areas for further investigation

### 2. **Source Grounding**
- AI responses reference specific research notes (e.g., "Based on Research Note 2...")
- Visual display of which notes were used to generate each response
- Shows reference numbers and titles of cited notes

### 3. **Quick Action Suggestions**
Four pre-built prompts for common research tasks:
- **Summarize all research**: Get a comprehensive summary of all notes
- **Key insights**: Extract main themes and patterns
- **Research gaps**: Identify areas needing more investigation
- **Find connections**: Discover relationships between topics

### 4. **Real-Time Streaming Responses**
- Responses stream in real-time for immediate feedback
- No waiting for complete responses
- Better user experience with progressive disclosure

### 5. **Context-Aware Analysis**
The AI has access to all your research note fields:
- Title and reference number
- Category and status
- Project association
- Main content
- Methodology
- Key findings
- Sources and references
- Additional notes

## How to Use

### Access the AI Assistant

1. Navigate to `/research` in your application
2. Click the **"AI Assistant"** button (purple/pink gradient) in the top right
3. The AI panel will open as a modal overlay

### Ask Questions

**Example Questions:**
```
- "Summarize all my research on machine learning"
- "What are the common themes across my technical research notes?"
- "What gaps exist in my current research?"
- "Find connections between my different projects"
- "What methodologies am I using most frequently?"
- "Compare the findings from Research Note 1 and Research Note 3"
```

### Use Quick Actions

Click any of the four quick action buttons to instantly:
1. Get a full research summary
2. Extract key insights
3. Identify research gaps
4. Find topic connections

### View Source References

When the AI references specific notes, you'll see them listed at the bottom of the response with:
- Reference number (e.g., RSH-123456-789)
- Note title

## Technical Implementation

### Files Created/Modified

1. **`/wistoria/src/components/research/AIAssistant.jsx`**
   - Main AI assistant component
   - Handles chat interface and streaming responses
   - Manages research context preparation

2. **`/wistoria/src/components/research/ResearchNotebookView.jsx`**
   - Added AI Assistant button and integration
   - State management for showing/hiding assistant
   - Pass research notes to AI component

### API Integration

The AI Assistant uses your existing backend:
- **Endpoint**: `POST /api/chat`
- **Server**: `http://localhost:5000` (configurable via `REACT_APP_API_URL`)
- **Model**: Uses Ollama's `gemma3:latest` by default
- **Features**: Streaming responses, chat history, context awareness

### Key Components

```jsx
<AIAssistant 
  notes={researchNotes}           // All research notes
  isMinimized={isAIMinimized}     // Minimize state
  onToggleSize={() => {...}}      // Toggle handler
/>
```

## Architecture

```
┌─────────────────────────────────────┐
│   Research Notebook View            │
│  ┌──────────────────────────────┐  │
│  │  AI Assistant Button         │  │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Research Notes Grid         │  │
│  │  - Note 1, Note 2, Note 3... │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
                 │
                 ├─── Click "AI Assistant"
                 ↓
┌─────────────────────────────────────┐
│   AI Assistant Modal (Full Screen)  │
│  ┌──────────────────────────────┐  │
│  │  Quick Actions (4 buttons)   │  │
│  ├──────────────────────────────┤  │
│  │  Chat Messages              │  │
│  │  - User questions           │  │
│  │  - AI responses with sources│  │
│  ├──────────────────────────────┤  │
│  │  Input Field                │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
                 │
                 ├─── Send question
                 ↓
┌─────────────────────────────────────┐
│   Backend Server (Node.js/Express)  │
│  ┌──────────────────────────────┐  │
│  │  POST /api/chat              │  │
│  │  - Receives enhanced message │  │
│  │  - Includes all research     │  │
│  │    notes as context          │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
                 │
                 ├─── Forward to Ollama
                 ↓
┌─────────────────────────────────────┐
│   Ollama (Local AI Model)           │
│  ┌──────────────────────────────┐  │
│  │  Model: gemma3:latest        │  │
│  │  - Analyzes research context │  │
│  │  - Generates response        │  │
│  │  - Streams back to client    │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Data Flow

1. **User asks question** → AI Assistant component
2. **Prepare context** → All research notes formatted as context
3. **Enhanced message** → Question + full research context combined
4. **API call** → POST to `/api/chat` with enhanced message
5. **Server processing** → Forwards to Ollama with chat history
6. **AI generation** → Ollama generates response based on context
7. **Streaming** → Response streams back to client in real-time
8. **Display** → Messages shown with source references extracted

## Context Preparation

For each research note, the AI receives:

```
[Research Note 1]
Title: Machine Learning Basics
Category: Technical
Status: completed
Project: ML Course
Reference: RSH-123456-789

Content: [Full content here...]

Methodology: [Methodology details...]

Key Findings: [Key findings...]

Sources: [Sources and references...]

Additional Notes: [Additional notes...]

---
```

## Customization

### Change AI Model

In `AIAssistant.jsx`, modify the model parameter:

```javascript
body: JSON.stringify({
  message: enhancedMessage,
  chatId: chatId,
  model: 'llama2'  // Change to any Ollama model
})
```

### Modify System Prompt

Edit the `enhancedMessage` in `handleSendMessage`:

```javascript
const enhancedMessage = `You are a specialized research assistant...
${researchContext}
[Your custom instructions here]
${messageText}`;
```

### Adjust UI Colors

The AI Assistant uses purple/pink gradient. To change:

```jsx
// In AIAssistant.jsx
className="bg-gradient-to-r from-purple-500 to-pink-500"
// Change to your preferred colors
```

## Best Practices

1. **Add meaningful research notes** - The AI can only analyze what you've written
2. **Be specific in questions** - Clear questions get better answers
3. **Use categories and tags** - Helps AI understand relationships
4. **Include methodology and sources** - Enriches AI context
5. **Review source references** - Verify which notes AI used for answers

## Limitations (Compared to NotebookLM)

✅ **What We Have:**
- AI-powered Q&A about research
- Source grounding and citations
- Multi-note synthesis
- Real-time streaming
- Quick action suggestions
- Context-aware analysis

❌ **What We Excluded (as requested):**
- Audio podcast generation
- Text-to-speech features
- Voice interactions

## Future Enhancements

Potential additions:
1. **Export conversations** - Save AI discussions with research
2. **Annotate notes** - AI-suggested highlights and tags
3. **Auto-categorization** - AI suggests categories for new notes
4. **Research recommendations** - AI suggests related papers/topics
5. **Timeline view** - Visualize research progression over time
6. **Collaboration** - Share AI insights with team members

## Troubleshooting

### AI not responding?
1. Check if Ollama is running: `ollama serve`
2. Verify server is running: `http://localhost:5000/api/models`
3. Check browser console for errors

### No research notes shown?
- Add some research notes first
- Check that notes have `type: 'research'`

### Slow responses?
- Large research collections take longer to process
- Consider using a faster Ollama model
- Reduce number of notes being analyzed

## Environment Setup

Required environment variables:

```bash
# In wistoria/.env
REACT_APP_API_URL=http://localhost:5000

# In server/.env
OLLAMA_URL=http://127.0.0.1:11434
PORT=5000
```

## Testing

To test the integration:

1. Create at least 3-5 research notes with different content
2. Open AI Assistant
3. Try quick actions first
4. Ask custom questions
5. Verify source references appear
6. Check streaming works smoothly

---

**Built on:** October 17, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready (without audio features)
