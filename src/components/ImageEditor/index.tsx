/**
 * ImageEditor 组件
 * 基于react-konva实现的图片编辑器核心组件
 * 功能包括：
 * 1. 图片上传（背景图和图层）
 * 2. 图层管理
 * 3. 图片变换（移动、缩放、旋转）
 * 4. 手势操作支持
 */
import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Image, Rect, Transformer, Text } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';
import { useGesture } from '@use-gesture/react';
import { useEditorStore } from '../../store/editorStore';
import { ImageElement, RectElement, TextElement } from '../../types/editor';
import styles from './styles.module.css';
import { BackgroundLayer } from './BackgroundLayer';
import { ImageNode } from './ImageNode';
import { RectNode } from './RectNode';
import { TextNode } from './TextNode';
import { UploadArea } from './UploadArea';
import BottomToolbar from '../BottomToolbar';

interface ImageEditorProps {
  width: number;
  height: number;
  onUpload: (file: File) => void;
  scale: number;
}

/**
 * 主编辑器组件
 */
export const ImageEditor: React.FC<ImageEditorProps> = ({
  width,
  height,
  onUpload,
  scale,
}) => {
  const {
    background,
    elements,
    selectedId,
    setSelectedId,
    moveElement,
    resizeElement,
    rotateElement,
    scaleElement,
    deleteElement,
    updateRectStyle,
    updateRectCornerRadius,
    updateElementOpacity,
    updateTextContent,
    updateTextStyle,
  } = useEditorStore();

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // 手势控制（缩放）
  useGesture(
    {
      onPinch: ({ offset: [s], event }) => {
        event?.preventDefault();
        const newScale = Math.min(Math.max(0.5, s), 3);
        scale = newScale;
      },
    },
    {
      target: containerRef,
      eventOptions: { passive: false },
    }
  );

  // 处理选中元素的变换控制器
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    const selectedNode = stageRef.current.findOne(`#${selectedId}`);
    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
    } else {
      transformerRef.current.nodes([]);
    }
  }, [selectedId]);

  // 处理画布空白处点击，取消选中
  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  // 工具栏操作处理
  const handleDelete = () => {
    if (selectedId) {
      deleteElement(selectedId);
    }
  };

  const handleRotate = (angle: number) => {
    if (selectedId) {
      rotateElement(selectedId, angle);
    }
  };

  const handleScale = (scaleValue: { x: number; y: number }) => {
    if (selectedId) {
      scaleElement(selectedId, scaleValue.x);
    }
  };

  const handleUpdateCornerRadius = (radius: number) => {
    if (selectedId) {
      updateRectCornerRadius(selectedId, radius);
    }
  };

  const handleUpdateFill = (color: string) => {
    if (selectedId) {
      updateRectStyle(selectedId, { fill: color });
    }
  };

  const handleUpdateStroke = (color: string) => {
    if (selectedId) {
      updateRectStyle(selectedId, { stroke: color });
    }
  };
  
  const handleUpdateOpacity = (opacity: number) => {
    if (selectedId) {
      updateElementOpacity(selectedId, opacity);
    }
  };

  const handleUpdateTextStyle = (style: Partial<TextElement>) => {
    if (selectedId) {
      updateTextStyle(selectedId, style);
    }
  };

  // 如果没有背景图，显示上传区域
  if (!background) {
    return <UploadArea onUpload={onUpload} />;
  }

  // 计算画布尺寸和位置
  const stageWidth = width;
  const stageHeight = height - 120; // 减去顶部和底部工具栏的高度

  // 计算背景图片的适应尺寸
  const calculateFitSize = (originalWidth: number, originalHeight: number) => {
    const padding = 40; // 留出一些边距
    const maxWidth = stageWidth - padding * 2;
    const maxHeight = stageHeight - padding * 2;
    const ratio = Math.min(
      maxWidth / originalWidth,
      maxHeight / originalHeight
    );
    return {
      width: originalWidth * ratio,
      height: originalHeight * ratio,
    };
  };

  // 计算背景图片的尺寸和位置
  const fitSize = calculateFitSize(
    background.originalSize.width,
    background.originalSize.height
  );
  const imageWidth = fitSize.width * scale;
  const imageHeight = fitSize.height * scale;

  // 计算画布中心位置
  const centerX = (stageWidth - imageWidth) / 2;
  const centerY = (stageHeight - imageHeight) / 2;

  // 创建背景图片对象并等待加载完成
  const backgroundImage = new window.Image();
  backgroundImage.src = background.src;
  
  // 获取选中的元素
  const selectedElement = elements.find((elem) => elem.id === selectedId) || null;

  return (
    <div ref={containerRef} className={styles.editorContainer}>
      <div className={styles.editorContent}>
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          scale={{ x: scale, y: scale }}
          x={0}
          y={0}
          onClick={checkDeselect}
          onTap={checkDeselect}
        >
          <Layer>
            {/* 背景图层 */}
            <Image
              image={backgroundImage}
              x={centerX}
              y={centerY}
              width={imageWidth}
              height={imageHeight}
            />

            {/* 元素图层 */}
            {elements.map((element) => {
              if (element.type === 'image') {
                return (
                  <ImageNode
                    key={element.id}
                    element={element}
                    isSelected={element.id === selectedId}
                  />
                );
              } else if (element.type === 'rect') {
                return (
                  <RectNode
                    key={element.id}
                    element={element}
                    isSelected={element.id === selectedId}
                  />
                );
              } else if (element.type === 'text') {
                return (
                  <TextNode
                    key={element.id}
                    element={element}
                    isSelected={element.id === selectedId}
                    onSelect={() => setSelectedId(element.id)}
                    onChange={(newProps) => {
                      if (newProps.text !== undefined) {
                        updateTextContent(element.id, newProps.text);
                      }
                      if (newProps.position) {
                        moveElement(element.id, newProps.position);
                      }
                      if (newProps.size) {
                        resizeElement(element.id, newProps.size);
                      }
                      if (newProps.rotation !== undefined) {
                        rotateElement(element.id, newProps.rotation);
                      }
                      if (newProps.scale !== undefined) {
                        scaleElement(element.id, newProps.scale);
                      }
                    }}
                  />
                );
              }
              return null;
            })}

            {/* 选中元素的变换控制器 */}
            {selectedId && (
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  const minSize = 5;
                  if (newBox.width < minSize || newBox.height < minSize) {
                    return oldBox;
                  }
                  return newBox;
                }}
                rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
                rotationSnapTolerance={5}
                enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                anchorSize={8}
                anchorCornerRadius={2}
                borderStroke="#1890ff"
                borderStrokeWidth={1}
                padding={5}
              />
            )}
          </Layer>
        </Stage>
      </div>
      {background && (
        <div className={styles.zoomIndicator}>
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* 底部工具栏 */}
      <BottomToolbar
        selectedObject={
          selectedElement
            ? {
                id: selectedElement.id,
                type: selectedElement.type,
                rotation: selectedElement.rotation,
                scale: selectedElement.scale,
                opacity: (selectedElement as any).opacity || 1,
                cornerRadius: selectedElement.type === 'rect' ? (selectedElement as RectElement).cornerRadius : undefined,
                style: selectedElement.type === 'rect' ? (selectedElement as RectElement).style : undefined,
                fontSize: selectedElement.type === 'text' ? (selectedElement as TextElement).fontSize : undefined,
                fontFamily: selectedElement.type === 'text' ? (selectedElement as TextElement).fontFamily : undefined,
                fill: selectedElement.type === 'text' ? (selectedElement as TextElement).fill : undefined,
                align: selectedElement.type === 'text' ? (selectedElement as TextElement).align : undefined,
                verticalAlign: selectedElement.type === 'text' ? (selectedElement as TextElement).verticalAlign : undefined,
              }
            : null
        }
        onDelete={handleDelete}
        onRotate={handleRotate}
        onScale={handleScale}
        onUpdateCornerRadius={handleUpdateCornerRadius}
        onUpdateFill={handleUpdateFill}
        onUpdateStroke={handleUpdateStroke}
        onUpdateOpacity={handleUpdateOpacity}
        onUpdateTextStyle={handleUpdateTextStyle}
      />
    </div>
  );
}; 