import React, { useEffect } from 'react';
import { actions } from '../state';

export const WaitingRoom: React.FC = () => {
  useEffect(() => {
    actions.initializeSocket();
  }, []);
  return (
    <div className="flex flex-col w-full justify-between items-center h-full">
      Waiting Room
    </div>
  );
};
