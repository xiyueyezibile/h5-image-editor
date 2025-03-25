import React, { useEffect, useState } from 'react';
import { Slider, InputNumber, Button, Space, Tooltip } from 'antd';
import {
  DeleteOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from '@ant-design/icons';
import styles from './styles.module.css';

// 定义不同类型对象的操作选项接口
interface ToolbarProps {
  selectedObject: {
    type: 'image' | 'text' | 'shape' | null;
    id: string;
    rotation?: number;
    scale?: number;
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
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);

  // 同步外部传入的状态
  useEffect(() => {
    if (selectedObject) {
      setRotation(selectedObject.rotation || 0);
      setScale(selectedObject.scale || 1);
    }
  }, [selectedObject]);

  if (!selectedObject) return null;

  // 处理旋转变化
  const handleRotationChange = (value: number) => {
    setRotation(value);
    onRotate(value);
  };

  // 处理缩放变化
  const handleScaleChange = (value: number) => {
    setScale(value);
    onScale({ x: value, y: value });
  };

  // 快速旋转按钮
  const handleQuickRotate = (angle: number) => {
    const newRotation = (rotation + angle) % 360;
    setRotation(newRotation);
    onRotate(newRotation);
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarContent}>
        {/* 旋转控制 */}
        <div className={styles.controlGroup}>
          <div className={styles.controlLabel}>旋转</div>
          <Space>
            <Button
              icon={<RotateLeftOutlined />}
              onClick={() => handleQuickRotate(-90)}
            />
            <Slider
              className={styles.rotationSlider}
              min={0}
              max={360}
              value={rotation}
              onChange={handleRotationChange}
              tooltip={{ formatter: (value) => `${value}°` }}
            />
            <Button
              icon={<RotateRightOutlined />}
              onClick={() => handleQuickRotate(90)}
            />
            <InputNumber
              min={0}
              max={360}
              value={rotation}
              onChange={(value) => handleRotationChange(value || 0)}
              addonAfter="°"
            />
          </Space>
        </div>

        {/* 缩放控制 */}
        <div className={styles.controlGroup}>
          <div className={styles.controlLabel}>缩放</div>
          <Space>
            <Button
              icon={<ZoomOutOutlined />}
              onClick={() => handleScaleChange(Math.max(0.1, scale - 0.1))}
            />
            <Slider
              className={styles.scaleSlider}
              min={0.1}
              max={3}
              step={0.1}
              value={scale}
              onChange={handleScaleChange}
              tooltip={{ formatter: (value) => `${(value * 100).toFixed(0)}%` }}
            />
            <Button
              icon={<ZoomInOutlined />}
              onClick={() => handleScaleChange(Math.min(3, scale + 0.1))}
            />
            <InputNumber
              min={10}
              max={300}
              value={Math.round(scale * 100)}
              onChange={(value) => handleScaleChange((value || 100) / 100)}
              addonAfter="%"
            />
          </Space>
        </div>

        {/* 删除按钮 */}
        <Tooltip title="删除">
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={onDelete}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default BottomToolbar; 