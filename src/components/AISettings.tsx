import React, {useState} from 'react';
import {
  Settings,
  RefreshCcw,
  FileText,
  BarChart3,
  ChevronDown,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import {azureOpenAIService} from '../services/azure-openai';
import {AZURE_OPENAI_CONFIG} from '../config/azure-openai';

export const AISettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  // Initialize with default values to prevent undefined errors
  const [apiKey, setApiKey] = useState(AZURE_OPENAI_CONFIG.apiKey || '');
  const [model, setModel] = useState(
    AZURE_OPENAI_CONFIG.modelName || 'o4-mini'
  );
  const [endpoint, setEndpoint] = useState(AZURE_OPENAI_CONFIG.endpoint || '');
  const [deployment, setDeployment] = useState(
    AZURE_OPENAI_CONFIG.deployment || ''
  );
  const [apiVersion, setApiVersion] = useState(
    AZURE_OPENAI_CONFIG.apiVersion || '2024-04-01-preview'
  );

  const [dailyQueryLimit, setDailyQueryLimit] = useState('1000');
  const [enableQueryLogging, setEnableQueryLogging] = useState(true);
  const [enableUserFeedback, setEnableUserFeedback] = useState(true);
  const [lastTrained] = useState('March 15, 2025 at 2:30 PM');
  const [trainingTime] = useState(
    'Training typically takes 15-30 minutes to complete'
  );
  const [connectionStatus, setConnectionStatus] = useState<
    'idle' | 'testing' | 'success' | 'error'
  >('idle');
  const [connectionMessage, setConnectionMessage] = useState('');

  // Zoning AI settings
  const [systemPrompt, setSystemPrompt] = useState(
    AZURE_OPENAI_CONFIG.systemPrompt || ''
  );

  // Migration settings
  const [docProcessingModel, setDocProcessingModel] = useState('GPT-4o');
  const [structurePrompt, setStructurePrompt] = useState(
    `Analyze this zoning code document and identify its structure. Extract chapters, articles, sections, and subsections. Identify any references between sections.`
  );
  const [autoCorrectIssues, setAutoCorrectIssues] = useState(true);
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [pdfEnabled, setPdfEnabled] = useState(true);
  const [wordEnabled, setWordEnabled] = useState(true);
  const [htmlEnabled, setHtmlEnabled] = useState(true);
  const [plainTextEnabled, setPlainTextEnabled] = useState(true);

  const tabs = [
    {id: 'general', label: 'General', icon: Settings},
    {id: 'zoning-ai', label: 'Zoning AI', icon: FileText},
    {id: 'migration', label: 'Migration', icon: RefreshCcw},
    {id: 'monitoring', label: 'Monitoring', icon: BarChart3},
  ];

  const models = ['o3-mini', 'gpt-4o', 'gpt-4', 'gpt-35-turbo'];

  const handleStartTraining = () => {
    // Training logic would go here
    console.log('Starting AI training...');
  };

  const handleTestConnection = async () => {
    setConnectionStatus('testing');
    setConnectionMessage('Testing connection to Azure OpenAI...');

    try {
      // Check if azureOpenAIService is available
      if (
        !azureOpenAIService ||
        typeof azureOpenAIService.testConnection !== 'function'
      ) {
        throw new Error('Azure OpenAI service is not available');
      }

      const isConnected = await azureOpenAIService.testConnection();
      if (isConnected) {
        setConnectionStatus('success');
        setConnectionMessage('Successfully connected to Azure OpenAI!');
      } else {
        setConnectionStatus('error');
        setConnectionMessage(
          'Failed to connect to Azure OpenAI. Please check your configuration.'
        );
      }
    } catch (error) {
      setConnectionStatus('error');
      setConnectionMessage(
        `Connection failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
      console.error('Connection test error:', error);
    }

    // Reset status after 5 seconds
    setTimeout(() => {
      setConnectionStatus('idle');
      setConnectionMessage('');
    }, 5000);
  };

  const handleSaveSettings = () => {
    // In a real implementation, you would save these settings to a backend
    console.log('Saving Azure OpenAI settings:', {
      apiKey: apiKey.substring(0, 10) + '...',
      model,
    });

    setConnectionStatus('success');
    setConnectionMessage('Settings saved successfully!');

    setTimeout(() => {
      setConnectionStatus('idle');
      setConnectionMessage('');
    }, 3000);
  };

  const ToggleSwitch = ({
    enabled,
    onChange,
    label,
    description,
  }: {
    enabled: boolean;
    onChange: (value: boolean) => void;
    label: string;
    description: string;
  }) => (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="text-white font-medium">{label}</h4>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-indigo-600' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div
      className="flex flex-col h-screen"
      style={{backgroundColor: 'rgb(3 7 18 / var(--tw-bg-opacity, 1))'}}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-6 pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">AI Settings</h1>
            {connectionMessage && (
              <div
                className={`flex items-center gap-2 mt-2 text-sm ${
                  connectionStatus === 'success'
                    ? 'text-green-400'
                    : connectionStatus === 'error'
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`}
              >
                {connectionStatus === 'success' && (
                  <CheckCircle className="w-4 h-4" />
                )}
                {connectionStatus === 'error' && (
                  <XCircle className="w-4 h-4" />
                )}
                {connectionStatus === 'testing' && (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                )}
                {connectionMessage}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={connectionStatus === 'testing'}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCcw
                className={`w-4 h-4 ${
                  connectionStatus === 'testing' ? 'animate-spin' : ''
                }`}
              />
              Test Connection
            </button>
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 p-6 pb-0">
        <div className="flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 pt-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <>
                {/* Azure OpenAI Configuration */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Azure OpenAI Configuration
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Configure your Azure OpenAI API settings for the zoning AI
                    assistant
                  </p>

                  <div className="space-y-6">
                    {/* Endpoint */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://your-resource.openai.azure.com/"
                      />
                    </div>

                    {/* API Key */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        API Key
                      </label>
                      <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter your Azure OpenAI API key"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {/* Deployment */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Deployment Name
                        </label>
                        <input
                          type="text"
                          value={deployment}
                          onChange={(e) => setDeployment(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="your-deployment-name"
                        />
                      </div>

                      {/* API Version */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          API Version
                        </label>
                        <input
                          type="text"
                          value={apiVersion}
                          onChange={(e) => setApiVersion(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="2024-12-01-preview"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Model */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Model
                        </label>
                        <div className="relative">
                          <select
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                          >
                            {models.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Max Tokens removed */}
                    </div>

                    {/* Temperature setting removed */}
                  </div>
                </div>

                {/* Usage & Monitoring */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Usage & Monitoring
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Configure AI usage limits and monitoring
                  </p>

                  <div className="space-y-6">
                    {/* Daily Query Limit */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Daily Query Limit
                      </label>
                      <input
                        type="number"
                        value={dailyQueryLimit}
                        onChange={(e) => setDailyQueryLimit(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Maximum number of AI queries per day"
                      />
                    </div>

                    {/* Toggles */}
                    <div className="space-y-4">
                      <ToggleSwitch
                        enabled={enableQueryLogging}
                        onChange={setEnableQueryLogging}
                        label="Enable Query Logging"
                        description="Log all AI queries for analysis"
                      />

                      <ToggleSwitch
                        enabled={enableUserFeedback}
                        onChange={setEnableUserFeedback}
                        label="Enable User Feedback"
                        description="Allow users to rate AI responses"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Training */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-white mb-3">
                    AI Training
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Train the AI on your zoning code
                  </p>

                  <div className="bg-gray-900 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      <div>
                        <h3 className="text-white font-medium">
                          Train AI Model
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Train the AI on your latest zoning code updates
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={handleStartTraining}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Start Training
                    </button>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last trained:</span>
                      <span className="text-white">{lastTrained}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Training time:</span>
                      <span className="text-gray-400">{trainingTime}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Zoning AI Tab */}
            {activeTab === 'zoning-ai' && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-3">
                  System Prompt
                </h2>
                <p className="text-gray-400 mb-6">
                  This prompt guides the AI's behavior and expertise focus
                </p>

                <div>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                    placeholder="Enter system prompt for the AI assistant..."
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    This prompt guides the AI's behavior and expertise focus
                  </p>
                </div>
              </div>
            )}

            {/* Migration Tab */}
            {activeTab === 'migration' && (
              <>
                {/* Document Processing */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Document Processing
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Configure AI settings for zoning code document processing
                  </p>

                  <div className="space-y-6">
                    {/* Document Processing Model */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Document Processing Model
                      </label>
                      <div className="relative">
                        <select
                          value={docProcessingModel}
                          onChange={(e) =>
                            setDocProcessingModel(e.target.value)
                          }
                          className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                        >
                          {models.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      <p className="text-gray-400 text-xs mt-1">
                        Model used for processing and analyzing zoning code
                        documents
                      </p>
                    </div>

                    {/* Structure Detection Prompt */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Structure Detection Prompt
                      </label>
                      <textarea
                        value={structurePrompt}
                        onChange={(e) => setStructurePrompt(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Enter prompt for structure detection..."
                      />
                    </div>

                    {/* Processing Options */}
                    <div className="space-y-4">
                      <ToggleSwitch
                        enabled={autoCorrectIssues}
                        onChange={setAutoCorrectIssues}
                        label="Auto-Correct Issues"
                        description="Automatically fix common issues in zoning code documents"
                      />

                      <ToggleSwitch
                        enabled={preserveFormatting}
                        onChange={setPreserveFormatting}
                        label="Preserve Original Formatting"
                        description="Maintain original text formatting where possible"
                      />
                    </div>
                  </div>
                </div>

                {/* Document Types */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h2 className="text-xl font-semibold text-white mb-3">
                    Document Types
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Configure supported document types and processing settings
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-red-400" />
                        <div>
                          <h4 className="text-white font-medium">
                            PDF Documents
                          </h4>
                          <p className="text-gray-400 text-sm">
                            Process PDF zoning code documents
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPdfEnabled(!pdfEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          pdfEnabled ? 'bg-indigo-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            pdfEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <div>
                          <h4 className="text-white font-medium">
                            Word Documents
                          </h4>
                          <p className="text-gray-400 text-sm">
                            Process DOC/DOCX zoning code documents
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setWordEnabled(!wordEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          wordEnabled ? 'bg-indigo-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            wordEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-orange-400" />
                        <div>
                          <h4 className="text-white font-medium">
                            HTML Documents
                          </h4>
                          <p className="text-gray-400 text-sm">
                            Process HTML zoning code documents
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setHtmlEnabled(!htmlEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          htmlEnabled ? 'bg-indigo-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            htmlEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <h4 className="text-white font-medium">Plain Text</h4>
                          <p className="text-gray-400 text-sm">
                            Process TXT zoning code documents
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setPlainTextEnabled(!plainTextEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          plainTextEnabled ? 'bg-indigo-600' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            plainTextEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Monitoring Tab */}
            {activeTab === 'monitoring' && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-3">
                  AI Monitoring
                </h2>
                <p className="text-gray-400 mb-6">
                  Monitor AI performance and usage statistics
                </p>

                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Monitoring Dashboard
                  </h3>
                  <p className="text-gray-400">
                    Monitoring features will be available soon
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
