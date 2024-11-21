import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';

export const NoteDetailModal = ({ note, onClose }) => {
  const { updateNote, deleteNote } = useTaskContext();
  const [editedNote, setEditedNote] = useState({
    ...note,
    content: note.content || '',
    title: note.title || '',
    referenceNumber: note.referenceNumber || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    if (!editedNote.title.trim() || !editedNote.content.trim()) return;
    
    // Update the note with new content and timestamp
    const updatedNote = {
      ...editedNote,
      updatedAt: new Date().toISOString(),
      title: editedNote.title.trim(),
      content: editedNote.content.trim()
    };
    
    updateNote(updatedNote);
    // Update the local state to reflect changes immediately
    note.title = updatedNote.title;
    note.content = updatedNote.content;
    note.updatedAt = updatedNote.updatedAt;
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedNote({
      ...note,
      content: note.content || '',
      title: note.title || '',
      referenceNumber: note.referenceNumber || '',
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteNote(note.id);
    onClose();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      {showDeleteConfirm ? (
        <div className="bg-card rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Delete Note</h2>
          <p className="text-muted-foreground mb-6">
            Are you sure you want to delete "{note.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 border border-border rounded-md hover:bg-accent/10"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
          <div className="p-6 border-b border-border">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedNote.title}
                    onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
                    className="text-xl font-bold bg-transparent border-b border-border focus:outline-none focus:border-primary w-full"
                  />
                ) : (
                  <h2 className="text-xl font-bold">{note.title}</h2>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="text-primary font-mono">{note.referenceNumber}</span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Created: {formatDate(note.createdAt)}</span>
                    <span>•</span>
                    <span>Updated: {formatDate(note.updatedAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1.5 text-sm border border-border rounded hover:bg-accent/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-background relative overflow-hidden p-6">
            {isEditing ? (
              <textarea
                value={editedNote.content}
                onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
                className="w-full h-full p-4 bg-transparent resize-none focus:outline-none font-monorama"
                placeholder="Note content..."
              />
            ) : (
              <div className="w-full h-full p-4 whitespace-pre-wrap font-monorama">
                {note.content}
              </div>
            )}
            <div className="absolute inset-0 grid grid-cols-[repeat(40,1fr)] grid-rows-[repeat(40,1fr)] gap-4 pointer-events-none opacity-10">
              {Array.from({ length: 1600 }).map((_, i) => (
                <div key={i} className="border-[0.5px] border-border" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 