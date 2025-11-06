

import React from 'react';
import { Platform } from '../../types';

const YouTubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M27.427 3.09C27.107 1.86 26.157.91 24.937.59C22.757 0 14 0 14 0C14 0 5.237 0 3.067.59C1.847.91.897 1.86.577 3.09C0 5.28 0 10 0 10C0 10 0 14.72.577 16.91C.897 18.14 1.847 19.09 3.067 19.41C5.237 20 14 20 14 20C14 20 22.757 20 24.937 19.41C26.157 19.09 27.107 18.14 27.427 16.91C28 14.72 28 10 28 10C28 10 28 5.28 27.427 3.09Z" fill="#FF0000"/>
        <path d="M11.2 14.28V5.71L18.49 10L11.2 14.28Z" fill="white"/>
    </svg>
);

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-1-6.7-2.91-1.85-1.88-2.75-4.38-2.68-6.95.02-1.18.31-2.35.82-3.45.5-1.1 1.22-2.11 2.12-2.95.83-.76 1.8-1.36 2.89-1.72 1.09-.36 2.25-.5 3.4-.5.02 1.54.02 3.08.01 4.63-.44.25-.85.53-1.23.86-1.11 1-1.64 2.45-1.62 3.99.02 1.5.61 2.93 1.63 4.01 1.02 1.08 2.43 1.63 3.93 1.62 1.5-.01 2.91-.56 3.93-1.63 1.02-1.08 1.61-2.51 1.63-4.01.02-1.54-.53-2.99-1.64-4-1.02-.92-2.33-1.42-3.66-1.5Zm7.66 4.11c-.33-.12-.66-.23-.99-.33v-3.7c.33.09.66.19.99.28.35 3.14 2.09 5.85 4.51 7.58-1.51-1.13-2.7-2.73-3.52-4.55Z"/>
    </svg>
);

const BilibiliIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d="M16 32.2c0-1.2 1-2.2 2.2-2.2h15.5c1.2 0 2.2 1 2.2 2.2v35.6c0 1.2-1 2.2-2.2 2.2H18.2c-1.2 0-2.2-1-2.2-2.2V32.2zM64 30h15.5c1.2 0 2.2 1 2.2 2.2v35.6c0 1.2-1 2.2-2.2 2.2H64c-1.2 0-2.2-1-2.2-2.2V32.2C61.8 31 62.8 30 64 30z" fill="#00A1D6"></path>
        <path fillRule="evenodd" clipRule="evenodd" d="M43.8 45c0-1.2 1-2.2 2.2-2.2h9.8c1.2 0 2.2 1 2.2 2.2v10c0 1.2-1 2.2-2.2 2.2h-9.8c-1.2 0-2.2-1-2.2-2.2V45z" fill="#00A1D6"></path>
    </svg>
);


const GenericIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.242.013.487.02.73.02h.621a2.25 2.25 0 011.664 2.25L13.5 14.5M9.75 3.104C8.462 4.157 7.5 5.753 7.5 7.5v1.5M13.5 14.5v-1.5c0-1.747-.962-3.343-2.47-4.157M13.5 14.5L16.5 18l3-3M4.5 14.5l-3 3 3 3" />
    </svg>
);


export const PlatformIcon: React.FC<{ platform: Platform; className?: string; }> = ({ platform, className }) => {
    switch (platform) {
        case Platform.YouTube:
            return <YouTubeIcon className={className} />;
        case Platform.TikTok:
            return <TikTokIcon className={className || 'text-white'} />;
        case Platform.Bilibili:
            return <BilibiliIcon className={className} />;
        case Platform.Douyin:
             return <TikTokIcon className={className || 'text-white'} />;
        case Platform.Xiaohongshu:
             return <GenericIcon className={className || 'text-red-500'} />;
        default:
            return <GenericIcon className={className || 'text-gray-400'} />;
    }
};