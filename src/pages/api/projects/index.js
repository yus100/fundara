// pages/api/projects/index.js
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('crowdfunding'); // Change 'crowdfunding' to your database name
    const projects = await db.collection('projects').find({}).toArray();

    // Convert MongoDB ObjectId to string
    const projectsSerialized = projects.map((project) => ({
      ...project,
      _id: project._id.toString(),
    }));

    res.status(200).json({ projects: projectsSerialized });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to load data' });
  }
}
