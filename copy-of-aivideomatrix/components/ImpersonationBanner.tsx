// components/ImpersonationBanner.tsx
import React from 'react';
import type { SuperAdminUser } from '../types';
import { ShieldCheckIcon } from './ui/Icons';

interface ImpersonationBannerProps {
    user: SuperAdminUser;
    onExit: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ user, onExit }) => {
    return (
        <div className="bg-yellow-500 text-black p-2 text-center text-sm font-semibold flex items-center justify-center sticky top-0 z-50">
            <ShieldCheckIcon className="h-5 w-5 mr-2" />
            <span>
                您正在以 <span className="font-bold">{user.email}</span> 的身份进行管理。
            </span>
            <button
                onClick={onExit}
                className="ml-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-md text-xs"
            >
                退出管理模式
            </button>
        </div>
    );
};
