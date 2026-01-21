import React, { ReactNode } from 'react';

interface ChildProps {
  children: ReactNode;
}

const Container = ({ children }: ChildProps) => {
  return (
    <div className="max-w-[52rem] mx-auto h-full">
      <div className="min-h-full flex flex-col justify-center px-2">
        {children}
      </div>
    </div>
  );
};

export default Container;
