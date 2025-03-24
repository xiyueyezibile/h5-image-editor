import React from 'react';
import { PictureOutlined } from '@ant-design/icons';
import styles from './styles.module.css';

interface UploadAreaProps {
  onUpload: (file: File) => void;
}

/**
 * 上传区域组件
 * 处理图片上传的用户界面
 */
export const UploadArea: React.FC<UploadAreaProps> = ({ onUpload }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };

  return (
    <div className={styles.uploadArea}>
      <label className={styles.uploadContent}>
        <PictureOutlined className={styles.uploadIcon} />
        <div className={styles.uploadText}>
          <p>点击上传图片</p>
          <p className={styles.uploadHint}>支持 JPG、PNG 格式</p>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
      </label>
    </div>
  );
}; 