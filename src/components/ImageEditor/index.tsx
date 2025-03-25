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
import { Stage, Layer, Image, Rect, Transformer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';
import { useGesture } from '@use-gesture/react';
import { useEditorStore } from '../../store/editorStore';
import { ImageElement, RectElement } from '../../types/editor';
import styles from './styles.module.css';
import { BackgroundLayer } from './BackgroundLayer';
import { ImageNode } from './ImageNode';
import { RectNode } from './RectNode';
import { UploadArea } from './UploadArea';

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
  
  return (
    <div ref={containerRef} className={styles.editorContainer}>
      <div className={styles.editorContent}>
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
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
            {elements.map((elem) => {
              if (elem.type === 'rect') {
                return (
                  <Rect
                    key={elem.id}
                    id={elem.id}
                    x={elem.position.x * scale + centerX}
                    y={elem.position.y * scale + centerY}
                    width={elem.size.width * elem.scale * scale}
                    height={elem.size.height * elem.scale * scale}
                    rotation={elem.rotation}
                    fill={elem.style.fill}
                    stroke={elem.style.stroke}
                    strokeWidth={elem.style.strokeWidth}
                    draggable
                    onClick={(e) => {
                      e.cancelBubble = true;
                      setSelectedId(elem.id);
                    }}
                    onTap={(e) => {
                      e.cancelBubble = true;
                      setSelectedId(elem.id);
                    }}
                    onDragStart={(e) => {
                      e.cancelBubble = true;
                      setSelectedId(elem.id);
                    }}
                    onDragEnd={(e) => {
                      const pos = {
                        x: (e.target.x() - centerX) / scale,
                        y: (e.target.y() - centerY) / scale,
                      };
                      moveElement(elem.id, pos);
                    }}
                    onTransformStart={(e) => {
                      e.cancelBubble = true;
                      const node = e.target;
                      node.setAttrs({
                        width: node.width() * node.scaleX(),
                        height: node.height() * node.scaleY(),
                        scaleX: 1,
                        scaleY: 1,
                      });
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const rotation = node.rotation();
                      const width = node.width() * node.scaleX();
                      const height = node.height() * node.scaleY();
                      const newScale = Math.sqrt((width * width + height * height) / 
                        (elem.size.width * elem.size.width + elem.size.height * elem.size.height)) / scale;
                      
                      node.setAttrs({
                        rotation,
                        width: elem.size.width * scale * newScale,
                        height: elem.size.height * scale * newScale,
                        scaleX: 1,
                        scaleY: 1,
                      });

                      scaleElement(elem.id, elem.scale * newScale);
                      rotateElement(elem.id, rotation);
                    }}
                  />
                );
              } else if (elem.type === 'image') {
                const imageObj = new window.Image();
                imageObj.src = elem.src;
                return (
                  <Image
                    key={elem.id}
                    id={elem.id}
                    image={imageObj}
                    x={elem.position.x * scale + centerX}
                    y={elem.position.y * scale + centerY}
                    width={elem.size.width * elem.scale * scale}
                    height={elem.size.height * elem.scale * scale}
                    rotation={elem.rotation}
                    draggable
                    onClick={(e) => {
                      e.cancelBubble = true;
                      setSelectedId(elem.id);
                    }}
                    onTap={(e) => {
                      e.cancelBubble = true;
                      setSelectedId(elem.id);
                    }}
                    onDragStart={(e) => {
                      e.cancelBubble = true;
                      setSelectedId(elem.id);
                    }}
                    onDragEnd={(e) => {
                      const pos = {
                        x: (e.target.x() - centerX) / scale,
                        y: (e.target.y() - centerY) / scale,
                      };
                      moveElement(elem.id, pos);
                    }}
                    onTransformStart={(e) => {
                      e.cancelBubble = true;
                      const node = e.target;
                      node.setAttrs({
                        width: node.width() * node.scaleX(),
                        height: node.height() * node.scaleY(),
                        scaleX: 1,
                        scaleY: 1,
                      });
                    }}
                    onTransformEnd={(e) => {
                      const node = e.target;
                      const rotation = node.rotation();
                      const width = node.width() * node.scaleX();
                      const height = node.height() * node.scaleY();
                      const newScale = Math.sqrt((width * width + height * height) / 
                        (elem.size.width * elem.size.width + elem.size.height * elem.size.height)) / scale;
                      
                      node.setAttrs({
                        rotation,
                        width: elem.size.width * scale * newScale,
                        height: elem.size.height * scale * newScale,
                        scaleX: 1,
                        scaleY: 1,
                      });

                      scaleElement(elem.id, elem.scale * newScale);
                      rotateElement(elem.id, rotation);
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
                  // 限制最小尺寸
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
    </div>
  );
}; 