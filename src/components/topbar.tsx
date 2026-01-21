import React from 'react';
import { bridgeLogo } from './svg/bridge-logo';
import VersionNumberLink from './version-number-link';
import { ArrowLeftOnRectangleIcon } from '@heroicons/react/20/solid';
import LogoutButton from './logout-button';
import { useLocation } from 'wouter';

interface TopBarProps {
  build?: string;
  version?: string;
}

const TopBar = ({ build, version }: TopBarProps) => {
  const [, setLocation] = useLocation();

  return (
    <div className="top-0 mb-10 z-20 sticky bg-[#0A2D4D]">
      <div className="flex justify-between px-3 py-2">
        <div className="flex items-center">
          <div>{bridgeLogo}</div>
          <div className="ml-3">
            <p className="text-md font-normal text-white">
              1Password SCIM Bridge
            </p>
            <p className="text-xs font-medium text-gray-300 group-hover:text-gray-200">
              {build && version && (
                <VersionNumberLink build={build} version={version} />
              )}
            </p>
          </div>
        </div>
        {build && version && (
          <div className="inline-flex items-center text-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2">
            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
            <LogoutButton setLocation={setLocation} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
