import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';

export const MobileEntryView = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { addNote } = useTaskContext();
  const [note, setNote] = useState({
    title: '',
    content: '',
    project: '',
    type: 'research',
    category: '',
    status: 'in-progress',
    methodology: '',
    sources: '',
    keyFindings: '',
  });

  const inputStyles = "w-full p-2 rounded-md border bg-card font-['Monorama'], 'Courier New', Courier, monospace";
  const textareaStyles = "w-full p-2 rounded-md border bg-card resize-none font-['Monorama'], 'Courier New', Courier, monospace";

  // Function to generate reference number
  const generateReferenceNumber = () => {
    const prefix = 'RSH';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!note.title || !note.content) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      const newNote = {
        ...note,
        id: Date.now().toString(),
        referenceNumber: generateReferenceNumber(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save directly to localStorage
      const savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
      savedNotes.push(newNote);
      localStorage.setItem('notes', JSON.stringify(savedNotes));

      alert('Research note added successfully!');
      navigate('/research');
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const debugLocalStorage = () => {
    const notes = localStorage.getItem('notes');
    console.log('Current notes in localStorage:', notes ? JSON.parse(notes) : 'No notes found');
  };

  return (
    <div className="min-h-screen bg-background p-4" style={{ fontFamily: "'Monorama', 'Courier New', Courier, monospace" }}>
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/research')}
            className="p-2 hover:bg-accent/10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold" style={{ fontFamily: "'Monorama', 'Courier New', Courier, monospace" }}>
            Add Research Note
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Research Title"
            value={note.title}
            onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
            className={`${inputStyles} h-10`}
            required
          />

          <input
            type="text"
            placeholder="Project Name"
            value={note.project}
            onChange={(e) => setNote(prev => ({ ...prev, project: e.target.value }))}
            className={`${inputStyles} h-10`}
          />

          <select
            value={note.category}
            onChange={(e) => setNote(prev => ({ ...prev, category: e.target.value }))}
            className={`${inputStyles} h-10`}
          >
            <option value="">Select Category</option>
            <option value="Technical">Technical</option>
            <option value="Scientific">Scientific</option>
            <option value="Market Research">Market Research</option>
            <option value="Literature Review">Literature Review</option>
            <option value="Case Study">Case Study</option>
            <option value="Experimental">Experimental</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={note.status}
            onChange={(e) => setNote(prev => ({ ...prev, status: e.target.value }))}
            className={`${inputStyles} h-10`}
          >
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="archived">Archived</option>
          </select>

          <textarea
            placeholder="Research Content"
            value={note.content}
            onChange={(e) => setNote(prev => ({ ...prev, content: e.target.value }))}
            className={`${textareaStyles} h-[200px]`}
            required
          />

          <textarea
            placeholder="Methodology (optional)"
            value={note.methodology}
            onChange={(e) => setNote(prev => ({ ...prev, methodology: e.target.value }))}
            className={`${textareaStyles} h-[100px]`}
          />

          <textarea
            placeholder="Sources/References (optional)"
            value={note.sources}
            onChange={(e) => setNote(prev => ({ ...prev, sources: e.target.value }))}
            className={`${textareaStyles} h-[100px]`}
          />

          <textarea
            placeholder="Key Findings (optional)"
            value={note.keyFindings}
            onChange={(e) => setNote(prev => ({ ...prev, keyFindings: e.target.value }))}
            className={`${textareaStyles} h-[100px]`}
          />

          <button
            type="submit"
            className="w-full py-3 bg-primary text-primary-foreground rounded-md flex items-center justify-center gap-2"
            style={{ fontFamily: "'Monorama', 'Courier New', Courier, monospace" }}
          >
            <Send className="w-4 h-4" />
            Submit Note
          </button>
        </form>
      </div>
    </div>
  );
}; 