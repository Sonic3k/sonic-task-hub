import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Trash2, Archive, Tag, Hash, Lightbulb
} from 'lucide-react';
import { 
  Note, 
  Category,
  NoteStatus,
  Priority,
  PRIORITY_COLORS,
  NOTE_STATUS_COLORS,
  NOTE_ICONS
} from '../types';
import { noteApi, categoryApi, apiHelpers } from '../services/api';
import { NoteFormModal } from '../components/NoteFormModal';
import toast from 'react-hot-toast';

interface NoteDetailPageProps {
  userId: number;
}

export const NoteDetailPage: React.FC<NoteDetailPageProps> = ({ userId }) => {
  const { noteNumber } = useParams<{ noteNumber: string }>();
  const navigate = useNavigate();
  
  const [note, setNote] = useState<Note | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (noteNumber) {
      loadNote();
      loadCategories();
    }
  }, [noteNumber, userId]);

  const loadNote = async () => {
    try {
      setLoading(true);
      const response = await noteApi.getByNumber(userId, parseInt(noteNumber!));
      
      if (response.data.success && response.data.data) {
        setNote(response.data.data);
      }
    } catch (error) {
      toast.error('Note not found');
      navigate('/notes');
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

  const handleArchive = async () => {
    if (!note) return;
    
    try {
      await noteApi.archive(userId, note.id);
      toast.success('Note archived!');
      loadNote();
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleDelete = async () => {
    if (!note || !confirm('Are you sure you want to delete this note?')) return;
    
    try {
      await noteApi.delete(userId, note.id);
      toast.success('Note deleted!');
      navigate('/notes');
    } catch (error) {
      toast.error(apiHelpers.handleApiError(error));
    }
  };

  const handleNoteSaved = () => {
    setShowEditModal(false);
    loadNote();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Note not found</h2>
          <Link to="/notes" className="text-blue-600 hover:text-blue-700">
            ← Back to Notes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/notes"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">💭</span>
                <h1 className="text-2xl font-bold text-gray-900">
                  #{note.noteNumber} {note.title}
                </h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[note.priority]}`}>
                  {NOTE_ICONS[note.priority]} {note.priority}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${NOTE_STATUS_COLORS[note.status]}`}>
                  {note.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {note.status === NoteStatus.ACTIVE && (
                <button
                  onClick={handleArchive}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </button>
              )}
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {note.description ? (
                <div className="prose prose-lg max-w-none">
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {note.description}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Lightbulb className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No content added yet</p>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                  >
                    Add content to this note
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Note Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-400" />
                Note Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Priority</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[note.priority]}`}>
                      {NOTE_ICONS[note.priority]} {note.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${NOTE_STATUS_COLORS[note.status]}`}>
                      {note.status}
                    </span>
                  </div>
                </div>

                {note.categoryName && (
                  <div>
                    <label className="text-sm text-gray-600">Category</label>
                    <div className="mt-1">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: note.categoryColor }}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {note.categoryName}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm text-gray-600">Created</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {formatDate(note.createdAt)}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-600">Last Updated</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {formatDate(note.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* Ideas & Tips */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-purple-900 mb-1">Brainstorming Tips</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Expand on this idea when inspiration strikes</li>
                    <li>• Connect with other notes and concepts</li>
                    <li>• Consider different perspectives and approaches</li>
                    <li>• Archive when no longer relevant</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <NoteFormModal
          userId={userId}
          categories={categories}
          note={note}
          onClose={() => setShowEditModal(false)}
          onSave={handleNoteSaved}
        />
      )}
    </div>
  );
};