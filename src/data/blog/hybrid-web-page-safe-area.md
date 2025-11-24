---
title: Hybrid页面的safe area适配
tags:
  - 前端
lang: zh
pubDatetime: 2021-09-26T00:00:00.000Z
description: Hybrid页面的safe area适配
---
## Contents
## 背景

手机全面屏普及给前端适配带来了安全区域的概念，前端适配也有了新的麻烦。

全面屏的刘海区域会遮挡页面的顶端，而Home Indicator会遮挡页面的底端。为了保证用户能够正常操作和浏览，需要避免在这些区域内放置交互元素，避开这些区域的部分就叫做安全区域(safe area)。

![Untitled 26.png](/static/images/hybrid-web-page-safe-area/Untitled%2026.png)

iPhone竖屏模式下的安全区域

![Untitled 1 11.png](/static/images/hybrid-web-page-safe-area/Untitled%201%2011.png)

iPhone横屏模式下的安全区域

如果不进行适配则会出现这样的问题：

![Untitled 2 8.png](/static/images/hybrid-web-page-safe-area/Untitled%202%208.png)

## 普通网页适配

这里指的普通网页是在手机浏览器或者默认webview内的网页（具体到我们的场景，更多是微信webview），这类网页我们一般不考虑顶部导航栏的高度，因为顶部导航栏不受网页控制，适配的问题主要在fix bottom的元素。

### iOS

从iOS11开始，在全面屏手机内，默认情况下网页将不会占据全部内容区域，而是仅在安全区域内展示。

未适配的网页将会出现如下的白条，在meta内设置`viewport-fit=cover`可以将网页扩展到整个屏幕，但是这时就需要网页自己处理安全区域了。

```HTML
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

![Untitled 3 6.png](/static/images/hybrid-web-page-safe-area/Untitled%203%206.png)

为了让网页能够适配，浏览器提供了一系列constant，分别代表safe area到各边的距离，可以在css内使用。  
对于上面的例子我们可以这样为底部导航栏加上padding-bottom：  

![Untitled 2 8.png](/static/images/hybrid-web-page-safe-area/Untitled%202%208.png)

```CSS
padding-bottom: constant(safe-area-inset-bottom); /* iOS < 11.2 */
padding-bottom: env(safe-area-inset-bottom); /* iOS >= 11.2 */
```

同时有constant和env是因为iOS11发布时只支持constant，11.2发布后constant被废弃改为env。

如果padding-bottom不为0怎么办呢，我们可以利用calc和env的fallback值：

```CSS
padding-bottom: calc(10px + env(safe-area-inset-bottom));
```

```CSS
padding-bottom: calc(10px + env(safe-area-inset-bottom, 10px));
```

面对更复杂的情况，我们还可以用supports媒体查询做样式隔离：

```CSS
@supports (bottom: constant(safe-area-inset-bottom)) or (bottom: env(safe-area-inset-bottom)) {
  div {
    padding-bottom: constant(safe-area-inset-bottom);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

### Android

Android手机底部虽然也会有类似Home Indicator的导航栏，但是却不支持`viewport-fit=cover`，如下图所示，底部区域不会显示HTML，也就不需要额外兼容。

![Untitled 4 5.png](/static/images/hybrid-web-page-safe-area/Untitled%204%205.png)

## Hybrid网页适配

Hybrid页面为了保证视觉效果，通常会设置隐藏App内浏览器默认的Header和Footer（我们通过URLScheme中的`displayHeader=false&displayFooter=fase`控制）。

![Untitled 5 4.png](/static/images/hybrid-web-page-safe-area/Untitled%205%204.png)

这样就需要自定义导航栏，并且处理顶部状态栏的高度，如果不处理就会这样：

![Untitled 6 4.png](/static/images/hybrid-web-page-safe-area/Untitled%206%204.png)

### iOS

在iOS上很好处理，利用safe-area-inset-top即可

```CSS
padding-top: env(safe-area-inset-top); 
```

### Android

这个问题上Android的处理比较复杂。首先不同Android Rom上`safe-area-inset-*`有着不同实现，有些不会生效，有些则会设为零，所以我们倾向于不在Android上使用`safe-area-inset-*`。

这样前端也没有任何办法获取状态栏的高度，需要客户端的帮助。客户端可以获取状态栏的高度，再通知给前端。

我们现行的做法是客户端将状态栏高度写在UA里，例如自定义后的UA可能为 `MyApp/6.2.0 StatusBarHeight/20` （注意单位是物理像素而不是逻辑像素），前端再通过`navigator.userAgent`解析状态栏高度，应用到样式内。

```TypeScript
import { getEnv } from 'env'
const env = getEnv()

const STATUS_BAR_HEIGHT = env?.device?.statusBarHeight ?? 20
```

但是这样iOS和Android样式逻辑差别会比较大，我们可以用CSS变量来解决：

```TypeScript
import { getEnv } from 'env'
const env = getEnv()

const STATUS_BAR_HEIGHT = env?.device?.statusBarHeight ?? 20
if (env.app.isApp) {
  document.body.style.setProperty(
    '--status-bar-height',
    env.os.isiOS ? 'env(safe-area-inset-top, 20px)' : `${STATUS_BAR_HEIGHT}px`
  )
}
```

这样我们就能很方便的在CSS中使用状态栏高度：

```CSS
padding-top: var(--status-bar-height);
```

需要注意的是，这段逻辑需要在网页渲染前执行，否则会因为CSS变量值变化导致Layout Shift。

### 为什么是UA？

我们通过UA传递状态栏高度信息，是因为UA可以保证JS在执行时一定能**同步**拿到状态栏高度信息。如果使用Hybrid Action，可能出现还没有拿到状态栏信息渲染已经完成的情况，并导致Layout Shift。
