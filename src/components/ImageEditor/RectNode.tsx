import React, { useRef, useEffect } from 'react';
import { Rect, Transformer } from 'react-konva';
import Konva from 'konva';
import { RectElement } from '../../types/editor';
import { useEditorStore } from '../../store/editorStore';

interface RectNodeProps {
  element: RectElement;
  isSelected: boolean;
}

/**
 * 矩形节点组件
 * 处理矩形图层的渲染和交互
 */
export const RectNode: React.FC<RectNodeProps> = ({ element, isSelected }) => {
  const shapeRef = useRef<Konva.Rect>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const { setSelectedId, moveElement, resizeElement, rotateElement } = useEditorStore();

  // 当图层被选中时，显示变换控制器
  useEffect(() => {
    if (isSelected && shapeRef.current && transformerRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Rect
        ref={shapeRef}
        x={element.position.x}
        y={element.position.y}
        width={element.size.width}
        height={element.size.height}
        fill={element.style.fill}
        stroke={element.style.stroke}
        strokeWidth={element.style.strokeWidth}
        cornerRadius={element.cornerRadius || 0}
        opacity={element.opacity || 1}
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