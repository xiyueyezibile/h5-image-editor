import React, { useState, useEffect } from 'react';
import { Slider, InputNumber, Button, Space, Tooltip, ColorPicker, Select } from 'antd';
import {
  DeleteOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FontSizeOutlined,
} from '@ant-design/icons';
import styles from './styles.module.css';

interface ToolbarProps {
  selectedObject: {
    type: 'text' | 'image' | 'shape';
    id: string;
    rotation?: number;
    scale?: number;
    opacity?: number;
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    cornerRadius?: number;
    style?: {
      fill: string;
      stroke: string;
      strokeWidth: number;
    };
  } | null;
  onDelete: () => void;
  onRotate: (angle: number) => void;
  onScale: (scale: { x: number; y: number }) => void;
  onUpdateCornerRadius?: (radius: number) => void;
  onUpdateFill?: (color: string) => void;
  onUpdateStroke?: (color: string) => void;
  onUpdateOpacity?: (opacity: number) => void;
  onUpdateTextStyle?: (style: {
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
  }) => void;
}

const BottomToolbar: React.FC<ToolbarProps> = ({
  selectedObject,
  onDelete,
  onRotate,
  onScale,
  onUpdateCornerRadius,
  onUpdateFill,
  onUpdateStroke,
  onUpdateOpacity,
  onUpdateTextStyle,
}) => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [fillColor, setFillColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#1890ff');
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');
  const [verticalAlign, setVerticalAlign] = useState<'top' | 'middle' | 'bottom'>('top');

  useEffect(() => {
    if (selectedObject) {
      setRotation(selectedObject.rotation || 0);
      setScale(selectedObject.scale || 1);
      setOpacity(selectedObject.opacity || 1);
      if (selectedObject.type === 'rect') {
        setCornerRadius(selectedObject.cornerRadius || 0);
        setFillColor(selectedObject.style?.fill || '#ffffff');
        setStrokeColor(selectedObject.style?.stroke || '#1890ff');
      } else if (selectedObject.type === 'text') {
        setFontSize(selectedObject.fontSize || 20);
        setFontFamily(selectedObject.fontFamily || 'Arial');
        setTextAlign(selectedObject.align || 'left');
        setVerticalAlign(selectedObject.verticalAlign || 'top');
        setFillColor(selectedObject.fill || '#000000');
      }
    }
  }, [selectedObject]);

  const handleRotateChange = (value: number | null) => {
    if (value !== null) {
      setRotation(value);
      onRotate(value);
    }
  };

  const handleScaleChange = (value: number | null) => {
    if (value !== null) {
      setScale(value);
      onScale({ x: value, y: value });
    }
  };

  const handleOpacityChange = (value: number | null) => {
    if (value !== null && onUpdateOpacity) {
      onUpdateOpacity(value);
    }
  };

  const handleCornerRadiusChange = (value: number | null) => {
    if (value !== null && onUpdateCornerRadius) {
      onUpdateCornerRadius(value);
    }
  };

  const handleFillChange = (color: string) => {
    if (onUpdateFill) {
      onUpdateFill(color);
    }
  };

  const handleStrokeChange = (color: string) => {
    if (onUpdateStroke) {
      onUpdateStroke(color);
    }
  };

  const handleTextStyleChange = (style: {
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
  }) => {
    if (onUpdateTextStyle) {
      onUpdateTextStyle(style);
    }
  };

  if (!selectedObject) return null;

  const isRectangle = selectedObject.type === 'shape';
  const isText = selectedObject.type === 'text';

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarContent}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {/* 基础操作 */}
          <Space className={styles.controlGroup}>
            <Tooltip title="删除">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={onDelete}
                danger
              />
            </Tooltip>
            <Tooltip title="向左旋转">
              <Button
                type="text"
                icon={<RotateLeftOutlined />}
                onClick={() => onRotate(rotation - 90)}
              />
            </Tooltip>
            <Tooltip title="向右旋转">
              <Button
                type="text"
                icon={<RotateRightOutlined />}
                onClick={() => onRotate(rotation + 90)}
              />
            </Tooltip>
            <Tooltip title="放大">
              <Button
                type="text"
                icon={<ZoomInOutlined />}
                onClick={() => handleScaleChange(scale + 0.1)}
              />
            </Tooltip>
            <Tooltip title="缩小">
              <Button
                type="text"
                icon={<ZoomOutOutlined />}
                onClick={() => handleScaleChange(scale - 0.1)}
              />
            </Tooltip>
          </Space>

          {/* 旋转控制 */}
          <div className={styles.controlGroup}>
            <span>旋转角度：</span>
            <Slider
              min={0}
              max={360}
              value={rotation}
              onChange={handleRotateChange}
              style={{ width: 200 }}
            />
            <InputNumber
              min={0}
              max={360}
              value={rotation}
              onChange={handleRotateChange}
              style={{ width: 80 }}
            />
          </div>

          {/* 缩放控制 */}
          <div className={styles.controlGroup}>
            <span>缩放比例：</span>
            <Slider
              min={0.1}
              max={3}
              step={0.1}
              value={scale}
              onChange={handleScaleChange}
              style={{ width: 200 }}
            />
            <InputNumber
              min={0.1}
              max={3}
              step={0.1}
              value={scale}
              onChange={handleScaleChange}
              style={{ width: 80 }}
            />
          </div>

          {/* 透明度控制 */}
          <div className={styles.controlGroup}>
            <span>透明度：</span>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={selectedObject.opacity || 1}
              onChange={handleOpacityChange}
              style={{ width: 200 }}
            />
            <InputNumber
              min={0}
              max={1}
              step={0.1}
              value={selectedObject.opacity || 1}
              onChange={handleOpacityChange}
              style={{ width: 80 }}
            />
          </div>

          {/* 矩形特有控制 */}
          {isRectangle && (
            <>
              <div className={styles.controlGroup}>
                <span>圆角：</span>
                <Slider
                  min={0}
                  max={50}
                  value={selectedObject.cornerRadius || 0}
                  onChange={handleCornerRadiusChange}
                  style={{ width: 200 }}
                />
                <InputNumber
                  min={0}
                  max={50}
                  value={selectedObject.cornerRadius || 0}
                  onChange={handleCornerRadiusChange}
                  style={{ width: 80 }}
                />
              </div>
              <div className={styles.controlGroup}>
                <span>填充颜色：</span>
                <input
                  type="color"
                  value={selectedObject.style?.fill || '#000000'}
                  onChange={(e) => handleFillChange(e.target.value)}
                />
              </div>
              <div className={styles.controlGroup}>
                <span>边框颜色：</span>
                <input
                  type="color"
                  value={selectedObject.style?.stroke || '#000000'}
                  onChange={(e) => handleStrokeChange(e.target.value)}
                />
              </div>
            </>
          )}

          {/* 文字特有控制 */}
          {isText && (
            <>
              <div className={styles.controlGroup}>
                <span>字体大小：</span>
                <Slider
                  min={12}
                  max={72}
                  value={selectedObject.fontSize || 16}
                  onChange={(value) =>
                    handleTextStyleChange({ fontSize: value })
                  }
                  style={{ width: 200 }}
                />
                <InputNumber
                  min={12}
                  max={72}
                  value={selectedObject.fontSize || 16}
                  onChange={(value) =>
                    handleTextStyleChange({ fontSize: value })
                  }
                  style={{ width: 80 }}
                />
              </div>
              <div className={styles.controlGroup}>
                <span>字体：</span>
                <Select
                  value={selectedObject.fontFamily || 'Arial'}
                  onChange={(value) =>
                    handleTextStyleChange({ fontFamily: value })
                  }
                  style={{ width: 120 }}
                  options={[
                    { label: 'Arial', value: 'Arial' },
                    { label: 'Times New Roman', value: 'Times New Roman' },
                    { label: '微软雅黑', value: 'Microsoft YaHei' },
                  ]}
                />
              </div>
              <div className={styles.controlGroup}>
                <span>对齐方式：</span>
                <Select
                  value={selectedObject.align || 'left'}
                  onChange={(value) =>
                    handleTextStyleChange({ align: value as 'left' | 'center' | 'right' })
                  }
                  style={{ width: 100 }}
                  options={[
                    { label: '左对齐', value: 'left' },
                    { label: '居中', value: 'center' },
                    { label: '右对齐', value: 'right' },
                  ]}
                />
              </div>
              <div className={styles.controlGroup}>
                <span>垂直对齐：</span>
                <Select
                  value={selectedObject.verticalAlign || 'top'}
                  onChange={(value) =>
                    handleTextStyleChange({ verticalAlign: value as 'top' | 'middle' | 'bottom' })
                  }
                  style={{ width: 100 }}
                  options={[
                    { label: '顶部', value: 'top' },
                    { label: '居中', value: 'middle' },
                    { label: '底部', value: 'bottom' },
                  ]}
                />
              </div>
              <div className={styles.controlGroup}>
                <span>文字颜色：</span>
                <input
                  type="color"
                  value={selectedObject.fill || '#000000'}
                  onChange={(e) =>
                    handleTextStyleChange({ fill: e.target.value })
                  }
                />
              </div>
            </>
          )}
        </Space>
      </div>
    </div>
  );
};

export default BottomToolbar; 