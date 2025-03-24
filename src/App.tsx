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
    selectedId,
    elements,
    background,
    setBackgroundImage,
    addRectElement,
    addImageElement,
    setSelectedId,
    moveElement,
    resizeElement,
    rotateElement,
  } = useEditorStore();

  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
  const selectedObject = selectedId
    ? elements.find((elem) => elem.id === selectedId)
    : null;

  // 处理删除操作
  const handleDelete = () => {
    if (selectedId) {
      setSelectedId(null);
      // 从 elements 数组中过滤掉被删除的元素
      const newElements = elements.filter(elem => elem.id !== selectedId);
      // 更新 store 中的 elements
      // 注意：这里需要添加一个新的 action 到 store 中
      // TODO: 添加 deleteElement action
    }
  };

  // 处理旋转操作
  const handleRotate = (angle: number) => {
    if (selectedId) {
      const selectedElement = elements.find((elem) => elem.id === selectedId);
      if (selectedElement) {
        rotateElement(selectedId, (selectedElement.rotation || 0) + angle);
      }
    }
  };

  // 处理缩放操作
  const handleScale = (scale: { x: number; y: number }) => {
    if (selectedId) {
      const selectedElement = elements.find((elem) => elem.id === selectedId);
      if (selectedElement) {
        resizeElement(selectedId, {
          width: selectedElement.size.width * scale.x,
          height: selectedElement.size.height * scale.y,
        });
      }
    }
  };

  // 处理添加文字
  const handleAddText = () => {
    // TODO: 实现添加文字功能
    console.log('添加文字功能待实现');
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
          setBackgroundImage(img.src, img.width, img.height);
        } else {
          addImageElement(img.src, img.width, img.height);
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
      />
      {/* 渲染底部工具栏 */}
      {selectedObject && (
        <BottomToolbar
          selectedObject={{
            type: selectedObject.type === 'rect' ? 'shape' : 'image',
            id: selectedObject.id,
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
