// pages/api/projects/index.js
import clientPromise from '../../../lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';




export const config = {
  api: {
    bodyParser: false,
  },
};


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

          // Parse the multipart form data
          const form = new IncomingForm({
            keepExtensions: true,
            multiples: false,
          });
          
          // Convert form parsing to Promise
          const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
              if (err) return reject(err);
              resolve([fields, files]);
            });
          });
    
          // Handle the image file if it exists
          let imageData = null;
          if (files && files.media && files.media[0]) {
            const file = files.media[0];
            try {
              // Read the file contents
              const imageBuffer = await fs.readFile(file.filepath);
              // Convert to base64
              imageData = `data:${file.mimetype};base64,${imageBuffer.toString('base64')}`;
              // Clean up the temporary file
              await fs.unlink(file.filepath);
            } catch (error) {
              console.error('Error processing file:', error);
            }
          }
    
          // Create new project and include the current user's ID
          const newProject = {
            title: fields.projectName[0], // Access first element of the array
            author: fields.author[0],
            orcid: fields.orcid ? fields.orcid[0] : '',
            description: fields.description[0],
            image: imageData,
            hpcProvider: fields.hpcProvider[0],
            gpuHours: parseFloat(fields.gpuHours[0]),
            moneyNeeded: parseFloat(fields.moneyNeeded[0]),
            donated: 0,
            goal: parseFloat(fields.moneyNeeded[0]),
            createdAt: new Date(),
            creatorId: userId,
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