// pages/api/projects/index.js
import clientPromise from '../../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('crowdfunding'); // Change 'crowdfunding' if needed

  if (req.method === 'GET') {
    try {
      const projects = await db.collection('projects').find({}).toArray();

      // Convert ObjectId to string for each project
      const projectsSerialized = projects.map((project) => ({
        ...project,
        _id: project._id.toString(),
      }));

      res.status(200).json({ projects: projectsSerialized });
    } catch (error) {
      console.error('Failed to load projects:', error);
      res.status(500).json({ error: 'Failed to load projects' });
    }
  } else if (req.method === 'POST') {
    try {
      // Destructure expected fields from the request body
      const {
        projectName,
        author,
        orcid,
        description,
        media,
        hpcProvider,
        gpuHours,
        moneyNeeded,
      } = req.body;

      // Simple validation (you may want to add more robust validation)
      if (
        !projectName ||
        !author ||
        !description ||
        !hpcProvider ||
        !gpuHours ||
        !moneyNeeded
      ) {
        return res
          .status(400)
          .json({ error: 'Missing required fields.' });
      }

      // Construct the new project object. (Here, we set donated to 0.)
      const newProject = {
        title: projectName,
        author,
        orcid,
        description,
        image: media, // For now, we expect a media URL.
        hpcProvider,
        gpuHours: parseFloat(gpuHours),
        moneyNeeded: parseFloat(moneyNeeded),
        donated: 0, // initial donation amount
        goal: parseFloat(moneyNeeded),
        createdAt: new Date(),
      };

      const result = await db.collection('projects').insertOne(newProject);
      newProject._id = result.insertedId.toString();

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
