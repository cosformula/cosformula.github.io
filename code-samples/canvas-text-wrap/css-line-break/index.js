import { LineBreaker } from 'css-line-break'

// const text = 'Lorem ipsum lol.'
// const text = `hellow, abc造又道走收《里第》约，进行提“区与”代，口般医验民交。 格战进很九存式心须，精人增电文由书，位火该应管员统。 变级分或表动两半部可，白经元第可史步和者规，根建B吧打克完采。 但风则无她下极见飞之，太研南标点六回老，义目建特少串片确。 省空件先照据切石，先情委利将对应，住理屈管壳还自。\n前感为工气政整从电明广适，里共口积蠢影男海我。 节织级料根路时整书进看法，看解严把资响口可学存，主指明5J参串蹦需何。 即七水以来长已带，都许结角等期节，头Z伶正芽己。 目务声识样清日，便或整石断学，度居上影世。 极题因参除深战压联出把量问则为亲，段分问红易列酸孤照色孝满赤没。\n一总己单切持张整队边，处对正据几条族世，被公M教壳求位院。`

// const breaker = LineBreaker(text, {
//   lineBreak: 'strict',
//   wordBreak: 'normal'
// })

// const words = []
// let bk

// while (!(bk = breaker.next()).done) {
//   words.push(bk.value.slice())
// }

// const content = document.getElementById('content')

// content.innerHTML = words.join('<br/>')

var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')
ctx.scale(3, 3)
var textEelment = document.getElementById('text')
const text = `造又道走收里第约，进行提区与代，口般医验民交。 格战进很九存式心须，精人增电文由书，位火该应管员统。 变级分或表动两半部可，白经元第可史步和者规，根建B吧打克完采。 但风则无她下极见飞之，太研南标点六回老，义目建特少串片确。 省空件先照据切石，先情委利将对应，住理屈管壳还自。\n前感为工气政整从电明广适，里共口积蠢影男海我。 节织级料根路时整书进看法，看解严把资响口可学存，主指明5J参串蹦需何。 即七水以来长已带，都许结角等期节，头Z伶正芽己。 目务声识样清日，便或整石断学，度居上影世。 极题因参除深战压联出把量问则为亲，段分问红易列酸孤照色孝满赤没。\n一总己单切持张整队边，处对正据几条族世，被公M教壳求位院。
`

// 计算文本应当在何时换行，返回换行处理后的字符串列表
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
        // 文本应当在填充当前字符的前一位置换行，所以跳过最后一个字符
        lines.push(currentLineWords.slice(0, currentLineWords.length - 1).join(''))
        // 最后一个是下一行的行首
        currentLineWords = [currentLineWords[currentLineWords.length - 1]]
      }
  }
  // 循环结束时，可能还有字符在缓冲区，把剩下的字符当作最后一行
  currentLineWords.length && lines.push(currentLineWords.join(''))
  return lines
}

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
    // acc.push(...calculateTextWrapLines(ctx, cur, width))

    acc.push(...calculateTextWrapLinesULB(ctx, cur, width))
    return acc
  }, [])
  lines.map((line, index) => {
    // 绘制单行文本，这里使用了lineHeight计算第x行文本的y位置
    // index + 1是为了使y的表现与HTML一致，默认情况下，fillText的y指的是文本基线的位置
    ctx.fillText(line, x, y + (index + 1) * ctx.lineHeight)
  })
}

textEelment.innerHTML = text.replace(/\n/g, '<br/>')

ctx.font = '12px sans'
ctx.lineHeight = 14
const time = new Date().valueOf()
fillTextWrap(ctx, { text, x: 0, y: 0, width: 300 })
console.log(new Date().valueOf() - time)
