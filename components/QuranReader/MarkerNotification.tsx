import React, { FC } from 'react';

const MarkerNotification: FC<{isVisible: boolean, type: string, text: string}> = ({isVisible, type, text}) => {
    if (!isVisible) return null;
    const getIcon = () => {
        switch(type) {
            case 'juz': return 'fa-book-open';
            case 'quarter': return 'fa-star';
            case 'sajda': return 'fa-mosque';
            case 'surah': return 'fa-scroll';
            default: return 'fa-info-circle';
        }
    };

    return (
        <div className={`marker-notification modal-skinned ${isVisible ? 'show' : ''}`}>
            <div className="marker-icon theme-header-bg"><i className={`fa-solid ${getIcon()}`}></i></div>
            <div className="marker-text">{text}</div>
        </div>
    );
};

export default MarkerNotification;
