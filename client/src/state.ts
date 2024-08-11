import { Game } from 'shared';
import { proxy, ref } from 'valtio';
import { derive, subscribeKey } from 'valtio/utils';
import { getTokenPayload } from './util';
import { Socket } from 'socket.io-client';
import { createSocketWithHandlers, socketIOUrl } from './socket-io';

export enum AppPage {
  Welcome = 'welcome',
  Create = 'create',
  Join = 'join',
  WaitingRoom = 'waiting-room',
}

type Me = {
  id: string;
  name: string;
};

export type AppState = {
  me?: Me;
  currentPage: AppPage;
  isLoading: boolean;
  game?: Game;
  accessToken?: string;
  socket?: Socket;
};

const state: AppState = proxy({
  currentPage: AppPage.Welcome,
  isLoading: false,
});

const stateWithComputed: AppState = derive(
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
  },
  {
    proxy: state,
  }
);

const actions = {
  setPage: (page: AppPage): void => {
    state.currentPage = page;
  },
  startOver: (): void => {
    actions.setPage(AppPage.Welcome);
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
};

subscribeKey(state, 'accessToken', () => {
  if (state.accessToken) {
    localStorage.setItem('accessToken', state.accessToken);
  }
});

export type AppActions = typeof actions;

export { stateWithComputed as state, actions };
