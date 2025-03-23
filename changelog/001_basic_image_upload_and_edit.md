 # 001 基本的图片上传和编辑功能

## 新增功能

1. 图片上传
   - 支持点击上传
   - 支持拖拽上传
   - 自动调整图片大小以适应画布

2. 图片编辑
   - 支持拖拽移动
   - 支持缩放调整大小
   - 支持旋转
   - 支持选中/取消选中

## 新增文件

- src/components/ImageEditor/ImageUploader.tsx
- src/components/ImageEditor/ImageUploader.module.css
- src/components/ImageEditor/index.tsx
- src/components/ImageEditor/index.module.css
- src/types/editor.ts

## 依赖更新

- 新增 use-image@1.1.1：用于在Konva中加载和处理图片

## 后续计划

1. 添加更多编辑工具（裁剪、滤镜等）
2. 优化移动端触摸体验
3. 添加撤销/重做功能
4. 添加图片保存功能