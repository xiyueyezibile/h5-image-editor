/**
 * ImageEditor 组件
 * 基于react-konva实现的图片编辑器核心组件
 * 功能包括：
 * 1. 图片上传（背景图和图层）
 * 2. 图层管理
 * 3. 图片变换（移动、缩放、旋转）
 * 4. 手势操作支持
 */
import React, { useRef } from 'react';
import { Stage, Layer, Image, Transformer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import Konva from 'konva';
import { useGesture } from '@use-gesture/react';
import useImage from 'use-image';
import { useEditorStore } from '../../store/editorStore';
import styles from './index.module.css';
import { ImageElement } from '../../types/editor';
import { UploadOutlined } from '@ant-design/icons';

/**
 * 背景图层组件
 * 负责渲染和管理编辑器的背景图片
 */
const BackgroundImageLayer: React.FC<{
  background: { src: string; originalSize: { width: number; height: number } };
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
 */
const ImageNode: React.FC<{
  element: ImageElement;
  isSelected: boolean;
}> = ({ element, isSelected }) => {
  const [image] = useImage(element.src);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const { setSelectedId, moveElement, resizeElement, rotateElement } = useEditorStore();

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
        onClick={() => setSelectedId(element.id)}
        onTap={() => setSelectedId(element.id)}
        onDragEnd={(e) => {
          moveElement(element.id, {
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = e.target;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          moveElement(element.id, {
            x: node.x(),
            y: node.y(),
          });

          resizeElement(element.id, {
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });

          rotateElement(element.id, node.rotation());
        }}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
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
          rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
          rotationSnapTolerance={15}
        />
      )}
    </>
  );
};

/**
 * 上传底图组件
 */
const UploadBackground: React.FC<{
  onImageUpload: (file: File) => void;
}> = ({ onImageUpload }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <label className={styles.uploadButton}>
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <UploadOutlined />
        <span>点击上传底图</span>
      </label>
    </div>
  );
};

/**
 * 主编辑器组件
 */
export const ImageEditor: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  const {
    background,
    elements,
    selectedId,
    scale,
    setSelectedId,
    setScale,
    setBackground,
  } = useEditorStore();

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理上传底图
  const handleUploadBackground = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onload = () => {
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
      };
    };
    reader.readAsDataURL(file);
  };

  // 手势控制（缩放）
  useGesture(
    {
      onPinch: ({ offset: [s], event }) => {
        event?.preventDefault();
        const newScale = Math.min(Math.max(0.5, s), 3);
        setScale(newScale);
      },
    },
    {
      target: containerRef,
      eventOptions: { passive: false },
    }
  );

  // 处理画布空白处点击，取消选中
  const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  return (
    <div ref={containerRef} className={styles.editorContainer}>
      <div className={styles.editorContent}>
        {!background ? (
          <UploadBackground onImageUpload={handleUploadBackground} />
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
        <div className={styles.zoomIndicator}>
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
}; 