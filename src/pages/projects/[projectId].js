// pages/projects/[projectId].js
import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';
import Navbar from '../../components/Navbar';

export default function ProjectPage({ project }) {
  if (!project) {
    return (
      <div style={{ padding: '20px' }}>
        <Navbar />
        <h1>Project not found</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Navbar />
      <h1>{project.title}</h1>
      {project.image && (
        <img
          src={project.image}
          alt={project.title}
          style={{
            width: '100%',
            maxWidth: '600px',
            height: 'auto',
            marginBottom: '20px',
          }}
        />
      )}
      <p>
        <strong>Description:</strong> {project.description}
      </p>
      <p>
        <strong>Author:</strong> {project.author}
      </p>
      {project.orcid && (
        <p>
          <strong>ORCID:</strong> {project.orcid}
        </p>
      )}
      {project.hpcProvider && (
        <p>
          <strong>HPC Provider:</strong> {project.hpcProvider}
        </p>
      )}
      {project.gpuHours && (
        <p>
          <strong>Approx GPU Hours Needed:</strong> {project.gpuHours}
        </p>
      )}
      <p>
        <strong>Money Needed:</strong> ${project.moneyNeeded}
      </p>
      <p>
        <strong>Donated:</strong> ${project.donated} raised of ${project.goal}
      </p>
      {project.createdAt && (
        <p>
          <small>Created on: {new Date(project.createdAt).toLocaleString()}</small>
        </p>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { projectId } = context.params;

  try {
    const client = await clientPromise;
    const db = client.db('crowdfunding');
    const project = await db
      .collection('projects')
      .findOne({ _id: new ObjectId(projectId) });

    if (!project) {
      return { notFound: true };
    }

    // Serialize the project
    project._id = project._id.toString();
    project.createdAt = project.createdAt ? project.createdAt.toISOString() : null;

    return {
      props: { project },
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return {
      props: { project: null },
    };
  }
}
