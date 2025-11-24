# 移动端滚动手势冲突解决方案

## 问题描述

在移动设备上，当交互式样例（CodeViewer 组件中的 iframe）包含可垂直滚动的内容时，会出现手势冲突：

- 用户想滚动 iframe 内部内容时，可能会触发页面滚动
- 用户想滚动页面时，可能会被 iframe 捕获

## 解决方案

### 1. 双指手势识别

- **单指滑动**：默认滚动页面
- **双指滑动**：滚动 iframe 内部内容（当检测到内容可滚动时）

### 2. 技术实现

#### CSS 优化

- 使用 `touch-action: pan-y` 控制触摸行为
- 使用 `overscroll-behavior: contain` 防止滚动穿透
- 使用 `-webkit-overflow-scrolling: touch` 优化 iOS 滚动体验

#### JavaScript 处理

```javascript
// 检测触摸点数量
previewContainer.addEventListener('touchstart', (e) => {
  touchCount = e.touches.length;

  // 双指触摸时，启用 iframe 内部滚动
  if (touchCount >= 2 && isIframeScrollable) {
    iframeInteractionEnabled = true;
    iframe.style.pointerEvents = 'auto';
  }
}, { passive: true });
```

#### 视觉反馈

- 双指触摸时显示提示："双指滑动操作内部"
- 提示 1.5 秒后自动消失

### 3. 边界检测

对于代码面板，实现了滚动边界检测：

- 到达顶部/底部时，允许页面接管滚动
- 避免滚动被"锁定"在子容器中

### 4. 新增属性

CodeViewer 组件新增了两个属性：

1. `enableMobileScroll`（默认为 `true`）：控制移动端内部滚动行为
2. `forceWhiteBackground`（默认为 `true`）：强制白色背景以兼容未适配深色模式的内容

```astro
<CodeViewer
  title="示例"
  enableMobileScroll={true}     // 允许移动端内部滚动
  forceWhiteBackground={true}    // 强制白色背景（默认）
  ...
/>

// 如果内容已适配深色模式，可以设置为 false
<CodeViewer
  forceWhiteBackground={false}  // 跟随系统主题
  ...
/>
```

## 测试方法

1. 访问测试页面：`http://localhost:4322/test-scroll`
2. 使用移动设备或开发者工具的移动端模拟器
3. 测试以下场景：
   - 单指滑动页面
   - 双指滑动 iframe 内容
   - 代码面板滚动
   - 表单输入交互

## 兼容性

- iOS Safari ✅
- Android Chrome ✅
- 其他移动浏览器 ✅

## 注意事项

1. 该方案需要用户学习双指手势，建议在首次使用时提供引导
2. 对于不支持多点触控的设备，默认优先页面滚动
3. 跨域 iframe 无法检测内容是否可滚动，会假设为可滚动
