---
layout: article
title: HTML canvas中文本换行的问题【WIP】
date: 2020-02-20 18:59:00 +0800
aside:
  toc: true
# mathjax: true
# mathjax_autoNumber: true
# mermaid: true
# chart: true
---

**这篇文章还未完工，目前仅供测试**

HTML canvas绘制文本时不支持换行，一般情况下可以通过`html2canvas`解决复杂的文本排版，但html2canvas在小程序或Node canvas环境下不可用。

这篇文章介绍了通过canvas文本渲染的基础知识、自动换行的两种算法、在换行时遵守排版规则、如何支持文本居中/字体缩放、以及html2canvas如何正确渲染文本。

<!--more-->

## 基础知识

这章将介绍canvas2D文本绘制的一些基础知识，如果你对这些已经很熟悉可以跳过。

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

## 贪心算法

自动换行的简单实现是使用贪心算法，该实现的核心思路是将尽可能多的字符放入一行，直到所有的字符都放进去。

使用一个变量作为缓冲区，代表当前渲染的文本行，依次在缓冲区内填充字符，并使用`measureText`计算当前缓冲区的实际渲染宽度，当渲染宽度大于设定宽度时，文本应当在填充当前字符的前一位置换行，将缓冲区文本作为一行加入列表并清空缓冲区。重复以上过程，直到所有的字符都被放入。

按照这样的思路将文本处理为换行后的字符串列表，列表中的每一项都代表实际渲染的单行文本，最后再调用`fillText`依次渲染即可。

```javascript
const text = 'Hello World'

// 计算文本应当在何时换行，返回换行处理后的字符串列表
function calculateTextWrapLines(ctx, text, width) {
  let lines = []
  let currentLineText = ''
  for (let i = 0; i < text.length; i++) {
    currentLineText += text[i]
    const { width: measuredWidth } = ctx.measureText(currentLineText)
    if (measuredWidth >= width) {
      // 文本应当在填充当前字符的前一位置换行，所以跳过最后一个字符
      lines.push(currentLineText.slice(0, currentLineText.length - 1))
      // 最后一个字符是下一行的行首
      currentLineText = currentLineText[currentLineText.length - 1]
    }
  }
  // 循环结束时，可能还有字符在缓冲区，把剩下的字符当作最后一行
  currentLineText.length && lines.push(currentLineText)
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


## 最小破损度算法



## 排版优化

上面的方法已经可以使用，但如果你足够细心，可能会发现canvas实际渲染的效果和HTML的渲染结果有些不一样，canvas渲染的结果会稍显怪异。

![两种实现的区别](/assets/img/canvas-text-wrap/naive-example-difference.png){:.shadow}

怪异的原因是我们在换行的过程中没有遵循排版规则。如果你对语文还有印象，可能会记得在作文纸上书写标点符号的一些规则，例如

> 句号、逗号、顿号...不出现在一行之首<br/>...引号、括号、书名号...前一半不出现在一行之末，后一半不出现在一行之首<br/>—— [《标点符号用法》](http://www.moe.gov.cn/ewebeditor/uploadfile/2015/01/13/20150113091548267.pdf)

英文也有类似的规则，例如单词之间不应当随意换行，需要空到下一行书写或者加破折号。实际上，对于Unicode，这些规则已经在[Unicode Line Breaking Algorithm (UAX #14)](http://unicode.org/reports/tr14/)中给出。

**Unicode Line Breaking Algorithm**确认了这样的算法规则：给定输入文本，该算法将产生被称为**break opportunities**的一组位置，这些位置能够作为行首而不会违反各种语言的排版规则，不过实际换行位置需要根据更高层的应用软件另行确认。

那么浏览器中文本换行规则是怎样的？[CSS Text Module Level 3](https://www.w3.org/TR/css-text-3/#line-breaking)定义了文本换行的表现，当文本因为内容溢出而换行被称作软换行（soft line break）.break opportunities称为**soft wrap opportunities**，但可以沿用Unicode Line Breaking Algorithm来计算soft wrap opportunities。

Unicode Line Breaking Algorithm有非常多的规则，实现一遍是个艰巨的任务，幸好有人已经做过并将它开源：[niklasvh/css-line-break](https://github.com/niklasvh/css-line-break)，这个库除了实现Unicode Line Breaking Algorithm还支持CSS中wordBreak的选项。

使用css-line-break库，我们可以进一步优化代码使其渲染的文本更贴近浏览器渲染结果了。在下面的代码中新建了`calculateTextWrapLinesULB`用于替换上一节的`calculateTextWrapLines`。

```javascript
import { LineBreaker } from 'css-line-break'

// 代码基本逻辑相同，不再注释
function calculateTextWrapLinesULB(ctx, text, width) {
  let lines = []
  let currentLineWords = []
  const breaker = LineBreaker(text, {
    lineBreak: 'strict',
    wordBreak: 'normal'
  })
  let bk
  while (!(bk = breaker.next()).done) {
    const word = bk.value.slice()
    currentLineWords.push(word)
    const { width: measuredWidth } = ctx.measureText(currentLineWords.join(''))
    if (measuredWidth >= width) {
        lines.push(currentLineWords.slice(0, currentLineWords.length - 1).join(''))
        currentLineWords = [currentLineWords[currentLineWords.length - 1]]
      }
  }
  currentLineWords.length && lines.push(currentLineWords.join(''))
  return lines
}

```

效果预览，左：div，右：canvas 实现。可以看出虽然渲染出来还是有些许区别，但是已经不会违反最基本的排版规则。

![效果预览](/assets/img/canvas-text-wrap/ULB-example.png){:.shadow}

需要注意的是，css-line-break大量的排版规则使得它的体积稍微有些大（压缩前80KB），html2canvas体积大（压缩后40KB）的原因也是因为依赖了css-line-break。

## 限制最大行数

我们已经在canvas里支持了文本换行，并且能够较好的符合排版规则。

## 

<!-- ## 效率优化？ -->

## html2canvas文本排版解析

html2canvas有两种渲染模式，一种是解析Dom节点再绘制到canvas，还有一种是利用svg的foreignObject绘制网页到svg，再将svg绘制到canvas。foreignObject模式原理比较简单，不做更多介绍。

在纯canvas模式下，html2canvas巧妙地利用了浏览器的渲染结果，首先使用[css-line-break库](https://github.com/niklasvh/css-line-break)将文本根据**break opportunities**分割为最小渲染节点，再利用`createRange`API选中该文本节点，随后通过`getBoundingClientRect`获取该文本节点的定位信息。这样保证了文本渲染结果与浏览器渲染结果基本一致。

- https://github.com/niklasvh/html2canvas/blob/522a4430559f9cdb8b5d5a3ee6db32beaa9d059b/src/dom/text-container.ts
- https://github.com/niklasvh/html2canvas/blob/master/src/render/canvas/canvas-renderer.ts
- https://github.com/niklasvh/html2canvas/blob/522a4430559f9cdb8b5d5a3ee6db32beaa9d059b/src/css/layout/text.ts#L47

使用svg foreignObject再绘制到canvas的方法可以参考[这篇文章](https://www.zhangxinxu.com/wordpress/2017/08/svg-foreignobject/)


## 参考资料

- [标点符号用法 - GB/T15834-2011 ](http://www.moe.gov.cn/ewebeditor/uploadfile/2015/01/13/20150113091548267.pdf)
- [canvas文本绘制自动换行、字间距、竖排等实现](https://www.zhangxinxu.com/wordpress/2018/02/canvas-text-break-line-letter-spacing-vertical/)
- [自动换行 - wikipedia](https://zh.wikipedia.org/wiki/%E8%87%AA%E5%8A%A8%E6%8D%A2%E8%A1%8C)

<!-- 
Success Text.
{:.success}
Info Text.
{:.info}
Warning Text.
{:.warning}
Error Text.
{:.error}

`success`{:.success}
`info`{:.info}
`warning`{:.warning}
`error`{:.error}

<div>{%- include extensions/codepen.html user='cosformula' hash='MWwbVqL' default_tab='result' -%}</div>
http://www.rozmichelle.com/kami2/
When $$a \ne 0$$, there are two solutions to $$ax^2 + bx + c = 0$$ and they are
$$x_1 = {-b + \sqrt{b^2-4ac} \over 2a}$$
$$x_2 = {-b - \sqrt{b^2-4ac} \over 2a} \notag$$ -->
