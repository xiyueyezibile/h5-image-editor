import React, { useState } from 'react';
import { Text } from 'react-konva';
import { TextElement } from '../../types/editor';

interface TextNodeProps {
  element: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (newProps: Partial<TextElement>) => void;
}

export const TextNode: React.FC<TextNodeProps> = ({
  element,
  isSelected,
  onSelect,
  onChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(element.text);

  // 处理双击事件，进入编辑模式
  const handleDblClick = () => {
    setIsEditing(true);
  };

  // 处理文本变化
  const handleTextChange = (e: any) => {
    const newText = e.target.value;
    setText(newText);
    onChange({ text: newText });
  };

  // 处理失去焦点事件
  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <Text
      id={element.id}
      text={element.text}
      x={element.position.x}
      y={element.position.y}
      width={element.size.width}
      height={element.size.height}
      rotation={element.rotation}
      scaleX={element.scale}
      scaleY={element.scale}
      opacity={element.opacity}
      fontSize={element.fontSize}
      fontFamily={element.fontFamily}
      fill={element.fill}
      align={element.align}
      verticalAlign={element.verticalAlign}
      onClick={onSelect}
      onTap={onSelect}
      onDblClick={handleDblClick}
      onDblTap={handleDblClick}
      draggable
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
        onChange({
          position: {
            x: node.x(),
            y: node.y(),
          },
          size: {
            width: node.width() * node.scaleX(),
            height: node.height() * node.scaleY(),
          },
          rotation: node.rotation(),
          scale: node.scaleX(),
        });
      }}
    />
  );
}; 