import { Game } from 'shared';
import { proxy, ref } from 'valtio';
import { derive, subscribeKey } from 'valtio/utils';
import { getTokenPayload, rouletteColor } from './util';
import { Socket } from 'socket.io-client';
import { createSocketWithHandlers, socketIOUrl } from './socket-io';
import { nanoid } from 'nanoid';

export enum AppPage {
  Welcome = 'welcome',
  Create = 'create',
  Join = 'join',
  WaitingRoom = 'waiting-room',
}

export type Participant = {
  id: string;
  name: string;
};

type WsError = {
  type: string;
  message: string;
};

type WsErrorUnique = WsError & {
  id: string;
};

export type AppState = {
  me?: Participant;
  currentPage: AppPage;
  isLoading: boolean;
  gameNumber: number;
  game?: Game;
  accessToken?: string;
  socket?: Socket;
  wsErrors: WsErrorUnique[];
};

const state: AppState = proxy({
  gameNumber: 0,
  currentPage: AppPage.Welcome,
  isLoading: false,
  wsErrors: [],
});

const stateWithComputed = derive(
  {
    me: (get) => {
      const accessToken = get(state).accessToken;
      if (!accessToken) {
        return;
      }
      const token = getTokenPayload(accessToken);
      return {
        id: token.sub,
        name: token.name,
      };
    },
    isAdmin: (get) => {
      if (!get(state).me) {
        return false;
      }
      return get(state).me?.id === get(state).game?.adminID;
    },
    gameColor: (get) => {
      return rouletteColor(get(state).gameNumber);
    },
  },
  {
    proxy: state,
  }
);

const actions = {
  setPage: (page: AppPage): void => {
    state.currentPage = page;
  },
  setGameNumber: (number: number): void => {
    state.gameNumber = number;
  },
  startOver: (): void => {
    actions.reset();
    localStorage.removeItem('accessToken');
    actions.setPage(AppPage.Welcome);
  },
  reset: (): void => {
    state.socket?.disconnect();
    state.game = undefined;
    state.accessToken = undefined;
    state.isLoading = false;
    state.socket = undefined;
    state.wsErrors = [];
  },
  startLoading: (): void => {
    state.isLoading = true;
  },
  initializeGame: (game: Game): void => {
    state.game = game;
  },
  updateGame: (game: Game): void => {
    state.game = game;
  },
  setGameAccessToken: (accessToken?: string): void => {
    state.accessToken = accessToken;
  },
  stopLoading: (): void => {
    state.isLoading = false;
  },
  initializeSocket: (): void => {
    if (!state.socket) {
      state.socket = ref(
        createSocketWithHandlers({ socketIOUrl, state, actions })
      );
    } else {
      state.socket.connect();
    }
  },
  placeBet: (bet: number): void => {
    state.socket?.emit('place_bet', { bet });
  },
  chooseColor: (color: string): void => {
    state.socket?.emit('choose_color', { color });
  },
  updateCredits: (credits: number): void => {
    state.socket?.emit('update_credits', { credits });
  },
  removeParticipant: (id: string): void => {
    state.socket?.emit('remove_participant', { id });
  },
  startGame: async () => {
    state.socket?.emit('start_game');
    let counter = state.gameNumber;
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (Math.random() < 0.02) {
        break;
      }
      counter = (counter + 1) % 37;
      state.socket?.emit('roulette_number', { number: counter });
    }
    state.socket?.emit('end_game', { color: stateWithComputed.gameColor });
  },
  addWsError: (error: WsError): void => {
    state.wsErrors = [...state.wsErrors, { ...error, id: nanoid(6) }];
  },
  removeWsError: (id: string): void => {
    state.wsErrors = state.wsErrors.filter((error) => error.id !== id);
  },
};

subscribeKey(state, 'accessToken', () => {
  if (state.accessToken) {
    localStorage.setItem('accessToken', state.accessToken);
  }
});

export type AppActions = typeof actions;

export { stateWithComputed as state, actions };
