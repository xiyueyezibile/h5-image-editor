/**
 * App.tsx
 * 主应用组件，负责：
 * 1. 响应式布局适配
 * 2. 图片编辑器的容器组件
 */
import React, { useEffect, useState } from 'react';
import {ImageEditor} from './components/ImageEditor';
import styles from './App.module.css';
import { debounce } from './utils/debounce';

const App: React.FC = () => {
  // 存储当前视口尺寸
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // 更新视口尺寸的函数
    const updateDimensions = () => {
      // 设置最新的视口宽高
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
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
  }, []);

  return (
    <div className={styles.app}>
      {/* 渲染图片编辑器组件，传入当前视口尺寸 */}
      <ImageEditor width={dimensions.width} height={dimensions.height} />
    </div>
  );
};

export default App;
