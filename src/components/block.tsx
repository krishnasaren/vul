import React from 'react';

const Block = (props: object) => (
  <div
    className="flex flex-col items-start bg-white py-8 shadow-default rounded-lg px-3 sm:px-8 mb-4"
    {...props}
  />
);

export default Block;
