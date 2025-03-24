import React from 'react';
import styles from './styles.module.css';
import { PictureOutlined, FontSizeOutlined, BorderOutlined } from '@ant-design/icons';

interface MaterialBarProps {
  onAddText: () => void;
  onAddShape: () => void;
  onAddImage: (file: File) => void;
}

const MaterialBar: React.FC<MaterialBarProps> = ({
  onAddText,
  onAddShape,
  onAddImage,
}) => {
  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAddImage(file);
    }
  };

  return (
    <div className={styles.materialBar}>
      <div className={styles.materialGroup}>
        <label className={styles.uploadButton}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <PictureOutlined />
          <span>图片</span>
        </label>
        <button onClick={onAddText}>
          <FontSizeOutlined />
          <span>文字</span>
        </button>
        <button onClick={onAddShape}>
          <BorderOutlined />
          <span>矩形</span>
        </button>
      </div>
    </div>
  );
};

export default MaterialBar; 