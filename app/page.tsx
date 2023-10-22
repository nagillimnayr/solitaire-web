'use client';

import { SolitaireGame } from '@/components/canvas/game/SolitaireGame';
import { GameHud } from '@/components/dom/hud/GameHud';
import { LoadingFallback } from '@/components/dom/loading-fallback/LoadingFallback';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const View = dynamic(
  () => import('@/components/canvas/scene/View').then((mod) => mod.View),
  {
    ssr: false,
    loading: () => <LoadingFallback />,
  },
);
const Common = dynamic(
  () => import('@/components/canvas/scene/View').then((mod) => mod.Common),
  { ssr: false },
);

export default function Page() {
  return (
    <>
      <div className='mx-auto flex h-screen w-full flex-col flex-wrap items-center '>
        <div className='relative m-0 h-full w-full p-0'>
          <GameHud />
          <View orbit={false} className='relative h-full w-full'>
            <Suspense fallback={null}>
              <SolitaireGame />
              <color attach='background' args={['lightblue']} />
            </Suspense>
          </View>
        </div>
      </div>
    </>
  );
}
