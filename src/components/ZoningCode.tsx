import React, { useState } from 'react';
import { 
  FileText, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Edit, 
  History, 
  Info,
  Plus
} from 'lucide-react';

interface SectionData {
  id: string;
  title: string;
  type: string;
  parent: string;
  ordinanceRef: string;
  lastUpdated: string;
  content: string;
  history: HistoryItem[];
  children?: string[];
}

interface HistoryItem {
  action: string;
  user: string;
  date: string;
  type: string;
}

export const ZoningCode: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [expandedSections, setExpandedSections] = useState<string[]>(['chapter-32']);
  const [searchTerm, setSearchTerm] = useState('');

  // Add global styles for content area
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .content-area h3 {
        color: #ffffff !important;
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }
      .content-area p {
        color: #e5e7eb !important;
        margin-bottom: 1rem;
        line-height: 1.6;
      }
      .content-area ul {
        color: #e5e7eb !important;
        margin-left: 1.5rem;
        margin-bottom: 1rem;
      }
      .content-area li {
        color: #e5e7eb !important;
        margin-bottom: 0.5rem;
      }
      .content-area strong {
        color: #ffffff !important;
        font-weight: 600;
      }
      .content-area em {
        color: #d1d5db !important;
        font-style: italic;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const sectionData: Record<string, SectionData> = {
    'chapter-32': {
      id: 'chapter-32',
      title: 'ORDINANCE NO. 2024-15 - BUTUAN CITY ZONING CODE',
      type: 'Ordinance',
      parent: 'None',
      ordinanceRef: 'Ord. No. 2024-15',
      lastUpdated: '2024-06-15',
      content: `
        <h3>Butuan City Comprehensive Zoning Ordinance</h3>
        <p>This ordinance shall be known and may be cited as the "Butuan City Zoning Ordinance of 2024," establishing comprehensive zoning regulations for the territorial jurisdiction of Butuan City, Agusan del Norte, Philippines.</p>
        <p>The purpose of this ordinance is to promote the health, safety, peace, morals, comfort, convenience and general welfare of the inhabitants of Butuan City through the regulation of land use and development.</p>
      `,
      history: [
        { action: 'Ordinance enacted', user: 'Butuan City Council', date: '2024-06-15', type: 'creation' },
        { action: 'Public hearing conducted', user: 'Planning Office', date: '2024-05-20', type: 'review' }
      ],
      children: ['article-1', 'article-2', 'article-3']
    },
    'article-1': {
      id: 'article-1',
      title: 'ARTICLE I - GENERAL PROVISIONS',
      type: 'Article',
      parent: 'chapter-32',
      ordinanceRef: 'Ord. No. 2024-15, Art. I',
      lastUpdated: '2024-06-15',
      content: `
        <h3>General Provisions</h3>
        <p>This article contains the fundamental provisions, definitions, and administrative framework for the implementation of zoning regulations in Butuan City.</p>
        <p>The provisions herein establish the legal foundation for land use planning and development control within the city's territorial boundaries.</p>
      `,
      history: [
        { action: 'Article finalized', user: 'Maria Santos', date: '2024-06-10', type: 'update' },
        { action: 'Draft reviewed', user: 'Planning Team', date: '2024-05-25', type: 'review' }
      ],
      children: ['sec-1-1', 'sec-1-2', 'sec-1-3', 'sec-1-4']
    },
    'article-2': {
      id: 'article-2',
      title: 'ARTICLE II - ZONING DISTRICTS AND REGULATIONS',
      type: 'Article',
      parent: 'chapter-32',
      ordinanceRef: 'Ord. No. 2024-15, Art. II',
      lastUpdated: '2024-06-12',
      content: `
        <h3>Zoning Districts and Regulations</h3>
        <p>This article establishes the various zoning districts within Butuan City and specifies the regulations applicable to each district.</p>
      `,
      history: [
        { action: 'Districts defined', user: 'Planning Team', date: '2024-06-12', type: 'update' }
      ],
      children: []
    },
    'article-3': {
      id: 'article-3',
      title: 'ARTICLE III - ADMINISTRATION AND ENFORCEMENT',
      type: 'Article',
      parent: 'chapter-32',
      ordinanceRef: 'Ord. No. 2024-15, Art. III',
      lastUpdated: '2024-06-14',
      content: `
        <h3>Administration and Enforcement</h3>
        <p>This article provides the administrative framework and enforcement mechanisms for the zoning ordinance.</p>
      `,
      history: [
        { action: 'Enforcement procedures added', user: 'Legal Team', date: '2024-06-14', type: 'update' }
      ],
      children: []
    },
    'sec-1-1': {
      id: 'sec-1-1',
      title: 'Sec. 1-1 - Short Title',
      type: 'Section',
      parent: 'article-1',
      ordinanceRef: 'Ord. No. 2024-15, Art. I, Sec. 1-1',
      lastUpdated: '2024-06-08',
      content: `
        <h3>Short Title</h3>
        <p>This ordinance shall be known and may be cited as the <strong>"Butuan City Zoning Ordinance of 2024"</strong> or the <strong>"Butuan City Comprehensive Zoning Code."</strong></p>
        <p>References to this ordinance in other local legislation, permits, or official documents may use the abbreviated citation <em>"BCZO 2024."</em></p>
      `,
      history: [
        { action: 'Section approved', user: 'Juan Dela Cruz', date: '2024-06-08', type: 'approval' },
        { action: 'Title revised', user: 'Maria Santos', date: '2024-06-05', type: 'update' }
      ]
    },
    'sec-1-2': {
      id: 'sec-1-2',
      title: 'Sec. 1-2 - Purpose and Intent',
      type: 'Section',
      parent: 'article-1',
      ordinanceRef: 'Ord. No. 2024-15, Art. I, Sec. 1-2',
      lastUpdated: '2024-06-10',
      content: `
        <h3>Purpose and Intent</h3>
        <p>The purpose of this zoning ordinance is to promote and protect the public health, safety, peace, morals, comfort, convenience, and general welfare of the residents of Butuan City.</p>
        <ul>
          <li>Guide orderly growth and development</li>
          <li>Protect property values</li>
          <li>Prevent overcrowding of land</li>
          <li>Provide adequate light and air</li>
        </ul>
      `,
      history: [
        { action: 'Purpose statement updated', user: 'Planning Team', date: '2024-06-10', type: 'update' }
      ]
    },
    'sec-1-3': {
      id: 'sec-1-3',
      title: 'Sec. 1-3 - Authority',
      type: 'Section',
      parent: 'article-1',
      ordinanceRef: 'Ord. No. 2024-15, Art. I, Sec. 1-3',
      lastUpdated: '2024-06-08',
      content: `
        <h3>Authority</h3>
        <p>This ordinance is adopted under the authority granted by the Local Government Code of 1991 and other applicable laws of the Republic of the Philippines.</p>
        <p>The City Planning and Development Office shall have primary responsibility for the administration and enforcement of this ordinance.</p>
      `,
      history: [
        { action: 'Authority section added', user: 'Legal Team', date: '2024-06-08', type: 'creation' }
      ]
    },
    'sec-1-4': {
      id: 'sec-1-4',
      title: 'Sec. 1-4 - Definitions',
      type: 'Section',
      parent: 'article-1',
      ordinanceRef: 'Ord. No. 2024-15, Art. I, Sec. 1-4',
      lastUpdated: '2024-06-09',
      content: `
        <h3>Definitions</h3>
        <p>For the purposes of this ordinance, the following terms shall have the meanings assigned below:</p>
        <ul>
          <li><strong>Zoning:</strong> The division of a city into districts and the regulation of land uses within those districts.</li>
          <li><strong>Lot:</strong> A tract or parcel of land occupied or capable of being occupied by one building and its accessory buildings.</li>
          <li><strong>Building:</strong> Any structure used or intended for supporting or sheltering any use or occupancy.</li>
        </ul>
      `,
      history: [
        { action: 'Definitions updated', user: 'Planning Team', date: '2024-06-09', type: 'update' },
        { action: 'Initial definitions added', user: 'Maria Santos', date: '2024-06-07', type: 'creation' }
      ]
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const selectSection = (sectionId: string) => {
    setSelectedSection(sectionId);
    setActiveTab('content');
  };

  const renderTreeItem = (sectionId: string, level: number = 0) => {
    const section = sectionData[sectionId];
    if (!section) return null;

    const isExpanded = expandedSections.includes(sectionId);
    const isSelected = selectedSection === sectionId;
    const hasChildren = section.children && section.children.length > 0;

    return (
      <div key={sectionId} className="tree-item">
        <div 
          className={`flex items-center py-2 px-3 rounded-lg cursor-pointer transition-colors ${
            isSelected ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800'
          }`}
          style={{ paddingLeft: `${12 + level * 20}px` }}
          onClick={() => selectSection(sectionId)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSection(sectionId);
              }}
              className="mr-2 p-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          )}
          <FileText className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium truncate">{section.title}</span>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-4">
            {section.children?.map(childId => renderTreeItem(childId, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (!selectedSection) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
          <FileText className="w-16 h-16 mb-4" />
          <h3 className="text-lg font-medium mb-2 text-white">Select a Section</h3>
          <p className="text-gray-400">Choose a section from the navigation tree to view its content</p>
        </div>
      );
    }

    const section = sectionData[selectedSection];
    if (!section) return null;

    return (
      <div className="space-y-6">
        {/* Section Header */}
        <div className="border-b border-gray-800 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-white">{section.title}</h1>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-400">
            <span>{section.type}</span>
            <span>•</span>
            <span>Last updated {section.lastUpdated}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-800">
          <nav className="flex space-x-4 md:space-x-8 overflow-x-auto">
            {[
              { id: 'content', label: 'Content', icon: FileText },
              { id: 'metadata', label: 'Metadata', icon: Info },
              { id: 'history', label: 'History', icon: History }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-xs md:text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Panels */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div 
                className="text-white space-y-4"
                style={{
                  color: '#ffffff'
                }}
              >
                <div 
                  dangerouslySetInnerHTML={{ __html: section.content }}
                  className="content-area"
                  style={{
                    color: '#ffffff'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'metadata' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Ordinance Reference</h3>
              <div className="bg-gray-800 rounded-lg p-4">
                <code className="text-gray-300">{section.ordinanceRef}</code>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Last Updated</h3>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-300">{section.lastUpdated}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Type</h3>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-300">{section.type}</div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Parent</h3>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-gray-300">
                  {section.parent !== 'None' && sectionData[section.parent] 
                    ? sectionData[section.parent].title 
                    : section.parent}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {section.history.map((item, index) => (
              <div key={index} className="p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">{item.action}</div>
                    <div className="text-gray-400 text-sm">{item.user} • {item.date}</div>
                  </div>
                  <button className="px-3 py-1 text-sm text-gray-300 bg-gray-700 rounded hover:bg-gray-600 transition-colors">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Navigation Sidebar */}
      <div className="w-80 bg-gray-900 border-r border-gray-800 flex-col hidden md:flex">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Zoning Code Structure</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search zoning code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {Object.keys(sectionData)
              .filter(id => !sectionData[id].parent || sectionData[id].parent === 'None')
              .map(sectionId => renderTreeItem(sectionId))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-gray-950">
        {/* Main Header */}
        <div 
          className="flex-shrink-0 p-4 md:p-6 pb-4 border-b border-gray-800" 
          style={{ backgroundColor: 'rgb(3 7 18 / var(--tw-bg-opacity, 1))' }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-3xl font-bold text-white">Zoning Code</h1>
            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" />
              Add New Section
            </button>
            <button className="md:hidden p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {/* Mobile Search - only visible on mobile */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search zoning code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}; 