import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { Card } from '../ui/card';
import { Clock, Plus, X, Search, Edit, Trash2 } from 'lucide-react';

export const NotesView = () => {
  const { notes, addNote, updateNote, deleteNote } = useTaskContext();
  const [selectedNote, setSelectedNote] = useState(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to generate a reference number
  function generateReferenceNumber() {
    const firstPart = String(Math.floor(Math.random() * 10));
    const secondPart = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    const thirdPart = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `${firstPart}-${secondPart}-${thirdPart}`;
  }

  // Handle form submission for new note
  const handleAddNote = (noteData) => {
    try {
      const noteToAdd = {
        ...noteData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addNote(noteToAdd);
      setIsAddingNote(false);
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  // Handle form submission for editing note
  const handleEditNote = (noteData) => {
    try {
      const updatedNote = {
        ...selectedNote,
        ...noteData,
        updatedAt: new Date().toISOString()
      };
      
      updateNote(updatedNote);
      setIsEditingNote(false);
      setSelectedNote(null);
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
    }
  };

  // Add handleDeleteNote function
  const handleDeleteNote = (noteId, e) => {
    e.stopPropagation(); // Prevent triggering note selection when clicking delete
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        deleteNote(noteId);
        // If the deleted note is currently selected, clear the selection
        if (selectedNote?.id === noteId) {
          setSelectedNote(null);
          setIsEditingNote(false);
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note. Please try again.');
      }
    }
  };

  const NoteModal = ({ note, isEditing, onSave, onClose, isAddingNote }) => {
    const [localData, setLocalData] = useState(
      isEditing ? note : {
        title: '',
        project: '',
        content: '',
        referenceNumber: generateReferenceNumber(),
        date: new Date().toISOString().split('T')[0]
      }
    );

    useEffect(() => {
      if (isEditing && note) {
        setLocalData(note);
      }
    }, [isEditing, note]);

    const handleInputChange = (e, field) => {
      setLocalData(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    };

    const handleSave = (e) => {
      e.preventDefault();
      
      if (!localData.title.trim() || !localData.content.trim()) {
        alert('Please fill in both title and content');
        return;
      }

      onSave(localData);
    };

    const isEditMode = isEditing || isAddingNote;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
        <div className="fixed inset-x-4 top-[50%] translate-y-[-50%] max-w-4xl mx-auto bg-card rounded-lg shadow-lg">
          <div className="p-6">
            <div className="mb-6">
              <input
                type="text"
                value={localData.title}
                onChange={(e) => handleInputChange(e, 'title')}
                className="text-2xl font-bold mb-2 w-full bg-transparent border-b border-border focus:outline-none focus:border-primary"
                placeholder="NOTE TITLE"
                readOnly={!isEditing && !isAddingNote}
              />
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="text-sm text-muted-foreground">PROJECT NAME</label>
                  <input
                    type="text"
                    value={localData.project}
                    onChange={(e) => handleInputChange(e, 'project')}
                    className="w-full bg-transparent border-b border-border focus:outline-none"
                    placeholder="Enter project name"
                    readOnly={!isEditing && !isAddingNote}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">REFERENCE NUMBER</label>
                  <div className="text-sm font-mono">
                    {localData.referenceNumber}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">DATE</label>
                  <div className="text-sm">{new Date().toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <div className="relative border border-border rounded-lg overflow-hidden">
              <div 
                className="absolute inset-0" 
                style={{
                  backgroundImage: `
                    linear-gradient(to right, hsl(var(--muted)/0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, hsl(var(--muted)/0.03) 1px, transparent 1px)
                  `,
                  backgroundSize: '24px 24px',
                }}
              />

              <textarea
                value={localData.content}
                onChange={(e) => handleInputChange(e, 'content')}
                className="w-full h-[500px] p-4 bg-transparent resize-none focus:outline-none font-mono relative z-10"
                placeholder="Start your journey here..."
                style={{
                  lineHeight: '24px',
                  backgroundImage: 'linear-gradient(transparent 23px, hsl(var(--muted)/0.03) 24px)',
                  backgroundSize: '100% 24px',
                  backgroundAttachment: 'local',
                }}
                readOnly={!isEditing && !isAddingNote}
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent/10"
              >
                CANCEL
              </button>
              {isEditMode && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  {isEditing ? 'SAVE CHANGES' : 'SAVE NOTE'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">Notes</h1>
          <button
            onClick={() => setIsAddingNote(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Add Note
          </button>
        </div>

        {/* Add/Edit Note Modal */}
        {(isAddingNote || isEditingNote) && (
          <NoteModal
            note={selectedNote}
            isEditing={isEditingNote}
            isAddingNote={isAddingNote}
            onSave={isEditingNote ? handleEditNote : handleAddNote}
            onClose={() => {
              setIsAddingNote(false);
              setIsEditingNote(false);
              setSelectedNote(null);
            }}
          />
        )}

        {/* View Note Modal */}
        {selectedNote && !isEditingNote && (
          <NoteModal
            note={selectedNote}
            isEditing={false}
            isAddingNote={false}
            onClose={() => setSelectedNote(null)}
          />
        )}

        {/* Notes List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <Card 
              key={note.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{note.title}</h3>
                    <span className="text-xs text-muted-foreground">
                      Project: {note.project}
                    </span>
                    <br />
                    <span className="text-xs text-primary font-mono">
                      {note.referenceNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedNote(note);
                        setIsEditingNote(true);
                      }}
                      className="p-1 hover:bg-accent/10 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteNote(note.id, e)}
                      className="p-1 hover:bg-accent/10 rounded text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="h-px bg-border" />
                <div 
                  className="text-sm text-muted-foreground whitespace-pre-wrap break-words font-mono cursor-pointer"
                  onClick={() => setSelectedNote(note)}
                  style={{ 
                    maxHeight: '150px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: '6',
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {note.content}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {new Date(note.date).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesView; 