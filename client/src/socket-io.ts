import { io, Socket } from 'socket.io-client';
import { AppActions, AppState } from './state';

export const socketIOUrl = `http://${import.meta.env.VITE_API_HOST}:${
  import.meta.env.VITE_API_PORT
}/${import.meta.env.VITE_TABLES_NAMESPACE}`;

type CreateSocketOptions = {
  socketIOUrl: string;
  state: AppState;
  actions: AppActions;
};

export const createSocketWithHandlers = ({
  socketIOUrl,
  state,
  actions,
}: CreateSocketOptions): Socket => {
  console.log(`Creating socket with accessToken: ${state.accessToken}`);
  const socket = io(socketIOUrl, {
    auth: { token: state.accessToken },
    transports: ['websocket', 'polling'],
  });

  socket.on(`connect`, () => {
    console.log(
      `Connected with socket ID: ${socket.id}. UserID: ${state.me?.id} will join room ${state.game?.id}`
    );
    actions.stopLoading();
  });

  socket.on(`connect_error`, (error) => {
    console.error(`Connection error ${JSON.stringify(error)}`);
    actions.addWsError({
      type: `Connection error`,
      message: `Failed to connect`,
    });
    actions.stopLoading();
  });

  socket.on(`exception`, (error) => {
    console.error(`Exception: ${JSON.stringify(error)}`);
    actions.addWsError({
      type: `Ws Exception`,
      message: error.message,
    });
  });

  socket.on(`table_updated`, (table) => {
    console.log(`Table updated: ${JSON.stringify(table)}`);
    actions.updateGame(table);
  });

  socket.on(`participant_removed`, (id) => {
    if (state.me?.id === id) {
      actions.startOver();
    }
  });

  socket.on('game_number', (gameNumber) => {
    actions.setGameNumber(gameNumber);
  });

  return socket;
};
