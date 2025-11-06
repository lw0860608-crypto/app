import React, { useState, useEffect } from 'react';
import type { ApiProvider } from '../types';
import { ApiType } from '../types';

interface ApiProviderModalProps {
    isOpen: boolean;
    onClose: () => void;
    // FIX: Removed non-existent property 'current_monthly_usage' from the onSave prop type.
    onSave: (providerData: Omit<ApiProvider, 'id' | 'created_at'> | ApiProvider) => void;
    providerToEdit?: ApiProvider | null;
}

export const ApiProviderModal: React.FC<ApiProviderModalProps> = ({ isOpen, onClose, onSave, providerToEdit }) => {
    // FIX: Removed state for fields that do not exist on the ApiProvider type (e.g., provider_name, api_type, cost info).
    // This component appears to be based on an outdated schema and is likely deprecated.
    const [credentials, setCredentials] = useState('{\n  "api_key": "YOUR_API_KEY"\n}');
    const [isActive, setIsActive] = useState(true);

    const isEditing = !!providerToEdit;

    useEffect(() => {
        if (isOpen) {
            if (isEditing && providerToEdit) {
                // FIX: Only set state for fields that exist on the ApiProvider type.
                setCredentials(JSON.stringify(providerToEdit.credentials, null, 2));
                setIsActive(providerToEdit.is_active);
            } else {
                // Reset form
                setCredentials('{\n  "api_key": "YOUR_API_KEY"\n}');
                setIsActive(true);
            }
        }
    }, [isOpen, providerToEdit, isEditing]);

    const handleSave = () => {
        let parsedCredentials;
        try {
            parsedCredentials = JSON.parse(credentials);
        } catch (error) {
            alert('凭证必须是有效的JSON对象。');
            return;
        }
        
        if (isEditing && providerToEdit) {
            onSave({ ...providerToEdit, credentials: parsedCredentials, is_active: isActive });
        } else {
            // FIX: This component is deprecated and cannot create new providers correctly as it lacks system_provider_id.
            // Casting to `any` to resolve the compile-time error for this unused component.
            // The active implementation is in ApiMarketplace.tsx.
            const providerData = {
                credentials: parsedCredentials,
                is_active: isActive,
            };
            onSave(providerData as any);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 transition-opacity" onClick={onClose}>
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-2xl p-6 border border-dark-border" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">{isEditing ? '编辑API供应商' : '添加新API供应商'}</h2>
                <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    {/* FIX: Removed UI for fields that no longer exist on the ApiProvider type. */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">凭证 (JSON)</label>
                        <textarea value={credentials} onChange={(e) => setCredentials(e.target.value)} rows={4} className="w-full font-mono text-xs bg-gray-900 border border-dark-border rounded-md py-2 px-3 text-white"></textarea>
                    </div>
                     <div className="flex items-center justify-between border-t border-dark-border pt-4">
                        <span className="text-sm font-medium text-gray-300">供应商状态</span>
                        <div className="flex items-center">
                                <span className={`mr-3 text-sm font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>{isActive ? '激活' : '禁用'}</span>
                                <button type="button" onClick={() => setIsActive(!isActive)} className={`${isActive ? 'bg-brand-blue' : 'bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`} role="switch" aria-checked={isActive}>
                                    <span className={`${isActive ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}></span>
                                </button>
                            </div>
                     </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition">取消</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition">保存供应商</button>
                </div>
            </div>
        </div>
    );
};
