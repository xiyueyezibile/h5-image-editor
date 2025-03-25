import React, { useRef, useEffect, useState } from 'react';
import { Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { TextElement } from '../../types/editor';
import { useEditorStore } from '../../store/editorStore';

interface TextNodeProps {
  element: TextElement;
  isSelected: boolean;
}

/**
 * 文字节点组件
 * 处理文字图层的渲染和交互
 */
export const TextNode: React.FC<TextNodeProps> = ({ element, isSelected }) => {
  const textRef = useRef<Konva.Text>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(element.text);
  const { setSelectedId, moveElement, resizeElement, rotateElement, updateTextContent, updateTextStyle } = useEditorStore();

  // 当图层被选中时，显示变换控制器
  useEffect(() => {
    if (isSelected && textRef.current && transformerRef.current) {
      transformerRef.current.nodes([textRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // 处理双击编辑
  const handleDblClick = () => {
    setIsEditing(true);
  };

  // 处理文本编辑完成
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    updateTextContent(element.id, newText);
  };

  // 处理文本编辑结束
  const handleTextEnd = () => {
    setIsEditing(false);
  };

  return (
    <>
      <Text
        ref={textRef}
        x={element.position.x}
        y={element.position.y}
        text={text}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fill={element.fill}
        align={element.align}
        verticalAlign={element.verticalAlign}
        width={element.size.width}
        height={element.size.height}
        rotation={element.rotation}
        opacity={element.opacity}
        draggable
        onClick={() => setSelectedId(element.id)}
        onTap={() => setSelectedId(element.id)}
        onDblClick={handleDblClick}
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
      {isEditing && (
        <textarea
          value={text}
          onChange={handleTextChange}
          onBlur={handleTextEnd}
          style={{
            position: 'absolute',
            top: element.position.y,
            left: element.position.x,
            width: element.size.width,
            height: element.size.height,
            fontSize: element.fontSize,
            fontFamily: element.fontFamily,
            color: element.fill,
            background: 'transparent',
            border: 'none',
            padding: 0,
            margin: 0,
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            transform: `rotate(${element.rotation}deg)`,
            zIndex: 1000,
          }}
          autoFocus
        />
      )}
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