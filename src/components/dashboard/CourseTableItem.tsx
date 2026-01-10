import { BookOpen, Edit2, Trash2, Library } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface CourseTableItemProps {
  course: any;
  isRTL: boolean;
  onEdit: (course: any) => void;
  onDelete: (id: string) => void;
  onClick: (courseId: string) => void;
}

export const CourseTableItem = ({ course, isRTL, onEdit, onDelete, onClick }: CourseTableItemProps) => {
  const [studentCount, setStudentCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchStudentCount = async () => {
      const { count, error } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('courseId', course.id);
      
      if (!error) setStudentCount(count);
    };

    fetchStudentCount();

    // Listen for global enrollment updates (triggered from Payment Desk)
    const handleSync = () => fetchStudentCount();
    window.addEventListener('itqan:enrollment-updated', handleSync);
    
    return () => {
      window.removeEventListener('itqan:enrollment-updated', handleSync);
    };
  }, [course.id]);

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      onDelete(course.id);
    }
  };

  const handleEdit = (e: MouseEvent) => {
    e.stopPropagation();
    onEdit(course);
  };

  const statusColor = course.status === 'published' 
    ? 'bg-green-100 text-green-700 border-green-200' 
    : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <tr 
      onClick={() => onClick(course.id)}
      className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
    >
      <td className="px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-10 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200 shadow-sm transition-transform group-hover:scale-105">
            {course.thumbnailUrl ? (
              <img 
                src={course.thumbnailUrl} 
                className="w-full h-full object-cover" 
                alt={course.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop';
                }}
              />
            ) : (
              <BookOpen className="w-5 h-5 text-slate-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors">{course.title}</p>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">ID: {course.id.slice(0, 8)}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-4">
        <span className={`px-3 py-1 rounded-full border ${statusColor} text-[10px] font-black uppercase tracking-widest shadow-sm`}>
          {course.status || 'draft'}
        </span>
      </td>
      <td className="px-8 py-4 text-slate-600 font-bold text-sm">
        <div className="flex items-center gap-2">
          {studentCount !== null ? studentCount : '--'}
          <span className="text-[10px] text-slate-400 font-normal">Registered</span>
        </div>
      </td>
      <td className="px-8 py-4">
        <div className="flex justify-center items-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onClick(course.id);
            }}
            title="Manage Course Content"
            className="p-2 bg-slate-50 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all border border-slate-100 hover:border-blue-200 shadow-sm flex items-center gap-2 group/btn"
          >
            <Library className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
            <span className={`text-[10px] font-bold uppercase tracking-wider hidden group-hover/row:inline-block ${isRTL ? 'mr-2' : 'ml-2'}`}>Curriculum</span>
          </button>
        </div>
      </td>
      <td className="px-8 py-4">
        <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
          <button 
            onClick={handleEdit}
            title="Edit Course"
            className="p-2 bg-slate-50 hover:bg-blue-50 rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-slate-100 hover:border-blue-200 shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDelete}
            title="Delete Course"
            className="p-2 bg-slate-50 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-all border border-slate-100 hover:border-red-200 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
