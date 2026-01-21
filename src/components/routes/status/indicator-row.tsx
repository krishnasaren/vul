import React from 'react';
import * as api from '../../../api';
import { HealthyBadge, UnhealthyBadge } from './badge';

interface IndicatorRowProps {
  state: api.State;
  name: string;
  text: string;
}

const IndicatorRow = ({ state, name, text }: IndicatorRowProps) => (
  <div className="flex justify-between items-center mt-5 w-full border-gray-200 border-0 border-b border-solid pb-5 last:border-hidden last:pb-0">
    <div className="flex flex-col">
      <p className="font-medium text-md">{name}</p>
      <p className="text-small font-normal text-gray-dark">{text}</p>
    </div>
    {(() => {
      switch (state) {
        case api.State.Healthy:
          return <HealthyBadge />;
        case api.State.Unhealthy:
          return <UnhealthyBadge />;
        case api.State.Unknown:
          <></>;
      }
    })()}
  </div>
);

export default IndicatorRow;
