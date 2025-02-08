// pages/new-project.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

export default function NewProject() {
  const [formData, setFormData] = useState({
    projectName: '',
    author: '',
    orcid: '',
    description: '',
    media: '',
    hpcProvider: 'GCP',
    gpuHours: '',
    moneyNeeded: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  // Update form state as fields change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // On form submit, send a POST request to create a new project
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.projectName ||
      !formData.author ||
      !formData.description ||
      !formData.hpcProvider ||
      !formData.gpuHours ||
      !formData.moneyNeeded
    ) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Something went wrong.');
        return;
      }

      // On success, redirect to the home page
      router.push('/');
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Error creating project.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Navbar />
      <h1>Fund New Project</h1>
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px', marginTop: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="projectName">Project Name:</label>
          <br />
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="author">Author:</label>
          <br />
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="orcid">ORCID:</label>
          <br />
          <input
            type="text"
            id="orcid"
            name="orcid"
            value={formData.orcid}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="description">Description:</label>
          <br />
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            required
          ></textarea>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="media">Media Upload (URL):</label>
          <br />
          <input
            type="text"
            id="media"
            name="media"
            value={formData.media}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="hpcProvider">HPC Provider:</label>
          <br />
          <select
            id="hpcProvider"
            name="hpcProvider"
            value={formData.hpcProvider}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="GCP">GCP</option>
            <option value="Azure">Azure</option>
            <option value="AWS">AWS</option>
            <option value="Lambda Labs">Lambda Labs</option>
            <option value="RunPod">RunPod</option>
            <option value="CoreWeave">CoreWeave</option>
          </select>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="gpuHours">Approx GPU Hours Needed:</label>
          <br />
          <input
            type="number"
            id="gpuHours"
            name="gpuHours"
            value={formData.gpuHours}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="moneyNeeded">Money Needed ($):</label>
          <br />
          <input
            type="number"
            id="moneyNeeded"
            name="moneyNeeded"
            value={formData.moneyNeeded}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button
          type="submit"
          style={{
            padding: '10px 20px',
            background: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Submit Project
        </button>
      </form>
    </div>
  );
}
