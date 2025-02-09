import React, { useState, ChangeEvent } from 'react';

interface FileUploadProps {
  onFileSelect?: (file: File | null) => void;
  maxSizeInMB?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  onFileSelect,
  maxSizeInMB = 5 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [preview, setPreview] = useState<string>('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError('');

    if (selectedFile) {
      //file type validation
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(selectedFile.type)) {
        setError('Please select a PNG, JPG, or JPEG file only');
        e.target.value = '';
        setFile(null);
        setPreview('');
        return;
      }

      if (selectedFile.size > maxSizeInMB * 1024 * 1024) {
        setError(`File size should be less than ${maxSizeInMB}MB`);
        e.target.value = '';
        setFile(null);
        setPreview('');
        return;
      }

      setFile(selectedFile);
      onFileSelect?.(selectedFile);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const clearFile = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setFile(null);
    setPreview('');
    setError('');
    onFileSelect?.(null);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="relative">
        <label 
          htmlFor="file-upload" 
          className={`
            flex flex-col items-center justify-center w-full h-64 
            border-2 border-dashed rounded-lg cursor-pointer
            ${error ? 'border-red-500 bg-red-50' : 
              file ? 'border-green-500 bg-green-50' : 
              'border-gray-300 bg-gray-50 hover:bg-gray-100'}
            transition-colors duration-200
          `}
        >
          {preview ? (
            <div className="relative w-full h-full p-4">
              <img 
                src={preview} 
                alt="Preview" 
                className="w-full h-full object-contain"
              />
              <button
                onClick={clearFile}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                aria-label="Remove file"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <div className="w-10 h-10 mb-3 text-gray-400">↑</div>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG or JPEG files only (max {maxSizeInMB}MB)</p>
            </div>
          )}
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleFileChange}
          />
        </label>
        {error && (
          <p className="mt-2 text-sm text-red-500" role="alert">{error}</p>
        )}
        {file && !error && (
          <p className="mt-2 text-sm text-green-500">
            File selected: {file.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;