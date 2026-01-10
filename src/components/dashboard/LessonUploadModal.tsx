import { useState } from 'react';
import { X, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface LessonUploadModalProps {
  onClose: () => void;
  onSuccess: () => void;
  courseId: string;
  lesson?: any;
}

export const LessonUploadModal = ({ onClose, onSuccess, courseId, lesson }: LessonUploadModalProps) => {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(lesson?.title || '');
  const [duration, setDuration] = useState(lesson?.duration || '');
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url || '');
  const [orderIndex, setOrderIndex] = useState(lesson?.order_index || 1);

  const handleSave = async () => {
    if (!title || !videoUrl) {
      alert('Please fill at least title and video URL');
      return;
    }

    setLoading(true);
    try {
      const lessonData = {
        course_id: courseId,
        title: title,
        video_url: videoUrl,
        duration: duration,
        order_index: isNaN(parseInt(orderIndex.toString())) ? 1 : parseInt(orderIndex.toString())
      };

      if (lesson?.id) {
        const { error } = await supabase
          .from('lessons')
          .update(lessonData)
          .eq('id', lesson.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('lessons')
          .insert([lessonData]);
        if (error) throw error;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Lesson save error:', err);
      alert('Failed to save lesson: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{lesson ? 'Edit Lesson' : 'Add New Lesson'}</h2>
            <p className="text-sm text-slate-400">Step up your course content</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Lesson Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Introduction to UI Design"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-600"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Video URL</label>
              <input 
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Supabase URL or External Link"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-600"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Duration</label>
                  <input 
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 12:45"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-600"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Index</label>
                  <input 
                    type="number"
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(e.target.value === '' ? 0 : parseInt(e.target.value))}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-center transition-all font-bold text-[#2563EB]"
                  />
               </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50/50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 text-slate-400 font-bold hover:text-slate-600 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-[2] py-4 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                {lesson ? 'Update Lesson' : 'Deploy Lesson'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
