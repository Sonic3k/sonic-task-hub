import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Archive, Trash2, FileText, Lightbulb } from 'lucide-react';
import { 
  Note, 
  NoteFilters, 
  NoteStatus, 
  Priority,
  Category,
  PageResponse,
  PRIORITY_COLORS,
  NOTE_STATUS_COLORS,
  NOTE_ICONS
} from '../types';
import { noteApi, categoryApi, apiHelpers } from '../services/api';
import { NoteFormModal } from '../components/NoteFormModal';
import toast from 'react-hot-toast';

interface NoteStudioProps {
  userId: number;
}

export const NoteStudio: React.FC<NoteStudioProps> = ({ userId }) => {
  // State management
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  const [filters, setFilters] = useState<NoteFilters>({
    page: 0,
    size: 20,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });

  // Modals
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Load data functions
  useEffect(() => {
    loadNotes();
    loadCategories();
  }, [userId, filters]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await noteApi.getWithFilters(userId, filters);
      
      if (response.data.success && response.data.data) {
        const pageData = response.data.data;
        setNotes(pageData.content);
        setTotalElements(pageData.totalElements);
        setTotalPages(pageData.totalPages);
      }
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryApi.getAvailableForUser(userId);
      if (response.data.success && response.data.data) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Filter functions
  const updateFilters = (newFilters: Partial<NoteFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 0 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  // Note actions
  const handleArchiveNote = async (noteId: number) => {
    try {
      await noteApi.archive(userId, noteId);
      toast.success('Note archived!');
      loadNotes();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await noteApi.delete(userId, noteId);
      toast.success('Note deleted!');
      loadNotes();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleNoteSaved = () => {
    setShowNoteForm(false);
    setEditingNote(null);
    loadNotes();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                     style={{ backgroundColor: '#483b85' }}>
                  💭
                </div>
                Note Studio
              </h1>
              <p className="text-gray-600 mt-2">Capture ideas and thoughts for later brainstorming</p>
            </div>
            <button
              onClick={() => setShowNoteForm(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#483b85' }}
            >
              <Plus className="w-4 h-4" />
              New Note
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search notes..."
                value={filters.search || ''}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white"
                style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
              />
            </div>

            <select
              value={filters.status || ''}
              onChange={(e) => updateFilters({ status: e.target.value as NoteStatus || undefined })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-sm"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            >
              <option value="">All Status</option>
              <option value={NoteStatus.ACTIVE}>Active</option>
              <option value={NoteStatus.ARCHIVED}>Archived</option>
            </select>

            <select
              value={filters.priority || ''}
              onChange={(e) => updateFilters({ priority: e.target.value as Priority || undefined })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-sm"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            >
              <option value="">All Priorities</option>
              <option value={Priority.HIGH}>📌 High</option>
              <option value={Priority.MEDIUM}>📋 Medium</option>
              <option value={Priority.LOW}>📝 Low</option>
            </select>

            <select
              value={filters.categoryId || ''}
              onChange={(e) => updateFilters({ categoryId: e.target.value ? parseInt(e.target.value) : undefined })}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white text-sm"
              style={{ '--tw-ring-color': '#483b85' } as React.CSSProperties}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {notes.map((note) => (
                <div key={note.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[note.priority]}`}>
                        {NOTE_ICONS[note.priority]} {note.priority}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${NOTE_STATUS_COLORS[note.status]}`}>
                        {note.status}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Link
                      to={`/notes/${note.noteNumber}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                    >
                      #{note.noteNumber} {note.title}
                    </Link>
                    {note.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-4">
                        {note.description}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  {note.categoryName && (
                    <div className="mb-4">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: note.categoryColor }}
                      >
                        {note.categoryName}
                      </span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="text-xs text-gray-500 mb-4">
                    Created {formatDate(note.createdAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setEditingNote(note);
                        setShowNoteForm(true);
                      }}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Edit
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {note.status === NoteStatus.ACTIVE && (
                        <button
                          onClick={() => handleArchiveNote(note.id)}
                          className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Archive"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {notes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">💭</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
                <p className="text-gray-500 mb-4">Start capturing your ideas and thoughts</p>
                <button
                  onClick={() => setShowNoteForm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#483b85' }}
                >
                  <Plus className="w-4 h-4" />
                  Create Note
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {notes.length} of {totalElements} notes
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange((filters.page || 0) - 1)}
                    disabled={filters.page === 0}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = Math.max(0, Math.min(totalPages - 5, (filters.page || 0) - 2)) + i;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                          filters.page === page
                            ? 'text-white border-transparent'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        style={filters.page === page ? { backgroundColor: '#483b85' } : {}}
                      >
                        {page + 1}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange((filters.page || 0) + 1)}
                    disabled={filters.page === totalPages - 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showNoteForm && (
        <NoteFormModal
          userId={userId}
          categories={categories}
          note={editingNote}
          onClose={() => {
            setShowNoteForm(false);
            setEditingNote(null);
          }}
          onSave={handleNoteSaved}
        />
      )}
    </div>
  );
};