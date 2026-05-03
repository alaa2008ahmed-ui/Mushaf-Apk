import React from 'react';
import type { Theme } from '../../context/themes';
import { motion } from 'framer-motion';

interface ThreeDButtonProps {
    label: string;
    onClick: () => void;
    color: string;
    padding?: string;
    children?: React.ReactNode;
    theme: Theme;
}

const ThreeDButton: React.FC<ThreeDButtonProps> = ({ label, onClick, color, padding = "py-3 px-4 text-base", children = null, theme }) => (
    <motion.button
        whileTap={{ y: 2, scale: 0.98 }}
        onClick={onClick}
        className={`w-full rounded-2xl font-bold cursor-pointer focus:outline-none overflow-hidden ${padding}`}
        style={{
            background: color,
            color: '#FFFFFF',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)',
            boxShadow: `0 4px 10px ${color}66`
        }}
    >
        <div className="flex items-center justify-center relative z-10 h-full w-full gap-2">
            {children}{label}
        </div>
    </motion.button>
);

export default ThreeDButton;
