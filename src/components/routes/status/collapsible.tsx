import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

interface CollapsibleProps {
  title: React.ReactElement;
  status?: React.ReactElement;
  children: React.ReactElement | React.ReactElement[];
  startOpened?: boolean;
  setHasBeenOpenedBefore?: Dispatch<SetStateAction<boolean>>;
}

export const Collapsible = ({
  title,
  status,
  children,
  startOpened,
  setHasBeenOpenedBefore,
}: CollapsibleProps) => {
  const [collapsed, setCollapsed] = useState(() => !startOpened);
  if (setHasBeenOpenedBefore && startOpened) {
    setHasBeenOpenedBefore(true);
  }

  useEffect(() => {
    setCollapsed(!startOpened);
  }, [startOpened]);

  const onClick = () => {
    if (setHasBeenOpenedBefore) {
      setHasBeenOpenedBefore(true);
    }

    setCollapsed(!collapsed);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center">
        <div className="flex justify-between w-full">
          <div className="flex items-center">
            {title} {status}
          </div>
          <div onClick={onClick} className="font-bold cursor-pointer ml-1">
            {collapsed ? (
              <ChevronRightIcon className="w-5 h-5 inline" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 inline" />
            )}
          </div>
        </div>
      </div>

      <div className={`${collapsed ? 'hidden' : ''} pt-3`}>{children}</div>
    </div>
  );
};

export interface CollapsibleWithButtonProps extends CollapsibleProps {
  collapsedButtonText: string;
  expandedButtonText: string;
  disabled: boolean;
}

export const CollapsibleWithButton = ({
  title,
  status,
  children,
  startOpened,
  setHasBeenOpenedBefore,

  collapsedButtonText,
  expandedButtonText,
  disabled,
}: CollapsibleWithButtonProps) => {
  const [collapsed, setCollapsed] = useState(() => !startOpened);
  if (setHasBeenOpenedBefore && startOpened) {
    setHasBeenOpenedBefore(true);
  }

  const onClick = () => {
    if (setHasBeenOpenedBefore) {
      setHasBeenOpenedBefore(true);
    }

    setCollapsed(!collapsed);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center">
        <div className="flex w-full justify-between">
          <div className="flex items-center">
            {title} <div className="invisible sm:visible">{status}</div>
          </div>
          <div
            onClick={onClick}
            className="font-bold mr-2 sm:mr-0 cursor-pointer ml-1"
          >
            {!disabled &&
              (collapsed ? (
                <button
                  onClick={onClick}
                  className="w-full ml-2 sm:ml-0 px-4 cursor-pointer py-2 sm:px-4 border border-solid border-blue-primary rounded-lg shadow-sm text-sm text-blue-primary hover:text-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  {collapsedButtonText}
                </button>
              ) : (
                <button
                  onClick={onClick}
                  className="cursor-pointer ml-2 sm:ml-0 py-2 px-4 sm:px-4 border border-solid border-blue-primary rounded-lg shadow-sm text-sm text-blue-primary hover:text-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2"
                >
                  {expandedButtonText}
                </button>
              ))}
          </div>
        </div>
      </div>

      <div className={disabled || collapsed ? 'hidden' : 'pt-3'}>
        {children}
      </div>
    </div>
  );
};
