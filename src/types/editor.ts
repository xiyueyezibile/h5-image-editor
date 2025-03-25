/**
 * editor.ts
 * 编辑器核心类型定义文件
 * 定义了编辑器中所有元素的类型和状态
 */

/**
 * 位置接口
 * 表示元素在画布中的位置坐标
 */
export interface Position {
  x: number;  // X轴坐标
  y: number;  // Y轴坐标
}

/**
 * 尺寸接口
 * 表示元素的宽高尺寸
 */
export interface Size {
  width: number;   // 宽度
  height: number;  // 高度
}

/**
 * 基础元素接口
 * 所有可编辑元素的基础属性
 */
export interface BaseElement {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  rotation: number;
  scale: number; // 添加元素级别的缩放
  opacity?: number; // 透明度 0-1之间
}

/**
 * 图片元素接口
 */
export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
}

/**
 * 矩形元素接口
 */
export interface RectElement extends BaseElement {
  type: 'rect';
  cornerRadius?: number; // 矩形圆角半径
  style: {
    fill: string;
    stroke: string;
    strokeWidth: number;
  };
}

/**
 * 文本元素接口
 * 表示编辑器中的文本图层
 */
export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

/**
 * 形状元素接口
 * 表示编辑器中的形状图层
 */
export interface ShapeElement {
  id: string;                        // 唯一标识符
  type: 'rect' | 'circle' | 'line'; // 形状类型
  position: Position;               // 位置信息
  size: Size;                      // 尺寸信息
  fill: string;                    // 填充颜色
  stroke: string;                  // 边框颜色
  strokeWidth: number;             // 边框宽度
  rotation: number;                // 旋转角度
}

/**
 * 包含所有可用的元素类型
 */
export type EditorElement = RectElement | ImageElement | TextElement;

/**
 * 背景图片接口
 */
export interface Background {
  src: string;
  originalSize: {
    width: number;
    height: number;
  };
}

/**
 * 编辑器状态接口
 * 表示编辑器的整体状态
 */
export interface EditorState {
  elements: EditorElement[];  // 所有图层元素
  selectedId: string | null;  // 当前选中的图层ID
  scale: number;             // 当前缩放比例
}

/**
 * 背景图片接口
 * 表示编辑器的背景图片
 */
export interface BackgroundImage {
  src: string;           // 图片源地址
  originalSize: Size;    // 原始尺寸
  size: Size;           // 当前尺寸
}