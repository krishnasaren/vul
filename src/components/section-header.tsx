import React, { ReactNode } from 'react';

interface ChildProps {
  header: string;
  children?: ReactNode;
}

const SectionHeader = ({ header, children }: ChildProps) => {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md text-center my-6">
      <h2 className="text-center text-3xl font-extrabold text-gray-700 my-3">
        {header}
      </h2>
      {children}
    </div>
  );
};

export default SectionHeader;
