import React, { useCallback } from 'react';
import styles from './ImageUploader.module.css';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    },
    [onImageUpload]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    },
    [onImageUpload]
  );

  return (
    <div
      className={styles.uploader}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className={styles.uploaderContent}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className={styles.input}
        id="image-upload"
      />
      <label htmlFor="image-upload" className={styles.label}>
        <div className={styles.content}>
          <span className={styles.icon}>📁</span>
          <p>点击或拖拽图片到此处上传</p>
        </div>
      </label>
      </div>
    </div>
  );
}; 