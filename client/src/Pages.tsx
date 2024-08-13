import React, { useEffect } from 'react';
import Welcome from './pages/Welcome';
import { actions, AppPage, state } from './state';
import { Create } from './pages/Create';
import { Join } from './pages/Join';
import { CSSTransition } from 'react-transition-group';
import { useSnapshot } from 'valtio';
import { WaitingRoom } from './pages/WaitingRoom';

const routeConfig = {
  [AppPage.Welcome]: Welcome,
  [AppPage.Create]: Create,
  [AppPage.Join]: Join,
  [AppPage.WaitingRoom]: WaitingRoom,
};

export const Pages: React.FC = () => {
  const currentState = useSnapshot(state);

  useEffect(() => {
    if (currentState.me?.id && currentState.game) {
      actions.setPage(AppPage.WaitingRoom);
    }
  }, [currentState.me?.id, currentState.game]);
  return (
    <>
      {Object.entries(routeConfig).map(([page, Component]) => (
        <CSSTransition
          key={page}
          in={page === currentState.currentPage}
          timeout={300}
          classNames="page"
          unmountOnExit
          addEndListener={(node, done) => {
            node.addEventListener('transitionend', done, false);
          }}
        >
          <div className="page h-full mx-auto py-8 px-4 overflow-y-auto">
            <Component />
          </div>
        </CSSTransition>
      ))}
    </>
  );
};
