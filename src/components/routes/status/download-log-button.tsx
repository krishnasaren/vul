import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import React from 'react';
import * as api from '../../../api';
import { BridgeError } from '../../../utils/error';
import { downloadBlob } from '../../../utils'

interface DownloadLogButtonProps {
  log: string;
  handleError: (err: BridgeError, operationSummary: string) => void;
}

const DownloadLogButton = ({ log, handleError }: DownloadLogButtonProps) => {
  const onClick = async () => {
    try {
      const blob = await api.getLog(log);
      downloadBlob(blob, log);
    } catch (_err) {
      const err = _err as BridgeError;
      handleError(err, 'download ' + log);
    }
  };

  return (
    <div className="flex mb-3 w-full">
      <div className="flex-1 px-3 py-2 text-gray-800 rounded-r-none border-r-0 border border-solid border-gray-200 rounded-lg">
        {log}
      </div>
      <button
        onClick={onClick}
        className="w-15 text-center border rounded-lg rounded-l-none border-gray-200 px-3"
      >
        <ArrowDownTrayIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default DownloadLogButton;
