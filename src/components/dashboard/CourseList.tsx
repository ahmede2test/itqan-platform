import { BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

import { CourseTableItem } from './CourseTableItem';

interface CourseListProps {
  searchQuery: string;
  isRTL: boolean;
  onSelectCourse?: (id: string) => void;
  onSetActiveTab?: (tab: string) => void;
  onEditCourse?: (course: any) => void;
}

export const CourseList = ({ searchQuery, isRTL, onSelectCourse, onSetActiveTab, onEditCourse }: CourseListProps) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      let query = supabase
        .from('courses')
        .select('id, title, videoUrl, thumbnailUrl, status, createdAt')
        .order('createdAt', { ascending: false });

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
       console.error('Error fetching courses:', error);
       setCourses([]); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      setCourses(courses.filter(c => c.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete course');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [searchQuery]);

  if (isLoading && courses.length === 0) {
     return <div className="p-20 text-center"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>;
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
      <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
        <table className="w-full border-collapse text-left">
          <thead className="bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
            <tr>
              <th className={`px-8 py-4 text-sm font-bold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>Name</th>
              <th className={`px-8 py-4 text-sm font-bold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>Status</th>
              <th className={`px-8 py-4 text-sm font-bold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>Students</th>
              <th className={`px-8 py-4 text-sm font-bold text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>Rating</th>
              <th className="px-8 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.length > 0 ? courses.map(course => (
              <CourseTableItem 
                key={course.id}
                course={course}
                isRTL={isRTL}
                onEdit={(c) => onEditCourse?.(c)}
                onDelete={handleDeleteCourse}
                onClick={(id) => {
                  onSelectCourse?.(id);
                  onSetActiveTab?.('course-editor');
                }}
              />
            )) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-medium">No results matching your search.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const ActiveCourses = ({ t, selectedCourseId, onSelectCourse, onViewAnalytics }: { t: any, selectedCourseId?: string | null, onSelectCourse?: (id: string | null) => void, onViewAnalytics?: (id: string) => void }) => {
  const [topCourses, setTopCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchTopCourses = async () => {
       const { data } = await supabase.from('courses').select('id, title, videoUrl, thumbnailUrl, createdAt').limit(3).order('createdAt', { ascending: false });
       if (data) setTopCourses(data);
    };
    fetchTopCourses();
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#2563EB] to-[#7C3AED] rounded-[2.5rem] p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16" />
      <h3 className="font-bold text-lg mb-1">{t('active_courses')}</h3>
      <p className="text-blue-100 text-sm mb-6">Top performing content</p>
      
      <div className="space-y-4">
        {topCourses.length > 0 ? topCourses.map(course => (
            <div 
               key={course.id} 
               onClick={() => onSelectCourse?.(selectedCourseId === course.id ? null : course.id)}
               className={`flex items-center gap-3 p-3 rounded-2xl backdrop-blur-md cursor-pointer transition-all ${
                  selectedCourseId === course.id 
                    ? 'bg-white/30 ring-2 ring-white shadow-lg scale-[1.02]' 
                    : 'bg-white/10 hover:bg-white/20'
               }`}
            >
                <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/20 transition-all ${
                   selectedCourseId === course.id ? 'bg-white shadow-lg ring-2 ring-white/50' : 'bg-white/10'
                }`}>
                   {course.thumbnailUrl ? (
                      <img 
                         src={course.thumbnailUrl} 
                         className="w-full h-full object-cover" 
                         alt={course.title}
                         onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title)}&background=random&color=fff`;
                         }}
                      />
                   ) : (
                      <span className="text-lg font-black opacity-40">{course.title.charAt(0)}</span>
                   )}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="font-bold text-sm truncate">{course.title}</p>
                   <p className="text-[10px] text-blue-100/60 uppercase tracking-widest font-black">Analytics</p>
                </div>
            </div>
         )) : (
            <div className="text-sm text-blue-200 italic">No courses available</div>
         )}
      </div>
      
      <button 
         onClick={() => selectedCourseId && onViewAnalytics?.(selectedCourseId)}
         disabled={!selectedCourseId}
         className="w-full mt-8 py-3 bg-white text-[#2563EB] rounded-xl font-bold hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-white/20 active:scale-95"
      >
         View Analytics
      </button>
    </div>
  );
};

