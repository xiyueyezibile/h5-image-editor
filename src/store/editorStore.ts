import { create } from 'zustand';
import { BackgroundImage, EditorElement, Position, Size } from '../types/editor';

interface EditorState {
  // 背景图片
  background: BackgroundImage | null;
  // 图层元素
  elements: EditorElement[];
  // 选中的元素ID
  selectedId: string | null;
  // 画布缩放比例
  scale: number;
  // 画布尺寸
  canvasSize: {
    width: number;
    height: number;
  };
  // Actions
  setBackground: (background: BackgroundImage | null) => void;
  addElement: (element: EditorElement) => void;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  deleteElement: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  setScale: (scale: number) => void;
  setCanvasSize: (size: { width: number; height: number }) => void;
  // 元素变换操作
  moveElement: (id: string, position: Position) => void;
  resizeElement: (id: string, size: Size) => void;
  rotateElement: (id: string, rotation: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  background: null,
  elements: [],
  selectedId: null,
  scale: 1,
  canvasSize: {
    width: window.innerWidth,
    height: window.innerHeight,
  },

  // 设置背景图片
  setBackground: (background) => set({ background }),

  // 添加新元素
  addElement: (element) =>
    set((state) => ({
      elements: [...state.elements, element],
    })),

  // 更新元素
  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((elem) =>
        elem.id === id ? { ...elem, ...updates } : elem
      ),
    })),

  // 删除元素
  deleteElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((elem) => elem.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  // 设置选中元素
  setSelectedId: (id) => set({ selectedId: id }),

  // 设置缩放比例
  setScale: (scale) => set({ scale }),

  // 设置画布尺寸
  setCanvasSize: (size) => set({ canvasSize: size }),

  // 移动元素
  moveElement: (id, position) =>
    set((state) => ({
      elements: state.elements.map((elem) =>
        elem.id === id ? { ...elem, position } : elem
      ),
    })),

  // 调整元素大小
  resizeElement: (id, size) =>
    set((state) => ({
      elements: state.elements.map((elem) =>
        elem.id === id ? { ...elem, size } : elem
      ),
    })),

  // 旋转元素
  rotateElement: (id, rotation) =>
    set((state) => ({
      elements: state.elements.map((elem) =>
        elem.id === id ? { ...elem, rotation } : elem
      ),
    })),
})); 