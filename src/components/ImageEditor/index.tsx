import React, { useState, useCallback, useRef } from 'react';
import { Stage, Layer, Image, Transformer } from 'react-konva';
import { ImageUploader } from './ImageUploader';
import { EditorElement, ImageElement, BackgroundImage } from '../../types/editor';
import styles from './index.module.css';
import { KonvaEventObject } from 'konva/lib/Node';
import useImage from 'use-image';
import { useGesture } from '@use-gesture/react';
import Konva from 'konva';

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

const ImageNode: React.FC<{
  element: ImageElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newAttrs: Partial<ImageElement>) => void;
}> = ({ element, isSelected, onSelect, onChange }) => {
  const [image] = useImage(element.src);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

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
          onChange({
            position: {
              x: e.target.x(),
              y: e.target.y(),
            },
          });
        }}
        onTransformEnd={(e) => {
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

export const ImageEditor: React.FC<{ width: number; height: number }> = ({
  width,
  height,
}) => {
  const [background, setBackground] = useState<BackgroundImage | null>(null);
  const [elements, setElements] = useState<EditorElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
          const maxWidth = width * 0.5; // 减小默认尺寸
          const maxHeight = height * 0.5;
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
              {elements.map((elem) => {
                if (elem.type === 'image') {
                  return (
                    <ImageNode
                      key={elem.id}
                      element={elem}
                      isSelected={elem.id === selectedId}
                      onSelect={() => setSelectedId(elem.id)}
                      onChange={(newAttrs) => handleElementChange(elem.id, newAttrs)}
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