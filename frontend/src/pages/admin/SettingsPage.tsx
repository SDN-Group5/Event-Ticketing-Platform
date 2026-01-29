import React, { useState } from 'react';

interface Setting {
  id: string;
  label: string;
  value: boolean | string;
  description: string;
  type: 'toggle' | 'input' | 'select';
  options?: { label: string; value: string }[];
}

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Setting[]>([
    {
      id: 'platform-fee',
      label: 'Platform Fee Percentage',
      value: '10',
      description: 'Commission fee charged for each ticket sale',
      type: 'input',
    },
    {
      id: 'enable-refunds',
      label: 'Enable Refunds',
      value: true,
      description: 'Allow customers to request refunds for events',
      type: 'toggle',
    },
    {
      id: 'refund-deadline',
      label: 'Refund Deadline (Hours)',
      value: '36',
      description: 'Time limit for refund requests before event',
      type: 'input',
    },
    {
      id: 'enable-resale',
      label: 'Enable Ticket Resale',
      value: true,
      description: 'Allow customers to resell their tickets',
      type: 'toggle',
    },
    {
      id: 'resale-fee',
      label: 'Resale Fee Percentage',
      value: '5',
      description: 'Commission on ticket resales',
      type: 'input',
    },
    {
      id: 'max-event-duration',
      label: 'Maximum Event Duration',
      value: '12',
      description: 'Maximum hours an event can last',
      type: 'select',
      options: [
        { label: '4 Hours', value: '4' },
        { label: '8 Hours', value: '8' },
        { label: '12 Hours', value: '12' },
        { label: '24 Hours', value: '24' },
      ],
    },
    {
      id: 'enable-notifications',
      label: 'System Notifications',
      value: true,
      description: 'Send automatic notifications to users',
      type: 'toggle',
    },
    {
      id: 'enable-analytics',
      label: 'Collect Analytics',
      value: true,
      description: 'Collect user behavior data for analytics',
      type: 'toggle',
    },
  ]);

  const [isSaved, setIsSaved] = useState(false);

  const handleToggle = (id: string) => {
    setSettings(settings.map(setting =>
      setting.id === id ? { ...setting, value: !setting.value } : setting
    ));
    setIsSaved(false);
  };

  const handleInputChange = (id: string, value: string) => {
    setSettings(settings.map(setting =>
      setting.id === id ? { ...setting, value } : setting
    ));
    setIsSaved(false);
  };

  const handleSave = () => {
    // TODO: Call API to save settings
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Platform Settings</h2>
          <p className="text-slate-400">Configure platform-wide settings and policies</p>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Payment Settings */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-900/50">
            <h3 className="text-white font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">payments</span>
              Payment Settings
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {settings.slice(0, 2).map(setting => (
              <div key={setting.id} className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">{setting.label}</p>
                  <p className="text-slate-400 text-sm">{setting.description}</p>
                </div>
                {setting.type === 'toggle' && (
                  <button
                    onClick={() => handleToggle(setting.id)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors flex-shrink-0 ${
                      setting.value ? 'bg-[#d946ef]' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        setting.value ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                )}
                {setting.type === 'input' && (
                  <input
                    type="text"
                    value={setting.value}
                    onChange={(e) => handleInputChange(setting.id, e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-[#d946ef] w-24"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Refund Settings */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-900/50">
            <h3 className="text-white font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">undo</span>
              Refund Policy
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {settings.slice(2, 5).map(setting => (
              <div key={setting.id} className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">{setting.label}</p>
                  <p className="text-slate-400 text-sm">{setting.description}</p>
                </div>
                {setting.type === 'toggle' && (
                  <button
                    onClick={() => handleToggle(setting.id)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors flex-shrink-0 ${
                      setting.value ? 'bg-[#d946ef]' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        setting.value ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                )}
                {setting.type === 'input' && (
                  <input
                    type="text"
                    value={setting.value}
                    onChange={(e) => handleInputChange(setting.id, e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-[#d946ef] w-24"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Event Settings */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-900/50">
            <h3 className="text-white font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">event</span>
              Event Settings
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {settings.slice(5, 7).map(setting => (
              <div key={setting.id} className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">{setting.label}</p>
                  <p className="text-slate-400 text-sm">{setting.description}</p>
                </div>
                {setting.type === 'select' && (
                  <select
                    value={setting.value}
                    onChange={(e) => handleInputChange(setting.id, e.target.value)}
                    className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-[#d946ef]"
                  >
                    {setting.options?.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-900/50">
            <h3 className="text-white font-bold flex items-center gap-2">
              <span className="material-symbols-outlined">settings</span>
              System Settings
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {settings.slice(7).map(setting => (
              <div key={setting.id} className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-white font-semibold mb-1">{setting.label}</p>
                  <p className="text-slate-400 text-sm">{setting.description}</p>
                </div>
                {setting.type === 'toggle' && (
                  <button
                    onClick={() => handleToggle(setting.id)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors flex-shrink-0 ${
                      setting.value ? 'bg-[#d946ef]' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                        setting.value ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 sticky bottom-8">
        {isSaved && (
          <div className="px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            Settings saved successfully
          </div>
        )}
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#d946ef] hover:bg-[#d946ef]/90 text-white rounded-lg transition-colors font-semibold"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};
