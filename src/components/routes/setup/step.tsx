import React, { PropsWithChildren } from 'react';
import { CheckIcon } from '@heroicons/react/20/solid';
import type { JSX } from 'react';
interface StepProps {
  name: string;
  description: string;
  completed: boolean;
}

const Step = ({
  name,
  description,
  completed,
  children,
}: PropsWithChildren<StepProps>): JSX.Element => {
  return (
    <div className="flex">
      {completed ? (
        <span className="mt-1 w-4 h-4 flex items-center justify-center bg-green-500 rounded-full">
          <CheckIcon className="w-4 h-4 text-white" aria-hidden="true" />
        </span>
      ) : (
        <span
          className="mt-1 w-4 h-4 flex items-center justify-center bg-gray-300 rounded-full"
          aria-hidden="true"
        />
      )}

      <div className="ml-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{name}</h3>
        <div className="mt-2 max-w-xl text-sm text-gray-900">
          <p>{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
};

export default Step;
