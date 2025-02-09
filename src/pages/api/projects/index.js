// pages/api/projects/index.js
import clientPromise from '../../../lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('crowdfunding'); // adjust if needed

  if (req.method === 'GET') {
    try {
      const projects = await db.collection('projects').find({}).toArray();
      const projectsSerialized = projects.map((project) => ({
        ...project,
        _id: project._id.toString(),
        createdAt: project.createdAt ? project.createdAt.toISOString() : null,
      }));
      res.status(200).json({ projects: projectsSerialized });
    } catch (error) {
      console.error('Failed to load projects:', error);
      res.status(500).json({ error: 'Failed to load projects' });
    }
  } else if (req.method === 'POST') {
    try {
      // Ensure the user is signed in
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        projectName,
        author,
        orcid,
        description,
        media,
        hpcProvider,
        gpuHours,
        moneyNeeded,
        solanaWallet,
      } = req.body;

      if (
        !projectName ||
        !author ||
        !description ||
        !hpcProvider ||
        !gpuHours ||
        !moneyNeeded
      ) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }

      // Create new project and include the current user's ID
      const newProject = {
        title: projectName,
        author,
        orcid,
        description,
        image: media,
        hpcProvider,
        gpuHours: parseFloat(gpuHours),
        moneyNeeded: parseFloat(moneyNeeded),
        donated: 0,
        goal: parseFloat(moneyNeeded),
        createdAt: new Date(),
        creatorId: userId,
        solanaWallet: solanaWallet || null,
      };

      const result = await db.collection('projects').insertOne(newProject);
      newProject._id = result.insertedId.toString();
      newProject.createdAt = newProject.createdAt.toISOString();
      

      res.status(201).json(newProject);
    } catch (error) {
      console.error('Failed to create project:', error);
      res.status(500).json({ error: 'Failed to create project.' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
