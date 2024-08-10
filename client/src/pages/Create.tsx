import React from 'react';
import { actions, AppPage } from '../state';
import SnackBar from '../components/ui/SnackBar';
import { makeRequest } from '../api';
import { Game } from 'shared';

export const Create: React.FC = () => {
  const [name, setName] = React.useState('');
  const [initialCredits, setInitialCredits] = React.useState(1000);
  const [maxBet, setMaxBet] = React.useState(100);
  const [apiError, setApiError] = React.useState('');

  const areFieldsValid = (): boolean => {
    if (name.length < 1 || name.length > 25) {
      return false;
    }

    if (initialCredits < 10 || initialCredits > 100000) {
      return false;
    }

    if (maxBet < 10 || maxBet > 100000) {
      return false;
    }

    return true;
  };

  const handleCreateGame = async () => {
    actions.startLoading();
    setApiError('');

    const { data, error } = await makeRequest<{
      table: Game;
      accessToken: string;
    }>('/tables', {
      method: 'POST',
      body: JSON.stringify({
        name,
        initialCredits,
        max_bet: maxBet,
      }),
    });

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
        <h3 className="text-center">You can create new game. Enter name:</h3>
        <div className="text-center w-full">
          <input
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            className="box info w-full mb-4 mt-2"
            value={name}
          />
        </div>
        <h3 className="text-center">Enter initial amount of credits:</h3>
        <div className="text-center w-full">
          <input
            maxLength={100}
            onChange={(e) => setInitialCredits(parseInt(e.target.value))}
            className="box info w-full mb-4 mt-2"
            value={initialCredits}
          />
        </div>
        <h3 className="text-center">Enter maximum bet:</h3>
        <div className="text-center w-full">
          <input
            maxLength={100}
            onChange={(e) => setMaxBet(parseInt(e.target.value))}
            className="box info w-full mb-20 mt-2"
            value={maxBet}
          />
        </div>
        <div className="flex flex-col justify-center items-center">
          <button
            className="box btn-orange w-32 my-2"
            onClick={handleCreateGame}
            disabled={!areFieldsValid()}
          >
            Create
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
