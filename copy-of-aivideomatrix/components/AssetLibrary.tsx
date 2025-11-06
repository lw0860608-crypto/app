// components/AssetLibrary.tsx
import React, { useState, useRef } from 'react';
import type { Asset } from '../types';
import { supabase } from '../services/supabase';
import { Card } from './ui/Card';
import { PlusIcon, TrashIcon, UploadIcon } from './ui/Icons';

interface AssetLibraryProps {
    assets: Asset[];
    refreshAssets: () => void;
}

export const AssetLibrary: React.FC<AssetLibraryProps> = ({ assets, refreshAssets }) => {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0 || !supabase) return;
        setIsUploading(true);
        
        // FIX: Explicitly type `files` to ensure correct type inference for `file` in the loop.
        const files: File[] = Array.from(event.target.files);
        for (const file of files) {
            const filePath = `public/${Date.now()}-${file.name}`;
            try {
                const { error: uploadError } = await supabase.storage.from('video_assets').upload(filePath, file);
                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('video_assets').getPublicUrl(filePath);

                // Add to our asset_library table
                await supabase.from('asset_library').insert([{
                    file_name: file.name,
                    storage_url: publicUrl,
                    asset_type: 'video', // Assuming only video for now
                    size_bytes: file.size
                }]);
            } catch (error: any) {
                console.error("Error uploading file:", error);
                alert(`文件 ${file.name} 上传失败: ${error.message}`);
            }
        }
        
        setIsUploading(false);
        refreshAssets(); // Refresh the view after all uploads are done
    };

    const handleDelete = async (asset: Asset) => {
        if (!supabase) return;
        if (window.confirm(`您确定要永久删除 "${asset.file_name}" 吗？此操作不可逆。`)) {
            try {
                // Extract file path from URL
                const url = new URL(asset.storage_url);
                const filePath = url.pathname.split('/video_assets/')[1];
                
                // 1. Delete from storage
                const { error: storageError } = await supabase.storage.from('video_assets').remove([filePath]);
                if (storageError) throw storageError;

                // 2. Delete from database
                const { error: dbError } = await supabase.from('asset_library').delete().eq('id', asset.id);
                if (dbError) throw dbError;
                
                refreshAssets();

            } catch (error: any) {
                 console.error("Error deleting asset:", error);
                alert(`删除素材失败: ${error.message}`);
            }
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">中央素材库</h1>
                    <p className="text-gray-400 mt-1">上传、管理并复用您的核心视频与图片素材。</p>
                </div>
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex items-center px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/80 transition disabled:bg-gray-700"
                >
                    <UploadIcon className="h-5 w-5 mr-2" />
                    {isUploading ? '上传中...' : '上传新素材'}
                </button>
                <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="video/*,image/*"
                    multiple
                />
            </div>

            <Card>
                {assets.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {assets.map(asset => (
                            <div key={asset.id} className="group relative">
                                <div className="aspect-w-9 aspect-h-16 bg-dark-bg rounded-lg overflow-hidden border border-dark-border">
                                    {asset.asset_type === 'video' ? (
                                        <video src={asset.storage_url} className="w-full h-full object-cover" muted loop onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()}/>
                                    ) : (
                                         <img src={asset.storage_url} alt={asset.file_name} className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleDelete(asset)} className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded-full text-white">
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 truncate" title={asset.file_name}>{asset.file_name}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-xl font-semibold text-white">您的素材库是空的</h2>
                        <p className="text-gray-400 mt-2">点击“上传新素材”来添加您的第一个视频或图片。</p>
                    </div>
                )}
            </Card>
        </div>
    );
};