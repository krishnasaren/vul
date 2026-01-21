import React from 'react';
import { folder } from '../../../svg/folder';
import { trash } from '../../../svg/trash';

const fileName = 'workspace-credentials.json';

interface DeleteKeyWithButtonProps {
  onDeleteClick: () => void;
}

const DeleteKeyBarWithButton = ({
  onDeleteClick,
}: DeleteKeyWithButtonProps) => {
  return (
    <div className="flex">
      <div className="py-3 text-center border border-r-0 rounded-md rounded-r-none border-gray-light pl-4 pr-3">
        {folder}
      </div>
      <div className="flex-1 py-2 text-gray-800 rounded-r-none rounded-l-none border border-l-0 border-solid border-gray-light rounded-md">
        {fileName}
      </div>
      <button
        onClick={onDeleteClick}
        className="w-15 text-center border border-l-0 rounded-md rounded-l-none border-gray-light px-3 "
      >
        {trash}
      </button>
    </div>
  );
};

export default DeleteKeyBarWithButton;
