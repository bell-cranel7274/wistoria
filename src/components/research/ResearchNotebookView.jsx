import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Clock, Plus, X, Search, Edit, Trash2, ArrowLeft, Smartphone, Filter, BookOpen, FileText, Calendar, Star, Eye, LayoutGrid, List, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { RESEARCH_CATEGORIES } from '../../utils/constants';
import { TaskStatus } from '../../types/task';
import AIAssistant from './AIAssistant';

export const ResearchNotebookView = () => {
  const { notes, addNote, updateNote, deleteNote } = useTaskContext();  const [selectedNote, setSelectedNote] = useState({
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
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(0); // Book page navigation
  const [showAIAssistant, setShowAIAssistant] = useState(false); // AI Assistant toggle
  const [isAIMinimized, setIsAIMinimized] = useState(true); // AI Assistant minimized state
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [debugMessage, setDebugMessage] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const RESEARCH_STATUSES = [
    'in-progress',
    'completed',
    'pending',
    'archived'
  ];
  // Add error handling
  const [error, setError] = useState(null);

  // Book page structure for the modal
  const bookPages = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      leftContent: 'basic-fields',
      rightContent: 'project-category'
    },
    {
      id: 'research-details', 
      title: 'Research Details',
      leftContent: 'methodology-sources',
      rightContent: 'key-findings'
    },
    {
      id: 'notes-content',
      title: 'Notes & Content', 
      leftContent: 'additional-notes',
      rightContent: 'main-content'
    }
  ];

  // Page navigation functions
  const nextPage = () => {
    if (currentPage < bookPages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageIndex) => {
    if (pageIndex >= 0 && pageIndex < bookPages.length) {
      setCurrentPage(pageIndex);
    }
  };

  // Add useEffect to check if components are mounting
  useEffect(() => {
    console.log('ResearchNotebookView mounted');
    console.log('Notes:', notes);
  }, [notes]);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showQRModal) {
      const url = generateMobileURL();
      if (!url) {
        setDebugMessage('Failed to generate URL');
        return;
      }

      QRCode.toDataURL(url, {
        width: 256,
        margin: 2,
        errorCorrectionLevel: 'H'
      })
      .then(url => {
        console.log('QR Code generated successfully');
        setQrCodeUrl(url);
      })
      .catch(err => {
        console.error('QR Code generation error:', err);
        setDebugMessage('Error generating QR code');
      });
    }
  }, [showQRModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-xl font-bold">Loading Research Notebook...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 text-foreground">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-red-500">Error: {error.message}</h1>
        </div>
      </div>
    );
  }

  // Function to generate a reference number
  function generateReferenceNumber() {
    const prefix = 'RSH';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  }
  // Handle form submission for new research note
  const handleAddNote = (noteData) => {
    try {
      const noteToAdd = {
        ...noteData,
        id: Date.now().toString(),
        type: 'research',
        referenceNumber: generateReferenceNumber(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Set default values for empty fields
        title: noteData.title || 'Untitled Research',
        content: noteData.content || '',
        project: noteData.project || '',
        methodology: noteData.methodology || '',
        sources: noteData.sources || '',
        keyFindings: noteData.keyFindings || '',
        notes: noteData.notes || '',
        notesPages: noteData.notesPages || [''],
      };

      addNote(noteToAdd);
      setIsAddingNote(false);
    } catch (error) {
      console.error('Error adding research note:', error);
      alert('Failed to add research note. Please try again.');
    }
  };

  // Add this function after generateReferenceNumber
  const handleDeleteNote = (noteId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this research note?')) {
      deleteNote(noteId);
    }
  };

  // Filter research notes
  const researchNotes = notes.filter(note => note.type === 'research');
  
  const filteredNotes = researchNotes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || note.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Add stats calculations
  const totalNotes = researchNotes.length;
  const completedNotes = researchNotes.filter(note => note.status === 'completed').length;
  const inProgressNotes = researchNotes.filter(note => note.status === 'in-progress').length;
  const pendingNotes = researchNotes.filter(note => note.status === 'pending').length;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in-progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'archived': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };
  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'academic': return <BookOpen className="w-4 h-4" />;
      case 'technical': return <FileText className="w-4 h-4" />;
      case 'business': return <Star className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const generateMobileURL = () => {
    try {
      const sessionId = Date.now().toString();
      // Using your specific IP address
      const baseUrl = 'http://192.168.1.10:5174';
      const url = `${baseUrl}/mobile-entry/${sessionId}`;
      console.log('Generated URL:', url);
      return url;
    } catch (error) {
      console.error('Error generating URL:', error);      return null;
    }
  };

  // Render functions for different page content
  const renderPageContent = (contentType) => {
    switch (contentType) {
      case 'basic-fields':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Research Title</label>
              <input
                type="text"
                placeholder="Enter your research title..."
                value={selectedNote?.title || ''}
                onChange={(e) => setSelectedNote(prev => ({ ...prev, title: e.target.value }))}
                className="w-full text-lg font-semibold bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Reference Number</label>
              <div className="bg-muted/20 border border-border rounded-lg p-3 font-mono text-sm text-muted-foreground">
                {generateReferenceNumber()}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Date Created</label>
              <div className="bg-muted/20 border border-border rounded-lg p-3 text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        );

      case 'project-category':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Project Name</label>
              <input
                type="text"
                placeholder="Enter project name"
                value={selectedNote?.project || ''}
                onChange={(e) => setSelectedNote(prev => ({ ...prev, project: e.target.value }))}
                className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Category</label>
              <select
                value={selectedNote?.category || ''}
                onChange={(e) => setSelectedNote(prev => ({ ...prev, category: e.target.value }))}
                className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
              >
                <option value="" disabled>Select Category</option>
                {RESEARCH_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Status</label>
              <select
                value={selectedNote?.status || 'in-progress'}
                onChange={(e) => setSelectedNote(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
              >
                {RESEARCH_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 'methodology-sources':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Methodology</label>
              <textarea
                value={selectedNote?.methodology || ''}
                onChange={(e) => setSelectedNote(prev => ({ ...prev, methodology: e.target.value }))}
                placeholder="Describe your research methodology and approach..."
                className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 h-32 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Sources & References</label>
              <textarea
                value={selectedNote?.sources || ''}
                onChange={(e) => setSelectedNote(prev => ({ ...prev, sources: e.target.value }))}
                placeholder="List your sources, references, and citations..."
                className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 h-32 resize-none"
              />
            </div>
          </div>
        );

      case 'key-findings':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Key Findings</label>
              <textarea
                value={selectedNote?.keyFindings || ''}
                onChange={(e) => setSelectedNote(prev => ({ ...prev, keyFindings: e.target.value }))}
                placeholder="Summarize your key findings and discoveries..."
                className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 h-40 resize-none"
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-primary mb-2">Research Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Be specific and measurable in your findings</li>
                <li>• Include statistical data when available</li>
                <li>• Note any limitations or constraints</li>
                <li>• Consider implications for future research</li>
              </ul>
            </div>
          </div>
        );

      case 'additional-notes':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Additional Notes</label>
              <textarea
                value={selectedNote?.notes || ''}
                onChange={(e) => setSelectedNote(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes, thoughts, or observations..."
                className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 h-48 resize-none"
              />
            </div>

            <div className="bg-muted/10 border border-border rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Progress Tracking</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Started:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Modified:</span>
                  <span>{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'main-content':
        return (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Main Research Content</label>
            </div>
            <div className="flex-1 relative overflow-hidden">
              {/* Grid Background */}
              <div 
                className="absolute inset-0 opacity-20" 
                style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Text Area */}
              <textarea
                value={selectedNote?.content || ''}
                onChange={(e) => setSelectedNote(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your detailed research content here...

You can include:
• Detailed observations and data
• Analysis and interpretations  
• Hypotheses and theories
• Questions for further research
• Personal insights and thoughts
• Conclusions and implications

This is your main research documentation space."
                className="w-full h-full p-4 bg-transparent resize-none focus:outline-none relative z-10 font-mono text-sm leading-6"
                style={{
                  lineHeight: '24px',
                }}
              />
            </div>
          </div>
        );

      default:
        return <div className="text-center text-muted-foreground">Content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 font-['Monorama']">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-3 hover:bg-accent/10 rounded-full transition-colors duration-200 border border-border/50"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Research Notebook
              </h1>
              <p className="text-muted-foreground mt-1">Organize your research and discoveries</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                console.log('Opening QR Modal');
                setDebugMessage('Opening QR Modal');
                setShowQRModal(true);
              }}
              className="px-4 py-2 bg-secondary/80 backdrop-blur-sm text-secondary-foreground rounded-lg hover:bg-secondary/90 flex items-center gap-2 transition-all duration-200 border border-border/50"
            >
              <Smartphone className="w-4 h-4" />
              Mobile Entry
            </button>
            <button
              onClick={() => {
                setShowAIAssistant(true);
                setIsAIMinimized(false);
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 transition-all duration-200 shadow-lg shadow-purple-500/20"
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </button>
            <button
              onClick={() => setIsAddingNote(true)}
              className="px-6 py-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/70 flex items-center gap-2 transition-all duration-200 shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              New Research Entry
            </button>
          </div>
        </div>        {/* Enhanced Stats Dashboard with Book Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/30" />
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalNotes}</p>
                <p className="text-sm text-muted-foreground font-medium">Total Research</p>
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-px bg-blue-500/20" />
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500/30" />
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <BookOpen className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedNotes}</p>
                <p className="text-sm text-muted-foreground font-medium">Completed</p>
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-px bg-green-500/20" />
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500/30" />
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{inProgressNotes}</p>
                <p className="text-sm text-muted-foreground font-medium">In Progress</p>
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-px bg-amber-500/20" />
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-500/30" />
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <Calendar className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingNotes}</p>
                <p className="text-sm text-muted-foreground font-medium">Pending</p>
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-px bg-yellow-500/20" />
          </div>
        </div>{/* Enhanced Search and Filters with Book Style */}
        <div className="bg-card/30 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-sm relative overflow-hidden">
          {/* Book texture background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
          
          {/* Book binding decoration */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-primary/20 via-primary/10 to-transparent" />
          <div className="absolute left-1 top-4 bottom-4 w-px bg-primary/30" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Research Library</h3>
                <p className="text-sm text-muted-foreground">Search and filter your research collection</p>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search research notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all duration-200"
                />
              </div>
              
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="pl-10 pr-8 py-3 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-primary/50 appearance-none min-w-[150px]"
                  >
                    <option value="all">All Categories</option>
                    {RESEARCH_CATEGORIES?.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-background/50 border border-border/50 rounded-lg focus:outline-none focus:border-primary/50 appearance-none min-w-[120px]"
                >
                  <option value="all">All Status</option>
                  {RESEARCH_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
                
                <div className="flex border border-border/50 rounded-lg overflow-hidden bg-background/50">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 transition-colors duration-200 ${
                      viewMode === 'grid' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent/10'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 transition-colors duration-200 ${
                      viewMode === 'list' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-accent/10'
                    }`}
                    title="List View"
                  >                  <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>        {/* Enhanced Research Notes Display */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-8 relative">
              {/* Book Stack Illustration */}
              <div className="flex justify-center items-end gap-2 mb-6">
                <div className="w-12 h-16 bg-gradient-to-br from-primary/60 to-primary/40 rounded-md transform rotate-3 shadow-lg">
                  <div className="absolute left-1 top-2 bottom-2 w-px bg-primary-foreground/30" />
                </div>
                <div className="w-12 h-20 bg-gradient-to-br from-primary/80 to-primary/60 rounded-md shadow-lg">
                  <div className="absolute left-1 top-2 bottom-2 w-px bg-primary-foreground/30" />
                </div>
                <div className="w-12 h-18 bg-gradient-to-br from-primary/70 to-primary/50 rounded-md transform -rotate-2 shadow-lg">
                  <div className="absolute left-1 top-2 bottom-2 w-px bg-primary-foreground/30" />
                </div>
              </div>
              
              <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Research Notes Found</h3>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                {searchQuery ? 'Try adjusting your search or filters to find your research notes' : 'Your research library is empty. Create your first research note to start building your knowledge collection'}
              </p>
            </div>
            {!searchQuery && (
              <button
                onClick={() => setIsAddingNote(true)}
                className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg shadow-primary/20 flex items-center gap-3 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">Create First Research Note</span>
              </button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
              : "space-y-4"
          }>            {filteredNotes.map(note => (
              viewMode === 'grid' ? (
                <Card 
                  key={note.id}
                  className="group relative overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm"
                  onClick={() => navigate(`/research/book/${note.id}`)}
                >
                  {/* Enhanced Book Cover Design */}
                  <div className="h-48 relative bg-gradient-to-br from-primary/90 via-primary to-primary/80 overflow-hidden">
                    {/* Book texture background */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
                    
                    {/* Book spine decoration */}
                    <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-primary-foreground/20 to-transparent" />
                    <div className="absolute right-0 top-0 w-1 h-full bg-gradient-to-b from-black/20 to-transparent" />
                    
                    {/* Book binding effect */}
                    <div className="absolute left-2 top-4 bottom-4 w-px bg-primary-foreground/30" />
                    <div className="absolute left-4 top-6 bottom-6 w-px bg-primary-foreground/20" />
                    
                    {/* Book spine with title */}
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <div className="text-center">
                        <h3 className="text-primary-foreground font-bold text-sm line-clamp-2 mb-2">
                          {note.title}
                        </h3>
                        <div className="w-12 h-px bg-primary-foreground/40 mx-auto mb-1" />
                        <p className="text-primary-foreground/80 text-xs uppercase tracking-wider">
                          Research
                        </p>
                      </div>
                    </div>
                    
                    {/* Category badge */}
                    <div className="absolute top-3 left-3 p-2 bg-primary-foreground/15 rounded-lg backdrop-blur-sm border border-primary-foreground/20">
                      {getCategoryIcon(note.category)}
                    </div>
                    
                    {/* Page corners decoration */}
                    <div className="absolute top-0 right-0 w-4 h-4 bg-primary-foreground/10 border-l border-b border-primary-foreground/20" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 bg-black/10 border-r border-t border-black/20" />
                    
                    {/* Action buttons */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNote(note);
                          setIsEditingNote(true);
                        }}
                        className="p-1.5 bg-background/90 rounded-md hover:bg-background transition-colors duration-200 shadow-lg"
                        title="Edit Research"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteNote(note.id, e)}
                        className="p-1.5 bg-background/90 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors duration-200 shadow-lg"
                        title="Delete Research"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {/* Book pages effect */}
                    <div className="absolute bottom-0 right-1 w-full h-1 bg-gradient-to-r from-transparent via-primary-foreground/20 to-primary-foreground/30" />
                    <div className="absolute bottom-1 right-2 w-[calc(100%-8px)] h-px bg-primary-foreground/20" />
                  </div>
                  
                  {/* Enhanced Card Content with Book Pages Effect */}
                  <div className="relative bg-background/95 border-t border-border/30">
                    {/* Page shadow effect */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                    
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                          {note.referenceNumber}
                        </span>
                        <div className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(note.status)}`}>
                          {note.status.charAt(0).toUpperCase() + note.status.slice(1).replace('-', ' ')}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground line-clamp-1 flex items-center gap-2">
                          <div className="w-1 h-4 bg-primary rounded-full" />
                          {note.project || 'No Project'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(note.createdAt).toLocaleDateString()}
                          <span className="text-muted-foreground/50">•</span>
                          <BookOpen className="w-3 h-3" />
                          <span>Research Note</span>
                        </div>
                      </div>
                      
                      {note.keyFindings && (
                        <div className="bg-muted/10 border border-border/30 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {note.keyFindings}
                          </p>
                        </div>
                      )}
                      
                      {/* Book pages indicator */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/20">
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-primary/60 rounded-full" />
                          <div className="w-1 h-1 bg-primary/40 rounded-full" />
                          <div className="w-1 h-1 bg-primary/20 rounded-full" />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {note.category || 'General'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>              ) : (
                // Enhanced List View with Book Style
                <Card 
                  key={note.id}
                  className="group cursor-pointer hover:shadow-md transition-all duration-200 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden"
                  onClick={() => navigate(`/research/book/${note.id}`)}
                >
                  <div className="p-4 flex items-center gap-4 relative">
                    {/* Book spine decoration */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/80 to-primary/60" />
                    
                    <div className="flex-shrink-0">
                      <div className="w-16 h-20 bg-gradient-to-br from-primary/90 to-primary/70 rounded-md flex flex-col items-center justify-center relative overflow-hidden shadow-lg">
                        {/* Book texture */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2210%22%20cy%3D%2210%22%20r%3D%221%22/%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
                        
                        {/* Book binding lines */}
                        <div className="absolute left-1 top-2 bottom-2 w-px bg-primary-foreground/30" />
                        <div className="absolute left-2 top-3 bottom-3 w-px bg-primary-foreground/20" />
                        
                        {/* Category icon */}
                        <div className="relative z-10 text-primary-foreground">
                          {getCategoryIcon(note.category)}
                        </div>
                        
                        {/* Page corners */}
                        <div className="absolute top-0 right-0 w-2 h-2 bg-primary-foreground/20 border-l border-b border-primary-foreground/30" />
                        <div className="absolute bottom-0 left-0 w-2 h-2 bg-black/20 border-r border-t border-black/30" />
                        
                        {/* Page indicator */}
                        <div className="absolute bottom-1 right-1 w-3 h-px bg-primary-foreground/40" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="w-1 h-4 bg-primary rounded-full" />
                            <h3 className="font-semibold text-foreground line-clamp-1">{note.title}</h3>
                          </div>
                          
                          <div className="bg-muted/20 border border-border/30 rounded-lg p-2">
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {note.project || 'No Project'}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="font-mono bg-muted/30 px-2 py-1 rounded">
                              {note.referenceNumber}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              Research
                            </span>
                          </div>
                          
                          {/* Key findings preview */}
                          {note.keyFindings && (
                            <div className="bg-primary/5 border border-primary/20 rounded p-2 mt-2">
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                <span className="font-medium">Key Findings:</span> {note.keyFindings}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(note.status)}`}>
                            {note.status.charAt(0).toUpperCase() + note.status.slice(1).replace('-', ' ')}
                          </div>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedNote(note);
                                setIsEditingNote(true);
                              }}
                              className="p-2 hover:bg-accent/10 rounded-md transition-colors duration-200"
                              title="Edit Research"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteNote(note.id, e)}
                              className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors duration-200"
                              title="Delete Research"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Page separator line */}
                      <div className="mt-3 pt-2 border-t border-border/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-primary/60 rounded-full" />
                            <div className="w-1 h-1 bg-primary/40 rounded-full" />
                            <div className="w-1 h-1 bg-primary/20 rounded-full" />
                          </div>
                          <span className="text-xs text-muted-foreground font-mono">
                            {note.category || 'General'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            ))}
          </div>
        )}

        {/* Add/Edit Note Modal */}
        {/* Similar to NotesView modal but with research-specific fields */}
        {/* ... Modal implementation ... */}        {isAddingNote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            {/* Book-Style Modal */}
            <div className="bg-card rounded-xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl border border-border/20 relative">
              {/* Modal Header with Book Spine Design */}
              <div className="flex justify-between items-center p-6 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Research Notebook</h2>
                    <p className="text-sm text-muted-foreground">
                      {bookPages[currentPage]?.title} - Page {currentPage + 1} of {bookPages.length}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsAddingNote(false);
                    setCurrentPage(0);
                  }}
                  className="p-2 hover:bg-accent/10 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Page Navigation Indicators */}
              <div className="px-6 py-3 border-b border-border/50 bg-background/50">
                <div className="flex items-center justify-center gap-2">
                  {bookPages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToPage(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentPage 
                          ? 'bg-primary scale-110' 
                          : 'bg-muted hover:bg-muted-foreground/20'
                      }`}
                      title={`Go to page ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Book Pages Content */}
              <div className="flex-1 flex overflow-hidden relative">
                {/* Page Turn Shadow Effect */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
                </div>

                {/* Left Page */}
                <div className="w-1/2 bg-card/50 backdrop-blur-sm border-r border-border/50 relative">
                  <div className="p-8 h-full overflow-y-auto scrollbar-hide">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        Left Page Content
                      </h3>
                      <div className="h-px bg-gradient-to-r from-primary/50 to-transparent mb-6" />
                    </div>
                    {renderPageContent(bookPages[currentPage]?.leftContent)}
                  </div>
                  
                  {/* Left page corner decoration */}
                  <div className="absolute bottom-4 left-4 text-xs text-muted-foreground font-mono">
                    L-{currentPage + 1}
                  </div>
                </div>

                {/* Right Page */}
                <div className="w-1/2 bg-background/30 backdrop-blur-sm relative">
                  <div className="p-8 h-full overflow-y-auto scrollbar-hide">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-secondary rounded-full" />
                        Right Page Content
                      </h3>
                      <div className="h-px bg-gradient-to-l from-secondary/50 to-transparent mb-6" />
                    </div>
                    {renderPageContent(bookPages[currentPage]?.rightContent)}
                  </div>
                  
                  {/* Right page corner decoration */}
                  <div className="absolute bottom-4 right-4 text-xs text-muted-foreground font-mono">
                    R-{currentPage + 1}
                  </div>
                </div>

                {/* Page Navigation Buttons */}
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 z-10 ${
                    currentPage === 0 
                      ? 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50' 
                      : 'bg-card hover:bg-card/80 text-foreground hover:shadow-xl hover:scale-110'
                  }`}
                  title="Previous Page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={nextPage}
                  disabled={currentPage === bookPages.length - 1}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 z-10 ${
                    currentPage === bookPages.length - 1 
                      ? 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50' 
                      : 'bg-card hover:bg-card/80 text-foreground hover:shadow-xl hover:scale-110'
                  }`}
                  title="Next Page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Book Footer with Page Info and Actions */}
              <div className="p-6 border-t border-border bg-card/50 backdrop-blur-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Auto-saved • Last modified: {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    Page {currentPage + 1} of {bookPages.length}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Quick page navigation */}
                  <div className="flex gap-1">
                    {bookPages.map((page, index) => (
                      <button
                        key={index}
                        onClick={() => goToPage(index)}
                        className={`px-2 py-1 text-xs rounded transition-all duration-200 ${
                          index === currentPage 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                        title={page.title}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  <div className="w-px h-6 bg-border" />
                  
                  <button
                    onClick={() => {
                      setIsAddingNote(false);
                      setCurrentPage(0);
                      setSelectedNote({
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
                    }}
                    className="px-6 py-2 text-sm border border-border rounded-lg hover:bg-accent/10 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleAddNote(selectedNote);
                      setCurrentPage(0);
                      setSelectedNote({
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
                    }}
                    className="px-6 py-2 text-sm bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg shadow-primary/20"
                  >
                    Save Research Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}        {/* Edit Note Modal */}
        {isEditingNote && selectedNote && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            {/* Book-Style Edit Modal */}
            <div className="bg-card rounded-xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl border border-border/20 relative">
              {/* Modal Header with Book Spine Design */}
              <div className="flex justify-between items-center p-6 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Edit Research Notebook</h2>
                    <p className="text-sm text-muted-foreground">
                      {bookPages[currentPage]?.title} - Page {currentPage + 1} of {bookPages.length}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsEditingNote(false);
                    setSelectedNote(null);
                    setCurrentPage(0);
                  }}
                  className="p-2 hover:bg-accent/10 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Page Navigation Indicators */}
              <div className="px-6 py-3 border-b border-border/50 bg-background/50">
                <div className="flex items-center justify-center gap-2">
                  {bookPages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToPage(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentPage 
                          ? 'bg-primary scale-110' 
                          : 'bg-muted hover:bg-muted-foreground/20'
                      }`}
                      title={`Go to page ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Book Pages Content */}
              <div className="flex-1 flex overflow-hidden relative">
                {/* Page Turn Shadow Effect */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-1/2 top-0 w-px h-full bg-gradient-to-b from-transparent via-border to-transparent" />
                </div>

                {/* Left Page */}
                <div className="w-1/2 bg-card/50 backdrop-blur-sm border-r border-border/50 relative">
                  <div className="p-8 h-full overflow-y-auto scrollbar-hide">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        Left Page Content
                      </h3>
                      <div className="h-px bg-gradient-to-r from-primary/50 to-transparent mb-6" />
                    </div>
                    {renderPageContent(bookPages[currentPage]?.leftContent)}
                  </div>
                  
                  {/* Left page corner decoration */}
                  <div className="absolute bottom-4 left-4 text-xs text-muted-foreground font-mono">
                    L-{currentPage + 1}
                  </div>
                </div>

                {/* Right Page */}
                <div className="w-1/2 bg-background/30 backdrop-blur-sm relative">
                  <div className="p-8 h-full overflow-y-auto scrollbar-hide">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-secondary rounded-full" />
                        Right Page Content
                      </h3>
                      <div className="h-px bg-gradient-to-l from-secondary/50 to-transparent mb-6" />
                    </div>
                    {renderPageContent(bookPages[currentPage]?.rightContent)}
                  </div>
                  
                  {/* Right page corner decoration */}
                  <div className="absolute bottom-4 right-4 text-xs text-muted-foreground font-mono">
                    R-{currentPage + 1}
                  </div>
                </div>

                {/* Page Navigation Buttons */}
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className={`absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 z-10 ${
                    currentPage === 0 
                      ? 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50' 
                      : 'bg-card hover:bg-card/80 text-foreground hover:shadow-xl hover:scale-110'
                  }`}
                  title="Previous Page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={nextPage}
                  disabled={currentPage === bookPages.length - 1}
                  className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full shadow-lg transition-all duration-200 z-10 ${
                    currentPage === bookPages.length - 1 
                      ? 'bg-muted/50 text-muted-foreground cursor-not-allowed opacity-50' 
                      : 'bg-card hover:bg-card/80 text-foreground hover:shadow-xl hover:scale-110'
                  }`}
                  title="Next Page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Book Footer with Page Info and Actions */}
              <div className="p-6 border-t border-border bg-card/50 backdrop-blur-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-xs text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Auto-saved • Last modified: {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    Page {currentPage + 1} of {bookPages.length}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Quick page navigation */}
                  <div className="flex gap-1">
                    {bookPages.map((page, index) => (
                      <button
                        key={index}
                        onClick={() => goToPage(index)}
                        className={`px-2 py-1 text-xs rounded transition-all duration-200 ${
                          index === currentPage 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                        }`}
                        title={page.title}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  <div className="w-px h-6 bg-border" />
                  
                  <button
                    onClick={() => {
                      setIsEditingNote(false);
                      setSelectedNote(null);
                      setCurrentPage(0);
                    }}
                    className="px-6 py-2 text-sm border border-border rounded-lg hover:bg-accent/10 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateNote({
                        ...selectedNote,
                        updatedAt: new Date().toISOString(),
                      });
                      setIsEditingNote(false);
                      setSelectedNote(null);
                      setCurrentPage(0);
                    }}
                    className="px-6 py-2 text-sm bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-lg hover:from-primary/90 hover:to-primary/70 transition-all duration-200 shadow-lg shadow-primary/20"
                  >
                    Update Research Note
                  </button>
                </div>
              </div>
            </div>
          </div>        )}

        {showQRModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Mobile Entry</h2>
                <button 
                  onClick={() => {
                    setShowQRModal(false);
                    setQrCodeUrl('');
                    setDebugMessage('');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-center bg-white p-4 rounded-lg min-h-[256px] items-center">
                  {!qrCodeUrl && !debugMessage && (
                    <div className="text-sm text-muted-foreground">Generating QR Code...</div>
                  )}
                  {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64" />}
                  {debugMessage && (
                    <div className="text-sm text-red-500">{debugMessage}</div>
                  )}
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Scan this QR code with your mobile device to add a research note
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Make sure your phone is connected to the same WiFi network
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {debugMessage && (
          <div className="fixed bottom-4 right-4 bg-card p-2 rounded shadow">
            {debugMessage}
          </div>
        )}

        {/* AI Assistant Panel */}
        {showAIAssistant && (
          <>
            {isAIMinimized ? (
              <AIAssistant
                notes={researchNotes}
                isMinimized={true}
                onToggleSize={() => setIsAIMinimized(false)}
              />
            ) : (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-background rounded-xl w-full max-w-4xl h-[80vh] shadow-2xl">
                  <AIAssistant
                    notes={researchNotes}
                    isMinimized={false}
                    onToggleSize={() => {
                      setIsAIMinimized(true);
                      setShowAIAssistant(false);
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};