// pages/my-projects.js
import Navbar from '../components/Navbar';
import clientPromise from '../lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';

export default function MyProjects({ projects }) {
  return (
    <div style={{ padding: '20px' }}>
      <Navbar />
      <h1>My Projects</h1>
      {projects.length === 0 ? (
        <p>You have not created any projects.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {projects.map((project) => (
            <div
              key={project._id}
              style={{
                border: '1px solid #ddd',
                padding: '20px',
                margin: '10px',
                width: '300px',
                borderRadius: '8px',
                boxShadow: '2px 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <img
                src={project.image}
                alt={project.title}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              />
              <h2>{project.title}</h2>
              <p>{project.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { userId } = getAuth(context.req);
  if (!userId) {
    return {
      redirect: {
        destination: '/sign-in', // adjust as needed
        permanent: false,
      },
    };
  }
  const client = await clientPromise;
  const db = client.db('crowdfunding');
  const projects = await db
    .collection('projects')
    .find({ creatorId: userId })
    .toArray();
  const projectsSerialized = projects.map((project) => ({
    ...project,
    _id: project._id.toString(),
    createdAt: project.createdAt ? project.createdAt.toISOString() : null,
  }));
  return {
    props: { projects: projectsSerialized },
  };
}
