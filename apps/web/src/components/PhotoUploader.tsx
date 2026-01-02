import React, { useCallback, useState, useRef, ChangeEvent } from 'react';
import * as FiIcons from 'react-icons/fi';

interface PhotoUploaderProps {
  onImageSelect: (file: File) => void;
  initialImageUrl?: string;
  className?: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onImageSelect,
  initialImageUrl = '',
  className = '',
  label = 'Upload an image',
  accept = 'image/*',
  maxSizeMB = 5,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>(initialImageUrl);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (file: File | null) => {
      if (!file) return;

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      // Check file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File is too large. Maximum size is ${maxSizeMB}MB`);
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Pass the file to parent
      onImageSelect(file);
    },
    [maxSizeMB, onImageSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0] || null;
    handleFileChange(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageSelect(null as any);
  };

  return (
    <div className={`photo-uploader ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        id="photo-upload"
      />
      <label
        htmlFor="photo-upload"
        className={`image-upload-container ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="image-preview"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              aria-label="Remove image"
            >
              <FiIcons.FiX size={18} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-3">
              <FiIcons.FiImage size={32} className="text-gray-500 dark:text-gray-300" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700 dark:text-gray-200">
                {label}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Drag & drop an image, or click to browse
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                Max file size: {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </label>
    </div>
  );
};

export default PhotoUploader;