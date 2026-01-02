import React, { useRef, useState, useCallback, useEffect } from 'react';
import './PhotoPicker.css';
import * as FiIcons from 'react-icons/fi';

interface PhotoPickerProps {
  photos: string[];
  maxPhotos?: number;
  minPhotos?: number;
  onPhotosChange: (urls: string[]) => void;
  disabled?: boolean;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  photos = [],
  maxPhotos = 3,
  minPhotos = 0,
  onPhotosChange,
  disabled = false,
}) => {
  const getValidationMessage = useCallback(() => {
    if (photos.length < minPhotos) {
      return `Minimum ${minPhotos} photo${minPhotos !== 1 ? 's' : ''} required`;
    }
    if (photos.length >= maxPhotos) {
      return `Maximum ${maxPhotos} photo${maxPhotos !== 1 ? 's' : ''} allowed`;
    }
    return null;
  }, [photos.length, minPhotos, maxPhotos]);

  const validationMessage = getValidationMessage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Handle file selection from file input
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    await processFiles(files);
  };

  // Process selected files (from file input or camera)
  const processFiles = async (files: File[]) => {
    if (photos.length + files.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photo${maxPhotos !== 1 ? 's' : ''} allowed`);
      return;
    }

    setUploading(true);
    
    try {
      const newUrls: string[] = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        // Upload the file to our local API
        const response = await fetch('/api/uploads', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const { fileUrl } = await response.json();
        newUrls.push(fileUrl);
      }

      // Update parent component with new URLs
      onPhotosChange([...photos, ...newUrls]);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Start camera for taking photos
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setShowCamera(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Could not access camera. Please check permissions.');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  }, [cameraStream]);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      
      const file = new File([blob], `camera-${Date.now()}.jpg`, { 
        type: 'image/jpeg' 
      });
      
      await processFiles([file]);
      stopCamera();
    }, 'image/jpeg', 0.9);
  }, [stopCamera]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  return (
    <div className="photo-picker-container">
      <div className={`photo-picker ${disabled ? 'disabled' : ''}`}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          multiple
          disabled={disabled || uploading}
          style={{ display: 'none' }}
          capture="environment"
        />
        
        {validationMessage && (
          <div className="validation-message">
            <FiIcons.FiAlertCircle className="validation-icon" />
            <span>{validationMessage}</span>
          </div>
        )}
        
        {showCamera ? (
        <div className="camera-container">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="camera-preview"
          />
          <div className="camera-controls">
            <button 
              type="button" 
              className="camera-button capture"
              onClick={capturePhoto}
              disabled={uploading}
            >
              📸
            </button>
            <button 
              type="button" 
              className="camera-button cancel"
              onClick={stopCamera}
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map((url, index) => (
            <div key={index} className="photo-thumbnail">
              <img src={url} alt={`Uploaded ${index + 1}`} />
              <button
                type="button"
                className="remove-photo"
                onClick={(e) => {
                  e.stopPropagation();
                  const newPhotos = [...photos];
                  newPhotos.splice(index, 1);
                  onPhotosChange(newPhotos);
                }}
                disabled={disabled || uploading}
                aria-label="Remove photo"
              >
                <FiIcons.FiX size={16} />
              </button>
            </div>
          ))}
          
          {photos.length < maxPhotos && (
            <div className="upload-options">
              <button
                type="button"
                className="upload-option"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
                title="Upload from device"
              >
                <FiIcons.FiUpload className="upload-icon" />
                <span>Upload</span>
              </button>
              <button
                type="button"
                className="upload-option"
                onClick={startCamera}
                disabled={disabled || uploading}
                title="Take a photo"
              >
                <FiIcons.FiCamera className="upload-icon" />
                <span>Camera</span>
              </button>
            </div>
          )}
          
          {uploading && (
            <div className="upload-progress">
              <div className="spinner"></div>
              <span>Uploading...</span>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};
