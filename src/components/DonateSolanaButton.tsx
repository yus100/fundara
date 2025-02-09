// components/DonateSolanaButton.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, RpcResponseAndContext, SignatureResult } from '@solana/web3.js';

interface DonateSolanaButtonProps {
  // The recipient Solana wallet address (as a string) from your project document.
  solanaWallet: string;
  // An optional default donation amount in SOL.
  defaultDonationAmount?: number;
  projectId: string;
}

interface TransactionStatus {
  value: {
    err: any;
  };
}

const DonateSolanaButton: React.FC<DonateSolanaButtonProps> = ({
  solanaWallet,
  defaultDonationAmount = 0.1,
  projectId,
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const [isSending, setIsSending] = useState<boolean>(false);
  const [donationAmount, setDonationAmount] = useState<number>(defaultDonationAmount);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Handle changes in the donation amount input field.
  const handleDonationAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDonationAmount(Number(e.target.value));
  };

  // Handle the form submission to create and send the transaction.
  const handleDonate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Solana wallet value:", solanaWallet);
    setErrorMessage('');
    if (!publicKey) {
      setErrorMessage('Please connect your wallet first.');
      return;
    }
    if (!donationAmount || donationAmount <= 0) {
      setErrorMessage('Please enter a valid donation amount.');
      return;
    }
    try {
      // Validate the wallet address
      new PublicKey(solanaWallet);
    } catch (error) {
      setErrorMessage('Invalid wallet address');
      return;
    }
    setIsSending(true);
    try {
      // Create and send transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(solanaWallet),
          lamports: donationAmount * LAMPORTS_PER_SOL,
        })
      );

      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      
      const signature = await sendTransaction(transaction, connection);
      
      // Save donation immediately after transaction is sent
      try {
        const response = await fetch('/api/donations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: donationAmount,
            signature,
            sender: publicKey.toString(),
            recipient: solanaWallet,
            projectId: projectId,
            status: 'pending' // Add status to track transaction state
          }),
        });

        if (!response.ok) {
          console.error('Failed to save donation record');
        }
      } catch (error) {
        console.error('Error saving donation:', error);
      }

      // Try to confirm but don't block on it
      connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      }, 'confirmed').then(confirmation => {
        console.log('Transaction confirmed:', confirmation);
      }).catch(error => {
        console.error('Confirmation error:', error);
      });

      alert(`Donation sent! Transaction signature: ${signature}`);
      return;
    } catch (error) {
      console.error('Error sending donation:', error);
      setErrorMessage(
        error instanceof Error 
          ? `Donation failed: ${error.message}` 
          : 'Donation failed! Please try again.'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form
      onSubmit={handleDonate}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '300px',
      }}
    >
      <label>
        Donation Amount (SOL):
        <input
          type="number"
          step="0.01"
          min="0"
          value={donationAmount}
          onChange={handleDonationAmountChange}
          style={{
            marginLeft: '10px',
            padding: '5px',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
      </label>
      <button
        type="submit"
        disabled={isSending}
        style={{
          padding: '10px 20px',
          background: isSending ? '#ccc' : '#5e2ca5',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: isSending ? 'not-allowed' : 'pointer',
        }}
      >
        {isSending ? 'Processing...' : 'Donate with Solana'}
      </button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </form>
  );
};

export default DonateSolanaButton;
