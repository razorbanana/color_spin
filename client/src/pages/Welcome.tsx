import React from 'react';
import { actions, AppPage } from '../state';

const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h1 className="text-center my-12">Welcome to Rankr</h1>
      <div className="my-12 flex flex-col justify-center">
        <button
          className="box btn-orange my-2"
          onClick={() => actions.setPage(AppPage.Create)}
        >
          Create new game
        </button>
        <button
          className="box btn-purple my-2"
          onClick={() => actions.setPage(AppPage.Join)}
        >
          Join existing game
        </button>
      </div>
    </div>
  );
};

export default Welcome;
