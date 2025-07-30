import React from "react";
import DeleteButton from "../Button/DeleteButton";
import EditCompleteButton from "../Button/EditCompleteButton";

interface Props {
  onEditComplete: () => void;
  onDelete: () => void;
}

const EditCompleteDeleteButtons: React.FC<Props> = ({ onEditComplete, onDelete }) => {
  return (
    <div className="flex-shrink-0 flex space-x-4">
      <EditCompleteButton onComplete={onEditComplete} />
      <DeleteButton onDelete={onDelete} />
    </div>
  );
};

export default EditCompleteDeleteButtons;
