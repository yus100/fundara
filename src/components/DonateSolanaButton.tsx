// components/DonateSolanaButton.tsx
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface DonateSolanaButtonProps {
  // The recipient Solana wallet address (as a string) from your project document.
  projectWallet: string;
  // An optional default donation amount in SOL.
  defaultDonationAmount?: number;
}

const DonateSolanaButton: React.FC<DonateSolanaButtonProps> = ({
  projectWallet,
  defaultDonationAmount = 0.1,
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
    setErrorMessage('');
    if (!publicKey) {
      setErrorMessage('Please connect your wallet first.');
      return;
    }
    if (!donationAmount || donationAmount <= 0) {
      setErrorMessage('Please enter a valid donation amount.');
      return;
    }
    setIsSending(true);
    try {
      // Create a transaction that transfers donationAmount SOL (converted to lamports)
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(projectWallet),
          lamports: donationAmount * LAMPORTS_PER_SOL,
        })
      );

      // Send the transaction using the connected wallet.
      const signature = await sendTransaction(transaction, connection);
      // Wait for confirmation.
      await connection.confirmTransaction(signature, 'processed');

      // Optionally, call your backend API to update the MongoDB donation record.
      // Example:
      // await fetch('/api/donations/solana', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ signature, donationAmount, projectWallet }),
      // });

      alert(`Donation successful! Transaction signature: ${signature}`);
    } catch (error) {
      console.error('Error sending donation:', error);
      setErrorMessage('Donation failed! Please try again.');
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
