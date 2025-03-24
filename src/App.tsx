/**
 * App.tsx
 * 主应用组件，负责：
 * 1. 响应式布局适配
 * 2. 图片编辑器的容器组件
 * 3. 管理选中对象的状态和操作
 */
import React, { useEffect } from 'react';
import { ImageEditor } from './components/ImageEditor';
import BottomToolbar from './components/BottomToolbar';
import MaterialBar from './components/MaterialBar';
import styles from './App.module.css';
import { debounce } from './utils/debounce';
import { useEditorStore } from './store/editorStore';

const App: React.FC = () => {
  const {
    canvasSize,
    selectedId,
    elements,
    background,
    setCanvasSize,
    deleteElement,
    rotateElement,
    resizeElement,
    addElement,
    setBackground,
  } = useEditorStore();

  useEffect(() => {
    // 更新视口尺寸的函数
    const updateDimensions = () => {
      // 设置最新的视口宽高
      setCanvasSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 使用防抖处理resize事件，避免频繁更新导致性能问题
    const debouncedUpdateDimensions = debounce(updateDimensions, 200);

    // 初始化时更新一次尺寸
    updateDimensions();
    // 监听窗口resize事件
    window.addEventListener('resize', debouncedUpdateDimensions);

    // 组件卸载时清理事件监听
    return () => {
      window.removeEventListener('resize', debouncedUpdateDimensions);
    };
  }, [setCanvasSize]);

  // 获取当前选中的对象
  const selectedObject = selectedId
    ? elements.find((elem) => elem.id === selectedId)
    : null;

  // 处理删除操作
  const handleDelete = () => {
    if (selectedId) {
      deleteElement(selectedId);
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
      if (selectedElement && 'size' in selectedElement) {
        resizeElement(selectedId, {
          width: selectedElement.size.width * scale.x,
          height: selectedElement.size.height * scale.y,
        });
      }
    }
  };

  // 处理添加文字
  const handleAddText = () => {
    const newText = {
      id: `text-${Date.now()}`,
      type: 'text' as const,
      text: '双击编辑文字',
      position: {
        x: canvasSize.width / 2 - 50,
        y: canvasSize.height / 2 - 10,
      },
      fontSize: 20,
      fontFamily: 'Arial',
      fill: '#000000',
      rotation: 0,
    };
    addElement(newText);
  };

  // 处理添加形状
  const handleAddShape = () => {
    const newShape = {
      id: `rect-${Date.now()}`,
      type: 'rect' as const,
      position: {
        x: canvasSize.width / 2 - 50,
        y: canvasSize.height / 2 - 50,
      },
      size: {
        width: 100,
        height: 100,
      },
      fill: '#4A90E2',
      stroke: '#2171C7',
      strokeWidth: 2,
      rotation: 0,
    };
    addElement(newShape);
  };

  // 处理添加图片
  const handleAddImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        // 如果还没有背景图，则设置为背景图
        if (!background) {
          setBackground({
            src: e.target?.result as string,
            originalSize: {
              width: img.width,
              height: img.height,
            },
            size: {
              width: img.width,
              height: img.height,
            },
          });
          return;
        }

        // 否则作为普通图层添加
        const aspectRatio = img.width / img.height;
        const maxWidth = canvasSize.width * 0.5;
        const maxHeight = canvasSize.height * 0.5;
        let newWidth = img.width;
        let newHeight = img.height;

        if (newWidth > maxWidth) {
          newWidth = maxWidth;
          newHeight = newWidth / aspectRatio;
        }
        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = newHeight * aspectRatio;
        }

        const newImage = {
          id: `image-${Date.now()}`,
          type: 'image' as const,
          src: e.target?.result as string,
          position: {
            x: (canvasSize.width - newWidth) / 2,
            y: (canvasSize.height - newHeight) / 2,
          },
          size: {
            width: newWidth,
            height: newHeight,
          },
          rotation: 0,
        };
        addElement(newImage);
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={styles.app}>
      {/* 渲染顶部物料栏 */}
      {background && <MaterialBar
        onAddText={handleAddText}
        onAddShape={handleAddShape}
        onAddImage={handleAddImage}
      />}
      {/* 渲染图片编辑器组件 */}
      <ImageEditor
        width={canvasSize.width}
        height={canvasSize.height}
      />
      {/* 渲染底部工具栏 */}
      {selectedObject && (
        <BottomToolbar
          selectedObject={{
            type: selectedObject.type === 'rect' || selectedObject.type === 'circle' || selectedObject.type === 'line'
              ? 'shape'
              : selectedObject.type,
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
