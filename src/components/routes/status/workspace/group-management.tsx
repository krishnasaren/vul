import React, { useEffect, useState } from 'react';
import type { JSX } from 'react';

import * as api from '../../../../api';
import { BridgeError, BridgeErrorType } from '../../../../utils/error';
import ErrorMessage from '../../../error';
import SuccessMessage from '../../../success';
import { useLocation } from 'wouter';
import { useManageGroupsModal, REMOVE } from './modals/manage-groups-modal';
import Spinner from '../../../spinner';
import { people } from '../../../svg/people';
//import { peopleLight } from '../../../svg/people-light';
import SyncProgress from './sync-progress';
//import ProgressBar from './progress-bar';
import { search } from '../../../svg/search-bar';
import { useDebounce } from '../../../../utils/debounce';

// Group operations used for error handling
const operations = {
  delete: 'delete group',
  unsync: 'unsync group',
  fetch: 'fetch group',
  save: 'save group',
  search: 'search groups',
};

/*
 * On page load, we retrieve customer's workspace groups, and any already synced groups from cache/b5
 *
 * Variable definitions:
 *
 * groups -- all groups retrieved from the customer's workspace account
 *
 * syncedGroupIds -- the currently synced groups from the cache/b5. This is used on page load to populate selectedGroupIds, and then refreshed on any updates
 *
 * selectedGroupIds -- the currently selected group ids. In addition to being populated by incoming group ids from the cache/b5 on page load,
 * this is updated with any changes in selections. This is ultimately used to save to cache/b5 when save is clicked
 */

const GroupManagement = (): JSX.Element => {
  const [allChecked, setAllChecked] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [syncedGroupIds, setSyncedGroupIds] = useState<string[]>([]);
  const [groups, setGroups] = useState<api.WorkspaceGroup[]>([]);
  const [error, setError] = useState({ message: '', detail: '' });
  const [success, setSuccess] = useState({ message: '', detail: '' });
  const [, setLocation] = useLocation();
  const [modalRender, popup] = useManageGroupsModal();
  const [loading, setLoading] = useState(true);
  const [syncProgress, setSyncProgress] = useState<api.SyncProgress | null>(
    null,
  );

  const [searchTerm, setSearchTerm] = useState<string | undefined>(undefined);
  const debouncedSearchTerm: string | undefined = useDebounce<
    string | undefined
  >(searchTerm, 1000);

  const groupIds = groups.map(g => g.id);
  const deletedGroupIds = syncedGroupIds.filter(id => !groupIds.includes(id));

    const handleError = (err: BridgeError, operation: string) => {
        setSuccess({ message: '', detail: '' });

        switch (err.type) {
            case BridgeErrorType.Unauthorized:
                setError({
                    message: 'Unauthorized',
                    detail: 'Redirecting to login page in 2 seconds',
                });
                setTimeout(() => setLocation('/app/login'), 2000);
                break;

            case BridgeErrorType.BadRequest:
            case BridgeErrorType.NotFound:
                setError({
                    message:
                        operation === operations.search
                            ? 'Invalid search'
                            : 'Unable to ' + operation + '.',
                    detail:
                        operation === operations.search
                            ? 'Please use a different search term'
                            : err.message,
                });
                break;

            default:
                setError({
                    message: 'Unable to ' + operation + '.',
                    detail: err.message,
                });
        }
    };

  const getGroupsAndSettings = async () => {
    try {
      const workspaceGroups = await api.getAllWorkspaceGroups();
      const configGroups = await api.getGroupSettings();
      setGroups(workspaceGroups);
      setSyncedGroupIds(configGroups);
      setSelectedGroupIds(configGroups);
      setAllChecked(workspaceGroups.length === configGroups.length);
    } catch (_err) {
      const err = _err as BridgeError;
      handleError(err, operations.fetch);
    }
  };

  useEffect(() => {
    (async () => {
      await getGroupsAndSettings();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setError({
        message: '',
        detail: '',
      });

      // Search term has been cleared. Let's fetch the first page of group results like on page load.
      // When the term has been cleared out and is an empty string, we know we need to fetch all groups with GET /workspace/groups
      // rather than use the endpoint for the search, which doesn't take an empty string as a search term.
      if (debouncedSearchTerm === '') {
        setLoading(true);
        await getGroupsAndSettings();
        setLoading(false);
        return;
      }

      // A search term has been entered. We need to fetch groups matching the search term,
      // and replace all our groups with the matching results.
      if (debouncedSearchTerm !== undefined) {
        setLoading(true);
        try {
          const results = await api.getWorkspaceGroupsByName(
            debouncedSearchTerm,
          );
          if (results) {
            setGroups(results);
          } else {
            // If there are no results, we set "groups" to an empty array so we can display "No results"
            setGroups([]);
          }
        } catch (_err) {
          const err = _err as BridgeError;
          handleError(err, operations.search);
        }
        setLoading(false);
      }
    })();
  }, [debouncedSearchTerm]);

  const updateSyncProgress = async () => {
    const progress = await api.getSyncProgress();
    setSyncProgress(progress);
  };



  const onGroupSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) => {
    setSelectedGroupIds(
      e.target.checked
        ? [...selectedGroupIds, id]
        : selectedGroupIds.filter(p => p !== id),
    );
    setSuccess({ message: '', detail: '' });
    setError({ message: '', detail: '' });
  };

  const toggleAll = async () => {
    const groupIds = groups.map(g => g.id);
    if (!allChecked && syncedGroupIds.length !== groups.length) {
      setSelectedGroupIds(groupIds);
    }

    if (allChecked && syncedGroupIds.length !== groups.length) {
      setSelectedGroupIds(syncedGroupIds);
    }

    // User is unchecking all groups while groups are synced, but we are not supporting mass deletions at this time.
    // We are still supporting a sync all groups operation,
    // so it might make more sense to add a Sync All Groups button instead of a one-way check box for this.
    setAllChecked(!allChecked);
  };

  const onGroupRemove = async (
    groupToBeDeleted: api.WorkspaceGroup,
    e: React.MouseEvent,
  ) => {
    const location = { x: e.pageX, y: e.pageY };
    const result = await popup(location);

    // Early return if user is cancelling out of the modal
    if (result === false) {
      return;
    }

    setError({ message: '', detail: '' });

    const newSelections = syncedGroupIds.filter(
      groupId => groupId !== groupToBeDeleted.id,
    );

    let externalGroupIds = newSelections;
    if (result === REMOVE) {
      try {
        await api.deleteGroup(groupToBeDeleted);
      } catch (_err) {
        const err = _err as BridgeError;
        handleError(err, operations.delete);
        // if group delete doesn't work, exit and let them try again or choose to desync on their own
        return;
      }
    } else {
      externalGroupIds = externalGroupIds.concat(deletedGroupIds);
    }

    // Regardless of whether user is unsyncing or deleting the group, we need to update the group config settings
    try {
      await api.updateGroupSettings(externalGroupIds);
      setSyncedGroupIds(newSelections);
      setSelectedGroupIds(newSelections);
      setSuccess({
        message: 'Group settings saved.',
        detail: 'Saved. Please allow a few minutes for a sync to be performed.',
      });
    } catch (_err) {
      const err = _err as BridgeError;
      handleError(err, operations.unsync);
    }

    await updateSyncProgress();
  };

  const noNewSelections =
    JSON.stringify(syncedGroupIds) === JSON.stringify(selectedGroupIds);

  const onGroupSave = async () => {
    setSuccess({ message: '', detail: '' });
    setError({ message: '', detail: '' });

    try {
      if (noNewSelections) {
        await api.queueSync();
        setSuccess({
          message: '',
          detail:
            'Sync enqueued. Please allow a few minutes for a sync to be performed.',
        });
      } else {
        await api.updateGroupSettings(selectedGroupIds.concat(deletedGroupIds));
        setSyncedGroupIds(selectedGroupIds);
        setSuccess({
          message: '',
          detail:
            'Saved. Please allow a few minutes for a sync to be performed.',
        });
      }
    } catch (_err) {
      const err = _err as BridgeError;
      handleError(err, operations.save);
    }

    await updateSyncProgress();
  };

  const orderedGroups = groups
    .map(g =>
      syncedGroupIds.includes(g.id)
        ? { ...g, Synced: true }
        : { ...g, Synced: false },
    )
    .sort((a, b) => Number(b.Synced) - Number(a.Synced));

  return (
    <div className="bg-white w-full">
      <div className="md:grid md:grid-cols-3">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Workspace Groups
          </h3>
          <p className="mt-1 flex items-center text-sm text-gray-500">
            <div className="inline-block mr-1">{people}</div>
            {groups.length === 200
              ? `${groups.length} results`
              : `${groups.length} groups`}
          </p>
          <div className="mt-1 flex items-center text-sm text-gray-500">
            <SyncProgress
              updateSyncProgress={updateSyncProgress}
              syncProgress={syncProgress}
            />
          </div>
          {groups.length === 200 && (
            <div className="rounded-md bg-blue-50 p-2 mt-4 mr-0 sm:mr-10 border border-[#0077FF3D]">
              <p className="text-sm font-bold text-gray-500">
                Showing first 200 results
              </p>
              <p className="text-sm font-normal text-gray-500">
                If you don&apos;t see what you&apos;re looking for, search for
                specific terms.
              </p>
            </div>
          )}
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="flex flex-col">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Select Groups
            </h3>
            <div className="mt-1 mb-4">
              <p className="text-sm text-gray-500">
                Select the groups you would like to sync.
              </p>
              <div className="mt-4">
                <div className="flex rounded-md shadow-sm">
                  <div className="relative flex flex-grow">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <div className="mr-1">{search}</div>
                    </div>
                    <input
                      type="search"
                      className="block w-full rounded-lg placeholder-gray-400 placeholder-opacity-75 border-gray-300 pl-10 focus:blue-primary focus:ring-blue-light sm:text-sm"
                      placeholder="Search Groups"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchTerm(e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
              {error.message && (
                <div className="mt-2">
                  <ErrorMessage message={error.message} detail={error.detail} />
                </div>
              )}

              {success.detail && (
                <div className="mt-2">
                  <SuccessMessage message="" detail={success.detail} />
                </div>
              )}
            </div>
            {modalRender}
            {loading ? (
              <div className="mt-6">
                <Spinner />
              </div>
            ) : groups.length > 0 ? (
              <>
                <div className="flex flex-col overflow-x-auto overflow-y-none">
                  <div
                    className={`relative ${
                      groups.length > 12 ? 'h-[34rem]' : ''
                    } md:rounded-lg`}
                  >
                    <table
                      className="min-w-full border-separate"
                      style={{ borderSpacing: 0 }}
                    >
                      <tbody className="bg-white">
                        <tr key="selectall">
                          <td className="border-b relative px-7 w-12">
                            <input
                              type="checkbox"
                              className="absolute -mt-2 h-4 w-4 rounded border-gray-400 text-blue-primary focus:ring-blue-light left-6"
                              checked={
                                groups.length === selectedGroupIds.length
                              }
                              onChange={toggleAll}
                            />
                          </td>
                          <td className="border-b whitespace-nowrap py-2.5 text-sm font-normal text-gray-800">
                            Select all results
                          </td>
                          <td className="border-b py-2.5 "></td>
                          <td className="border-b py-2.5"></td>
                        </tr>
                        {orderedGroups.map(group => (
                          <tr
                            key={group.email}
                            className={
                              selectedGroupIds.includes(group.id) &&
                              !group.Synced
                                ? 'bg-[#0077FF14]'
                                : undefined
                            }
                          >
                            {group.Synced ? (
                              <td className="border-b relative px-7 w-12">
                                <input
                                  type="checkbox"
                                  className="absolute -mt-2 h-4 w-4 rounded border-gray-400 text-blue-primary focus:ring-blue-light left-6"
                                  value={group.email}
                                  checked={syncedGroupIds.includes(group.id)}
                                  onClick={event => onGroupRemove(group, event)}
                                  readOnly
                                />
                              </td>
                            ) : (
                              <td className="border-b relative px-7 w-12">
                                <input
                                  type="checkbox"
                                  className="absolute -mt-2 h-4 w-4 rounded border-gray-400 text-blue-primary focus:ring-blue-light left-6"
                                  value={group.email}
                                  checked={selectedGroupIds.includes(group.id)}
                                  onChange={e => onGroupSelect(e, group.id)}
                                />
                              </td>
                            )}
                            <td className="border-b max-w-[12rem] truncate whitespace-nowrap py-2.5 text-sm font-normal text-gray-800">
                              {group.name}
                              <p className="text-xs font-medium text-gray-dark">
                                {group.email}
                              </p>
                            </td>
                            <td className="border-b text-left sm:w-16 text-gray-800 font-normal text-sm">
                              {group.Synced ? 'Synced' : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="border-t border-[#DADCE3] md:-ml-[15.5rem]">
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={onGroupSave}
                      disabled={
                        !!error.message || syncProgress?.started
                        // TODO: determine if we want to keep this or not
                        // || selectedGroupIds.length === 0
                      }
                      className="inline-flex justify-center py-2 px-4 rounded-lg border border-transparent bg-blue-primary text-sm font-medium text-white shadow-sm hover:bg-blue-dark focus:outline-none focus:ring-2 focus:ring-blue-light focus:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      {noNewSelections ? 'Sync Groups' : 'Save Groups'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-700 font-normal text-sm">
                No results
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupManagement;
