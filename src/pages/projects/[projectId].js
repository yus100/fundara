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
    <div className="min-h-screen bg-gray-50">
    <Navbar />
    
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {project.image && (
          <div className="w-full aspect-[16/9] sm:aspect-[2/1] lg:aspect-[16/9] relative overflow-hidden">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-4 sm:p-6 lg:p-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            {project.title}
          </h1>

          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between text-sm font-medium mb-2 gap-1">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
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
          <div className="space-y-6 sm:space-y-8">
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">About the Project</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 bg-gray-50 rounded-lg p-4 sm:p-6">
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
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
