import React from 'react';

export const SupabaseGuide: React.FC = () => {
  return (
    <div className="mt-4 border border-dark-border rounded-lg p-3 bg-gray-900/50">
      <p className="text-xs text-center text-gray-400 mb-2">Find your keys on this page:</p>
      <svg width="100%" viewBox="0 0 400 200" className="rounded-md">
        {/* Background */}
        <rect width="400" height="200" fill="#1F2937" rx="8" />

        {/* Header */}
        <rect width="400" height="24" fill="#374151" />
        <circle cx="12" cy="12" r="4" fill="#EF4444" />
        <circle cx="28" cy="12" r="4" fill="#FBBF24" />
        <circle cx="44" cy="12" r="4" fill="#10B981" />

        {/* Sidebar */}
        <rect x="0" y="24" width="100" height="176" fill="#111827" />
        <text x="10" y="50" fill="#9CA3AF" fontSize="10" fontWeight="bold">Project Settings</text>
        <rect x="0" y="60" width="100" height="20" fill="#00B2FF" fillOpacity="0.1" />
        <text x="10" y="74" fill="#00B2FF" fontSize="10" fontWeight="bold">API</text>

        {/* Main Content */}
        <text x="120" y="50" fill="#FFFFFF" fontSize="14" fontWeight="bold">Project API</text>
        
        {/* URL Box */}
        <text x="120" y="75" fill="#9CA3AF" fontSize="10">Project URL</text>
        <rect x="120" y="82" width="260" height="25" fill="#111827" rx="4" stroke="#374151" />
        <rect x="122" y="84" width="256" height="21" fill="none" stroke="#34D399" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x="128" y="97" fill="#6B7280" fontSize="9" fontFamily="monospace">https://your-ref.supabase.co</text>

        {/* Key Box */}
        <text x="120" y="125" fill="#9CA3AF" fontSize="10">Project API Keys</text>
        <rect x="120" y="132" width="260" height="45" fill="#111827" rx="4" stroke="#374151" />
        <text x="128" y="145" fill="#9CA3AF" fontSize="9" fontWeight="bold">anon (public)</text>
        <rect x="122" y="152" width="256" height="21" fill="none" stroke="#FBBF24" strokeWidth="1.5" strokeDasharray="4 2" />
        <text x="128" y="165" fill="#6B7280" fontSize="9" fontFamily="monospace">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</text>
      </svg>
    </div>
  );
};