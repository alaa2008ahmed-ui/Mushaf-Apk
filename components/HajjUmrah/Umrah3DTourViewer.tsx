import React from 'react';
import { MasjidHaram3DViewer } from './MasjidHaram3DViewer';
import { Calculator3DStyles } from '../../utils/styles/calculator3DStyles';

export interface Umrah3DTourViewerProps {
  s3d: Calculator3DStyles;
  onClose?: () => void;
}

export const Umrah3DTourViewer: React.FC<Umrah3DTourViewerProps> = ({ s3d, onClose }) => {
  return <MasjidHaram3DViewer s3d={s3d} initialFocus="tour" tourOnly onClose={onClose} />;
};

export default Umrah3DTourViewer;
