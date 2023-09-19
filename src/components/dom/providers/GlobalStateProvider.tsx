import { PropsWithChildren, createContext, useMemo } from 'react';
import { ActorRefFrom } from 'xstate';
import { StockMachine } from '@/state/stock-machine';
import { useInterpret } from '@xstate/react';

type GlobalState = {
  StockPileActor: ActorRefFrom<typeof StockMachine>;
};
export const GlobalStateContext = createContext<GlobalState>(null!);

export const GlobalStateProvider = ({ children }: PropsWithChildren) => {
  const StockPileActor = useInterpret(StockMachine);

  const context: GlobalState = useMemo(
    () => ({
      StockPileActor,
    }),
    [StockPileActor],
  );

  return (
    <>
      <GlobalStateContext.Provider value={context}>
        {children}
      </GlobalStateContext.Provider>
    </>
  );
};
