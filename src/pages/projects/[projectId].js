// pages/projects/[projectId].js
import { useState } from 'react';
import useSWR from 'swr';
import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';
import Navbar from '../../components/Navbar';
import { useUser } from '@clerk/nextjs';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ProjectPage({ project, initialUpdates, orcidData }) {
  const { user } = useUser();
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateText, setUpdateText] = useState('');
  const { data: updatesData, mutate: mutateUpdates } = useSWR(
    `/api/project-updates?projectId=${project._id}`,
    fetcher,
    { fallbackData: { updates: initialUpdates } }
  );

  // Determine if the logged-in user is the owner
  const isOwner = user && user.id === project.creatorId;

  // Get the timestamp for the most recent update
  const lastUpdate =
    updatesData &&
    updatesData.updates &&
    updatesData.updates.length > 0 &&
    updatesData.updates[0].createdAt;

  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!updateText.trim()) return;

    try {
      const res = await fetch('/api/project-updates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project._id, updateText }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to add update.');
        return;
      }
      setUpdateText('');
      setShowUpdateForm(false);
      mutateUpdates(); // Refresh updates list
    } catch (error) {
      console.error('Error adding update:', error);
      alert('Error adding update.');
    }
  };

  // Render ORCID section (as shown previously)
  let orcidAuthorName = null;
  if (
    orcidData &&
    orcidData.person &&
    orcidData.person.name &&
    (orcidData.person.name['given-names'] || orcidData.person.name['family-name'])
  ) {
    const given = orcidData.person.name['given-names']?.value || '';
    const family = orcidData.person.name['family-name']?.value || '';
    orcidAuthorName = `${given} ${family}`.trim();
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
        <div>
          <strong>ORCID:</strong>{' '}
          <a
            href={`https://orcid.org/${project.orcid}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {project.orcid}
          </a>
        </div>
      )}
      {project.orcid && orcidData && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ddd' }}>
          <h3>Author Credentials from ORCID</h3>
          {orcidAuthorName ? (
            <p>
              <strong>Name from ORCID:</strong> {orcidAuthorName}
            </p>
          ) : (
            <p>Could not extract name from ORCID record.</p>
          )}
          <a
            href={`https://orcid.org/${project.orcid}/works`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              marginTop: '10px',
              padding: '8px 16px',
              background: '#0070f3',
              color: '#fff',
              borderRadius: '5px',
              textDecoration: 'none',
            }}
          >
            View Past Publications
          </a>
        </div>
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

      {/* Project Updates Section */}
      <hr style={{ margin: '40px 0' }} />
      <h2>Project Updates</h2>
      {lastUpdate && (
        <p>
          <em>Last updated on: {new Date(lastUpdate).toLocaleString()}</em>
        </p>
      )}

      {updatesData && updatesData.updates && updatesData.updates.length > 0 ? (
        updatesData.updates.map((update) => (
          <div
            key={update._id}
            style={{
              border: '1px solid #ccc',
              padding: '15px',
              marginBottom: '15px',
              borderRadius: '5px',
            }}
          >
            <p>{update.updateText}</p>
            <small>
              Updated on: {new Date(update.createdAt).toLocaleString()}
            </small>
          </div>
        ))
      ) : (
        <p>No updates yet.</p>
      )}

      {/* If the current user is the owner, show the update form */}
      {isOwner && (
        <div style={{ marginTop: '30px' }}>
          {!showUpdateForm ? (
            <button
              onClick={() => setShowUpdateForm(true)}
              style={{
                padding: '10px 20px',
                background: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Add Update
            </button>
          ) : (
            <form onSubmit={handleAddUpdate}>
              <textarea
                value={updateText}
                onChange={(e) => setUpdateText(e.target.value)}
                placeholder="Enter your update here..."
                style={{ width: '100%', height: '100px', padding: '10px', marginBottom: '10px' }}
                required
              ></textarea>
              <br />
              <button
                type="submit"
                style={{
                  padding: '10px 20px',
                  background: '#0070f3',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '10px',
                }}
              >
                Submit Update
              </button>
              <button
                type="button"
                onClick={() => setShowUpdateForm(false)}
                style={{
                  padding: '10px 20px',
                  background: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { projectId } = context.params;
  try {
    const client = await clientPromise;
    const db = client.db('crowdfunding');

    // Fetch the project
    const project = await db
      .collection('projects')
      .findOne({ _id: new ObjectId(projectId) });
    if (!project) {
      return { notFound: true };
    }
    project._id = project._id.toString();
    project.createdAt = project.createdAt ? project.createdAt.toISOString() : null;

    // Fetch project updates (sorted with the newest first)
    const updates = await db
      .collection('projectUpdates')
      .find({ projectId: project._id })
      .sort({ createdAt: -1 })
      .toArray();
    const updatesSerialized = updates.map((update) => ({
      ...update,
      _id: update._id.toString(),
      createdAt: update.createdAt ? update.createdAt.toISOString() : null,
    }));

    // (Optional) If the project has an ORCID, fetch its record from the public ORCID API.
    let orcidData = null;
    if (project.orcid) {
      try {
        const orcidRes = await fetch(`https://pub.orcid.org/v3.0/${project.orcid}`, {
          headers: { Accept: 'application/json' },
        });
        if (orcidRes.ok) {
          orcidData = await orcidRes.json();
        }
      } catch (err) {
        console.error('Failed to fetch ORCID data:', err);
      }
    }

    return {
      props: {
        project,
        initialUpdates: updatesSerialized,
        orcidData,
      },
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return { props: { project: null, initialUpdates: [], orcidData: null } };
  }
}
