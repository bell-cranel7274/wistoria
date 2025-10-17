# Research Notebook Feature - Related Files

This document lists all files related to the Research Notebook feature shown in your screenshot.

## 📚 Core Components

### Main Research Component
- **`src/components/research/ResearchNotebookView.jsx`**
  - Main research notebook interface (library view)
  - Grid/List view modes
  - Search and filter functionality
  - Statistics dashboard
  - Navigates to full-page form for create/edit
  - Integrates AI Assistant

### Research Form (Full-Page)
- **`src/components/research/ResearchFormPage.jsx`**
  - Full-page form for creating and editing research notes
  - Replaces old modal dialogs
  - Book-style UI with page navigation
  - Responsive design for mobile/tablet/desktop
  - Handles both new notes and editing existing notes

### Book Detail View
- **`src/components/research/BookView.jsx`**
  - Detailed view for individual research notes
  - Book-style reading interface
  - PDF attachment support
  - Edit mode with multiple pages
  - Navigation between research book pages

### AI Assistant
- **`src/components/research/AIAssistant.jsx`**
  - AI-powered research analysis
  - Research summarization
  - Finding connections between notes
  - Research gap analysis
  - Integration with Ollama LLM

### Mobile Entry
- **`src/components/research/MobileEntryView.jsx`**
  - Mobile-friendly note entry interface
  - QR code scanning support
  - Quick mobile data capture

## 🗂️ Context & State Management

### Task Context (Manages Research Notes)
- **`src/context/TaskContext.jsx`**
  - Provides `notes` state array
  - Functions: `addNote()`, `updateNote()`, `deleteNote()`
  - LocalStorage persistence
  - Cross-tab synchronization
  - Auto-save functionality

## 🛣️ Routing & Navigation

### App Router
- **`src/App.jsx`**
  - Route: `/research` → ResearchNotebookView (library view)
  - Route: `/research/new` → ResearchFormPage (create new)
  - Route: `/research/edit/:noteId` → ResearchFormPage (edit existing)
  - Route: `/research/book/:bookId` → BookView (read-only view)
  - Route: `/mobile-entry/:sessionId` → MobileEntryView

## ⚙️ Configuration & Constants

### Constants
- **`src/utils/constants.js`**
  - `RESEARCH_CATEGORIES`: Array of research categories
    - Literature Review
    - Field Research
    - Data Analysis
    - Methodology
    - Findings
    - Conclusions
    - References
    - Other

### Storage Configuration
- **`src/constants/storage.js`**
  - `STORAGE_KEYS.NOTES`: 'eden_notes'
  - Storage error handling
  - Backup and recovery functions
  - LocalStorage utilities

## 📦 Dependencies (from package.json)

### Research-Specific Dependencies
- **`qrcode` (^1.5.4)**: QR code generation for mobile entry
- **`react-router-dom` (^6.22.0)**: Navigation between research views
- **`lucide-react` (^0.460.0)**: Icons (BookOpen, FileText, etc.)
- **`axios` (^1.12.2)**: API calls to Ollama for AI features

### UI/Framework Dependencies
- **`react` (^18.2.0)**: Core framework
- **`tailwindcss` (^3.4.1)**: Styling
- **`date-fns` (^4.1.0)**: Date formatting

## 📄 Documentation

- **`docs/AI_ASSISTANT_QUICK_START.md`**
  - How to use the AI Assistant with research notes
  - Quick start guide
  - Example queries and workflows

- **`docs/NOTEBOOK_LM_INTEGRATION.md`**
  - NotebookLM-inspired features
  - AI integration architecture

## 🎨 UI Components Used

### From `src/components/ui/`
- **`Card`**: Container components for research notes
- **`LoadingScreen`**: Loading states

## 📊 Data Structure

### Research Note Object Schema
```javascript
{
  id: string,              // Timestamp-based ID
  type: 'research',        // Note type
  title: string,           // Research title
  content: string,         // Main content
  project: string,         // Associated project
  category: string,        // From RESEARCH_CATEGORIES
  status: string,          // 'in-progress' | 'completed' | 'pending' | 'archived'
  methodology: string,     // Research methodology
  sources: string,         // Sources & references
  keyFindings: string,     // Key findings summary
  notes: string,           // Additional notes
  notesPages: array,       // Multi-page notes
  pdfs: array,            // PDF attachments
  referenceNumber: string, // Generated reference
  createdAt: string,       // ISO timestamp
  updatedAt: string        // ISO timestamp
}
```

## 🔄 Data Flow

1. **Create Research Note**:
   - User clicks "+ New Research Entry" button
   - Navigate to `/research/new`
   - `ResearchFormPage` loads with empty form
   - User fills multi-page form
   - User clicks "Save" → `handleSave()`
   - `TaskContext.addNote()` → LocalStorage
   - Navigate back to `/research`

2. **Edit Research Note**:
   - User clicks "Edit" button on research card
   - Navigate to `/research/edit/:noteId`
   - `ResearchFormPage` loads existing note data
   - User modifies fields across pages
   - User clicks "Save" → `handleSave()`
   - `TaskContext.updateNote()` → LocalStorage
   - Navigate back to `/research`

3. **View Research Note**:
   - User clicks on research card
   - Navigate to `/research/book/:bookId`
   - `BookView` component loads note by ID
   - Displays book-style read-only interface

4. **AI Analysis**:
   - User clicks AI Assistant button
   - `setShowAIAssistant(true)`
   - `AIAssistant` component loads with `notes` prop
   - Sends queries to Ollama API
   - Returns analysis based on research content

## 🎯 Key Features

1. **Book-Style Interface**
   - Book cover designs for research notes
   - Page navigation (Basic Info, Research Details, Notes & Content)
   - Book binding visual effects
   - Reference numbering system

2. **Search & Filter**
   - Search by title, content, or project
   - Filter by category (Literature Review, Field Research, etc.)
   - Filter by status (Completed, In Progress, Pending, Archived)
   - Grid/List view toggle

3. **Statistics Dashboard**
   - Total research count
   - Completed notes count
   - In-progress notes count
   - Pending notes count

4. **Mobile Integration**
   - QR code generation for mobile access
   - Mobile entry view for quick capture
   - Session-based mobile linking

5. **AI Assistant**
   - Summarize research
   - Find connections
   - Identify research gaps
   - Answer questions about notes

## 🔗 Integration Points

### With Task System
- Research notes stored in same context as tasks
- Shared storage system
- Unified search functionality

### With Ollama API
- AI Assistant makes requests to local Ollama instance
- Model: Uses configured Ollama model (default: llama2)
- Endpoint: `http://localhost:11434/api/generate`

### With LocalStorage
- All notes persisted locally
- Backup system for data recovery
- Cross-tab synchronization

## 📱 Mobile Features

- QR code generation links to mobile entry form
- Session-based entry system
- Responsive design for mobile viewing
- Touch-optimized interactions

## 🎨 Styling Approach

- Tailwind CSS utility classes
- Custom color scheme with CSS variables
- Book-themed design system
- Gradient effects and shadows
- Responsive grid layouts
- Dark mode support

## 📈 Future Enhancement Areas

Based on the codebase structure:
- PDF viewer integration (pdfs array exists but viewing not fully implemented)
- Export functionality
- Collaboration features
- Advanced AI features (voice notes, image analysis)
- Research timeline visualization
- Citation management system

---

## Quick Reference: File Paths

```
src/
├── components/
│   ├── research/
│   │   ├── ResearchNotebookView.jsx    ← Main library view
│   │   ├── ResearchFormPage.jsx        ← Full-page create/edit form (NEW)
│   │   ├── BookView.jsx                 ← Detail view (read-only)
│   │   ├── AIAssistant.jsx              ← AI features
│   │   └── MobileEntryView.jsx          ← Mobile capture
│   └── ui/
│       └── card.jsx                     ← UI component
├── context/
│   └── TaskContext.jsx                  ← State management
├── utils/
│   └── constants.js                     ← Research categories
├── constants/
│   └── storage.js                       ← Storage config
└── App.jsx                              ← Routing

docs/
├── AI_ASSISTANT_QUICK_START.md          ← User guide
└── NOTEBOOK_LM_INTEGRATION.md           ← AI docs

package.json                             ← Dependencies
```

---

**Total Files in Research Feature: 12 core files**
- 5 Component files (including new ResearchFormPage)
- 1 Context file
- 2 Utility/Config files
- 1 Router file
- 2 Documentation files
- 1 Package manifest
