/**
 * ImageEditor 组件
 * 基于react-konva实现的图片编辑器核心组件
 * 功能包括：
 * 1. 图片上传（背景图和图层）
 * 2. 图层管理
 * 3. 图片变换（移动、缩放、旋转）
 * 4. 手势操作支持
 */
import React, { useState, useCallback, useRef } from 'react';
import { Stage, Layer, Image, Transformer } from 'react-konva';
import { ImageUploader } from './ImageUploader';
import { EditorElement, ImageElement, BackgroundImage } from '../../types/editor';
import styles from './index.module.css';
import { KonvaEventObject } from 'konva/lib/Node';
import useImage from 'use-image';
import { useGesture } from '@use-gesture/react';
import Konva from 'konva';

/**
 * 背景图层组件
 * 负责渲染和管理编辑器的背景图片
 */
const BackgroundImageLayer: React.FC<{
  background: BackgroundImage;
  stageSize: { width: number; height: number };
}> = ({ background, stageSize }) => {
  const [image] = useImage(background.src);
  
  if (!image) return null;

  // 计算缩放比例，使图片适应舞台
  const scale = Math.min(
    stageSize.width / background.originalSize.width,
    stageSize.height / background.originalSize.height
  );

  return (
    <Image
      image={image}
      width={background.originalSize.width}
      height={background.originalSize.height}
      scaleX={scale}
      scaleY={scale}
      x={(stageSize.width - background.originalSize.width * scale) / 2}
      y={(stageSize.height - background.originalSize.height * scale) / 2}
      listening={false}
    />
  );
};

/**
 * 图片节点组件
 * 处理单个图片图层的渲染和交互
 * 支持拖拽、缩放、旋转等操作
 */
const ImageNode: React.FC<{
  element: ImageElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<ImageElement>) => void;
}> = ({ element, isSelected, onSelect, onChange }) => {
  const [image] = useImage(element.src);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // 当图层被选中时，显示变换控制器
  React.useEffect(() => {
    if (isSelected && imageRef.current && transformerRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Image
        ref={imageRef}
        image={image}
        x={element.position.x}
        y={element.position.y}
        width={element.size.width}
        height={element.size.height}
        rotation={element.rotation}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          // 拖拽结束时更新位置
          onChange({
            position: {
              x: e.target.x(),
              y: e.target.y(),
            },
          });
        }}
        onTransformEnd={(e) => {
          // 变换结束时更新大小和旋转角度
          const node = e.target;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            position: {
              x: node.x(),
              y: node.y(),
            },
            size: {
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
            },
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // 限制最小尺寸
            const minWidth = 5;
            const minHeight = 5;
            if (newBox.width < minWidth || newBox.height < minHeight) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right'
          ]}
          // 设置旋转吸附角度
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotationSnapTolerance={15}
        />
      )}
    </>
  );
};

/**
 * 主编辑器组件
 * 管理整个编辑器的状态和交互
 */
export const ImageEditor: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  // 状态管理
  const [background, setBackground] = useState<BackgroundImage | null>(null);
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 手势控制（缩放）
  useGesture(
    {
      onPinch: ({ offset: [s], event }) => {
        event?.preventDefault();
        const newScale = Math.min(Math.max(0.5, s), 3); // 限制缩放范围
        setScale(newScale);
      },
    },
    {
      target: containerRef,
      eventOptions: { passive: false },
    }
  );

  // 处理图片上传
  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        if (!background) {
          // 如果还没有底图，则设置为底图
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
        } else {
          // 否则添加为普通图层
          const aspectRatio = img.width / img.height;
          const maxWidth = width * 0.5; // 限制新添加图层的最大尺寸
          const maxHeight = height * 0.5;
          let newWidth = img.width;
          let newHeight = img.height;

          // 保持宽高比例计算合适的尺寸
          if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = newWidth / aspectRatio;
          }
          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
          }

          // 创建新的图层元素
          const newElement: ImageElement = {
            id: `image-${Date.now()}`,
            type: 'image',
            src: e.target?.result as string,
            position: {
              x: (width - newWidth) / 2,
              y: (height - newHeight) / 2,
            },
            size: {
              width: newWidth,
              height: newHeight,
            },
            rotation: 0,
          };

          setElements((prev) => [...prev, newElement]);
        }
      };
    };
    reader.readAsDataURL(file);
  }, [width, height, background]);

  // 更新图层属性
  const handleElementChange = useCallback((id: string, newAttrs: Partial<EditorElement>) => {
    setElements((prev) =>
      prev.map((elem) => {
        if (elem.id === id) {
          return {
            ...elem,
            ...newAttrs,
            type: elem.type
          } as EditorElement;
        }
        return elem;
      })
    );
  }, []);

  // 处理画布空白处点击，取消选中状态
  const checkDeselect = useCallback((e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  }, []);

  return (
    <div ref={containerRef} className={styles.editorContainer}>
      <div className={styles.editorContent}>
        {!background ? (
          <ImageUploader onImageUpload={handleImageUpload} />
        ) : (
          <Stage
            ref={stageRef}
            width={width}
            height={height}
            onMouseDown={checkDeselect}
            onTouchStart={checkDeselect}
            scaleX={scale}
            scaleY={scale}
          >
            <Layer>
              <BackgroundImageLayer
                background={background}
                stageSize={{ width, height }}
              />
            </Layer>
            <Layer>
              {elements.map((element) => {
                if (element.type === 'image') {
                  return (
                    <ImageNode
                      key={element.id}
                      element={element as ImageElement}
                      isSelected={selectedId === element.id}
                      onSelect={() => setSelectedId(element.id)}
                      onChange={(newAttrs) =>
                        handleElementChange(element.id, newAttrs)
                      }
                    />
                  );
                }
                return null;
              })}
            </Layer>
          </Stage>
        )}
      </div>
      {background && (
        <>
          <div className={styles.uploadButton}>
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
          <div className={styles.zoomIndicator}>
            {Math.round(scale * 100)}%
          </div>
        </>
      )}
    </div>
  );
}; 