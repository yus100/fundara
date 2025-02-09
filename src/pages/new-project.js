// pages/new-project.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import FileUpload from '../components/fileUpload.tsx';
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


  // Handle file selection
  const handleFileSelect = (file) => {
    setFormData(prev => ({
      ...prev,
      media: file ? file : ''
    }));
  };


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
      // Create FormData object
      const formDataToSend = new FormData();
      

      Object.keys(formData).forEach(key => {
        if (key === 'media' && formData[key] instanceof File) {
          // Handle file upload
          formDataToSend.append('media', formData[key]);
        } else {
          // Handle other form fields
          formDataToSend.append(key, formData[key].toString());
        }
      });
  
      const res = await fetch('/api/projects', {
        method: 'POST',
        // Remove the Content-Type header - FormData will set it automatically
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`,
        },
        body: formDataToSend,
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'Something went wrong.');
        return;
      }
  
      //response data
      const data = await res.json();
      
      // Redirect to home page with a string path
      router.push('/');
      
      
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Error creating project.');
    }
  };

  return (
<div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
  <Navbar />
  <div className="max-w-3xl mx-auto">
    <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center pt-8">Create New Project</h1>
    
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-1">
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
            Project Title
          </label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor="author" className="block text-sm font-medium text-gray-700">
              Author
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="orcid" className="block text-sm font-medium text-gray-700">
              ORCID
            </label>
            <input
              type="text"
              id="orcid"
              name="orcid"
              value={formData.orcid}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
            required
          ></textarea>
        </div>

        <div className="space-y-2">
          <label htmlFor="media" className="block text-sm font-medium text-gray-700">
            Media Upload
          </label>
          <FileUpload 
            onFileSelect={handleFileSelect}
            maxSizeInMB={5}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="hpcProvider" className="block text-sm font-medium text-gray-700">
            HPC Provider
          </label>
          <select
            id="hpcProvider"
            name="hpcProvider"
            value={formData.hpcProvider}
            onChange={handleChange}
            className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm bg-white"
          >
            <option value="GCP">GCP</option>
            <option value="Azure">Azure</option>
            <option value="AWS">AWS</option>
            <option value="Lambda Labs">Lambda Labs</option>
            <option value="RunPod">RunPod</option>
            <option value="CoreWeave">CoreWeave</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label htmlFor="gpuHours" className="block text-sm font-medium text-gray-700">
              Approx GPU Hours Needed
            </label>
            <input
              type="number"
              id="gpuHours"
              name="gpuHours"
              value={formData.gpuHours}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="moneyNeeded" className="block text-sm font-medium text-gray-700">
              Money Needed ($)
            </label>
            <input
              type="number"
              id="moneyNeeded"
              name="moneyNeeded"
              value={formData.moneyNeeded}
              onChange={handleChange}
              className="w-full rounded-lg border-gray-300 border p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out shadow-sm"
              required
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            Submit Project
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
  );
}
