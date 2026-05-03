import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { HISN_ALMUSLIM_CATEGORIES } from '../../data/hisnAlmuslimData';
import { motion } from 'motion/react';

interface CategoryListProps {
    onSelectCategory: (category: any) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ onSelectCategory }) => {
    const { theme } = useTheme();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1
        }
    };

    const itemVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    return (
        <div className="grid grid-cols-2 gap-3 p-2">
            {HISN_ALMUSLIM_CATEGORIES.map((category, index) => {
                const color = theme.palette[index % theme.palette.length];
                
                return (
                    <div 
                        key={category.id} 
                        onClick={() => onSelectCategory(category)}
                        className="relative group cursor-pointer active:scale-95 transition-transform"
                    >
                        <div className="h-full p-3 rounded-3xl bg-white dark:bg-gray-800 border border-black/5 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center gap-1 overflow-hidden">
                            {/* Background hint */}
                            <div 
                                className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10 blur-xl pointer-events-none"
                                style={{ backgroundColor: color }}
                            />
                            
                            <div 
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-0 group-hover:scale-110 transition-transform duration-300 shadow-inner"
                                style={{ 
                                    backgroundColor: color + '15',
                                    color: color
                                }}
                            >
                                <i className={`fa-solid ${category.icon || 'fa-book-open'} text-2xl`}></i>
                            </div>
                            
                            <h2 className="font-bold text-sm sm:text-base leading-tight text-gray-800 dark:text-gray-100 line-clamp-2">
                                {category.title}
                            </h2>

                            <div className="mt-auto pt-1 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <i className="fa-solid fa-arrow-left-long text-xs" style={{ color }}></i>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

export default CategoryList;
