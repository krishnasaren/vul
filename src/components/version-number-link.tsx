import React from 'react';

interface VersionNumberLinkProps {
  build: string;
  version: string;
}

export const getBuildUrl = (build: string) =>
  'https://app-updates.agilebits.com/product_history/SCIM#v' + build;

const VersionNumberLink = ({ build, version }: VersionNumberLinkProps) => (
  <a
    className="text-sm text-[#85BEFF] hover:text-blue-dark underline"
    href={getBuildUrl(build)}
    target="_blank"
    rel="noopener noreferrer"
  >
    Version {version}
  </a>
);

export default VersionNumberLink;
