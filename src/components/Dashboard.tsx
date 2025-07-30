import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Scale, 
  HelpCircle, 
  Upload,
  Activity,
  Users,
  Clock,
  TrendingUp,
  Calendar,
  BarChart3,
  Download,
  Plus,
  Filter,
  Eye
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: 'Zoning Code',
      stats: '4 Chapters',
      updated: 'Last updated 2 days ago',
      icon: FileText,
      link: '/admin/zoning-code',
      color: 'bg-blue-600'
    },
    {
      title: 'Zoning Regulations',
      stats: '32 Regulations',
      updated: 'Last updated 5 hours ago',
      icon: Scale,
      link: '/admin/regulations',
      color: 'bg-green-600'
    },
    {
      title: 'Zoning FAQs',
      stats: '128 FAQs',
      updated: 'Last updated yesterday',
      icon: HelpCircle,
      link: '/admin/faqs',
      color: 'bg-purple-600'
    },
    {
      title: 'Import Zoning Code',
      stats: 'AI-Powered',
      updated: 'Import from PDF, Word, or HTML',
      icon: Upload,
      link: '/admin/import',
      color: 'bg-orange-600'
    },
    {
      title: 'Users',
      stats: '12 Users',
      updated: '3 active now',
      icon: Users,
      link: '/admin/users',
      color: 'bg-blue-600'
    },
    {
      title: 'AI Settings',
      stats: 'Configured',
      updated: 'Using GPT-4o model',
      icon: Activity,
      link: '/admin/ai-settings',
      color: 'bg-purple-600'
    }
  ];

  const analyticsData = [
    { label: 'Total Code Sections', value: '245', change: '+12%', trend: 'up' },
    { label: 'Active Regulations', value: '32', change: '+3', trend: 'up' },
    { label: 'Pending Reviews', value: '8', change: '-2', trend: 'down' },
    { label: 'Monthly Updates', value: '15', change: '+25%', trend: 'up' },
  ];

  const recentActivity = [
    { action: 'Updated C5-3 zoning regulation', user: 'John Smith', time: '2 hours ago', type: 'update' },
    { action: 'Added new FAQ for R8B height limits', user: 'Sarah Johnson', time: '5 hours ago', type: 'create' },
    { action: 'Imported zoning code from PDF document', user: 'Michael Brown', time: 'Yesterday', type: 'import' },
    { action: 'Added new section to Chapter 32', user: 'Emily Davis', time: '2 days ago', type: 'review' },
  ];

  const popularQueries = [
    { query: '"What can I build in Midtown?"', count: '87 queries' },
    { query: '"What is the height limit in R8B?"', count: '64 queries' },
    { query: '"Can I build residential in M1-5?"', count: '52 queries' },
  ];

  // Analytics Data
  const weeklyQueryData = [
    { week: 'Week 1', queries: 320, accuracy: 92 },
    { week: 'Week 2', queries: 380, accuracy: 94 },
    { week: 'Week 3', queries: 420, accuracy: 91 },
    { week: 'Week 4', queries: 480, accuracy: 93 },
    { week: 'Week 5', queries: 520, accuracy: 95 },
    { week: 'Week 6', queries: 580, accuracy: 94 },
    { week: 'Week 7', queries: 620, accuracy: 96 },
    { week: 'Week 8', queries: 581, accuracy: 94 },
  ];

  const dailyUserActivity = [
    { day: 'Mon', users: 18, queries: 142 },
    { day: 'Tue', users: 24, queries: 186 },
    { day: 'Wed', users: 21, queries: 164 },
    { day: 'Thu', users: 27, queries: 203 },
    { day: 'Fri', users: 25, queries: 198 },
    { day: 'Sat', users: 12, queries: 89 },
    { day: 'Sun', users: 10, queries: 76 },
  ];

  const queryCategories = [
    { name: 'Food Pastries', value: 35, count: 203 },
    { name: 'Internet Cafes', value: 25, count: 145 },
    { name: 'Flower Shops', value: 20, count: 116 },
    { name: 'Restaurants', value: 20, count: 117 },
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  // Reports Data
  const [reports, setReports] = useState([
    {
      id: 1,
      name: 'Monthly Zoning Activity Report',
      type: 'Activity Summary',
      date: '2024-12-01',
      size: '2.3 MB',
      status: 'Generated',
      description: 'Comprehensive analysis of all zoning activities for November 2024'
    },
    {
      id: 2,
      name: 'AI Query Analytics Report',
      type: 'Analytics',
      date: '2024-11-28',
      size: '1.8 MB',
      status: 'Generated',
      description: 'Detailed breakdown of AI query patterns and user interactions'
    },
    {
      id: 3,
      name: 'Regulation Compliance Summary',
      type: 'Compliance',
      date: '2024-11-25',
      size: '945 KB',
      status: 'Generated',
      description: 'Current compliance status across all zoning regulations'
    },
    {
      id: 4,
      name: 'User Activity Dashboard',
      type: 'User Analytics',
      date: '2024-11-22',
      size: '1.2 MB',
      status: 'Generated',
      description: 'Weekly user engagement and system usage patterns'
    }
  ]);

  const reportTemplates = [
    { name: 'Zoning Activity Summary', type: 'activity', icon: Activity },
    { name: 'AI Performance Report', type: 'performance', icon: TrendingUp },
    { name: 'User Engagement Analysis', type: 'users', icon: Users },
    { name: 'Code Update History', type: 'updates', icon: FileText },
    { name: 'Compliance Audit Report', type: 'compliance', icon: Scale },
  ];

  const handleCardClick = (link: string) => {
    navigate(link);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'update': return <Activity className="w-4 h-4 text-blue-400" />;
      case 'create': return <FileText className="w-4 h-4 text-green-400" />;
      case 'import': return <Upload className="w-4 h-4 text-orange-400" />;
      case 'review': return <Users className="w-4 h-4 text-purple-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <div className="flex-shrink-0 p-4 md:p-6 pb-0">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">Dashboard</h1>
            
            {/* Tab Navigation */}
            <div className="border-b border-gray-800">
              <nav className="flex space-x-4 md:space-x-8 overflow-x-auto">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'analytics', label: 'Analytics' },
                  { id: 'reports', label: 'Reports' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-0">
        <div className="max-w-7xl mx-auto">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Dashboard Cards Grid - First Row (4 cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardCards.slice(0, 4).map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index}
                    onClick={() => handleCardClick(card.link)}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${card.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                      {card.title}
                    </h3>
                    <div className="text-2xl font-bold text-indigo-400 mb-1">
                      {card.stats}
                    </div>
                    <div className="text-sm text-gray-400">
                      {card.updated}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dashboard Cards Grid - Second Row (2 cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dashboardCards.slice(4, 6).map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index + 4}
                    onClick={() => handleCardClick(card.link)}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 cursor-pointer hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`p-3 rounded-lg ${card.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                      {card.title}
                    </h3>
                    <div className="text-2xl font-bold text-indigo-400 mb-1">
                      {card.stats}
                    </div>
                    <div className="text-sm text-gray-400">
                      {card.updated}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Section - 3 columns */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* AI Queries */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">AI Queries</h3>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-400 mb-2">+581</div>
                  <div className="text-sm text-gray-400">+201 from last week</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="space-y-1">
                      <div className="text-sm text-white">{activity.action}</div>
                      <div className="text-xs text-gray-400">{activity.user} • {activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Popular AI Queries */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Popular AI Queries</h3>
                <div className="text-sm text-gray-400 mb-4">Most frequent user questions this week</div>
                <div className="space-y-3">
                  {popularQueries.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="text-sm text-white">{item.query}</div>
                      <div className="text-xs text-gray-400">{item.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* AI Query Trends */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">AI Query Trends</h3>
                <p className="text-sm text-gray-400 mb-4">Weekly query volume and accuracy over the past 8 weeks</p>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyQueryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="queries" 
                      stroke="#4F46E5" 
                      strokeWidth={3}
                      name="Queries"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="accuracy" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Accuracy (%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Query Categories */}
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Query Categories</h3>
                <p className="text-sm text-gray-400 mb-4">Distribution of AI queries by category this month</p>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={queryCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {queryCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Activity Chart */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Daily User Activity</h3>
              <p className="text-sm text-gray-400 mb-4">Active users and queries over the past week</p>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={dailyUserActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="users" fill="#4F46E5" name="Active Users" />
                  <Bar dataKey="queries" fill="#10B981" name="Total Queries" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Report Generation Section */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Generate New Report</h3>
                  <p className="text-sm text-gray-400">Create custom reports based on your requirements</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  New Report
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportTemplates.map((template, index) => {
                  const Icon = template.icon;
                  return (
                    <div
                      key={index}
                      className="p-4 border border-gray-700 rounded-lg hover:border-indigo-500 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gray-800 rounded-lg group-hover:bg-indigo-600 transition-colors">
                          <Icon className="w-5 h-5 text-indigo-400 group-hover:text-white" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-white">{template.name}</h4>
                          <p className="text-xs text-gray-400 capitalize">{template.type} report</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Generated Reports */}
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Generated Reports</h3>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filter
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors">
                    <Download className="w-4 h-4" />
                    Export All
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-lg">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium text-white">{report.name}</h4>
                            <span className="px-2 py-1 text-xs bg-green-600 text-white rounded-full">
                              {report.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-1">{report.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Generated on {report.date}
                            </span>
                            <span>{report.size}</span>
                            <span className="capitalize">{report.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-1 px-3 py-1 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-gray-700 rounded transition-colors">
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1 text-xs text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors">
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Total Reports Generated</h4>
                <div className="text-2xl font-bold text-white">47</div>
                <div className="text-sm text-green-400">+8 this month</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Data Coverage</h4>
                <div className="text-2xl font-bold text-white">98.5%</div>
                <div className="text-sm text-gray-400">Accuracy rate</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Storage Used</h4>
                <div className="text-2xl font-bold text-white">156 MB</div>
                <div className="text-sm text-gray-400">of 2 GB available</div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}; 