import React from 'react';
import { Participants } from 'shared';

export const ParticipantList = ({
  participants,
  userID,
  isAdmin,
  onRemoveParticipant,
}: {
  isOpen: boolean;
  participants: Participants;
  userID: string | undefined;
  isAdmin: boolean;
  onRemoveParticipant: (id: string) => void;
}) => {
  return (
    <div className="absolute w-1/3 left-0 top-0 bg-slate-200 h-full">
      <h2 className="text-2xl m-6">Participants</h2>
      {Object.entries(participants).map(([id, participant]) => (
        <div key={id} className="m-6 box flex justify-evenly">
          <span className="mr-3">{participant.name}</span>
          <span className="text-orange-600 mx-3">{participant.credits}</span>
          <span
            className={`text-${
              participant.chosenColor ? participant.chosenColor : 'grey'
            }-600 mx-3`}
          >
            {participant.chosenColor ? participant.chosenColor : 'None'}
          </span>
          {isAdmin && id !== userID ? (
            <button
              onClick={() => onRemoveParticipant(id)}
              className="box btn-purple right-0"
            >
              Remove
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
};
