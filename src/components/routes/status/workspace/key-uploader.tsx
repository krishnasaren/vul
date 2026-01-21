import React, {
  useEffect,
  Dispatch,
  SetStateAction,
  useState,
  ChangeEventHandler,
  RefObject,
  useRef,
} from 'react';
import { BridgeError, BridgeErrorType } from '../../../../utils/error';
import { fileAsString } from '../../../../utils';
import * as storage from '../../../../storage';
import * as api from '../../../../api';
import { useLocation } from 'wouter';
import { useModal } from './modals/modal';
import DeleteKeyBarWithButton from './delete-key-bar-with-button';
import Spinner from '../../../spinner';
import { PlusIcon } from '@heroicons/react/24/solid';
import { Message } from '../../../../messages';

interface KeyUploaderProps {
  setError: Dispatch<SetStateAction<{ message: string; detail: string }>>;
}

const KeyUploader = ({ setError }: KeyUploaderProps) => {
  const [modalRender, popup] = useModal();
  const [, setLocation] = useLocation();
  const [keyJson, setKeyJson] = useState<string | null>(null);
  const [hadKeyAlready, setHadKeyAlready] = useState(false);
  const [loading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await api.getWorkspaceKey();
        setHadKeyAlready(true);
        storage.saveKeyUploaded();
      } catch (_err) {
        const err = _err as BridgeError;

        handleError(err, 'get service account key');
      }
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (keyJson) {
        try {
          // fail if key is not valid json
          const parsedKey = JSON.parse(keyJson);
          await api.uploadWorkspaceKey(parsedKey);
          setHadKeyAlready(true);
          storage.saveKeyUploaded();

          // For users who have already uploaded their configuration,
          // we need to restart the server to be in Workspace mode.
          // Otherwise, we don't have any reason to restart and can let the user continue setting up.
          if (storage.getConfigUploaded()) {
            await api.restartServer();
            setLocation(`/app/login?status=${Message.Connected}`);
          }

          setError({ message: '', detail: '' });
        } catch (_err) {
          const err = _err as BridgeError;
          handleError(err, 'upload service account key');
        }
      }
    })();
  }, [keyJson]);

  const onDeleteClick = async () => {
    // Similar to uploading the SA key, if users are deleting the SA key while not in workspace mode,
    // we don't have any reason to kick them out and restart the server. We can just unset the key file.
    if (storage.getMode() === api.Mode.Workspace) {
      const cont = await popup({
        titleText: 'Remove Service Account Key',
        subtitleText: '',
        confirmText: 'Confirm and Remove',
        cancelText: 'Cancel',
        bodyText:
          'After removing your Google Service Account Key, this page will refresh and you’ll need to sign in again.',
        isCritical: true,
      });

      if (cont) {
        await api.deleteWorkspaceKey();
        storage.removeKeyUploaded();
        await api.restartServer();
        setLocation(`/app/login?status=${Message.KeyDeleted}`);
      }
    }

    if (storage.getMode() !== api.Mode.Workspace) {
      await api.deleteWorkspaceKey();
      storage.removeKeyUploaded();
      setKeyJson(null);
      setHadKeyAlready(false);
    }
  };

  const handleError = (err: BridgeError, operationSummary: string) => {
    switch (err.type) {
      case BridgeErrorType.Unauthorized:
        setError({
          message: err.message,
          detail: 'Redirecting to login page in 2 seconds',
        });
        setTimeout(() => setLocation('/app/login'), 2000);

      // not found just means that our key file was not present,
      // so we can ignore this error.
      case BridgeErrorType.NotFound:
        break;

      default:
        setError({
          message: 'Unable to ' + operationSummary + '.',
          detail: err.message,
        });
    }
  };

  const inputRef: RefObject<HTMLInputElement> = useRef(null);

  const onInputChange: ChangeEventHandler<HTMLInputElement> = async e => {
    const fileText = await fileAsString(e.target.files![0]);
    setKeyJson(fileText);
  };

  return (
    <>
      {modalRender}
      <div className="flex flex-col">
        <h2 className="block text-md mb-2 font-semibold text-gray-900">
          Google Service Account Key
        </h2>

        {loading ? (
          <div className="flex justify-center w-full mt-1 mb-6">
            <Spinner />
          </div>
        ) : hadKeyAlready ? (
          <div className="mb-4">
            <DeleteKeyBarWithButton onDeleteClick={onDeleteClick} />
          </div>
        ) : (
          <div className="mb-4">
            <div className="flex w-full mt-1">
              {modalRender}
              <button
                onClick={() => inputRef.current && inputRef.current.click()}
                className="w-full cursor-pointer py-2 border border-solid border-blue-primary rounded-lg shadow-sm text-sm text-blue-primary hover:text-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-light"
              >
                <PlusIcon className="inline-block mb-[0.2rem] mr-1 w-4 h-4" />
                Upload Google Service Account Key
              </button>
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={onInputChange}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default KeyUploader;
