// pages/api/donations/index.js
import clientPromise from '../../../lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('crowdfunding');

  if (req.method === 'POST') {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { projectId, amount } = req.body;
      if (!projectId || !amount) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }

      const donation = {
        projectId,
        donorId: userId,
        amount: parseFloat(amount),
        createdAt: new Date(),
      };

      // Insert donation record into a dedicated collection
      const result = await db.collection('donations').insertOne(donation);

      // Update the project's donated amount
      await db.collection('projects').updateOne(
        { _id: new ObjectId(projectId) },
        { $inc: { donated: parseFloat(amount) } }
      );

      donation._id = result.insertedId.toString();
      donation.createdAt = donation.createdAt.toISOString();

      res.status(201).json(donation);
    } catch (error) {
      console.error('Failed to record donation:', error);
      res.status(500).json({ error: 'Failed to record donation.' });
    }
  } else if (req.method === 'GET') {
    try {
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const donations = await db
        .collection('donations')
        .find({ donorId: userId })
        .toArray();
      const donationsSerialized = donations.map((donation) => ({
        ...donation,
        _id: donation._id.toString(),
        createdAt: donation.createdAt ? donation.createdAt.toISOString() : null,
      }));
      res.status(200).json({ donations: donationsSerialized });
    } catch (error) {
      console.error('Failed to load donations:', error);
      res.status(500).json({ error: 'Failed to load donations.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
