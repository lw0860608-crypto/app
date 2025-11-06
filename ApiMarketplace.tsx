import React, { useState, useMemo } from 'react';
import { Card } from './ui/Card';
import type { ApiProvider, ApiMarketplaceProvider } from '../types';
import { supabase } from '../services/supabase';
import { StorefrontIcon, SparklesIcon, VideoCameraIcon, BeakerIcon, TerminalIcon } from './ui/Icons';

// A generic modal for editing API provider credentials
const ProviderActivationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (credentials: any) => void;
    provider: ApiMarketplaceProvider;
    userProvider: ApiProvider | null;
}> = ({ isOpen, onClose, onSave, provider, userProvider }) => {
    
    const [credentials, setCredentials] = useState('{}');

    React.useEffect(() => {
        if (isOpen) {
            const initialCredentials = userProvider 
                ? JSON.stringify(userProvider.credentials, null, 2) 
                : JSON.stringify(provider.credentials_schema, null, 2);
            setCredentials(initialCredentials);
        }
    }, [isOpen, userProvider, provider]);

    const handleSave = () => {
        try {
            const parsedCredentials = JSON.parse(credentials);
            onSave(parsedCredentials);
        } catch (e) {
            alert('凭证必须是有效的 JSON 格式。');
        }
    };
    
    if (!isOpen) return null;
    
    return (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-lg p-6 border border-dark-border" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-2">配置 {provider.provider_name}</h2>
                <p className="text-sm text-gray-400 mb-4">{provider.description}</p>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">凭证 (JSON)</label>
                    <textarea value={credentials} onChange={e => setCredentials(e.target.value)} rows={8} className="w-full font-mono text-xs bg-gray-900 border-dark-border rounded-md py-2 px-3 text-white" />
                </div>
                 <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition">保存配置</button>
                </div>
            </div>
        </div>
    )
}


interface ApiMarketplaceProps {
    userApiProviders: ApiProvider[];
    systemApiProviders: ApiMarketplaceProvider[];
    refreshProviders: () => void;
}

export const ApiMarketplace: React.FC<ApiMarketplaceProps> = ({ userApiProviders, systemApiProviders, refreshProviders }) => {
    
    const [selectedProvider, setSelectedProvider] = useState<ApiMarketplaceProvider | null>(null);

    const userProvidersMap = useMemo(() => {
        return new Map(userApiProviders.map(p => [p.system_provider_id, p]));
    }, [userApiProviders]);

    const handleSave = async (credentials: any) => {
        if (!selectedProvider || !supabase) return;

        const existingProvider = userProvidersMap.get(selectedProvider.id);

        if (existingProvider) {
            // Update
            const { error } = await supabase.from('api_providers').update({ credentials }).eq('id', existingProvider.id);
            if (error) console.error("Error updating provider:", error);
        } else {
            // Insert
            const { error } = await supabase.from('api_providers').insert([{
                system_provider_id: selectedProvider.id,
                credentials
            }]);
             if (error) console.error("Error activating provider:", error);
        }
        
        refreshProviders();
        setSelectedProvider(null);
    };

    const getIconForType = (type: string) => {
        switch(type) {
            case 'Text': return <BeakerIcon className="h-6 w-6 text-purple-400" />;
            case 'Video': return <VideoCameraIcon className="h-6 w-6 text-red-400" />;
            case 'Audio': return <SparklesIcon className="h-6 w-6 text-cyan-400" />;
            default: return <TerminalIcon className="h-6 w-6 text-gray-400" />;
        }
    }

    return (
        <div className="space-y-6">
             <div className="flex items-center space-x-3">
                 <StorefrontIcon className="h-8 w-8 text-brand-blue"/>
                 <div>
                    <h1 className="text-3xl font-bold text-white">AI 模型市场</h1>
                    <p className="text-gray-400 mt-1">在此激活并配置系统所需的AI服务。请确保您已激活所有“必选项”。</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systemApiProviders.map(provider => {
                    const userProvider = userProvidersMap.get(provider.id);
                    const isActivated = !!userProvider;
                    return (
                        <Card key={provider.id} className="flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-3">
                                        {getIconForType(provider.api_type)}
                                        <h2 className="text-lg font-bold text-white">{provider.provider_name}</h2>
                                    </div>
                                    {provider.is_core && <span className="text-xs font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">必选项</span>}
                                </div>
                                 <p className="text-sm text-gray-400 mt-2 min-h-[40px]">{provider.description}</p>
                            </div>
                            <div className="mt-4">
                                <button
                                    onClick={() => setSelectedProvider(provider)}
                                    className={`w-full py-2 rounded-lg font-semibold transition ${isActivated ? 'bg-green-600/80 hover:bg-green-600 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-200'}`}
                                >
                                    {isActivated ? '管理配置' : '激活'}
                                </button>
                            </div>
                        </Card>
                    )
                })}
            </div>

            {selectedProvider && (
                <ProviderActivationModal 
                    isOpen={!!selectedProvider}
                    onClose={() => setSelectedProvider(null)}
                    onSave={handleSave}
                    provider={selectedProvider}
                    userProvider={userProvidersMap.get(selectedProvider.id) || null}
                />
            )}
        </div>
    );
};
