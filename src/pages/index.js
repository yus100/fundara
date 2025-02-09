// pages/index.js
import useSWR from 'swr';
import Navbar from '../components/Navbar';
import { getStripe } from "@/utils/stripe";
import { useState } from "react";
import { handlePaymentError } from "@/utils/errorHandling";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Home({ initialProjects }) {
  const [errorMessage, setErrorMessage] = useState(null);

  const { data, error, mutate } = useSWR('/api/projects', fetcher, {
    fallbackData: { projects: initialProjects },
  });

  if (error) return <div>Failed to load projects.</div>;
  if (!data) return <div>Loading...</div>;

  const { projects } = data;

  async function handleDonate(projectId) {   
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
      <h1>Crowdfunding Projects</h1>

      {/* Error message */}
      {errorMessage && (
        <div className="text-red-500 text-sm bg-red-100/10 p-3 rounded mb-4">
          {errorMessage}
        </div>
      )}
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
}

// Pre-render the page with data from MongoDB
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
