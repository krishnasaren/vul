import React, { useEffect } from 'react';
import * as api from '../../../../api';
import ProgressBar from './progress-bar';

interface SyncProgressProps {
  updateSyncProgress: () => void;
  syncProgress: api.SyncProgress | null;
}

const SyncProgress = ({
  updateSyncProgress,
  syncProgress,
}: SyncProgressProps) => {
  const syncRateMS = 1000;

  const renderSyncStatus = (progress: api.SyncProgress) => {
    if (progress.started) {
      return `${
        progress.current === 0
          ? `Starting sync...`
          : `Syncing ${progress.current} / ${progress.total} users, ${progress.failed} failed`
      }`;
    }
    if (!progress.started) {
      return `Last synced ${progress.total} users, ${progress.failed} failed`;
    }
  };

  useEffect(() => {
    // perform an initial fetch in case there is a sync in progress,
    // and the user refreshes the page.
    updateSyncProgress();
  }, []);

  useEffect(() => {
    if (syncProgress) {
      // once the sync starts, keep it going
      if (syncProgress.started) {
        setTimeout(updateSyncProgress, syncRateMS);
      }
    }
  }, [syncProgress]);

  if (!syncProgress) {
    return <></>;
  }

  return (
    <div className="flex flex-col">
      <div className="mb-2">{renderSyncStatus(syncProgress)}</div>

      {syncProgress.current !== 0 && syncProgress.started && (
        <ProgressBar
          progress={syncProgress.current}
          total={syncProgress.total}
          backgroundCssColor="white"
          foregroundCssColor="#1060d1"
          className="rounded-3xl h-1 w-full"
        />
      )}
    </div>
  );
};

export default SyncProgress;
