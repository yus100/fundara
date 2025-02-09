// pages/projects/[projectId].js
import { useState } from 'react';
import useSWR from 'swr';
import { ObjectId } from 'mongodb';
import clientPromise from '../../lib/mongodb';
import Navbar from '../../components/Navbar';
import { useUser } from '@clerk/nextjs';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function ProjectPage({ project, initialUpdates }) {
  const { user } = useUser();
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateText, setUpdateText] = useState('');

  // Fetch updates for this project using SWR.
  const { data: updatesData, mutate: mutateUpdates } = useSWR(
    `/api/project-updates?projectId=${project._id}`,
    fetcher,
    { fallbackData: { updates: initialUpdates } }
  );

  // Determine if the current user is the owner of the project.
  const isOwner = user && user.id === project.creatorId;

  // Handler for submitting an update.
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
      mutateUpdates(); // Refresh the list of updates.
    } catch (error) {
      console.error('Error adding update:', error);
      alert('Error adding update.');
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold">Project not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-6 lg:py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          {project.image && (
            <div className="w-full aspect-[16/9] relative overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              {project.title}
            </h1>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:justify-between text-sm font-medium mb-2 gap-1">
                <div className="flex flex-col sm:flex-row gap-2">
                  <span className="text-blue-600 font-semibold">${project.donated} raised</span>
                  <span className="text-gray-600">of ${project.goal} goal</span>
                </div>
                <span className="text-gray-500">
                  {Math.round((project.donated / project.goal) * 100)}% funded
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min((project.donated / project.goal) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Project Details */}
            <div className="space-y-6">
              <div className="prose max-w-none">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">About the Project</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 rounded-lg p-4">
                {/* Left Column */}
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Author</span>
                    <span className="mt-1 text-gray-900">{project.author}</span>
                  </div>
                  {project.orcid && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">ORCID</span>
                      <span className="mt-1 text-gray-900 break-all">{project.orcid}</span>
                    </div>
                  )}
                  {project.hpcProvider && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">HPC Provider</span>
                      <span className="mt-1 text-gray-900">{project.hpcProvider}</span>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {project.gpuHours && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">GPU Hours Needed</span>
                      <span className="mt-1 text-gray-900">{project.gpuHours.toLocaleString()} hours</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-500">Funding Goal</span>
                    <span className="mt-1 text-gray-900">${project.moneyNeeded.toLocaleString()}</span>
                  </div>
                  {project.createdAt && (
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-500">Project Created</span>
                      <span className="mt-1 text-gray-900 text-sm">
                        {new Date(project.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Updates Section */}
        <div className="mt-8 max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Project Updates</h2>
          {updatesData && updatesData.updates && updatesData.updates.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Last updated on: {new Date(updatesData.updates[0].createdAt).toLocaleString()}
              </p>
              {updatesData.updates.map((update) => (
                <div key={update._id} className="mb-4 p-4 border rounded">
                  <p className="text-gray-800">{update.updateText}</p>
                  <small className="text-gray-500">
                    Updated on: {new Date(update.createdAt).toLocaleString()}
                  </small>
                </div>
              ))}
            </>
          ) : (
            <p className="text-gray-600">No updates yet.</p>
          )}

          {/* Only show the update form if the current user owns the project */}
          {isOwner && (
            <div className="mt-4">
              {!showUpdateForm ? (
                <button
                  onClick={() => setShowUpdateForm(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Add Update
                </button>
              ) : (
                <form onSubmit={handleAddUpdate}>
                  <textarea
                    className="w-full p-2 border rounded mb-2"
                    value={updateText}
                    onChange={(e) => setUpdateText(e.target.value)}
                    placeholder="Enter update description..."
                    required
                  ></textarea>
                  <div className="flex space-x-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                      Submit Update
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUpdateForm(false);
                        setUpdateText('');
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { projectId } = context.params;

  try {
    const client = await clientPromise;
    const db = client.db('crowdfunding');
    const project = await db.collection('projects').findOne({ _id: new ObjectId(projectId) });

    if (!project) {
      return { notFound: true };
    }

    // Serialize the project document.
    project._id = project._id.toString();
    project.createdAt = project.createdAt ? project.createdAt.toISOString() : null;

    // Fetch initial updates for the project.
    const updatesCursor = await db
      .collection('projectUpdates')
      .find({ projectId: project._id })
      .sort({ createdAt: -1 })
      .toArray();
    const initialUpdates = updatesCursor.map((update) => ({
      ...update,
      _id: update._id.toString(),
      createdAt: update.createdAt ? update.createdAt.toISOString() : null,
    }));

    return {
      props: { project, initialUpdates },
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return {
      props: { project: null, initialUpdates: [] },
    };
  }
}
