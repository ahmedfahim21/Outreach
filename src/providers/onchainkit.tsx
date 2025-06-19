'use client';

import { base, baseSepolia } from 'wagmi/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import type { ReactNode } from 'react';

export function OnChainProviders(props: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_CDP_CLIENT_API_KEY}
      projectId={process.env.NEXT_PUBLIC_CDP_PROJECT_ID}
          chain={process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? base : baseSepolia}
          config={{ appearance: { 
            mode: 'dark',
        }
      }}
    >
      {props.children}
    </OnchainKitProvider>
  );
}
