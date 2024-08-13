import React, { useEffect } from 'react';
import { actions, state } from '../state';
import { useSnapshot } from 'valtio';
import { ParticipantList } from '../components/ParticipantList';
import { ExitButton } from '../components/ui/ExitButton';
import { RouletteColorBackgroundStyle, RouletteColorTextStyle } from '../util';
import { RouletteColor } from 'shared';

export enum TextColor {
  red = 'bg-slate-100',
  black = 'bg-slate-100',
  green = 'bg-slate-100',
}

export const WaitingRoom: React.FC = () => {
  const currentState = useSnapshot(state);
  const [bet, setBet] = React.useState(0);
  const [color, setColor] = React.useState('null');
  const chosenColor: RouletteColor | null =
    currentState.me && currentState.game?.participants[currentState.me?.id]
      ? currentState.game?.participants[currentState.me?.id].chosenColor
      : RouletteColor.none;
  const styleKey: RouletteColor =
    chosenColor === null ? RouletteColor.none : chosenColor;

  useEffect(() => {
    actions.initializeSocket();
  }, []);

  const handleExit = () => {
    actions.startOver();
  };

  return (
    <div className="flex flex-col w-full justify-between items-center h-full">
      <ParticipantList
        isOpen={true}
        participants={currentState.game?.participants || {}}
        userID={currentState.me?.id}
        isAdmin={currentState.isAdmin}
        onRemoveParticipant={(id) => actions.removeParticipant(id)}
      />
      <ExitButton onClick={handleExit} />
      <div className="absolute right-0 flex flex-col w-2/3 items-center h-full">
        <div>
          <h1>
            Room code:{' '}
            <span className="text-orange-500">{currentState.game?.id}</span>
          </h1>
          <h1>
            Max bet:{' '}
            <span className="text-red-500">{currentState.game?.max_bet}</span>
          </h1>
        </div>
        <div
          className={`${
            RouletteColorBackgroundStyle[currentState.gameColor]
          } text-slate-100 p-12 m-10 rounded-xl `}
        >
          <span className="text-5xl">{currentState.gameNumber}</span>
        </div>
        <button
          disabled={!currentState.isAdmin}
          onClick={actions.startGame}
          className="box btn-orange w-32 my-2"
        >
          Start game
        </button>
        <h3>
          Your credits:{' '}
          <span className="text-orange-500">
            {currentState.me &&
            currentState.game?.participants[currentState.me?.id]
              ? currentState.game?.participants[currentState.me?.id].credits
              : 'Please reenter'}
          </span>
        </h3>
        <h3>
          Your bet:{' '}
          <span className="text-orange-500">
            {currentState.me &&
            currentState.game?.participants[currentState.me?.id]
              ? currentState.game?.participants[currentState.me?.id].bet
              : 'Please reenter'}
          </span>
        </h3>
        <h3 className="text-center">Change bet:</h3>
        <div className="text-center w-full">
          <input
            onChange={(e) => {
              if (e.target.value === '') {
                setBet(0);
                return;
              }
              if (
                (currentState.game?.max_bet ?? -1) < parseInt(e.target.value) ||
                parseInt(e.target.value) < -1
              ) {
                return;
              }
              setBet(parseInt(e.target.value));
            }}
            className="box info w-1/3 my-2 "
            value={bet === null ? '' : bet}
          />
        </div>
        <h3>
          Your color:{' '}
          <span className={`${RouletteColorTextStyle[styleKey]}`}>
            {currentState.me &&
            currentState.game?.participants[currentState.me?.id]
              ? currentState.game?.participants[currentState.me?.id].chosenColor
              : 'Please reenter'}
          </span>
        </h3>
        <h3 className="text-center">Change color:</h3>
        <div className="text-center w-full">
          <select
            onChange={(e) => setColor(e.target.value)}
            value={color}
            className="box w-1/3"
          >
            <option value="null">Null</option>
            <option
              value="red"
              className={`${RouletteColorBackgroundStyle.red} text-slate-100`}
            >
              Red
            </option>
            <option
              value="black"
              className={`${RouletteColorBackgroundStyle.black} text-slate-100`}
            >
              Black
            </option>
            <option
              value="green"
              className={`${RouletteColorBackgroundStyle.green} text-slate-100`}
            >
              Green
            </option>
          </select>
        </div>
        <button
          onClick={() => {
            actions.placeBet(bet);
            actions.chooseColor(color);
            setBet(0);
            setColor('null');
          }}
          className="box btn-orange w-32 my-2"
        >
          Submit
        </button>
      </div>
    </div>
  );
};
