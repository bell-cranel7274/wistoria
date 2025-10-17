import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, FileText, Tag, Calendar, FolderOpen, BookOpen, Lightbulb, FileCode, StickyNote, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import { RESEARCH_CATEGORIES } from '../../utils/constants';

export const ResearchFormPage = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { notes, addNote, updateNote } = useTaskContext();
  const [activeSection, setActiveSection] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const RESEARCH_STATUSES = [
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'completed', label: 'Completed', color: 'bg-green-500' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
    { value: 'archived', label: 'Archived', color: 'bg-gray-500' },
  ];

  // Navigation sections for sidebar
  const sections = [
    { id: 'overview', label: 'Overview', icon: FileText, description: 'Basic information' },
    { id: 'details', label: 'Research Details', icon: BookOpen, description: 'Methodology & approach' },
    { id: 'findings', label: 'Key Findings', icon: Lightbulb, description: 'Results & insights' },
    { id: 'sources', label: 'Sources', icon: FileCode, description: 'References & citations' },
    { id: 'notes', label: 'Notes & Content', icon: StickyNote, description: 'Additional information' },
  ];

  // Initialize note state
  const [selectedNote, setSelectedNote] = useState({
    title: '',
    content: '',
    project: '',
    type: 'research',
    category: '',
    sources: '',
    keyFindings: '',
    methodology: '',
    notes: '',
    notesPages: [''],
    pdfs: [],
    status: 'in-progress',
  });

  // Load existing note if editing
  useEffect(() => {
    if (noteId) {
      const existingNote = notes.find(note => note.id === noteId);
      if (existingNote) {
        setSelectedNote(existingNote);
      } else {
        navigate('/research');
      }
    }
  }, [noteId, notes, navigate]);

  // Generate reference number
  const generateReferenceNumber = () => {
    const prefix = 'RSN';
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${prefix}-${timestamp}-${random}`;
  };

  // Handle save
  const handleSave = () => {
    try {
      if (noteId) {
        // Update existing note
        updateNote({
          ...selectedNote,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Add new note
        const noteToAdd = {
          ...selectedNote,
          id: Date.now().toString(),
          type: 'research',
          referenceNumber: generateReferenceNumber(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          title: selectedNote.title || 'Untitled Research',
          content: selectedNote.content || '',
          project: selectedNote.project || '',
          methodology: selectedNote.methodology || '',
          sources: selectedNote.sources || '',
          keyFindings: selectedNote.keyFindings || '',
          notes: selectedNote.notes || '',
          notesPages: selectedNote.notesPages || [''],
        };
        addNote(noteToAdd);
      }
      navigate('/research');
    } catch (error) {
      console.error('Error saving research note:', error);
      alert('Failed to save research note. Please try again.');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/research');
    }
  };

  // Check if a section is completed
  const getSectionCompletion = (sectionId) => {
    switch (sectionId) {
      case 'overview':
        return !!selectedNote.title;
      case 'details':
        return !!selectedNote.methodology;
      case 'findings':
        return !!selectedNote.keyFindings;
      case 'sources':
        return !!selectedNote.sources;
      case 'notes':
        return !!selectedNote.content;
      default:
        return false;
    }
  };

  // Calculate overall progress
  const calculateProgress = () => {
    const completedSections = sections.filter(section => 
      getSectionCompletion(section.id)
    ).length;
    return (completedSections / sections.length) * 100;
  };

  // Render content based on active section
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white flex items-center gap-2">
                Research Title
                <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={selectedNote?.title || ''}
                onChange={(e) => setSelectedNote(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a descriptive title for your research..."
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
              />
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-gray-400" />
                  Project
                </label>
                <input
                  type="text"
                  value={selectedNote?.project || ''}
                  onChange={(e) => setSelectedNote(prev => ({ ...prev, project: e.target.value }))}
                  placeholder="Associated project name"
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  Category
                </label>
                <select
                  value={selectedNote?.category || ''}
                  onChange={(e) => setSelectedNote(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                >
                  <option value="">Select a category</option>
                  {RESEARCH_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Reference Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Reference Number
                </label>
                <input
                  type="text"
                  value={selectedNote?.referenceNumber || 'Auto-generated on save'}
                  readOnly
                  className="w-full bg-muted/30 border border-border rounded-lg px-4 py-3 text-base text-gray-400 cursor-not-allowed"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {RESEARCH_STATUSES.map(status => (
                    <button
                      key={status.value}
                      onClick={() => setSelectedNote(prev => ({ ...prev, status: status.value }))}
                      className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedNote?.status === status.value
                          ? `${status.color} text-white border-transparent`
                          : 'bg-background border-border text-gray-400 hover:border-primary/50'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Date Info */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {selectedNote?.createdAt 
                    ? `Created ${new Date(selectedNote.createdAt).toLocaleDateString()}` 
                    : 'New research note'}
                </span>
                {selectedNote?.updatedAt && (
                  <span className="text-gray-400">
                    Last updated {new Date(selectedNote.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            {/* Methodology */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Research Methodology</label>
              <p className="text-xs text-gray-400 mb-2">Describe your research approach and methods</p>
              <textarea
                value={selectedNote?.methodology || ''}
                onChange={(e) => setSelectedNote(prev => ({ ...prev, methodology: e.target.value }))}
                placeholder="• What methods did you use?
• How did you collect data?
• What was your approach to analysis?
• Were there any specific frameworks or tools?"
                rows={8}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Methodology Tips
              </h4>
              <ul className="text-xs text-gray-400 space-y-1.5">
                <li>• Clearly define your research design (qualitative, quantitative, mixed)</li>
                <li>• Explain your sampling strategy and participant selection</li>
                <li>• Describe data collection instruments and procedures</li>
                <li>• Note any ethical considerations or limitations</li>
              </ul>
            </div>
          </div>
        );

      case 'findings':
        return (
          <div className="space-y-6">
            {/* Key Findings */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Key Findings</label>
              <p className="text-xs text-gray-400 mb-2">Summarize your most important discoveries and insights</p>
              <textarea
                value={selectedNote?.keyFindings || ''}
                onChange={(e) => setSelectedNote(prev => ({ ...prev, keyFindings: e.target.value }))}
                placeholder="• What were the main outcomes?
• Were there any surprising results?
• How do findings relate to your research questions?
• What patterns or trends emerged?"
                rows={10}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
              />
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-amber-600 dark:text-amber-500 mb-2">Best Practices</h4>
              <ul className="text-xs text-gray-400 space-y-1.5">
                <li>• Be specific and data-driven in your findings</li>
                <li>• Separate findings from interpretation when possible</li>
                <li>• Note statistical significance or confidence levels</li>
                <li>• Consider alternative explanations for your results</li>
              </ul>
            </div>
          </div>
        );

      case 'sources':
        return (
          <div className="space-y-6">
            {/* Sources & References */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Sources & References</label>
              <p className="text-xs text-gray-400 mb-2">List all sources, citations, and references used in your research</p>
              <textarea
                value={selectedNote?.sources || ''}
                onChange={(e) => setSelectedNote(prev => ({ ...prev, sources: e.target.value }))}
                placeholder="Example format:
1. Smith, J. (2024). Research Title. Journal Name, 10(2), 123-145.
2. https://example.com/relevant-article
3. Book Author (2023). Book Title. Publisher.

Or use your preferred citation style (APA, MLA, Chicago, etc.)"
                rows={12}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 text-base font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
              />
            </div>

            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-600 dark:text-blue-500 mb-2">Citation Guidelines</h4>
              <ul className="text-xs text-gray-400 space-y-1.5">
                <li>• Use a consistent citation format throughout</li>
                <li>• Include DOIs or URLs where applicable</li>
                <li>• Verify all citations are accurate and complete</li>
                <li>• Consider organizing by type (books, journals, websites)</li>
              </ul>
            </div>
          </div>
        );

      case 'notes':
        // Ensure notesPages array exists and has at least one page
        const pages = selectedNote?.notesPages || [''];
        const currentPageContent = pages[currentPage] || '';
        
        return (
          <div className="space-y-6">
            {/* Page Navigation Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white">Research Paper</h3>
                <span className="text-sm text-gray-400">
                  Page {currentPage + 1} of {pages.length}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Previous Page */}
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                
                {/* Page Indicator Dots */}
                <div className="flex items-center gap-2 px-3">
                  {pages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      className={`transition-all rounded-full ${
                        index === currentPage
                          ? 'bg-orange-500 w-8 h-2'
                          : 'bg-gray-600 hover:bg-gray-500 w-2 h-2'
                      }`}
                      title={`Page ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Next Page */}
                <button
                  onClick={() => {
                    if (currentPage === pages.length - 1) {
                      // Add new page
                      const newPages = [...pages, ''];
                      setSelectedNote(prev => ({ ...prev, notesPages: newPages }));
                      setCurrentPage(pages.length);
                    } else {
                      setCurrentPage(currentPage + 1);
                    }
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
                >
                  {currentPage === pages.length - 1 ? '+ New Page' : 'Next →'}
                </button>
                
                {/* Delete Page */}
                {pages.length > 1 && (
                  <button
                    onClick={() => {
                      if (window.confirm('Delete this page?')) {
                        const newPages = pages.filter((_, i) => i !== currentPage);
                        setSelectedNote(prev => ({ ...prev, notesPages: newPages }));
                        setCurrentPage(Math.max(0, currentPage - 1));
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Single Paper-like Textarea with Grid Lines */}
            <div className="space-y-2">
              <div className="bg-gray-700/30 rounded-lg p-1 border border-gray-600">
                <div className="bg-white rounded shadow-lg relative">
                  {/* Grid Lines Background - Notebook Style */}
                  <div 
                    className="absolute inset-0 pointer-events-none rounded"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, #cbd5e1 27px, #cbd5e1 28px)',
                      backgroundPosition: '0 24px'
                    }}
                  />
                  <textarea
                    value={currentPageContent}
                    onChange={(e) => {
                      const newPages = [...pages];
                      newPages[currentPage] = e.target.value;
                      setSelectedNote(prev => ({ ...prev, notesPages: newPages }));
                    }}
                    placeholder={`Write your research content for page ${currentPage + 1}...

This is like writing on paper. Use this space for:
• Detailed observations and raw data
• Step-by-step analysis and reasoning
• Charts, graphs, and figure descriptions
• Supporting evidence and examples
• Technical details and specifications
• Discussion of results
• Implications and recommendations

Click "Next →" or "+ New Page" to add more pages.`}
                    className="w-full bg-transparent rounded px-8 py-6 text-base focus:outline-none resize-none font-serif relative z-10"
                    rows={24}
                    style={{
                      minHeight: '800px',
                      lineHeight: '28px',
                      letterSpacing: '0.01em',
                      color: '#111827',
                      fontWeight: '400'
                    }}
                  />
                </div>
              </div>
              
              {/* Page Info */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Page {currentPage + 1}</span>
                <span>{currentPageContent.length} characters</span>
              </div>
            </div>

            {/* Additional Notes Section (separate from pages) */}
            <div className="space-y-2 pt-6 border-t border-gray-700">
              <label className="text-sm font-medium text-white">Additional Notes</label>
              <p className="text-xs text-gray-400 mb-2">Quick notes, ideas, or follow-up items (not part of the main paper)</p>
              <textarea
                value={selectedNote?.notes || ''}
                onChange={(e) => setSelectedNote(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="• Ideas for future research
• Questions that arose during the study
• Unexpected observations
• Personal reflections
• Follow-up tasks"
                rows={6}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-800 border-b border-gray-700">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-white uppercase tracking-wide">
              {noteId ? 'Edit Research' : 'New Research Entry'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-700 rounded-lg">
              <span className="text-xs text-gray-400 uppercase tracking-wide">Completion</span>
              <div className="flex gap-1">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={`w-1.5 h-1.5 rounded-full ${
                      getSectionCompletion(section.id)
                        ? 'bg-green-500'
                        : 'bg-gray-600'
                    }`}
                    title={section.label}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline uppercase text-xs tracking-wide">Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedNote.title.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors uppercase text-xs tracking-wide font-semibold"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Desktop (30% width) - Collapsible */}
        <aside 
          className={`hidden md:flex bg-gray-800 border-r border-gray-700 overflow-y-auto flex-col transition-all duration-300 ${
            isSidebarOpen ? 'w-[30%]' : 'w-0'
          }`}
        >
          <div className={`p-4 ${isSidebarOpen ? 'block' : 'hidden'}`}>
            {/* Completion Box */}
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-white uppercase text-xs tracking-wide">Completion</h3>
              </div>
              <div className="space-y-2">
                {sections.map((section) => {
                  const isComplete = getSectionCompletion(section.id);
                  return (
                    <div key={section.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 uppercase text-xs">{section.label}</span>
                      <span className={`text-xs uppercase tracking-wide ${isComplete ? 'text-green-500' : 'text-gray-500'}`}>
                        {isComplete ? '✓' : '○'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-start gap-3 px-4 py-3 rounded transition-all ${
                      isActive
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-left">
                      <div className="font-medium uppercase text-xs tracking-wide">
                        {section.label}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 normal-case">
                        {section.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-gray-700 hover:bg-orange-500 text-white p-2 rounded-r-lg shadow-lg transition-all duration-300"
          style={{ 
            left: isSidebarOpen ? '30%' : '0',
            transform: 'translateY(-50%)'
          }}
          title={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        >
          {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {/* Mobile Section Selector */}
        <div className="md:hidden w-full p-4 bg-gray-800 border-b border-gray-700">
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded text-white font-medium focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content Area - Responsive Width */}
        <main 
          className={`flex-1 bg-gray-800 overflow-y-auto transition-all duration-300 ${
            isSidebarOpen ? 'md:w-[70%]' : 'w-full'
          }`}
        >
          <div className="h-full p-8">
            {/* Section Header */}
            <div className="mb-6 pb-4 border-b border-gray-700">
              {sections.map((section) => {
                if (section.id === activeSection) {
                  const Icon = section.icon;
                  return (
                    <div key={section.id} className="flex items-center gap-3">
                      <div className="p-2 bg-gray-700 rounded-lg">
                        <Icon className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-white uppercase tracking-wide">
                          {section.label}
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">{section.description}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
            </div>

            {/* Section Content - Full Width */}
            <div className="w-full">
              {renderSectionContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResearchFormPage;
