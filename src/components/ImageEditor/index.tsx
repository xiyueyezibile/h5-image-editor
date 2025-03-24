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
import { Stage, Layer } from 'react-konva';
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

/**
 * 主编辑器组件
 */
export const ImageEditor: React.FC<{
  width: number;
  height: number;
  onUpload: (file: File) => void;
}> = ({
  width,
  height,
  onUpload,
}) => {
  const {
    background,
    elements,
    selectedId,
    scale,
    setSelectedId,
    setScale,
  } = useEditorStore();

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
          <UploadArea onUpload={onUpload} />
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
              <BackgroundLayer
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
                if (element.type === 'rect') {
                  return (
                    <RectNode
                      key={element.id}
                      element={element as RectElement}
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