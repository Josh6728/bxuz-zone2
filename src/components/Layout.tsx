import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Scale, 
  HelpCircle, 
  Upload, 
  Settings, 
  Users, 
  ChevronDown,
  User,
  LogOut,
  Map
} from 'lucide-react';

export const Layout: React.FC = () => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Zoning Code', href: '/admin/zoning-code', icon: FileText },
    { name: 'Regulations', href: '/admin/regulations', icon: Scale },
    { name: 'FAQs', href: '/admin/faqs', icon: HelpCircle },
    { name: 'Import', href: '/admin/import', icon: Upload },
    { name: 'AI Settings', href: '/admin/ai-settings', icon: Settings },
    { name: 'Users', href: '/admin/users', icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <nav className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-screen overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">
            Zoning Code Administration
          </h2>
        </div>

        {/* User Account Section */}
        <div className="p-4 border-b border-gray-800 relative">
          <div 
            className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              AU
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">Admin User</div>
              <div className="text-xs text-gray-400 truncate">admin@planning.nyc.gov</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>

          {/* User Dropdown */}
          {isUserDropdownOpen && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
              <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-t-lg">
                <User className="w-4 h-4" />
                Profile
              </a>
              <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700">
                <Settings className="w-4 h-4" />
                Settings
              </a>
              <div className="border-t border-gray-700"></div>
              <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-lg">
                <LogOut className="w-4 h-4" />
                Log out
              </a>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <ul className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full px-4 py-2 text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Map className="w-4 h-4" />
            Return to Map
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 ml-72 min-h-screen">
        <div className="h-full overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}; 