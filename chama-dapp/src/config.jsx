// src/config.jsx
import React from 'react';
import { createAppKit } from '@reown/appkit/react';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';

const projectId = '3268c03bffd8e52c1b26452048d2ce4c';

// Define Ethereum Sepolia network in the exact format expected by AppKit
const networks = [
  {
    id: 11155111,
    name: 'Ethereum Sepolia',
    network: 'sepolia',
    rpcUrls: {
      default: { http: ['https://ethereum-sepolia-rpc.publicnode.com'] },
      public: { http: ['https://endpoints.omniatech.io/v1/eth/sepolia/public'] }
    },
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorers: {
      default: {
        name: 'Etherscan',
        url: 'https://sepolia.etherscan.io'
      }
    },
    testnet: true
  }
];

// Get the current URL safely (works in both browser and SSR)
const getOriginUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5173'; // Fallback for SSR
};

const metadata = {
  name: 'Chama Dapp v2',
  description: 'A decentralized group savings platform',
  url: getOriginUrl(),
  icons: ['https://i.ibb.co/0jZ4BfL/chama-logo.png'],
};

// Initialize AppKit once at the root level
let appKit = null;

// Initialize AppKit
try {
  // Create AppKit configuration
  const appKitConfig = {
    adapters: [new EthersAdapter()],
    networks,
    metadata,
    projectId,
    themeMode: 'dark',
    features: {
      analytics: true,
    },
    themeVariables: {
      '--w3m-accent': '#000000',
    },
  };

  console.log('Initializing AppKit with config:', appKitConfig);
  appKit = createAppKit(appKitConfig);

  // Expose the appKit instance globally for debugging and direct access
  if (typeof window !== 'undefined') {
    window.appKit = appKit;
    console.log('AppKit initialized and exposed globally');
  }
} catch (error) {
  console.error('Error initializing AppKit:', error);
}

export default function AppKitConfig() {
  // Use a React effect to ensure AppKit is initialized in the browser environment
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.appKit) {
      console.log('AppKit is available in the browser');
    }
  }, []);

  return null;
}

export { appKit };
