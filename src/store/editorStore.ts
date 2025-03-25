import { create } from 'zustand';
import { Background, ImageElement, RectElement, EditorElement } from '../types/editor';

interface EditorState {
  background: Background | null; // 背景图
  elements: EditorElement[]; // 元素列表
  selectedId: string | null; // 选中的元素id
  scale: number; // 缩放比例
  setBackgroundImage: (src: string, width: number, height: number) => void; // 设置背景图
  addImageElement: (src: string, width: number, height: number) => void; // 添加图片元素
  addRectElement: () => void; // 添加矩形元素
  deleteElement: (id: string) => void; // 删除元素
  setSelectedId: (id: string | null) => void; // 设置选中的元素id
  moveElement: (id: string, position: { x: number; y: number }) => void; // 移动元素
  resizeElement: (id: string, size: { width: number; height: number }) => void; // 调整元素大小
  rotateElement: (id: string, rotation: number) => void; // 旋转元素
  scaleElement: (id: string, scale: number) => void; // 缩放元素
  setScale: (scale: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  background: null,
  elements: [],
  selectedId: null,
  scale: 1,

  setBackgroundImage: (src, width, height) =>
    set({ background: { src, originalSize: { width, height } } }),

  addImageElement: (src, width, height) =>
    set((state) => {
      const id = `image-${Date.now()}`;
      return {
        elements: [
          ...state.elements,
          {
            id,
            type: 'image',
            src,
            position: { x: 50, y: 50 },
            size: { width, height },
            rotation: 0,
            scale: 1,
          } as ImageElement,
        ],
        selectedId: id,
      };
    }),

  addRectElement: () =>
    set((state) => {
      const id = `rect-${Date.now()}`;
      const defaultSize = 100;
      return {
        elements: [
          ...state.elements,
          {
            id,
            type: 'rect',
            position: { x: 0, y: 0 },
            size: { width: defaultSize, height: defaultSize },
            rotation: 0,
            scale: 1,
            style: {
              fill: '#ffffff',
              stroke: '#1890ff',
              strokeWidth: 2,
            },
          } as RectElement,
        ],
        selectedId: id,
      };
    }),

  deleteElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((elem) => elem.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
    })),

  resizeElement: (id, size) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, size } : el
      ),
    })),

  rotateElement: (id, rotation) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, rotation: rotation % 360 } : el
      ),
    })),

  scaleElement: (id, scale) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, scale } : el
      ),
    })),

  setScale: (scale) => set({ scale }),

  setSelectedId: (id) => set({ selectedId: id }),

  moveElement: (id, position) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, position } : el
      ),
    })),
})); 