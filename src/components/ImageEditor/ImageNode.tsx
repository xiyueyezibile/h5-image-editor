import React, { useRef, useEffect } from 'react';
import { Image, Transformer } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';
import { ImageElement } from '../../types/editor';
import { useEditorStore } from '../../store/editorStore';

interface ImageNodeProps {
  element: ImageElement;
  isSelected: boolean;
}

/**
 * 图片节点组件
 * 处理单个图片图层的渲染和交互
 */
export const ImageNode: React.FC<ImageNodeProps> = ({ element, isSelected }) => {
  const [image] = useImage(element.src);
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const { setSelectedId, moveElement, resizeElement, rotateElement } = useEditorStore();

  // 当图层被选中时，显示变换控制器
  useEffect(() => {
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
        opacity={element.opacity || 1}
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