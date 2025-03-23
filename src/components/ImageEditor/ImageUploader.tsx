/**
 * ImageUploader.tsx
 * 图片上传组件
 * 支持拖拽上传和点击上传两种方式
 * 用于编辑器的初始化阶段，上传背景图片
 */
import React, { useCallback } from 'react';
import styles from './ImageUploader.module.css';

/**
 * 组件属性接口
 */
interface ImageUploaderProps {
  onImageUpload: (file: File) => void;  // 图片上传成功的回调函数
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  /**
   * 处理拖拽上传
   * 支持拖拽图片文件到上传区域
   */
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      // 验证文件类型是否为图片
      if (file && file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    },
    [onImageUpload]
  );

  /**
   * 处理文件选择
   * 支持通过点击选择图片文件
   */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      // 验证文件类型是否为图片
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
      onDragOver={(e) => e.preventDefault()} // 阻止默认行为以支持拖拽
    >
      <div className={styles.uploaderContent}>
        <input
          type="file"
          accept="image/*"  // 限制只能选择图片文件
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