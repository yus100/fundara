import clientPromise from '../../lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { amount, signature, sender, recipient, projectId } = req.body;

    const client = await clientPromise;
    const db = client.db('crowdfunding');

    const donation = {
      donorId: userId,
      amount,
      projectId,
      transactionSignature: signature,
      senderAddress: sender,
      recipientAddress: recipient,
      createdAt: new Date(),
      type: 'solana'
    };

    await db.collection('donations').insertOne(donation);
    res.status(200).json({ message: 'Donation recorded successfully' });
  } catch (error) {
    console.error('Error saving donation:', error);
    res.status(500).json({ message: 'Error saving donation' });
  }
} 