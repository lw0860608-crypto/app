
import React from 'react';
import { MindSparkIcon } from './ui/Icons';

interface HeaderProps {
    onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
    return (
        <header className="md:hidden bg-dark-card border-b border-dark-border p-4 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-tr from-brand-blue to-brand-purple p-2 rounded-lg">
                    <MindSparkIcon className="h-5 w-5 text-white"/>
                </div>
                <h1 className="text-lg font-bold text-white">一青里AI工作室</h1>
            </div>
            <button onClick={onToggleSidebar} className="text-gray-300 hover:text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
        </header>
    );
};
