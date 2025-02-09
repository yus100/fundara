// pages/index.js
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Navbar from '../components/Navbar';
import { getStripe } from "@/utils/stripe";
import { handlePaymentError } from "@/utils/errorHandling";
import TopProjectsCarousel from '../components/TopProjectsCarousel';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home({ initialProjects }) {

  const router = useRouter();
  const { data, error, mutate } = useSWR('/api/projects', fetcher, {
    fallbackData: { projects: initialProjects },
  });

  if (error) return <div>Failed to load projects.</div>;
  if (!data) return <div>Loading...</div>;

  const { projects } = data;

  // Navigate to the project detail page
  function handleCardClick(projectId) {
    router.push(`/projects/${projectId}`);
  }

  async function handleDonate(e, projectId) {
    // Prevent the card's click event from firing
    e.stopPropagation();

    const amount = prompt('Enter donation amount:');
    if (!amount) return;

    try {
      setErrorMessage(null);
      // Create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectId, 
          amount: Number(amount), // Ensure amount is a number
        }),
      });

      const { sessionId } = await response.json(); // Specific backend payment instance
      
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const result = await stripe.redirectToCheckout({
        sessionId: sessionId,
      });
    
      if (result.error) {
        setErrorMessage(handlePaymentError(result.error));
      } else {
        // Only update database after successful payment in stripe
        const dbResponse = await fetch('/api/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, amount }),
        });
  
        if (!dbResponse.ok) {
          throw new Error('Failed to record donation');
        }
  
        alert('Donation successful using stripe!');
        mutate(); // Refresh the projects data
      }
    } catch (error) {
      setErrorMessage(handlePaymentError(error));
      alert('Payment Error');
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <Navbar />
      <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            <span className="inline-block mb-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
              Accelerate Project Innovation
            </span>
            <span className="block mt-2 sm:mt-4 text-gray-900">
              Through Direct Support
            </span>
          </h1>
        </div>
      </div>

      <TopProjectsCarousel projects={projects} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              onClick={() => handleCardClick(project._id)}
              className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                  {project.title}
                </h2>
                
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                  {project.description}
                </p>

                <div className="space-y-2 mb-4">
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${Math.min((project.donated / project.goal) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="font-medium">${project.donated.toLocaleString()}</span>
                    <span>of ${project.goal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDonate(e, project._id);
                  }}
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium
                           hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 
                           focus:ring-offset-2 transition-colors duration-200"
                >
                  Donate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const clientPromise = (await import('../lib/mongodb')).default;
  const client = await clientPromise;
  const db = client.db('crowdfunding');
  const projects = await db.collection('projects').find({}).toArray();
  const projectsSerialized = projects.map((project) => ({
    ...project,
    _id: project._id.toString(),
    createdAt: project.createdAt ? project.createdAt.toISOString() : null,
  }));

  return {
    props: { initialProjects: projectsSerialized },
  };
}

