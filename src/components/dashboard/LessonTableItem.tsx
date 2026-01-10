import { Edit2, Trash2, Play, GripVertical } from 'lucide-react';

interface LessonTableItemProps {
  lesson: any;
  onEdit: (lesson: any) => void;
  onDelete: (id: string) => void;
}

export const LessonTableItem = ({ lesson, onEdit, onDelete }: LessonTableItemProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      onDelete(lesson.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(lesson);
  };

  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
      <td className="px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="text-slate-300 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB]">
            <Play className="w-4 h-4 fill-current" />
          </div>
          <div>
            <p className="font-bold text-slate-800">{lesson.title}</p>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Index: {lesson.order_index}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-4 text-slate-600 font-medium text-sm">
        {lesson.video_url?.includes('supabase') ? 'Storage' : 'External'}
      </td>
      <td className="px-8 py-4 text-slate-600 font-bold text-sm text-[#2563EB]">
        {lesson.duration || '--:--'}
      </td>
      <td className="px-8 py-4 text-slate-600 font-medium text-sm">
        {lesson.order_index}
      </td>
      <td className="px-8 py-4 text-right">
        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button 
            onClick={handleEdit}
            title="Edit Lesson"
            className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-all"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={handleDelete}
            title="Delete Lesson"
            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};
