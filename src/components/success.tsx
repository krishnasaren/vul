import React from 'react';

interface SuccessMessageProps {
  message: string;
  detail: string;
}

const SuccessMessage = ({ message, detail }: SuccessMessageProps) => {
  return (
    <div className="w-full md:flex md:items-center justify-center">
      <div
        className="w-full bg-[#F2FCFA] text-gray-600 border-1 border border-[#ADE0D3] px-4 py-2 rounded-lg relative"
        role="alert"
      >
        <strong className="font-bold">{message}</strong>
        <span className="block sm:inline text-sm"> {detail}</span>
      </div>
    </div>
  );
};

export default SuccessMessage;
