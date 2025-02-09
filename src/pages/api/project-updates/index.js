// pages/api/project-updates/index.js
import clientPromise from '../../../lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('crowdfunding');

  if (req.method === 'GET') {
    // GET updates for a given project
    const { projectId } = req.query;
    if (!projectId) {
      return res.status(400).json({ error: 'Missing projectId' });
    }
    try {
      const updates = await db
        .collection('projectUpdates')
        .find({ projectId })
        .sort({ createdAt: -1 })
        .toArray();
      const updatesSerialized = updates.map((update) => ({
        ...update,
        _id: update._id.toString(),
        createdAt: update.createdAt ? update.createdAt.toISOString() : null,
      }));
      return res.status(200).json({ updates: updatesSerialized });
    } catch (error) {
      console.error('Error fetching updates:', error);
      return res.status(500).json({ error: 'Error fetching updates' });
    }
  } else if (req.method === 'POST') {
    // POST a new update for a project.
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { projectId, updateText } = req.body;
    if (!projectId || !updateText) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify that the current user owns the project.
    try {
      const project = await db
        .collection('projects')
        .findOne({ _id: new ObjectId(projectId) });
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      if (project.creatorId !== userId) {
        return res.status(403).json({ error: 'Not allowed to update this project' });
      }

      // Create and insert the new update.
      const newUpdate = {
        projectId,
        updateText,
        createdAt: new Date(),
      };
      const result = await db.collection('projectUpdates').insertOne(newUpdate);
      newUpdate._id = result.insertedId.toString();
      newUpdate.createdAt = newUpdate.createdAt.toISOString();

      return res.status(201).json(newUpdate);
    } catch (error) {
      console.error('Error creating update:', error);
      return res.status(500).json({ error: 'Error creating update' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
