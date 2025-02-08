// pages/my-donations.js
import Navbar from '../components/Navbar';
import clientPromise from '../lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';
import { useRouter } from 'next/router';

export default function MyDonations({ donationsWithProject }) {
  const router = useRouter();

  return (
    <div style={{ padding: '20px' }}>
      <Navbar />

      <h1>My Donations</h1>
      {donationsWithProject.length === 0 ? (
        <p>You have not made any donations yet.</p>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {donationsWithProject.map((donation) => (
            <div
              key={donation._id}
              onClick={() => router.push(`/projects/${donation.project._id}`)}
              style={{
                border: '1px solid #ddd',
                padding: '20px',
                margin: '10px',
                width: '300px',
                borderRadius: '8px',
                boxShadow: '2px 2px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer',
              }}
            >
              <h2>{donation.project?.title || 'Unknown Project'}</h2>
              <p>Donated: ${donation.amount}</p>
              <p>{donation.project?.description}</p>
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

  // Get donation records for the current user
  const donations = await db
    .collection('donations')
    .find({ donorId: userId })
    .toArray();

  // For each donation, fetch the project details
  const donationsWithProject = await Promise.all(
    donations.map(async (donation) => {
      let project = null;
      if (donation.projectId) {
        project = await db
          .collection('projects')
          .findOne({ _id: new ObjectId(donation.projectId) });
        if (project) {
          project._id = project._id.toString();
          project.createdAt = project.createdAt
            ? project.createdAt.toISOString()
            : null;
        }
      }
      return {
        ...donation,
        _id: donation._id.toString(),
        createdAt: donation.createdAt ? donation.createdAt.toISOString() : null,
        project,
      };
    })
  );

  return {
    props: { donationsWithProject },
  };
}
