import { PropsWithChildren } from 'react';
import { GlobalStateProvider } from './GlobalStateProvider';
import { Analytics } from '@vercel/analytics/react';

export function Providers({ children }: PropsWithChildren) {
  return (
    <>
      <GlobalStateProvider>{children}</GlobalStateProvider>
      <Analytics />
    </>
  );
}
