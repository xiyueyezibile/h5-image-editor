/**
 * App.tsx
 * 主应用组件，负责：
 * 1. 响应式布局适配
 * 2. 图片编辑器的容器组件
 * 3. 管理选中对象的状态和操作
 */
import React, { useEffect, useState } from 'react';
import { ImageEditor } from './components/ImageEditor';
import BottomToolbar from './components/BottomToolbar';
import MaterialBar from './components/MaterialBar';
import styles from './App.module.css';
import { useEditorStore } from './store/editorStore';

const App: React.FC = () => {
  const {
    background,
    selectedId,
    elements,
    addTextElement,
    addRectElement,
    addImageElement,
    setBackgroundImage,
    deleteElement,
    rotateElement,
    scaleElement,
  } = useEditorStore();

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [scale, setScale] = useState(1);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 获取当前选中的对象
  const selectedObject = elements.find((elem) => elem.id === selectedId) || null;

  // 处理删除操作
  const handleDelete = () => {
    if (selectedId) {
      deleteElement(selectedId);
    }
  };

  // 处理旋转操作
  const handleRotate = (angle: number) => {
    if (selectedId) {
      rotateElement(selectedId, angle);
    }
  };

  // 处理缩放操作
  const handleScale = (scaleValue: { x: number; y: number }) => {
    if (selectedId) {
      scaleElement(selectedId, scaleValue.x);
    }
  };

  // 处理添加文字
  const handleAddText = () => {
    addTextElement();
  };

  // 处理添加矩形
  const handleAddShape = () => {
    addRectElement();
  };

  // 处理图片上传
  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (!background) {
          // 设置背景图片，直接使用原始尺寸，由 ImageEditor 组件负责适配
          setBackgroundImage(img.src, img.width, img.height);
        } else {
          // 添加图片图层，计算合适的初始位置和大小
          const maxSize = Math.min(windowSize.width, windowSize.height) * 0.3; // 设置为视图大小的 30%
          const ratio = Math.min(maxSize / img.width, maxSize / img.height);
          const width = img.width * ratio;
          const height = img.height * ratio;
          addImageElement(img.src, width, height);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.app}>
      {/* 渲染顶部物料栏，只在有背景图时显示 */}
      {background && (
        <MaterialBar
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddImage={handleUpload}
        />
      )}
      {/* 渲染图片编辑器组件 */}
      <ImageEditor
        width={windowSize.width}
        height={windowSize.height}
        onUpload={handleUpload}
        scale={scale}
      />
      {/* 渲染底部工具栏 */}
      {selectedObject && (
        <BottomToolbar
          selectedObject={{
            type: selectedObject.type === 'rect' ? 'shape' : selectedObject.type,
            id: selectedObject.id,
            rotation: selectedObject.rotation,
            scale: selectedObject.scale,
          }}
          onDelete={handleDelete}
          onRotate={handleRotate}
          onScale={handleScale}
        />
      )}
    </div>
  );
};

export default App;
