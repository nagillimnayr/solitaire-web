import { Layout } from '@/components/dom/Layout';
import { GlobalStateProvider } from '@/components/dom/providers/GlobalStateProvider';
import '@/global.css';

export const metadata = {
  title: 'Solitaire!',
  description: 'Its Solitaire!',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className='antialiased'>
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body>
        {/* To avoid FOUT with styled-components wrap Layout with StyledComponentsRegistry https://beta.nextjs.org/docs/styling/css-in-js#styled-components */}
        <GlobalStateProvider>
          <Layout>{children}</Layout>
        </GlobalStateProvider>
      </body>
    </html>
  );
}
