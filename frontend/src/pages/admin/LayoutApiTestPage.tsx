import React, { useState } from 'react';
import { LayoutAPI } from '../../services/layoutApiService';
import { EventLayout } from '../../types/layout';

export const LayoutApiTestPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [layouts, setLayouts] = useState<EventLayout[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');

    // Test API connection
    const testConnection = async () => {
        setLoading(true);
        setError(null);
        try {
            const isConnected = await LayoutAPI.testConnection();
            setConnectionStatus(isConnected ? 'connected' : 'failed');
        } catch (err: any) {
            setConnectionStatus('failed');
            setError(err.message || 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    // Test getAllLayouts
    const testGetAllLayouts = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await LayoutAPI.getAllLayouts();
            setLayouts(data);
            console.log('✅ getAllLayouts response:', data);
        } catch (err: any) {
            setError(err.response?.data?.error?.message || err.message || 'Failed to fetch layouts');
            console.error('❌ getAllLayouts error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Layout API Test Page</h1>
                <p className="text-slate-400 mb-8">Testing backend integration before full deployment</p>

                {/* API Configuration */}
                <div className="bg-[#0f1219] border border-slate-800 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">API Configuration</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex gap-2">
                            <span className="text-slate-500">Base URL:</span>
                            <code className="text-[#8655f6]">{process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4002/api/v1'}</code>
                        </div>
                        <div className="flex gap-2 items-center">
                            <span className="text-slate-500">Status:</span>
                            {connectionStatus === 'unknown' && <span className="text-slate-400">Not tested</span>}
                            {connectionStatus === 'connected' && <span className="text-green-500">✓ Connected</span>}
                            {connectionStatus === 'failed' && <span className="text-red-500">✗ Failed</span>}
                        </div>
                    </div>
                </div>

                {/* Test Actions */}
                <div className="bg-[#0f1219] border border-slate-800 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Test Actions</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={testConnection}
                            disabled={loading}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Testing...' : 'Test Connection'}
                        </button>
                        <button
                            onClick={testGetAllLayouts}
                            disabled={loading}
                            className="px-4 py-2 bg-[#8655f6] hover:bg-[#7544e5] rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Get All Layouts'}
                        </button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                        <h3 className="font-bold text-red-400 mb-2">Error</h3>
                        <p className="text-sm text-red-300">{error}</p>
                    </div>
                )}

                {/* Results Display */}
                <div className="bg-[#0f1219] border border-slate-800 rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Results ({layouts.length} layouts)</h2>

                    {layouts.length === 0 ? (
                        <p className="text-slate-500 text-sm">No layouts loaded. Click "Get All Layouts" to test the API.</p>
                    ) : (
                        <div className="space-y-4">
                            {layouts.map((layout, index) => (
                                <div key={layout.eventId || index} className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-lg">{layout.eventName || 'Unnamed Event'}</h3>
                                            <p className="text-xs text-slate-400">Event ID: {layout.eventId}</p>
                                        </div>
                                        <div className="text-right text-xs text-slate-500">
                                            {layout.zones.length} zones
                                        </div>
                                    </div>

                                    {/* Canvas Info */}
                                    <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                                        <div>
                                            <span className="text-slate-500">Canvas:</span>
                                            <span className="ml-2 text-white">{layout.canvasWidth}×{layout.canvasHeight}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Color:</span>
                                            <span
                                                className="ml-2 inline-block w-4 h-4 rounded border border-slate-600"
                                                style={{ backgroundColor: layout.canvasColor }}
                                            />
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Updated:</span>
                                            <span className="ml-2 text-white text-xs">
                                                {layout.updatedAt ? new Date(layout.updatedAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Zones */}
                                    <div className="mt-3 pt-3 border-t border-slate-700">
                                        <p className="text-xs text-slate-500 mb-2">Zones:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {layout.zones.map((zone) => (
                                                <div
                                                    key={zone.id}
                                                    className="px-2 py-1 rounded text-xs border"
                                                    style={{
                                                        borderColor: zone.color,
                                                        backgroundColor: `${zone.color}15`
                                                    }}
                                                >
                                                    <span style={{ color: zone.color }}>{zone.name}</span>
                                                    <span className="text-slate-500 ml-1">({zone.type})</span>
                                                    {zone.rows && zone.seatsPerRow && (
                                                        <span className="text-slate-400 ml-1">
                                                            {zone.rows}×{zone.seatsPerRow}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Raw JSON Display */}
                {layouts.length > 0 && (
                    <div className="mt-6 bg-[#0f1219] border border-slate-800 rounded-lg p-6">
                        <h2 className="text-xl font-bold mb-4">Raw JSON Response</h2>
                        <pre className="text-xs bg-black/50 p-4 rounded overflow-auto max-h-96 text-slate-300">
                            {JSON.stringify(layouts, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
};
