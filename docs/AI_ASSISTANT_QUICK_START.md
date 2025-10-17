# NotebookLM-Style AI Assistant - Quick Start Guide

## 🎯 What Is This?

An AI-powered research assistant that helps you analyze, understand, and extract insights from your research notes - inspired by Google's NotebookLM.

## 🚀 Quick Start (3 Steps)

### Step 1: Add Research Notes
```
Navigate to: http://localhost:4300/research

Click: "+ New Research Entry"

Fill in:
- Title: "Machine Learning Study"
- Content: Your research content
- Methodology: How you conducted the research
- Key Findings: Main discoveries
- Sources: References and citations
```

### Step 2: Open AI Assistant
```
Click the purple/pink "AI Assistant" button
(Top right of the research page)
```

### Step 3: Ask Questions or Use Quick Actions
```
Quick Actions (Click any):
📚 Summarize all research
💡 Key insights  
📊 Research gaps
🔗 Find connections

OR

Type your own question:
"What are the common themes in my research?"
```

## 💬 Example Conversations

### Example 1: Getting a Summary
```
You: Summarize all my research on AI

AI: Based on your research notes:

Research Note 1 (Machine Learning Basics) discusses fundamental concepts...
Research Note 3 (Neural Networks) explores deep learning architectures...

The common theme across these notes is...

Referenced notes:
• RSH-123456-789 - Machine Learning Basics
• RSH-789012-345 - Neural Networks
```

### Example 2: Finding Connections
```
You: What connections exist between my different projects?

AI: Analyzing your research notes, I found several connections:

1. Research Note 2 and Note 4 both use similar methodologies...
2. Your findings in Note 1 support the hypothesis in Note 5...
3. Consider exploring the gap between...
```

### Example 3: Research Gaps
```
You: What should I research next?

AI: Based on Research Note 1, 2, and 3, here are areas needing more investigation:

1. You've researched theory extensively but lack practical implementations
2. Most sources are from 2020-2021, recent developments are missing
3. The connection between X and Y is mentioned but not explored...
```

## 🎨 Features

### ✅ What You Can Do

- **Ask natural questions** about your research
- **Get summaries** of all your notes
- **Find patterns** and connections
- **Identify gaps** in your research
- **Get cited sources** for every answer
- **Stream responses** in real-time
- **Use quick actions** for common tasks

### 📋 AI Understands

- Your research titles and content
- Methodologies used
- Key findings and conclusions
- Sources and references
- Project relationships
- Categories and status
- Additional notes

## 🎯 Best Prompts to Try

### For Analysis
```
"What are the key themes across all my research?"
"Compare Research Note 1 and Research Note 3"
"What patterns do you see in my findings?"
"Which notes are most related to [topic]?"
```

### For Planning
```
"What should I research next?"
"What gaps exist in my current research?"
"What questions remain unanswered?"
"What additional sources would be valuable?"
```

### For Synthesis
```
"Create a synthesis of my [category] research"
"How do my findings support/contradict each other?"
"What conclusions can be drawn from all my notes?"
"Summarize my research on [specific topic]"
```

## 🔧 Technical Requirements

### Prerequisites
1. **Ollama** running locally (`ollama serve`)
2. **Backend server** running (`npm run dev` in `/server`)
3. **Frontend** running (`npm start` in `/wistoria`)
4. At least **one research note** created

### Check if Everything Works
```bash
# 1. Test Ollama
curl http://localhost:11434/api/tags

# 2. Test Backend
curl http://localhost:5000/api/models

# 3. Open Frontend
open http://localhost:4300/research
```

## 💡 Tips for Best Results

1. **Write detailed notes**: More content = better AI analysis
2. **Use categories**: Helps AI understand context
3. **Include sources**: Improves credibility of insights
4. **Add methodology**: AI can suggest improvements
5. **Be specific**: Clear questions get better answers
6. **Use quick actions**: Great starting points

## ⚡ Keyboard Shortcuts

- `Enter` - Send message
- `Shift + Enter` - New line in message
- `Esc` (future) - Close AI assistant

## 🎨 UI Elements
