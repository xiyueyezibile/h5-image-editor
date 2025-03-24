import { create } from 'zustand';
import { Background, ImageElement, RectElement, EditorElement } from '../types/editor';

interface EditorState {
  background: Background | null;
  elements: EditorElement[];
  selectedId: string | null;
  scale: number;
  setBackgroundImage: (src: string, width: number, height: number) => void;
  addImageElement: (src: string, width: number, height: number) => void;
  addRectElement: () => void;
  setSelectedId: (id: string | null) => void;
  moveElement: (id: string, position: { x: number; y: number }) => void;
  resizeElement: (id: string, size: { width: number; height: number }) => void;
  rotateElement: (id: string, rotation: number) => void;
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
    set((state) => ({
      elements: [
        ...state.elements,
        {
          id: `image-${Date.now()}`,
          type: 'image',
          src,
          position: { x: 0, y: 0 },
          size: { width, height },
          rotation: 0,
        } as ImageElement,
      ],
    })),

  addRectElement: () =>
    set((state) => {
      const id = `rect-${Date.now()}`;
      return {
        elements: [
          ...state.elements,
          {
            id,
            type: 'rect',
            position: { x: 100, y: 100 },
            size: { width: 100, height: 100 },
            rotation: 0,
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

  setSelectedId: (id) => set({ selectedId: id }),

  moveElement: (id, position) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, position } : el
      ),
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
        el.id === id ? { ...el, rotation } : el
      ),
    })),

  setScale: (scale) => set({ scale }),
})); 