import React, { useRef, useState } from 'react';
import './PhotoPicker.css';

interface PhotoPickerProps {
  photos: string[];
  maxPhotos?: number;
  onPhotosChange: (urls: string[]) => void;
  disabled?: boolean;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  photos,
  maxPhotos = 3,
  onPhotosChange,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > maxPhotos) {
      alert(`Maximum ${maxPhotos} photos allowed`);
      return;
    }

    setUploading(true);
    try {
      const newUrls: string[] = [];

      for (const file of files) {
        // Get signed URL
        const signResponse = await fetch('/api/uploads/sign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            mimeType: file.type,
          }),
        });

        if (!signResponse.ok) throw new Error('Failed to get upload URL');

        const { uploadUrl, fileUrl } = await signResponse.json();

        // Upload to S3
        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) throw new Error('Failed to upload');

        newUrls.push(fileUrl);
      }

      onPhotosChange([...photos, ...newUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="photo-picker">
      <div className="photo-grid">
        {photos.map((url, index) => (
          <div key={index} className="photo-item">
            <img src={url} alt={`Photo ${index + 1}`} />
            <button
              type="button"
              className="remove-photo"
              onClick={() => removePhoto(index)}
              disabled={disabled}
            >
              ×
            </button>
          </div>
        ))}
        {photos.length < maxPhotos && (
          <div className="photo-upload-placeholder">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="add-photo-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || uploading}
            >
              {uploading ? 'Uploading...' : '+ Add Photo'}
            </button>
          </div>
        )}
      </div>
      {photos.length < maxPhotos && (
        <div className="photo-actions">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            style={{ display: 'none' }}
            id="upload-photo"
          />
          <label htmlFor="upload-photo" className="btn-secondary">
            {uploading ? 'Uploading...' : 'Upload from Device'}
          </label>
        </div>
      )}
    </div>
  );
};

