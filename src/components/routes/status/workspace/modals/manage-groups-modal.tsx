import React, { useEffect, useState } from 'react';

interface DeleteGroupModalProps {
  onCancel: () => void;
  onDesync: () => void;
  onRemove: () => void;
  modalLocation: ModalLocation;
}

// ModalLocation is the x and y axis coordinates where we want to place the modal
interface ModalLocation {
  x: number;
  y: number;
}

export const REMOVE = 'remove';
export const DESYNC = 'desync';

const ManageGroupsModal = ({
  modalLocation,
  onCancel,
  onDesync,
  onRemove,
}: DeleteGroupModalProps) => {
  return (
    <div
      className={`flex bg-gray-700/20 absolute justify-center items-center z-30`}
      style={{
        top: `${modalLocation.y}px`,
        left: `${modalLocation.x}px`,
      }}
    >
      <div className="bg-white rounded-lg flex flex-col shadow-lg select-none">
        <div className={`p-4 pb-0 flex items-center justify-left relative`}>
          <div className="font-medium text-base z-30">Manage Group</div>
        </div>
        <div className="flex-1 flex flex-col text-left p-3 z-40">
          <button
            onClick={onDesync}
            className="py-2 px-10 w-full border border-transparent rounded-lg shadow-sm border-gray-light text-gray-800 focus:ring-blue-light focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            Stop Syncing
          </button>

          <div className="mt-2">
            <button
              onClick={onRemove}
              className="py-2 px-10 w-full border border-transparent rounded-lg shadow-sm border-red-primary text-red-primary focus:ring-red-light focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              Remove from 1Password
            </button>
          </div>
        </div>
      </div>
      <div className="absolute w-screen h-screen" onClick={onCancel} />
    </div>
  );
};

export const useManageGroupsModal = (): [
  React.ReactElement,
  (modalLocation: ModalLocation) => Promise<boolean | string>,
] => {
  const [props, setProps] = useState<DeleteGroupModalProps | null>(null);

  const popup = async (
    modalLocation: ModalLocation,
  ): Promise<boolean | string> =>
    new Promise(resolve => {
      setProps({
        modalLocation,
        onDesync: () => {
          resolve(DESYNC);
          setProps(null);
        },
        onRemove: () => {
          resolve(REMOVE);
          setProps(null);
        },
        onCancel: () => {
          resolve(false);
          setProps(null);
        },
      });
    });

  const modalRender = props ? <ManageGroupsModal {...props} /> : <></>;

  return [modalRender, popup];
};

export default ManageGroupsModal;
