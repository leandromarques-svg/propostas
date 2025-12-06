import React from 'react';
import { Logo } from './Logo';

interface FooterProps {
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className }) => {
    // Default negative margins if no class provided, or append if user wants to override/add
    // But better: use the provided key class for margins if present, else default.
    // Simpler: Just allow full override or concatenation. Since tailwind conflict handling is tricky without a merge lib,
    // I'll make the default conditional.

    // If className is provided, use it. usage in App.tsx might need to be specific.
    // If I want to REMOVE negative margins, I pass an empty string or 'w-full'.
    // The default was '-mx-4 md:-mx-8'.

    const baseClasses = "bg-metarh-dark py-8 rounded-t-[3rem]";
    const marginClasses = className !== undefined ? className : "-mx-4 md:-mx-8";

    return (
        <footer className={`${baseClasses} ${marginClasses}`}>
            <div className="flex justify-center">
                <Logo variant="white" orientation="horizontal" className="h-8" />
            </div>
        </footer>
    );
};
