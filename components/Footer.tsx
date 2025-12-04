import React from 'react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-metarh-dark py-8 rounded-t-[3rem] -mx-4 md:-mx-8">
            <div className="flex justify-center">
                <Logo variant="white" orientation="horizontal" className="h-8" />
            </div>
        </footer>
    );
};
