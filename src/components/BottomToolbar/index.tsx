import React from 'react';
import styles from './styles.module.css';

// 定义不同类型对象的操作选项接口
interface ToolbarProps {
  selectedObject: {
    type: 'image' | 'text' | 'shape' | null;
    id: string;
  } | null;
  onDelete: () => void;
  onRotate: (angle: number) => void;
  onScale: (scale: { x: number; y: number }) => void;
}

const BottomToolbar: React.FC<ToolbarProps> = ({
  selectedObject,
  onDelete,
  onRotate,
  onScale,
}) => {
  if (!selectedObject) return null;

  return (
    <div className={styles.toolbar}>
      {/* 通用操作 */}
      <div className={styles.commonTools}>
        <button onClick={onDelete}>删除</button>
        <button onClick={() => onRotate(90)}>旋转90°</button>
      </div>

      {/* 根据选中对象类型显示特定操作 */}
      {selectedObject.type === 'image' && (
        <div className={styles.imageTools}>
          <button onClick={() => onScale({ x: 1.1, y: 1.1 })}>放大</button>
          <button onClick={() => onScale({ x: 0.9, y: 0.9 })}>缩小</button>
        </div>
      )}

      {selectedObject.type === 'text' && (
        <div className={styles.textTools}>
          {/* 文字特定操作 */}
        </div>
      )}

      {selectedObject.type === 'shape' && (
        <div className={styles.shapeTools}>
          {/* 形状特定操作 */}
        </div>
      )}
    </div>
  );
};

export default BottomToolbar; 