import { Game } from 'shared';
import { proxy } from 'valtio';

export enum AppPage {
  Welcome = 'welcome',
  Create = 'create',
  Join = 'join',
  WaitingRoom = 'waiting-room',
}

export type AppState = {
  currentPage: AppPage;
  isLoading: boolean;
  game?: Game;
  accessToken?: string;
};

const state: AppState = proxy({
  currentPage: AppPage.Welcome,
  isLoading: false,
});

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
  setGameAccessToken: (accessToken?: string): void => {
    state.accessToken = accessToken;
  },
  stopLoading: (): void => {
    state.isLoading = false;
  },
};

export { state, actions };
