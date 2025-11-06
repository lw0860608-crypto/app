import React from 'react';
import { Card } from './ui/Card.tsx';

export const Settings: React.FC = () => {
    return (
        <Card>
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-white">This page is deprecated.</h1>
                <p className="text-gray-400 mt-2">API provider management has been moved to the new "AI Model Marketplace".</p>
                 <p className="text-gray-400">Please use the link in the sidebar to configure your APIs.</p>
            </div>
        </Card>
    );
};
