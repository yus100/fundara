// pages/index.js
import useSWR from 'swr';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home({ initialProjects }) {
  // Using SWR to revalidate data on the client side
  const { data, error } = useSWR('/api/projects', fetcher, {
    fallbackData: { projects: initialProjects },
  });

  if (error) return <div>Failed to load projects.</div>;
  if (!data) return <div>Loading...</div>;

  const { projects } = data;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Crowdfunding Projects</h1>
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
            <div style={{ margin: '10px 0' }}>
              <div
                style={{
                  background: '#eee',
                  width: '100%',
                  height: '20px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    background: '#76c7c0',
                    width: `${(project.donated / project.goal) * 100}%`,
                    height: '100%',
                  }}
                ></div>
              </div>
              <p style={{ fontSize: '0.9em', margin: '5px 0' }}>
                ${project.donated} raised of ${project.goal}
              </p>
            </div>
            <button
              onClick={() => handleDonate(project._id)}
              style={{
                padding: '10px 20px',
                background: '#0070f3',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Donate
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // This is a placeholder for your donation logic.
  function handleDonate(projectId) {
    alert(`Donate button clicked for project ${projectId}`);
  }
}

// You can fetch the initial data on the server side so the page is pre-rendered.
export async function getServerSideProps() {
  // Option 1: Use the API route (make sure your server URL is correct)
  // const res = await fetch('http://localhost:3000/api/projects');
  // const data = await res.json();
  // return { props: { initialProjects: data.projects } };

  // Option 2: Directly fetch from MongoDB (this avoids an extra HTTP request)
  const clientPromise = (await import('../lib/mongodb')).default;
  const client = await clientPromise;
  const db = client.db('crowdfunding');
  const projects = await db.collection('projects').find({}).toArray();
  const projectsSerialized = projects.map((project) => ({
    ...project,
    _id: project._id.toString(),
  }));

  return {
    props: { initialProjects: projectsSerialized },
  };
}
