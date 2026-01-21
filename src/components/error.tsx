import React from 'react';

interface ErrorMessageProps {
  message: string;
  detail: string;
}

const ErrorMessage = ({ message, detail }: ErrorMessageProps) => {
  return (
    <div className="w-full md:flex md:items-center justify-center">
      <div
        className="w-full bg-red-light border-solid border border-[#E5B6AC] text-gray-dark px-4 py-2 rounded-lg relative"
        role="alert"
      >
        <strong className="font-bold">{message}</strong>
        <div className="text-sm"> {detail}</div>
      </div>
    </div>
  );
};

export default ErrorMessage;
