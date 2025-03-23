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
 * 图片元素接口
 * 表示编辑器中的图片图层
 */
export interface ImageElement {
  id: string;           // 唯一标识符
  type: 'image';       // 元素类型
  src: string;         // 图片源地址
  position: Position;  // 位置信息
  size: Size;         // 尺寸信息
  rotation: number;    // 旋转角度
}

/**
 * 文本元素接口
 * 表示编辑器中的文本图层
 */
export interface TextElement {
  id: string;           // 唯一标识符
  type: 'text';        // 元素类型
  text: string;        // 文本内容
  position: Position;  // 位置信息
  fontSize: number;    // 字体大小
  fontFamily: string;  // 字体族
  fill: string;       // 填充颜色
  rotation: number;    // 旋转角度
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
 * 编辑器元素类型
 * 所有可能的图层类型的联合类型
 */
export type EditorElement = ImageElement | TextElement | ShapeElement;

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