# 项目开发问题记录与解决方案 (Issues & Solutions)

本文档记录了 Cardy Markdown Editor 开发过程中遇到的核心技术挑战及其解决方案，旨在为后期维护和学习提供参考。

## 1. 编辑器内图片实时展示
**问题描述**：传统的 Markdown 编辑器通常只显示 `![alt](url)` 文本。用户希望在左侧编辑器中能直接看到图片，而不是 Base64 或路径。
**解决方案**：
- 使用 `contentEditable` 属性构建编辑器，而非简单的 `textarea`。
- 监听 `onPaste` 和文件上传事件，将图片转换为 `URL.createObjectURL(file)`。
- 在编辑器中直接插入 `<img>` 标签展示。
- **同步逻辑**：在输入时，通过正则解析编辑器内容，将图片标签转换回 Markdown 语法存储到状态中，确保预览区能正常渲染。

## 2. 预览区图片无法显示 (Blob URL 过滤)
**问题描述**：在编辑器中插入图片后，右侧预览区显示图片加载失败。
**原因分析**：`react-markdown` 默认会过滤掉非 `http/https` 协议的链接（包括 `blob:` 协议）以防范 XSS 攻击。
**解决方案**：
- 为 `ReactMarkdown` 组件配置 `urlTransform` 属性：
  ```tsx
  <ReactMarkdown 
    urlTransform={(uri) => uri.startsWith('blob:') ? uri : uri}
  >
  ```

## 3. 卡片尺寸不统一
**问题描述**：当某张卡片内容较少时，Flex 布局会导致卡片自动收缩，视觉上不整齐。
**解决方案**：
- 锁定卡片容器宽度为 `400px`。
- 使用 `shrink-0` 属性强制防止 Flex 压缩。
- 设置 `aspect-[3/4]` 确保所有卡片比例一致。

## 4. 字号调整时标题不同步
**问题描述**：最初只调整了正文的 `font-size`，导致标题在字号变大时显得过小。
**解决方案**：
- **相对单位化**：将卡片内所有元素的尺寸（font-size, margin, padding）从固定像素 (`px`) 改为相对单位 (`em`)。
- **根控制**：只需在卡片容器上根据选择器设置 `text-[12px]` 到 `text-[18px]`，内部所有标题和间距都会自动等比缩放。

## 5. 导出 PDF/ZIP 失败 (Failed to fetch)
**问题描述**：点击导出按钮时，控制台报错 `Failed to fetch`，图片无法加载。
**原因分析**：`html-to-image` 默认开启了 `cacheBust: true`。它会尝试在图片 URL 后添加随机参数来刷新缓存，但这对于 `blob:` 协议的本地链接是无效的，会导致请求错误。
**解决方案**：
- 在调用 `toPng` 时显式禁用 `cacheBust`：
  ```tsx
  await toPng(cardRef.current, { cacheBust: false, pixelRatio: 2 });
  ```

## 6. 导出状态冲突 (UI 闪烁)
**问题描述**：点击 PDF 导出时，ZIP 按钮也会显示加载动画。
**原因分析**：使用了全局的 `isExporting` 布尔值控制所有按钮的状态。
**解决方案**：
- 将状态细化为枚举类型：`exportingType: 'pdf' | 'zip' | null`。
- 按钮根据自己的类型判断是否显示加载状态，实现 UI 的精确反馈。

## 7. 代码块样式区分
**问题描述**：需要区分 Mac 风格的大段代码块和行内高亮代码。
**解决方案**：
- 在 `ReactMarkdown` 的 `components` 配置中，通过检查 `children` 是否包含换行符或 `className` 是否包含 `language-` 来区分：
  - **块级代码**：渲染带红绿灯图标的自定义容器。
  - **行内代码**：渲染简洁的橘色背景小标签。
