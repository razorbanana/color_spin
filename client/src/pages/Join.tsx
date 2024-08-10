import React from 'react';
import { actions, AppPage } from '../state';
import { Game } from 'shared';
import { makeRequest } from '../api';
import SnackBar from '../components/ui/SnackBar';

export const Join: React.FC = () => {
  const [name, setName] = React.useState('');
  const [tableID, setTableID] = React.useState('');
  const [apiError, setApiError] = React.useState('');

  const areFieldsValid = (): boolean => {
    if (tableID.length < 6 || tableID.length > 6) {
      return false;
    }

    if (name.length < 1 || name.length > 25) {
      return false;
    }

    return true;
  };

  const handleJoin = async () => {
    actions.startLoading();
    setApiError('');

    const { data, error } = await makeRequest<{
      accessToken: string;
      table: Game;
    }>('/tables/join', {
      method: 'POST',
      body: JSON.stringify({
        name,
        tableID: tableID,
      }),
    });

    console.log('!!!');
    console.log(data, error);

    if (error && error.statusCode === 400) {
      setApiError('Invalid input');
    } else if (error && error.statusCode !== 400) {
      setApiError(error.messages[0]);
    } else {
      actions.initializeGame(data.table);
      actions.setGameAccessToken(data.accessToken);
      actions.setPage(AppPage.WaitingRoom);
    }
    actions.stopLoading();
  };

  return (
    <div className="flex flex-col w-full justify-around items-stretch h-full mx-auto max-w-sm">
      <SnackBar
        show={apiError.length > 0}
        message={apiError}
        type="error"
        autoCloseDuration={5000}
        onClose={() => setApiError('')}
      />
      <div className="mb-12">
        <h3 className="text-center">
          You can join the game. Enter your join code:
        </h3>
        <div className="text-center w-full">
          <input
            maxLength={100}
            onChange={(e) => setTableID(e.target.value)}
            className="box info w-full mb-4 mt-2"
            value={tableID}
          />
        </div>
        <h3 className="text-center">Enter your name:</h3>
        <div className="text-center w-full">
          <input
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            className="box info w-full mb-4 mt-2"
            value={name}
          />
        </div>
        <div className="flex flex-col justify-around items-center">
          <button
            className="box btn-orange w-32 my-2"
            onClick={handleJoin}
            disabled={!areFieldsValid()}
          >
            Join
          </button>
          <button
            className="box btn-purple w-32 my-2"
            onClick={() => actions.startOver()}
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
};
