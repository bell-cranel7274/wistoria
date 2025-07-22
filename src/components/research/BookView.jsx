import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, ChevronLeft, ChevronRight, FileUp, File, X, BookOpen, Edit3, Save, Clock } from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import { RESEARCH_CATEGORIES } from '../../utils/constants';
import { TaskStatus } from '../../types/task';

export const BookView = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { notes, updateNote, deleteNote } = useTaskContext();
  const [currentPage, setCurrentPage] = useState(0);
  const [currentNotePage, setCurrentNotePage] = useState(0);
  const [pdfs, setPdfs] = useState([]);
  const fileInputRef = useRef(null);

  const book = notes.find(note => note.id === bookId);

  // Use useEffect to handle initialization
  useEffect(() => {
    if (book) {
      // Ensure pdfs array exists
      if (!book.pdfs) {
        const updatedBook = { ...book, pdfs: [] };
        updateNote(updatedBook);
      }
      setPdfs(book.pdfs || []);
      
      // Handle notesPages initialization
      if (!book.notesPages) {
        const updatedBook = { ...book, notesPages: [''] };
        updateNote(updatedBook);
      }
    } else {
      navigate('/research');
    }
  }, [book, updateNote, navigate]);
  if (!book) return null;

  // Define book pages structure for dual-page layout
  const bookPages = [
    { 
      title: 'Research Overview', 
      leftContent: 'basic-info',
      rightContent: 'overview'
    },
    { 
      title: 'Methodology & Sources', 
      leftContent: 'methodology',
      rightContent: 'sources'
    },
    { 
      title: 'Findings & Analysis', 
      leftContent: 'key-findings',
      rightContent: 'analysis-notes'
    },
    { 
      title: 'Research Notes', 
      leftContent: 'notes-editor',
      rightContent: 'notes-preview'
    },
    { 
      title: 'Attachments & PDFs', 
      leftContent: 'pdf-manager',
      rightContent: 'pdf-viewer'
    }
  ];

  const handleFieldChange = (field, value) => {
    const updatedBook = { ...book, [field]: value };
    updateNote(updatedBook);
  };

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
    setCurrentPage(pageIndex);
  };

  // Content rendering function for different page types
  const renderPageContent = (contentType) => {
    switch (contentType) {
      case 'basic-info':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Research Title</label>
              <input
                type="text"
                value={book.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Reference Number</label>
              <input
                type="text"
                value={book.referenceNumber || ''}
                onChange={(e) => handleFieldChange('referenceNumber', e.target.value)}
                className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Category</label>
                <select
                  value={book.category || ''}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
                >
                  <option value="">Select Category</option>
                  {RESEARCH_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Status</label>
                <select
                  value={book.status || ''}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
                >
                  <option value="">Select Status</option>
                  {Object.values(TaskStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Project</label>
              <input
                type="text"
                value={book.project || ''}
                onChange={(e) => handleFieldChange('project', e.target.value)}
                placeholder="Associated project name..."
                className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200"
              />
            </div>
          </div>
        );

      case 'overview':
        return (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Research Overview</label>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-20" 
                style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }}
              />              <textarea
                value={book.overview || ''}
                onChange={(e) => handleFieldChange('overview', e.target.value)}
                placeholder="Describe your research overview, objectives, and main focus areas..."
                className="w-full h-full p-4 bg-transparent resize-none focus:outline-none relative z-10 font-mono text-sm leading-6"
                style={{ lineHeight: '24px' }}
              />
            </div>
          </div>
        );

      case 'methodology':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Research Methodology</label>
              <textarea
                value={book.methodology || ''}
                onChange={(e) => handleFieldChange('methodology', e.target.value)}
                placeholder="Describe your research methodology and approach..."
                className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 h-40 resize-none"
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-primary mb-2">Methodology Tips</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Define your research approach (qualitative, quantitative, mixed)</li>
                <li>• Specify data collection methods</li>
                <li>• Outline analysis techniques</li>
                <li>• Note any limitations or constraints</li>
              </ul>
            </div>
          </div>
        );

      case 'sources':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Sources & References</label>
              <textarea
                value={book.sources || ''}
                onChange={(e) => handleFieldChange('sources', e.target.value)}
                placeholder="List your sources, references, and citations..."
                className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 h-40 resize-none"
              />
            </div>

            <div className="bg-secondary/5 border border-secondary/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-secondary mb-2">Citation Guidelines</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use consistent citation format (APA, MLA, etc.)</li>
                <li>• Include DOI or URL when available</li>
                <li>• Note access dates for web sources</li>
                <li>• Organize by relevance or alphabetically</li>
              </ul>
            </div>
          </div>
        );

      case 'key-findings':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Key Findings</label>
              <textarea
                value={book.keyFindings || ''}
                onChange={(e) => handleFieldChange('keyFindings', e.target.value)}
                placeholder="Summarize your key findings and discoveries..."
                className="w-full bg-background/50 border border-border rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 h-48 resize-none"
              />
            </div>

            <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-600 mb-2">Key Findings Checklist</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• State findings clearly and concisely</li>
                <li>• Support with evidence or data</li>
                <li>• Note statistical significance if applicable</li>
                <li>• Highlight unexpected discoveries</li>
              </ul>
            </div>
          </div>
        );

      case 'analysis-notes':
        return (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Analysis & Insights</label>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-10" 
                style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px',
                }}
              />
              <textarea
                value={book.analysisNotes || ''}
                onChange={(e) => handleFieldChange('analysisNotes', e.target.value)}
                placeholder="Write your detailed analysis, interpretations, and insights here...

• Data interpretation
• Pattern recognition
• Correlation analysis
• Implications and significance
• Future research directions"
                className="w-full h-full p-4 bg-transparent resize-none focus:outline-none relative z-10 font-mono text-sm leading-5"
                style={{ lineHeight: '20px' }}
              />
            </div>
          </div>
        );

      case 'notes-editor':
        return (
          <div className="h-full flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">Research Notes</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentNotePage(Math.max(0, currentNotePage - 1))}
                  disabled={currentNotePage === 0}
                  className="p-1 hover:bg-accent/10 rounded disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground">
                  Page {currentNotePage + 1} of {book.notesPages?.length || 1}
                </span>
                <button
                  onClick={() => setCurrentNotePage(Math.min((book.notesPages?.length || 1) - 1, currentNotePage + 1))}
                  disabled={currentNotePage === (book.notesPages?.length || 1) - 1}
                  className="p-1 hover:bg-accent/10 rounded disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative overflow-hidden">
              <div 
                className="absolute inset-0 opacity-10" 
                style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }}
              />
              <textarea
                value={book.notesPages?.[currentNotePage] || ''}
                onChange={(e) => {
                  const updatedBook = { ...book };
                  if (!updatedBook.notesPages) updatedBook.notesPages = [''];
                  updatedBook.notesPages[currentNotePage] = e.target.value;
                  updateNote(updatedBook);
                }}
                placeholder="Take detailed research notes here..."
                className="w-full h-full p-4 bg-transparent resize-none focus:outline-none relative z-10 font-mono text-sm leading-6"
                style={{ lineHeight: '24px' }}
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={addNewNotePage}
                className="px-3 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Page
              </button>
              <button
                onClick={() => deleteNotePage(currentNotePage)}
                disabled={(book.notesPages?.length || 1) <= 1}
                className="px-3 py-1 text-xs bg-destructive/10 text-destructive rounded hover:bg-destructive/20 disabled:opacity-50"
              >
                Delete Page
              </button>
            </div>
          </div>
        );

      case 'notes-preview':
        return (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Notes Preview</label>
            </div>
            <div className="flex-1 bg-muted/10 border border-border/30 rounded-lg p-4 overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                {book.notesPages?.[currentNotePage] ? (
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {book.notesPages[currentNotePage]}
                  </pre>
                ) : (
                  <div className="text-center text-muted-foreground italic">
                    Start writing notes to see preview
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 text-xs text-muted-foreground space-y-1">
              <div>Words: {(book.notesPages?.[currentNotePage] || '').split(/\s+/).filter(w => w.length > 0).length}</div>
              <div>Characters: {(book.notesPages?.[currentNotePage] || '').length}</div>
            </div>
          </div>
        );

      case 'pdf-manager':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wide">PDF Attachments</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 flex items-center gap-1"
              >
                <FileUp className="w-3 h-3" />
                Upload PDF
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf"
                multiple
                className="hidden"
              />
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {pdfs?.map(pdf => (
                <div 
                  key={pdf.id}
                  className="bg-background/50 border border-border/50 p-3 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <File className="w-6 h-6 text-primary" />
                    <div>
                      <div className="font-medium text-sm">{pdf.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(pdf.uploadDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const pdfUrl = createPdfUrl(pdf.data);
                        if (pdfUrl) {
                          window.open(pdfUrl, '_blank');
                          setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
                        }
                      }}
                      className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20"
                    >
                      View
                    </button>
                    <button
                      onClick={() => removePdf(pdf.id)}
                      className="p-1 hover:bg-accent/10 rounded text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {(!pdfs || pdfs.length === 0) && (
              <div className="text-center text-muted-foreground py-8 border border-dashed border-border rounded-lg">
                <File className="w-12 h-12 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm">No PDFs attached yet</p>
                <p className="text-xs">Click "Upload PDF" to add documents</p>
              </div>
            )}
          </div>
        );

      case 'pdf-viewer':
        return (
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">PDF Viewer</label>
            </div>
            <div className="flex-1 bg-muted/10 border border-border/30 rounded-lg p-4 flex items-center justify-center">
              {pdfs && pdfs.length > 0 ? (
                <div className="text-center">
                  <File className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    {pdfs.length} PDF{pdfs.length > 1 ? 's' : ''} attached
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click "View" in the left panel to open PDFs
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <FileUp className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">No PDFs attached</p>
                  <p className="text-xs text-muted-foreground">
                    Upload PDFs to view them here
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return <div className="text-center text-muted-foreground">Content not found</div>;
    }
  };

  const addNewNotePage = () => {
    const updatedBook = { ...book };
    updatedBook.notesPages = [...(book.notesPages || []), ''];
    updateNote(updatedBook);
    setCurrentNotePage(updatedBook.notesPages.length - 1);
  };

  const deleteNotePage = (pageIndex) => {
    if (book.notesPages.length <= 1) return;
    if (window.confirm('Are you sure you want to delete this page?')) {
      const updatedBook = { ...book };
      updatedBook.notesPages = updatedBook.notesPages.filter((_, i) => i !== pageIndex);
      updateNote(updatedBook);
      setCurrentNotePage(Math.max(0, currentNotePage - 1));
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this research book?')) {
      deleteNote(bookId);
      navigate('/research');
    }
  };

  const handleFileUpload = async (event) => {
    try {
      const files = Array.from(event.target.files);
      
      // Check file size (e.g., limit to 10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          return;
        }
      }

      const updatedBook = { ...book };
      updatedBook.pdfs = updatedBook.pdfs || [];

      for (const file of files) {
        // Convert PDF to base64
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        });

        const newPdf = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          data: base64Data,
          uploadDate: new Date().toISOString()
        };

        updatedBook.pdfs.push(newPdf);
      }

      // Update both local state and context
      setPdfs(updatedBook.pdfs);
      await updateNote(updatedBook);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      console.log('PDFs updated successfully:', updatedBook.pdfs.length);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      alert('Failed to upload PDF. Please try again.');
    }
  };

  const removePdf = async (pdfId) => {
    try {
      if (window.confirm('Are you sure you want to remove this PDF?')) {
        const updatedBook = { ...book };
        updatedBook.pdfs = (updatedBook.pdfs || []).filter(pdf => pdf.id !== pdfId);
        
        // Update both local state and context
        setPdfs(updatedBook.pdfs);
        await updateNote(updatedBook);
        
        console.log('PDF removed successfully');
      }
    } catch (error) {
      console.error('Error removing PDF:', error);
      alert('Failed to remove PDF. Please try again.');
    }
  };

  // Add this function to create a blob URL for PDF viewing
  const createPdfUrl = (base64Data) => {
    try {
      // Remove the data URL prefix if it exists
      const pdfData = base64Data.split(',')[1] || base64Data;
      const byteCharacters = atob(pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating PDF URL:', error);
      return null;
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 font-['Monorama']">
      <div className="max-w-7xl mx-auto p-6">
        {/* Enhanced Header with Book Style */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/research')}
              className="p-3 hover:bg-accent/10 rounded-full transition-colors duration-200 border border-border/50"
              title="Back to Research Library"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {book.title}
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Research Book • {book.referenceNumber}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Clock className="w-3 h-3" />
              Last modified: {new Date(book.updatedAt || book.createdAt).toLocaleString()}
            </div>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-destructive/10 rounded-full text-destructive transition-colors duration-200"
              title="Delete Research Book"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Book-Style Interface */}
        <div className="bg-card rounded-xl w-full h-[85vh] flex flex-col shadow-2xl border border-border/20 relative overflow-hidden">
          {/* Book Header with Spine Design */}
          <div className="flex justify-between items-center p-6 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Research Book</h2>
                <p className="text-sm text-muted-foreground">
                  {bookPages[currentPage]?.title} - Page {currentPage + 1} of {bookPages.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted-foreground">
                Category: {book.category || 'Unassigned'}
              </div>
              <div className="w-px h-4 bg-border" />
              <div className="text-xs text-muted-foreground">
                Status: {book.status || 'Unknown'}
              </div>
            </div>
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
            </div>            {/* Left Page */}
            <div className="w-1/2 bg-card/50 backdrop-blur-sm border-r border-border/50 relative">
              <div className="p-8 h-full overflow-y-auto scrollbar-hide">
                {renderPageContent(bookPages[currentPage]?.leftContent)}
              </div>
              
              {/* Left page corner decoration */}
              <div className="absolute bottom-4 left-4 text-xs text-muted-foreground font-mono">
                L-{currentPage + 1}
              </div>
            </div>            {/* Right Page */}
            <div className="w-1/2 bg-background/30 backdrop-blur-sm relative">
              <div className="p-8 h-full overflow-y-auto scrollbar-hide">
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
                  <Edit3 className="w-3 h-3" />
                  Auto-saved • Research Book
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
                onClick={() => navigate('/research')}
                className="px-6 py-2 text-sm border border-border rounded-lg hover:bg-accent/10 transition-colors duration-200"
              >
                Close Book
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 