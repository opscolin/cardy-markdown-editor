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

## 8. 数据持久化 (LocalStorage Persistence)
**问题描述**：用户刷新页面或重启浏览器后，之前创建的笔记和设置会丢失。
**解决方案**：
- 使用 `localStorage` 存储 `files` 数组和 `activeFileId`。
- 在 `App` 组件初始化时，从 `localStorage` 读取数据。
- 使用 `useEffect` 监听数据变化，实时同步到本地存储。
- **UI 反馈**：在标题栏添加了一个闪烁的 "Saved" 状态指示灯，让用户对保存状态有明确预期。

## 9. 图片持久化 (Image Persistence)
**问题描述**：`blob:` 协议的图片链接是会话级的，刷新页面后会失效。
**解决方案**：
- **Base64 转换**：在插入图片（粘贴或上传）时，使用 `FileReader` 将图片转换为 Base64 编码的 Data URL。
- **持久化存储**：Base64 字符串直接存储在 Markdown 文本中，随 `localStorage` 一起保存。
- **权衡**：虽然 Base64 会增加存储体积，但对于本地优先、无后端的轻量级编辑器来说，这是实现图片跨会话持久化最简单有效的方法。
