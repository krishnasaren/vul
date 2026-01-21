import React from 'react';

interface TitleTextProps {
  text: string;
}

const TitleText = ({ text }: TitleTextProps) => (
  <div className="font-semibold text-xl">{text}</div>
);

export default TitleText;
