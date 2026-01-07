import { motion } from 'framer-motion';
import { BarChart3, Users, BookOpen, Settings, Bell, Search } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-700 p-6 flex flex-col">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-10">
          ITQAN Admin
        </div>
        
        <nav className="space-y-2 flex-1">
          {[
            { icon: BarChart3, label: 'Analytics', active: true },
            { icon: Users, label: 'Users', active: false },
            { icon: BookOpen, label: 'Content', active: false },
            { icon: Settings, label: 'Settings', active: false },
          ].map((item) => (
            <button 
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                item.active 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="h-20 border-b border-slate-700 flex items-center justify-between px-8">
          <h1 className="text-xl font-bold">Dashboard Overview</h1>
          <div className="flex items-center gap-4">
            <div className="bg-slate-800 p-2 rounded-full text-slate-400">
               <Search className="w-5 h-5" />
            </div>
            <div className="bg-slate-800 p-2 rounded-full text-slate-400">
               <Bell className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
          </div>
        </header>

        <div className="p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { label: "Total Students", val: "12,450", change: "+12%" },
              { label: "Active Courses", val: "45", change: "+3%" },
              { label: "Revenue", val: "$124,500", change: "+8%" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-slate-800 p-6 rounded-2xl border border-slate-700"
              >
                <div className="text-slate-400 text-sm mb-2">{stat.label}</div>
                <div className="text-3xl font-bold mb-2">{stat.val}</div>
                <div className="text-green-400 text-sm font-medium">{stat.change} vs last month</div>
              </motion.div>
            ))}
          </div>

          <div className="h-96 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-center">
            <p className="text-slate-500">Live Analytics Chart Placeholder</p>
          </div>
        </div>
      </main>
    </div>
  );
}
