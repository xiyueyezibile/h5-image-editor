import React from 'react';
import { Image } from 'react-konva';
import useImage from 'use-image';
import { Background } from '../../types/editor';

interface BackgroundLayerProps {
  background: Background;
  stageSize: { width: number; height: number };
}

/**
 * 背景图层组件
 * 负责渲染和管理编辑器的背景图片
 */
export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  background,
  stageSize,
}) => {
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