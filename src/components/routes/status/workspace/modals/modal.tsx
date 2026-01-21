import React, { useEffect, useState } from 'react';

export interface ModalConfig {
  titleText: string;
  subtitleText: string;
  confirmText: string;
  cancelText: string;
  bodyText: string;
  // TODO: break into two components and remove boolean parameter.
  // It's generally bad practice in react to use a boolean flag.
  isCritical: boolean;
}

interface ModalProps extends ModalConfig {
  onCancel: () => void;
  onConfirm: () => void;
}

const Modal = ({
  titleText,
  subtitleText,
  confirmText,
  bodyText,
  cancelText,
  isCritical,
  onCancel,
  onConfirm,
}: ModalProps) => {
  useEffect(() => {
    document.body.style.setProperty('overflow', 'hidden');
    return () => document.body.style.setProperty('overflow', 'auto');
  }, []);

  return (
    <div
      // TODO: make this background click out work.
      // right now, it also would trigger it when clicking a text box.
      // onClick={onCancel}
      className="w-screen h-screen bg-gray-700/20 fixed top-0 left-0 overscroll-contain flex justify-center items-center z-20"
    >
      <div className="w-96 h-80 bg-white rounded-md flex flex-col shadow-lg">
        <div className="border-gray-200 border-0 border-b border-solid p-3 flex items-center justify-center relative">
          <div className="font-semibold text-base">{titleText}</div>
          <button
            onClick={onCancel}
            className={`font-medium text-sm ${
              isCritical ? 'text-red-primary' : 'text-blue-primary'
            } absolute right-0 p-3`}
          >
            {cancelText}
          </button>
        </div>
        <div className="flex-1 flex flex-col text-center p-3">
          <div className="font-medium text-base">{subtitleText}</div>
          <p className="whitespace-pre-line">{bodyText}</p>
        </div>
        <div className="border-gray-200 border-0 border-t border-solid p-3 flex justify-center items-center">
          <button
            onClick={onConfirm}
            className={`py-2 px-4 w-full border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
              isCritical
                ? 'bg-red-primary hover:bg-red-dark focus:ring-red-light'
                : 'bg-blue-primary hover:bg-blue-dark focus:ring-blue-light'
            } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const useModal = (): [
  React.ReactElement,
  (config: ModalConfig) => Promise<boolean>,
] => {
  const [props, setProps] = useState<ModalProps | null>(null);

  const popup = async (config: ModalConfig): Promise<boolean> =>
    new Promise(resolve => {
      setProps({
        ...config,
        onConfirm: () => {
          resolve(true);
          setProps(null);
        },
        onCancel: () => {
          resolve(false);
          setProps(null);
        },
      });
    });

  const modalRender = props ? <Modal {...props} /> : <></>;

  return [modalRender, popup];
};

export default Modal;
