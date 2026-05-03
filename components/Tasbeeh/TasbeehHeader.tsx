import React from 'react';
import ThemePageLock from '../ThemePageLock';

interface TasbeehHeaderProps {
    title: string;
    subtitle: string;
}

const TasbeehHeader: React.FC<TasbeehHeaderProps> = ({ title, subtitle }) => {
    return (
        <header className="app-top-bar">
            <div className="app-top-bar__inner">
                <h1 className="app-top-bar__title text-2xl font-kufi flex items-center justify-center gap-2">
                    <ThemePageLock />
                    {title}
                </h1>
                <p className="app-top-bar__subtitle">{subtitle}</p>
            </div>
        </header>
    );
};

export default TasbeehHeader;
