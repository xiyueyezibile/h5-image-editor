import React, { useEffect, useState } from 'react';
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

// 定义不同类型对象的操作选项接口
interface ToolbarProps {
  selectedObject: {
    type: 'image' | 'text' | 'shape' | 'rect' | null;
    id: string;
    rotation?: number;
    scale?: number;
    cornerRadius?: number;
    opacity?: number;
    fontSize?: number;
    fontFamily?: string;
    fill?: string;
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    style?: {
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
    };
  } | null;
  onDelete: () => void;
  onRotate: (angle: number) => void;
  onScale: (scale: { x: number; y: number }) => void;
  onUpdateCornerRadius?: (radius: number) => void;
  onUpdateFill?: (color: string) => void;
  onUpdateStroke?: (color: string) => void;
  onUpdateOpacity?: (opacity: number) => void;
  onUpdateTextStyle?: (style: any) => void;
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

  // 同步外部传入的状态
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

  // 处理圆角变化
  const handleCornerRadiusChange = (value: number) => {
    setCornerRadius(value);
    onUpdateCornerRadius && onUpdateCornerRadius(value);
  };

  // 处理透明度变化
  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    onUpdateOpacity && onUpdateOpacity(value);
  };

  // 处理填充颜色变化
  const handleFillColorChange = (color: string) => {
    setFillColor(color);
    onUpdateFill && onUpdateFill(color);
  };

  // 处理边框颜色变化
  const handleStrokeColorChange = (color: string) => {
    setStrokeColor(color);
    onUpdateStroke && onUpdateStroke(color);
  };

  // 快速旋转按钮
  const handleQuickRotate = (angle: number) => {
    const newRotation = (rotation + angle) % 360;
    setRotation(newRotation);
    onRotate(newRotation);
  };

  // 处理字体大小变化
  const handleFontSizeChange = (value: number) => {
    setFontSize(value);
    onUpdateTextStyle && onUpdateTextStyle({ fontSize: value });
  };

  // 处理字体族变化
  const handleFontFamilyChange = (value: string) => {
    setFontFamily(value);
    onUpdateTextStyle && onUpdateTextStyle({ fontFamily: value });
  };

  // 处理文本对齐方式变化
  const handleTextAlignChange = (value: 'left' | 'center' | 'right') => {
    setTextAlign(value);
    onUpdateTextStyle && onUpdateTextStyle({ align: value });
  };

  // 处理垂直对齐方式变化
  const handleVerticalAlignChange = (value: 'top' | 'middle' | 'bottom') => {
    setVerticalAlign(value);
    onUpdateTextStyle && onUpdateTextStyle({ verticalAlign: value });
  };

  const isRectangle = selectedObject.type === 'rect';
  const isText = selectedObject.type === 'text';

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
              tooltip={{ formatter: (value) => `${value ? (value * 100).toFixed(0) : 0}%` }}
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
        
        {/* 透明度控制 - 对所有元素可用 */}
        <div className={styles.controlGroup}>
          <div className={styles.controlLabel}>透明度</div>
          <Space>
            <Slider
              className={styles.opacitySlider}
              min={0}
              max={1}
              step={0.01}
              value={opacity}
              onChange={handleOpacityChange}
              tooltip={{ formatter: (value) => `${value ? Math.round(value * 100) : 0}%` }}
            />
            <InputNumber
              min={0}
              max={100}
              value={Math.round(opacity * 100)}
              onChange={(value) => handleOpacityChange((value || 0) / 100)}
              addonAfter="%"
            />
          </Space>
        </div>

        {/* 文字控制 - 仅对文字元素显示 */}
        {isText && (
          <>
            <div className={styles.controlGroup}>
              <div className={styles.controlLabel}>字体大小</div>
              <Space>
                <Button
                  icon={<FontSizeOutlined />}
                  onClick={() => handleFontSizeChange(Math.max(8, fontSize - 2))}
                />
                <Slider
                  className={styles.fontSizeSlider}
                  min={8}
                  max={72}
                  value={fontSize}
                  onChange={handleFontSizeChange}
                />
                <Button
                  icon={<FontSizeOutlined />}
                  onClick={() => handleFontSizeChange(Math.min(72, fontSize + 2))}
                />
                <InputNumber
                  min={8}
                  max={72}
                  value={fontSize}
                  onChange={(value) => handleFontSizeChange(value || 20)}
                />
              </Space>
            </div>

            <div className={styles.controlGroup}>
              <div className={styles.controlLabel}>字体</div>
              <Select
                value={fontFamily}
                onChange={handleFontFamilyChange}
                style={{ width: 120 }}
                options={[
                  { label: 'Arial', value: 'Arial' },
                  { label: 'Times New Roman', value: 'Times New Roman' },
                  { label: '微软雅黑', value: 'Microsoft YaHei' },
                ]}
              />
            </div>

            <div className={styles.controlGroup}>
              <div className={styles.controlLabel}>对齐方式</div>
              <Select
                value={textAlign}
                onChange={handleTextAlignChange}
                style={{ width: 100 }}
                options={[
                  { label: '左对齐', value: 'left' },
                  { label: '居中', value: 'center' },
                  { label: '右对齐', value: 'right' },
                ]}
              />
            </div>

            <div className={styles.controlGroup}>
              <div className={styles.controlLabel}>垂直对齐</div>
              <Select
                value={verticalAlign}
                onChange={handleVerticalAlignChange}
                style={{ width: 100 }}
                options={[
                  { label: '顶部', value: 'top' },
                  { label: '居中', value: 'middle' },
                  { label: '底部', value: 'bottom' },
                ]}
              />
            </div>

            <div className={styles.controlGroup}>
              <div className={styles.controlLabel}>文字颜色</div>
              <ColorPicker
                value={fillColor}
                onChange={(color) => {
                  setFillColor(color.toHexString());
                  onUpdateTextStyle && onUpdateTextStyle({ fill: color.toHexString() });
                }}
              />
            </div>
          </>
        )}

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