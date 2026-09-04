import React from 'react';
import { Comment } from '../types';

interface PinMarkerProps {
  comment: Comment;
  index: number;
  isSelected: boolean;
  onSelect: (comment: Comment) => void;
}

export const PinMarker: React.FC<PinMarkerProps> = ({
  comment,
  index,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      id={`pin-${comment.id}`}
      className={`pin-marker ${isSelected ? 'active' : ''}`}
      style={{
        left: `${comment.pos_x}%`,
        top: `${comment.pos_y}%`,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(comment);
      }}
      title={`${comment.author_name}: "${comment.text}"`}
    >
      <div className="pin-bubble">
        <span className="pin-bubble-inner">{index + 1}</span>
      </div>
    </div>
  );
};
