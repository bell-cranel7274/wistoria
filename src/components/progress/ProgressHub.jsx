import React, { useState, useRef, useEffect } from 'react';
import { Video, Square, Play, ArrowLeft, Calendar, Trash2, Edit, X, Camera, Mic, AlertCircle, Settings, Filter, Save, Search, SortAsc, SortDesc, Clock, CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { VIDEO_CATEGORIES } from '../../utils/constants';
import { initDB, saveRecording, getAllRecordings, deleteRecording as deleteRecordingFromDB, updateRecording } from '../../utils/videoStorage';

export const ProgressHub = () => {
  // Core recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  // Recording details state
  const [recordingDetails, setRecordingDetails] = useState({
    title: '',
    category: VIDEO_CATEGORIES[0],
    description: ''
  });
  
  // UI state
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(null);
  const [title, setTitle] = useState('');
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [sortConfig, setSortConfig] = useState({ field: 'timestamp', direction: 'desc' });
  
  // Permission state
  const [permissionStatus, setPermissionStatus] = useState({
    camera: 'checking',
    microphone: 'checking'
  });
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  
  // Refs
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const previewVideoRef = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Utility functions
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setDateRange({ start: '', end: '' });
    setSortConfig({ field: 'timestamp', direction: 'desc' });
  };

  const toggleSort = (field) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Group recordings by category for display
  const groupedRecordings = recordings.reduce((acc, recording) => {
    const category = recording.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(recording);
    return acc;
  }, {});

  const closeRecordingModal = async () => {
    try {
      await cleanupMediaResources();
      setShowRecordingModal(false);
      setError(null);
    } catch (error) {
      console.error('Error closing recording modal:', error);
    }
  };

  // Initialize DB and load recordings
  useEffect(() => {
    const init = async () => {
      try {
        await initDB();
        const loadedRecordings = await getAllRecordings();
        setRecordings(loadedRecordings);
      } catch (error) {
        console.error('Failed to initialize recordings:', error);
      }
    };
    init();
  }, []);

  // Cleanup function for media resources
  const cleanupMediaResources = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (mediaRecorderRef.current) {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        mediaRecorderRef.current = null;
      }
      chunksRef.current = [];
    } catch (error) {
      console.error('Error cleaning up media resources:', error);
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      cleanupMediaResources();
    };
  }, []);

  const startRecording = async () => {
    try {
      await cleanupMediaResources(); // Cleanup any existing resources first
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          // Store the blob in a temporary ref instead of saving immediately
          const blob = new Blob(chunksRef.current, { type: 'video/webm' });
          chunksRef.current = [blob]; // Store blob for later use in handleSaveRecording
          setShowSaveDialog(true);
        } catch (error) {
          console.error('Error preparing recording:', error);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check camera/microphone permissions.');
    }
  };

  const updateRecordingTitle = async (id, newTitle) => {
    try {
      const recording = recordings.find(r => r.id === id);
      if (!recording) return;

      const updatedRecording = {
        ...recording,
        title: newTitle
      };

      await updateRecording(updatedRecording);
      setRecordings(prev => prev.map(r => r.id === id ? updatedRecording : r));
      setIsEditingTitle(null);
    } catch (error) {
      console.error('Error updating recording title:', error);
      setError('Failed to update recording title');
    }
  };

  const handleSaveRecording = async () => {
    try {
      setIsSaving(true);
      setError(null);

      if (!recordingDetails.title.trim()) {
        setError('Please enter a title for your recording');
        return;
      }

      // Use the stored blob from chunksRef
      const blob = chunksRef.current[0];
      const recording = {
        id: Date.now().toString(),
        title: recordingDetails.title.trim(),
        category: recordingDetails.category,
        description: recordingDetails.description.trim(),
        blob,
        timestamp: new Date().toISOString(),
      };

      const savedRecording = await saveRecording(recording);
      
      if (savedRecording) { // Only update UI if save was successful (not cancelled)
        const loadedRecordings = await getAllRecordings();
        setRecordings(loadedRecordings);
        
        // Reset states
        setShowSaveDialog(false);
        setShowRecordingModal(false);
        setRecordingDetails({
          title: '',
          category: VIDEO_CATEGORIES[0],
          description: ''
        });
      }
      chunksRef.current = [];
    } catch (error) {
      console.error('Error saving recording:', error);
      setError('Failed to save recording. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const cancelSave = () => {
    setShowSaveDialog(false);
    setError(null);
    setRecordingDetails({
      title: '',
      category: VIDEO_CATEGORIES[0],
      description: ''
    });
  };

  const stopRecording = async () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      await cleanupMediaResources();
      setIsRecording(false);
      // Show save dialog after stopping recording
      setShowSaveDialog(true);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setError('Failed to stop recording. Please try again.');
    }
  };

  const deleteRecording = async (id) => {
    try {
      await deleteRecordingFromDB(id);
      setRecordings(prev => prev.filter(r => r.id !== id));
      if (selectedRecording?.id === id) {
        setSelectedRecording(null);
      }
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  };

  const updateRecordingData = async (updatedRecording) => {
    try {
      const updated = await updateRecording(updatedRecording);
      setRecordings(prev => 
        prev.map(r => r.id === updated.id ? updated : r)
      );
      setSelectedRecording(null);
    } catch (error) {
      console.error('Error updating recording:', error);
    }
  };

  // Preview handling
  useEffect(() => {
    if (selectedRecording && previewVideoRef.current) {
      previewVideoRef.current.src = selectedRecording.url;
    }
    return () => {
      if (previewVideoRef.current) {
        previewVideoRef.current.src = '';
      }
    };
  }, [selectedRecording]);

  const checkPermissions = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      const hasMicrophone = devices.some(device => device.kind === 'audioinput');

      if (!hasCamera) {
        setPermissionStatus(prev => ({ ...prev, camera: 'unavailable' }));
      }
      if (!hasMicrophone) {
        setPermissionStatus(prev => ({ ...prev, microphone: 'unavailable' }));
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setPermissionStatus({
          camera: 'granted',
          microphone: 'granted'
        });
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Permission check error:', error);
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setPermissionStatus({
            camera: 'denied',
            microphone: 'denied'
          });
        } else {
          setPermissionStatus({
            camera: 'error',
            microphone: 'error'
          });
        }
        setError('Please allow camera and microphone access to record videos.');
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissionStatus({
        camera: 'error',
        microphone: 'error'
      });
      setError('Unable to check camera and microphone permissions.');
    }
  };

  const requestPermissions = async () => {
    try {
      setIsRequestingPermissions(true);
      setError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      setPermissionStatus({
        camera: 'granted',
        microphone: 'granted'
      });

      // Stop the tracks immediately since we're just checking permissions
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Permission request error:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionStatus({
          camera: 'denied',
          microphone: 'denied'
        });
        setError('Camera and microphone access was denied. Please allow access in your browser settings.');
      } else {
        setPermissionStatus({
          camera: 'error',
          microphone: 'error'
        });
        setError('An error occurred while requesting permissions.');
      }
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  // Check permissions when the recording modal is opened
  useEffect(() => {
    if (showRecordingModal) {
      checkPermissions();
    }
  }, [showRecordingModal]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-accent/10 rounded-full"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold font-['Monorama']">Progress Hub</h1>
          </div>
          <button
            onClick={() => setShowRecordingModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
          >
            <Video className="w-5 h-5" />
            New Recording
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Search recordings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background font-['Monorama']"
              />
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[200px]">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md bg-background font-['Monorama']"
              >
                <option value="All">All Categories</option>
                {VIDEO_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Date Range */}
            <div className="flex items-center gap-2 flex-1">
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="pl-10 pr-4 py-2 border rounded-md bg-background font-['Monorama'] min-w-[160px]"
                  placeholder="Start date"
                />
              </div>
              <span className="text-muted-foreground">to</span>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="pl-10 pr-4 py-2 border rounded-md bg-background font-['Monorama'] min-w-[160px]"
                  placeholder="End date"
                />
              </div>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => toggleSort('timestamp')}
                className={`px-3 py-2 border rounded-md hover:bg-accent/10 flex items-center gap-2 ${
                  sortConfig.field === 'timestamp' ? 'border-primary text-primary' : 'border-border'
                }`}
                title="Sort by date"
              >
                <Clock className="w-4 h-4" />
                Date
                {sortConfig.field === 'timestamp' && (
                  sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => toggleSort('title')}
                className={`px-3 py-2 border rounded-md hover:bg-accent/10 flex items-center gap-2 ${
                  sortConfig.field === 'title' ? 'border-primary text-primary' : 'border-border'
                }`}
                title="Sort by title"
              >
                Title
                {sortConfig.field === 'title' && (
                  sortConfig.direction === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={resetFilters}
                className="px-3 py-2 border rounded-md hover:bg-accent/10 text-sm"
                title="Reset all filters"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <div className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md flex items-center gap-1">
                Search: {searchQuery}
                <button
                  onClick={() => setSearchQuery('')}
                  className="hover:text-primary/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {selectedCategory !== 'All' && (
              <div className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md flex items-center gap-1">
                Category: {selectedCategory}
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="hover:text-primary/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {(dateRange.start || dateRange.end) && (
              <div className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-md flex items-center gap-1">
                Date: {dateRange.start || 'Any'} to {dateRange.end || 'Any'}
                <button
                  onClick={() => setDateRange({ start: '', end: '' })}
                  className="hover:text-primary/70"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          {Object.values(groupedRecordings).flat().length} recording(s) found
        </div>

        {/* Recordings List */}
        <div className="space-y-8">
          {Object.entries(groupedRecordings).map(([category, categoryRecordings]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryRecordings.map((recording) => (
                  <div
                    key={recording.id}
                    className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary transition-colors"
                  >
                    <div className="aspect-video bg-black/90 cursor-pointer" onClick={() => setSelectedVideo(recording)}>
                      <video
                        src={recording.url}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        {isEditingTitle === recording.id ? (
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={() => updateRecordingTitle(recording.id, title)}
                            onKeyPress={(e) => e.key === 'Enter' && updateRecordingTitle(recording.id, title)}
                            className="flex-1 px-2 py-1 bg-background border border-border rounded-md text-sm"
                            autoFocus
                          />
                        ) : (
                          <div className="flex-1">
                            <h3 className="font-medium text-sm">{recording.title}</h3>
                            {recording.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{recording.description}</p>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setIsEditingTitle(recording.id);
                              setTitle(recording.title);
                            }}
                            className="p-1 hover:bg-accent/10 rounded-md"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteRecording(recording.id)}
                            className="p-1 hover:bg-accent/10 rounded-md text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(recording.timestamp)}
                        </div>
                        <button
                          onClick={() => setSelectedVideo(recording)}
                          className="flex items-center gap-1 text-primary hover:text-primary/90"
                        >
                          <Play className="w-3 h-3" />
                          Play
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {recordings.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p>No recordings yet</p>
                    <button
                      onClick={() => setShowRecordingModal(true)}
                      className="mt-4 text-sm text-primary hover:text-primary/90"
                    >
                      Create your first recording
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Recording Modal */}
      {showRecordingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg w-full max-w-3xl">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold">New Recording</h3>
              <button
                onClick={closeRecordingModal}
                className="p-2 hover:bg-accent/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Permission Status */}
            {!isRecording && (
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Camera className={`w-5 h-5 ${
                      permissionStatus.camera === 'granted' ? 'text-emerald-500' :
                      permissionStatus.camera === 'denied' ? 'text-destructive' :
                      permissionStatus.camera === 'error' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`} />
                    <span className="text-sm">
                      Camera: {permissionStatus.camera === 'granted' ? 'Allowed' :
                              permissionStatus.camera === 'denied' ? 'Denied' :
                              permissionStatus.camera === 'error' ? 'Error' :
                              permissionStatus.camera === 'unavailable' ? 'Not Found' :
                              'Checking...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mic className={`w-5 h-5 ${
                      permissionStatus.microphone === 'granted' ? 'text-emerald-500' :
                      permissionStatus.microphone === 'denied' ? 'text-destructive' :
                      permissionStatus.microphone === 'error' ? 'text-destructive' :
                      'text-muted-foreground'
                    }`} />
                    <span className="text-sm">
                      Microphone: {permissionStatus.microphone === 'granted' ? 'Allowed' :
                                 permissionStatus.microphone === 'denied' ? 'Denied' :
                                 permissionStatus.microphone === 'error' ? 'Error' :
                                 permissionStatus.microphone === 'unavailable' ? 'Not Found' :
                                 'Checking...'}
                    </span>
                  </div>
                </div>
                
                {error && (
                  <div className="mt-3 p-3 bg-destructive/10 text-destructive rounded-md flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div className="text-sm whitespace-pre-line">{error}</div>
                  </div>
                )}
                
                {(permissionStatus.camera !== 'granted' || permissionStatus.microphone !== 'granted') && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={requestPermissions}
                      disabled={isRequestingPermissions}
                      className="text-sm text-primary hover:text-primary/90 disabled:opacity-50 flex items-center gap-1"
                    >
                      <Settings className="w-4 h-4" />
                      {isRequestingPermissions ? 'Requesting Permissions...' : 'Request Permissions'}
                    </button>
                    {permissionStatus.camera === 'denied' && (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open('https://support.google.com/chrome/answer/2693767?hl=en', '_blank');
                        }}
                        className="text-sm text-primary hover:text-primary/90 ml-2"
                      >
                        How to enable permissions?
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="p-4">
              <div className="aspect-video bg-black/90 rounded-lg relative overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                {!isRecording && !videoRef.current?.srcObject && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="w-16 h-16 text-muted-foreground/20" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-center gap-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={permissionStatus.camera !== 'granted' || permissionStatus.microphone !== 'granted'}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Video className="w-5 h-5" />
                  {(permissionStatus.camera !== 'granted' || permissionStatus.microphone !== 'granted')
                    ? 'Permissions Required'
                    : 'Start Recording'
                  }
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 bg-destructive text-destructive-foreground px-6 py-3 rounded-md hover:bg-destructive/90 transition-colors"
                >
                  <Square className="w-5 h-5" />
                  Stop Recording
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-card rounded-lg w-full max-w-md">
            <div className="p-4 border-b border-border">
              <h3 className="text-lg font-semibold">Save Recording</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={recordingDetails.title}
                  onChange={(e) => setRecordingDetails(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a title for your recording"
                  className="w-full p-2 rounded-md border bg-background"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={recordingDetails.category}
                  onChange={(e) => setRecordingDetails(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 rounded-md border bg-background"
                >
                  {VIDEO_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={recordingDetails.description}
                  onChange={(e) => setRecordingDetails(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a description (optional)"
                  className="w-full p-2 rounded-md border bg-background h-24 resize-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-md flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">{error}</div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={cancelSave}
                  className="px-4 py-2 text-sm border border-border rounded-md hover:bg-accent/10"
                  disabled={isSaving}
                >
                  Discard
                </button>
                <button
                  onClick={handleSaveRecording}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Choose Save Location</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg w-full max-w-4xl">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedVideo.title}</h3>
                {selectedVideo.description && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedVideo.description}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedVideo(null)}
                className="p-2 hover:bg-accent/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <video
                src={selectedVideo.url}
                controls
                autoPlay
                className="w-full rounded-lg"
              />
            </div>
            <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
              <span>Recorded on {formatDate(selectedVideo.timestamp)}</span>
              <span className="px-2 py-1 rounded-md bg-secondary/10">{selectedVideo.category}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};