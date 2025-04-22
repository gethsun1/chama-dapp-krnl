import React, { useEffect } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';

/**
 * A component that renders the Web3Modal button directly with custom styling
 */
export default function Web3ModalButton() {
  const { isConnected } = useAppKitAccount();

  useEffect(() => {
    // Create the Web3Modal button if it doesn't exist
    if (!document.querySelector('w3m-button')) {
      try {
        // Create the Web3Modal button element
        const web3ModalButton = document.createElement('w3m-button');

        // Style the button
        web3ModalButton.setAttribute('balance', 'show');
        web3ModalButton.setAttribute('icon', 'hide');

        // Custom styling
        web3ModalButton.style.borderRadius = '8px';
        web3ModalButton.style.backgroundColor = 'black';
        web3ModalButton.style.color = 'white';
        web3ModalButton.style.border = '2px solid white';
        web3ModalButton.style.padding = '8px 16px';
        web3ModalButton.style.fontSize = '0.875rem';

        // Add it to the DOM
        const container = document.getElementById('web3modal-container');
        if (container) {
          container.appendChild(web3ModalButton);
          console.log('Web3Modal button created and added to DOM');
        } else {
          console.error('Web3modal container not found');
        }
      } catch (error) {
        console.error('Error creating Web3Modal button:', error);
      }
    }
  }, []);

  // Apply custom styling to the container
  const containerStyle = {
    display: 'inline-block',
    minWidth: '150px',
    textAlign: 'center'
  };

  return <div id="web3modal-container" style={containerStyle}></div>;
}
