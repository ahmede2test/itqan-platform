import { useState, useEffect } from 'react';
import { Plus, Play, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { LessonTableItem } from './LessonTableItem';
import { LessonUploadModal } from './LessonUploadModal';
import { AnimatePresence } from 'framer-motion';

interface LessonManagerProps {
  courseId: string | null;
  onBack: () => void;
}

export const LessonManager = ({ courseId, onBack }: LessonManagerProps) => {
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const fetchLessons = async () => {
    if (!courseId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, course_id, title, video_url, duration, order_index')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [courseId]);

  const handleDeleteLesson = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setLessons(lessons.filter(l => l.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete lesson');
    }
  };

  if (!courseId) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
           <button 
             onClick={onBack}
             title="Back to Courses"
             className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-slate-100"
           >
             <X className="w-5 h-5" />
           </button>
           <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#2563EB]">
              <Play className="w-6 h-6 fill-current" />
           </div>
           <div>
              <h3 className="font-bold text-lg text-slate-800">Lesson Curriculum</h3>
              <p className="text-sm text-slate-400">{lessons.length} Lessons published</p>
           </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onBack}
            className="px-6 py-3 text-slate-400 font-bold hover:text-slate-600 transition-all"
          >
            Back to Manager
          </button>
          <button 
            onClick={() => {
              setEditingLesson(null);
              setShowUpload(true);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#2563EB] text-white rounded-xl font-bold hover:bg-[#1d4ed8] shadow-lg shadow-blue-500/20 transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Lesson
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-8 py-4 text-sm font-bold text-slate-500">Lesson Name</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500">Type</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500">Duration</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500">Index</th>
                <th className="px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lessons.length > 0 ? (
                lessons.map((lesson) => (
                  <LessonTableItem 
                    key={lesson.id}
                    lesson={lesson}
                    onEdit={(l) => {
                      setEditingLesson(l);
                      setShowUpload(true);
                    }}
                    onDelete={handleDeleteLesson}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">
                    {isLoading ? 'Loading lessons...' : 'No lessons found. Start by adding your first lesson!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showUpload && (
          <LessonUploadModal 
            courseId={courseId}
            lesson={editingLesson}
            onClose={() => setShowUpload(false)}
            onSuccess={fetchLessons}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
