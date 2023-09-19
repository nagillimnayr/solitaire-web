import { PropsWithChildren, createContext, useMemo } from 'react';
import { ActorRefFrom } from 'xstate';
import { GameMachine } from '@/state/game-machine';
import { useInterpret } from '@xstate/react';

type GlobalState = {
  GameActor: ActorRefFrom<typeof GameMachine>;
};
export const GlobalStateContext = createContext<GlobalState>(null!);

export const GlobalStateProvider = ({ children }: PropsWithChildren) => {
  const GameActor = useInterpret(GameMachine);

  const context: GlobalState = useMemo(
    () => ({
      GameActor,
    }),
    [GameActor],
  );

  return (
    <>
      <GlobalStateContext.Provider value={context}>
        {children}
      </GlobalStateContext.Provider>
    </>
  );
};
