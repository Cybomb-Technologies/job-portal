import React from 'react';
import { Outlet } from 'react-router-dom';
import EmployerProfileSidebar from './EmployerProfileSidebar';

const EmployerProfileLayout = () => {
    return (
        <div className="py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-bold text-black dark:text-white mb-8">Company Settings</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1">
                        <EmployerProfileSidebar />
                    </div>
                    <div className="md:col-span-3">
                         <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployerProfileLayout;
