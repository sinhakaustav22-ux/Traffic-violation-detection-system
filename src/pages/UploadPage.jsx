import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Upload, FileVideo, Image as ImageIcon, X, AlertCircle, CheckCircle } from 'lucide-react';
import PageWrapper from '../components/layout/PageWrapper.jsx';
import { uploadVideo, uploadImage, processFile, getFiles } from '../api/uploadAPI.js';
import { useSocket } from '../hooks/useSocket.js';

const UploadPage = () => {
  const [activeTab, setActiveTab] = useState('video');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentFiles, setRecentFiles] = useState([]);
  const fileInputRef = useRef(null);

  const fetchFiles = async () => {
    try {
      const data = await getFiles();
      setRecentFiles(data);
    } catch (err) {
      console.error('Failed to fetch files', err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useSocket('file_status_update', (data) => {
    setRecentFiles(prev => prev.map(f => 
      f.id === data.fileId ? { ...f, status: data.status } : f
    ));
    if (data.status === 'COMPLETED') {
      toast.success(`Processing complete for file #${data.fileId}`);
    } else if (data.status === 'FAILED') {
      toast.error(`Processing failed for file #${data.fileId}`);
    }
  });

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type based on active tab
    if (activeTab === 'video' && !selectedFile.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }
    if (activeTab === 'image' && !selectedFile.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setFile(selectedFile);

    // Create preview
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Auto-switch tab based on file type
      if (droppedFile.type.startsWith('video/')) {
        setActiveTab('video');
      } else if (droppedFile.type.startsWith('image/')) {
        setActiveTab('image');
      } else {
        toast.error('Unsupported file type');
        return;
      }
      
      setFile(droppedFile);
      
      if (droppedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(droppedFile);
      } else {
        setPreview(URL.createObjectURL(droppedFile));
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append(activeTab === 'video' ? 'video' : 'image', file);

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      let response;
      if (activeTab === 'video') {
        response = await uploadVideo(formData);
      } else {
        response = await uploadImage(formData);
      }
      
      clearInterval(interval);
      setUploadProgress(100);
      
      toast.success('File uploaded successfully');
      
      // Start processing
      await processFile(response.file.id);
      toast.success('Processing started');
      
      clearFile();
      fetchFiles();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Upload Media</h1>
        <p className="text-gray-500 mt-1">Upload videos or images for violation detection.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-4 px-6 text-sm font-medium text-center flex items-center justify-center ${
                  activeTab === 'video'
                    ? 'border-b-2 border-[#1E40AF] text-[#1E40AF] bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => { setActiveTab('video'); clearFile(); }}
              >
                <FileVideo className="mr-2" size={18} />
                Video Upload
              </button>
              <button
                className={`flex-1 py-4 px-6 text-sm font-medium text-center flex items-center justify-center ${
                  activeTab === 'image'
                    ? 'border-b-2 border-[#1E40AF] text-[#1E40AF] bg-blue-50'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => { setActiveTab('image'); clearFile(); }}
              >
                <ImageIcon className="mr-2" size={18} />
                Image Upload
              </button>
            </div>

            <div className="p-6">
              {!file ? (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-4 text-sm text-gray-600">
                    <span className="font-medium text-[#1E40AF]">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {activeTab === 'video' ? 'MP4, AVI up to 50MB' : 'PNG, JPG up to 10MB'}
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center truncate pr-4">
                      {activeTab === 'video' ? <FileVideo className="text-gray-400 mr-2" size={20} /> : <ImageIcon className="text-gray-400 mr-2" size={20} />}
                      <span className="text-sm font-medium text-gray-900 truncate">{file.name}</span>
                      <span className="ml-2 text-xs text-gray-500">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                    </div>
                    <button 
                      onClick={clearFile}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      disabled={uploading}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="p-4 bg-black flex justify-center items-center h-64">
                    {activeTab === 'video' ? (
                      <video src={preview} controls className="max-h-full max-w-full" />
                    ) : (
                      <img src={preview} alt="Preview" className="max-h-full max-w-full object-contain" />
                    )}
                  </div>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept={activeTab === 'video' ? 'video/mp4,video/x-m4v,video/*' : 'image/jpeg,image/png,image/jpg'}
                onChange={handleFileSelect}
              />

              {uploading && (
                <div className="mt-6">
                  <div className="flex justify-between text-sm font-medium text-gray-900 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-[#1E40AF] h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="bg-[#1E40AF] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="mr-2" />
                      Upload & Process
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Files Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Recent Uploads</h3>
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
              {recentFiles.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <p>No recent uploads</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {recentFiles.map(f => (
                    <li key={f.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          {f.file_type === 'video' ? (
                            <FileVideo className="text-blue-500 mr-3 mt-1" size={20} />
                          ) : (
                            <ImageIcon className="text-green-500 mr-3 mt-1" size={20} />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate w-40" title={f.original_name}>
                              {f.original_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(f.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(f.status)}`}>
                          {f.status}
                        </span>
                      </div>
                      {f.status === 'FAILED' && (
                        <div className="mt-2 text-xs text-red-600 flex items-start">
                          <AlertCircle size={12} className="mr-1 mt-0.5 flex-shrink-0" />
                          <span>Processing failed. Please try again.</span>
                        </div>
                      )}
                      {f.status === 'COMPLETED' && (
                        <div className="mt-2 text-xs text-green-600 flex items-center">
                          <CheckCircle size={12} className="mr-1" />
                          <span>Processing complete</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default UploadPage;
