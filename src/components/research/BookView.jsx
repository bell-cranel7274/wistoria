import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, Tag, FolderOpen, FileText, BookOpen, Lightbulb, FileCode, StickyNote, Info, Eye } from 'lucide-react';
import { useTaskContext } from '../../context/TaskContext';
import { RESEARCH_CATEGORIES } from '../../utils/constants';

export const BookView = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { notes, deleteNote } = useTaskContext();
  const [activeSection, setActiveSection] = useState('overview');

  const note = notes.find(n => n.id === bookId);

  useEffect(() => {
    if (!note) {
      navigate('/research');
    }
  }, [note, navigate]);

  if (!note) {
    return null;
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this research note?')) {
      deleteNote(note.id);
      navigate('/research');
    }
  };

  const handleEdit = () => {
    navigate(`/research/edit/${note.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/research')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">{note.title}</h1>
        <div className="bg-white rounded-lg p-6">
          <p>{note.description || 'No description'}</p>
        </div>
      </div>
    </div>
  );
};

export default BookView;
