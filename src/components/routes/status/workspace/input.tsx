import React, { Dispatch, SetStateAction } from 'react';

interface InputProps {
  title: string;
  tooltip: string;
  text: string;
  setText: Dispatch<SetStateAction<string>>;
}

const Input = ({ title, tooltip, text, setText }: InputProps) => (
  <div className="mb-6">
    <label
      htmlFor={title}
      className="block text-base font-semibold text-gray-800"
    >
      {title}
    </label>
    <div>
      <p className="text-sm mt-2 text-gray-dark" id="email-description">
        {tooltip}
      </p>
      <input
        type="text"
        name={title}
        value={text}
        onChange={e => setText(e.target.value)}
        className="shadow-sm mt-2 focus:ring-blue-light focus:border-blue-light block w-full text-gray-800 sm:text-sm border-gray-light rounded-md"
      />
    </div>
  </div>
);

export default Input;
