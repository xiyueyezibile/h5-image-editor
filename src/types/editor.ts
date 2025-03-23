export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ImageElement {
  id: string;
  type: 'image';
  src: string;
  position: Position;
  size: Size;
  rotation: number;
}

export interface TextElement {
  id: string;
  type: 'text';
  text: string;
  position: Position;
  fontSize: number;
  fontFamily: string;
  fill: string;
  rotation: number;
}

export interface ShapeElement {
  id: string;
  type: 'rect' | 'circle' | 'line';
  position: Position;
  size: Size;
  fill: string;
  stroke: string;
  strokeWidth: number;
  rotation: number;
}

export type EditorElement = ImageElement | TextElement | ShapeElement;

export interface EditorState {
  elements: EditorElement[];
  selectedId: string | null;
  scale: number;
} 

export interface BackgroundImage {
  src: string;
  originalSize: Size;
  size: Size;
}