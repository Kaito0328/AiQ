import React from "react";
import EditButton from "../Button/EditButton";
import DeleteButton from "../Button/DeleteButton";

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

const EditDeleteButtons: React.FC<Props> = ({ onEdit, onDelete }) => {
  return (
    <div className="flex-shrink-0 flex space-x-4">
      <EditButton onEdit={onEdit} />
      <DeleteButton onDelete={onDelete} />
    </div>
  );
};

export default EditDeleteButtons;
