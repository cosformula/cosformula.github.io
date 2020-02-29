---
layout: article
title: HTML canvas中文本换行的问题
date: 2020-02-29 23:11:00 +0800
aside:
  toc: true
# mathjax: true
# mathjax_autoNumber: true
# mermaid: true
# chart: true
---

HTML canvas 绘制文本时不支持换行，一般情况下可以通过 html2canvas 解决复杂的文本排版，但 html2canvas 不能在小程序或 Node canvas 环境下使用。

这篇文章介绍了 canvas 文本渲染的基础知识、贪心算法实现自动换行、Unicode 换行算法/CSS 标准中的换行以及 html2canvas 能够正确渲染文本换行的原理。

<!--more-->

## 基础知识

这章将介绍 canvas2D 文本绘制的一些基础知识，如果你对这些已经很熟悉可以跳过。

Canvas2D 环境中，可以使用`fillText`API 来绘制文本。该 API 的语法如下：

```javascript
void ctx.fillText(text, x, y [, maxWidth]);
```

`text`是所要绘制的字符串，`x`和`y`为文本起点的坐标，可选参数`maxWidth`为绘制的最大宽度。

如果指定了 maxWidth，绘制字符串实际渲染长度超出`maxWidth`时，文本会进行自适应缩放。

可以在下面的 codepen 里体验三个参数的作用。

<div>{%- include extensions/codepen.html user='cosformula' hash='XWbNqbJ' default_tab='result' -%}</div>

`fillText`仅支持绘制单行文本，文本超出绘制范围仍然会继续绘制，而`\n`也会被视为空白字符。幸好 Canvas2D 还提供了`mesaureText`API，语法如下：

```javascript
ctx.measureText(text)
```

参数`text`为要测量的字符串，该方法会返回`TextMetrics`对象，`TextMetrics`对象包含`width`属性。通过这样的代码可以测量指定字符串绘制后的宽度。

```javascript
var text = ctx.measureText('foo') // TextMetrics object
text.width // 16;
```

## 使用贪心算法实现自动换行

自动换行的简单实现是使用贪心算法，核心思路是将尽可能多的字符放入一行，直到所有的字符都放进去。

<!-- 使用一个变量作为缓冲区，代表当前渲染的文本行，依次在缓冲区内填充字符，并使用`measureText`计算当前缓冲区的实际渲染宽度，当渲染宽度大于设定宽度时，文本应当在填充当前字符的前一位置换行，将缓冲区文本作为一行加入列表并清空缓冲区。重复以上过程，直到所有的字符都被放入。 -->

按照这样的思路将文本处理为换行后的字符串列表，列表中的每一项都代表实际渲染的单行文本，最后再调用`fillText`依次渲染即可。

```javascript
const text = 'Hello World'

// 计算文本应当在何时换行，返回换行处理后的字符串列表
function calculateTextWrapLines(ctx, text, maxWidth) {
  let lines = []
  //
  let words = text.split('')
  let line = ''

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const testLine = line + word
    const { width: measuredWidth } = ctx.measureText(testLine)
    if (measuredWidth > maxWidth) {
      lines.push(line)
      // 最后一个词是下一行的行首
      line = word
    } else {
      line = testLine
    }
  }
  // 循环结束时，可能还有字符在缓冲区，把剩下的字符当作最后一行
  line.length && lines.push(line)
  return lines
}

// 调用换行处理函数处理文本换行，
function fillTextWrap(ctx, { text, x, y, width }) {
  // 支持换行符
  const paragraphs = text.split('\n')
  // 将\n分割后的段落交给calculateTextWrapLines处理为换行后的字符串列表
  const lines = paragraphs.reduce((acc, cur) => {
    acc.push(...calculateTextWrapLines(ctx, cur, width))
    return acc
  }, [])
  lines.map((line, index) => {
    // 绘制单行文本，这里使用了lineHeight计算第x行文本的y位置
    ctx.fillText(line, x, y + index * ctx.lineHeight)
  })
}

ctx.font = '12px sans'
ctx.lineHeight = 14
// textBaseline改为top是为了使y的表现与HTML一致，默认情况下，fillText的y指的是文本基线的位置
ctx.textBaseline = 'top'
fillTextWrap(ctx, { text, x: 0, y: 0, width: 300 })
```

效果预览，左：div，右：canvas 实现，完整的示例代码可以[在这里看到](https://codepen.io/cosformula/pen/MWwbVqL)。

![效果预览](/assets/img/canvas-text-wrap/naive-example.png){:.shadow}

大多数排版软件使用贪心算法，但 TeX 使用[最小破损度算法](https://en.wikipedia.org/wiki/Line_wrap_and_word_wrap#Minimum_raggedness)来完成排版，该算法通过尽量减少行末的空白来实现更美观的排版。

## Unicode 换行算法与 CSS 换行标准

大部分介绍 canvas 文本换行文章都到此为止，但如果你足够细心，可能会发现 canvas 实际渲染的效果和 HTML 的渲染结果有些不一样，canvas 渲染的结果会稍显怪异。

![两种实现的区别](/assets/img/canvas-text-wrap/naive-example-difference.png){:.shadow}

这是因为我们在换行时没有遵守排版规则，换行的时候把`。`放在了行首。如果你对语文还有印象，可能会记得在作文纸上书写标点符号的一些规则，例如

> 句号、逗号、顿号...不出现在一行之首<br/>...引号、括号、书名号...前一半不出现在一行之末，后一半不出现在一行之首<br/>—— [《标点符号用法》](http://www.moe.gov.cn/ewebeditor/uploadfile/2015/01/13/20150113091548267.pdf)

英文也有类似的规则，例如单词之内不应当随意换行，需要空到下一行书写或者加破折号。但我们在文本编辑器或者网页里不需要手动遵守这些规则，这是因为 Unicode 标准已经制定了 Unicode 字符里软换行的表现，而我们应用软件和操作系统在渲染文本的时候已经遵守了这些标准，标准的具体规则在[Unicode 换行算法 (Unicode Line Breaking Algorithm, UAX #14）](http://unicode.org/reports/tr14/)中详细给出。

Unicode 换行算法描述了这样的算法：给定输入文本，该算法将产生被称为换行机会（**break opportunities**）的一组位置，换行机会指的是在文本渲染的过程中允许于此处换行，不过实际换行位置需要结合显示窗口宽度和字体大小由更高层的应用软件另行确认。

该算法的规则大致可分为以下几类。算法中将 Unicode 字符分为不同的换行类（Line Breaking Classes），例如表意文字为一类（如汉字）、左标点为一类（如"["）、数字前置符号为一类（如"\$"）等等。这些字符类本身在换行中有默认表现，如「除非特殊情况下表意文字的前后均可换行」、「左标点符号后禁止换行」。不同字符类组合起来还需遵守另外的规则，例如「在数字和字母之间禁止换行」。除此之外还有类似「永远不在文本的开头换行」、「文本的结尾永远可以换行」、「除禁止换行的位置外都允许换行」的规则。

我们可以用一个简单的例子说明换行算法的作用：遵循 Unicode 换行算法的规定，给定句子"Hello, world!"，将给出"Hello, **\|**world!**\|**"（**\|**代表换行机会）。根据给出的换行位置，在实际绘制中我们可以先把"Hello, "填充到第一行，如果发现位置不够放"world!"，就把"world!"放到第二行。但是在上文的贪心算法里，我们简单地把每一个字符都视作换行机会，这也导致了奇怪的排版。

那么浏览器中文本换行规则是怎样的？CSS 中关于换行表现的属性有"line-break"、"word-break"、"hyphens"和"overflow-wrap"，这些属性在[CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/#line-breaking)有详细定义。

- [line-break](https://developer.mozilla.org/zh-CN/docs/Web/CSS/line-break)：用来处理如何断开带有标点符号的中文、日文或韩文（CJK）文本的行
- [word-break](https://developer.mozilla.org/zh-CN/docs/Web/CSS/word-break)：指定怎样在单词内断行
- [hyphens](https://developer.mozilla.org/zh-CN/docs/Web/CSS/hyphens)：告知浏览器在换行时如何使用连字符连接单词
- [overflow-wrap](https://developer.mozilla.org/zh-CN/docs/Web/CSS/word-wrap)：用来说明当一个不能被分开的字符串太长而不能填充其包裹盒时，为防止其溢出，浏览器是否允许这样的单词中断换行。

不过 CSS 规范中并没有完整定义换行机会何时出现，多数情况下换行机会的产生遵循 Unicode 换行算法，属性定义也沿用了算法中给出的换行类，这四个属性更多是在特殊情况下调整 Unicode 换行算法给出的换行机会。

到现在你应该知道为什么我们实现的换行和浏览器里渲染的表现有些许差异了，我们既没有遵守 CSS 规范也没有遵守 Unicode 换行算法。不过把这两个算法都实现一遍是个艰巨的任务，幸好有人已经做过并将它开源：[niklasvh/css-line-break](https://github.com/niklasvh/css-line-break)。

使用 css-line-break 库，我们可以进一步优化代码使其渲染的文本更贴近浏览器渲染结果了。在下面的代码中新建了`calculateTextWrapLinesULB`用于替换上一节的`calculateTextWrapLines`。

```javascript
import { LineBreaker } from 'css-line-break'

// 代码基本逻辑相同，不再注释
function calculateTextWrapLinesULB(ctx, text, width) {
  let lines = []
  const breaker = LineBreaker(text, {
    lineBreak: 'strict',
    wordBreak: 'normal'
  })
  let bk
  let words = text.split('')
  let line = ''

  while (!(bk = breaker.next()).done) {
    const word = bk.value.slice()
    const testLine = line + word
    const { width: measuredWidth } = ctx.measureText(testLine)
    if (measuredWidth >= width) {
      lines.push(testLine)
      line = word
    } else {
      line = testLine
    }
  }
  line.length && lines.push(line)
  return lines
}
```

效果预览，左：div，右：canvas 实现。可以看出虽然渲染出来还是有些许区别，但是已经不会违反最基本的排版规则。

![效果预览](/assets/img/canvas-text-wrap/ULB-example.png){:.shadow}

需要注意的是，css-line-break 大量的排版规则使得它的体积稍微有些大（压缩前 80KB）。

## html2canvas 文本排版原理

我们已经知道，html2canvas 能够绘制出与 DOM 节点一摸一样的图片，但我们已知 canvas 难以渲染和浏览器表现一致的文本，html2canvas 是如何做到的？

html2canvas 有两种渲染模式，一种是解析 Dom 节点再绘制到 canvas，还有一种是利用 svg 的 foreignObject 绘制网页到 svg，再将 svg 绘制到 canvas。foreignObject 模式原理可以参考[这篇文章](https://www.zhangxinxu.com/wordpress/2017/08/svg-foreignobject/)。

在纯 canvas 模式下，html2canvas 巧妙地利用了浏览器的渲染结果，首先使用[css-line-break 库](https://github.com/niklasvh/css-line-break)得到可以作为行首的字符集合并以该集合创建文本节点，再利用`createRange`API 选中该文本节点，随后通过`getBoundingClientRect`获取该文本节点的定位信息。最后利用文本节点的定位信息调用 fillText 就可以使文本渲染结果与浏览器渲染结果基本一致。不过也因为依赖了 css-line-break，html2canvas 的体积同样有些大（压缩后 40KB）。

<!-- - https://github.com/niklasvh/html2canvas/blob/522a4430559f9cdb8b5d5a3ee6db32beaa9d059b/src/dom/text-container.ts
- https://github.com/niklasvh/html2canvas/blob/master/src/render/canvas/canvas-renderer.ts
- https://github.com/niklasvh/html2canvas/blob/522a4430559f9cdb8b5d5a3ee6db32beaa9d059b/src/css/layout/text.ts#L47 -->

## 参考资料

- [标点符号用法 - GB/T15834-2011 ](http://www.moe.gov.cn/ewebeditor/uploadfile/2015/01/13/20150113091548267.pdf)
- [canvas 文本绘制自动换行、字间距、竖排等实现](https://www.zhangxinxu.com/wordpress/2018/02/canvas-text-break-line-letter-spacing-vertical/)
- [自动换行 - wikipedia](https://en.wikipedia.org/wiki/Line_wrap_and_word_wrap)
- [Unicode 换行算法的数据](https://www.unicode.org/Public/UCD/latest/ucd/LineBreak.txt)
- [Unicode 换行算法的 CPP 实现](https://www.unicode.org/Public/PROGRAMS/LineBreakSampleCpp/5.2.0/)
- [Unicode 换行算法的在线 demo](https://www.unicode.org/cldr/utility/breaks.jsp)
