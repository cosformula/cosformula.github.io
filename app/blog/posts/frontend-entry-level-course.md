---
title: 前端入门课
share: true
category: app/blog/posts
filename: frontend-entry-level-course
publishedAt: 2019-08-13
---
# **HTML**

## 标签、内容、元素

  

### 什么是HTML？

> HTML是一种用于定义内容结构的标记语言。HTML 由一系列的**元素**组成，这些**元素**可以用来包围不同部分的内容，使其以某种方式**呈现**或者**工作**。

  

### 什么是元素？

```HTML
<p>果果真可爱！</p>
```

<iframe
  height={300}
  style={{ width: "100%" }}
  scrolling="no"
  title="Untitled"
  src="https://codepen.io/cosformula/embed/xvydPY?default-tab=html%2Cresult"
  frameBorder="no"
  loading="lazy"
  allowTransparency="true"
  allowFullScreen="true"
>
  See the Pen &lt;a href="https://codepen.io/cosformula/pen/xvydPY"&gt;
  Untitled&lt;/a&gt; by formula (&lt;a
  href="https://codepen.io/cosformula"&gt;@cosformula&lt;/a&gt;) on &lt;a
  href="https://codepen.io"&gt;CodePen&lt;/a&gt;.
</iframe>


### 元素拆解

![/images/Untitled 43.png](/static/images/frontend-entry-level-course/Untitled%2043.png)

  

### 不妨认识一个新元素

```HTML
<h1>果果</h1>
<p>果果真可爱！</p>
```



<iframe
  height={300}
  style={{ width: "100%" }}
  scrolling="no"
  title="Untitled"
  src="https://codepen.io/cosformula/embed/xvydPY?default-tab=html%2Cresult"
  frameBorder="no"
  loading="lazy"
  allowTransparency="true"
  allowFullScreen="true"
>
  See the Pen &lt;a href="https://codepen.io/cosformula/pen/xvydPY"&gt;
  Untitled&lt;/a&gt; by formula (&lt;a
  href="https://codepen.io/cosformula"&gt;@cosformula&lt;/a&gt;) on &lt;a
  href="https://codepen.io"&gt;CodePen&lt;/a&gt;.
</iframe>


> [!important] h1元素在屏幕上呈现为更大号的粗体字体，h1元素的上下边距似乎也更大。

  

### 不妨认识多一点

```HTML
<h1>猫猫</h1>
<h2>果果</h2>
<p>果果真可爱！</p>
<h2>科科</h2>
<p>科科也好可爱！</p>

<h3>不妨再多试试</h3>
<h4>其实还有更小的</h4>
<h5>还能更小</h5>
<h6>不能再小了</h6>
```

<iframe
  height={300}
  style={{ width: "100%" }}
  scrolling="no"
  title="Untitled"
  src="https://codepen.io/cosformula/embed/oKaWaQ?default-tab=html%2Cresult"
  frameBorder="no"
  loading="lazy"
  allowTransparency="true"
  allowFullScreen="true"
>
  See the Pen &lt;a href="https://codepen.io/cosformula/pen/oKaWaQ"&gt;
  Untitled&lt;/a&gt; by formula (&lt;a
  href="https://codepen.io/cosformula"&gt;@cosformula&lt;/a&gt;) on &lt;a
  href="https://codepen.io"&gt;CodePen&lt;/a&gt;.
</iframe>

  

### 来认识元素属性

我们通过引入一个新标签来认识元素属性。

```HTML
<h1>果果</h1>
<p>果果真可爱！</p>
<img src="https://wx4.sinaimg.cn/mw690/8ad532bfgy1g5tkb2ocs9j20u90u076b.jpg"></img>
```

<iframe
  height={300}
  style={{ width: "100%" }}
  scrolling="no"
  title="Untitled"
  src="https://codepen.io/cosformula/embed/qeJmKy?default-tab=html%2Cresult"
  frameBorder="no"
  loading="lazy"
  allowTransparency="true"
  allowFullScreen="true"
>
  See the Pen &lt;a href="https://codepen.io/cosformula/pen/qeJmKy"&gt;
  Untitled&lt;/a&gt; by formula (&lt;a
  href="https://codepen.io/cosformula"&gt;@cosformula&lt;/a&gt;) on &lt;a
  href="https://codepen.io"&gt;CodePen&lt;/a&gt;.
</iframe>


  

> 属性包含了关于元素的一些额外信息，这些信息本身不应显现在内容中。

本例中，img元素会在屏幕上呈现一张图片，而这张图片来源于src中所指定的地址。

> [!important] 实际上每种元素都有公共属性，不同的元素又有不同的专有属性，在实际中他们都有不同的作用。

  

### 来认识超链接

```HTML
<h1>果果</h1>
<p><a href="https://wx4.sinaimg.cn/mw690/8ad532bfgy1g5tkb2ocs9j20u90u076b.jpg" target="_blank">果果</a>真可爱！</p>
```

<iframe
  height={300}
  style={{ width: "100%" }}
  scrolling="no"
  title="Untitled"
  src="https://codepen.io/cosformula/embed/wVYdNM?default-tab=html%2Cresult"
  frameBorder="no"
  loading="lazy"
  allowTransparency="true"
  allowFullScreen="true"
>
  See the Pen &lt;a href="https://codepen.io/cosformula/pen/wVYdNM"&gt;
  Untitled&lt;/a&gt; by formula (&lt;a
  href="https://codepen.io/cosformula"&gt;@cosformula&lt;/a&gt;) on &lt;a
  href="https://codepen.io"&gt;CodePen&lt;/a&gt;.
</iframe>


> [!important] a元素工作方式不同于其他你已经认识的元素，一开始的时候它在屏幕中显示为蓝色带下划线的字体，当你的鼠标移动到之上时鼠标会变成👋形，这时点击则会让浏览器跳转到href属性中所填写的地址，点击后文字会变成紫色下划线的字体。

  

### 嵌套

在刚刚的例子里，a元素实际上与内容一同被包裹在p标签内，我们把这个称为元素的嵌套。嵌套比起其他的概念可能稍微抽象一些，我们也许可以这样理解：元素内的内容可以是纯文字，也可以是纯文字+其他元素。

  

### 复习

- HTML由可嵌套的元素组成
- 元素由开始标签结束标签包裹内容而成
- 不同的元素在网页上有不同的呈现，或者有不同的工作方式

  

### 接下来是...

- 认识其他的HTML标签，熟悉他们如何在屏幕上呈现或者如何工作
- 认识其他的元素属性

  

### 学到这里，你对HTML的理解已经表达完了🐶

HTML的全称是**H**yper **T**ext **M**arkup **L**anguage，意思是超文本标记语言，在1990年诞生于CERN。

当时在CERN，蒂姆·伯纳斯-李希望一个能够方便地进行技术文档管理、发布和交换（当时他们可能只能通过拷贝磁盘来交换文档），HTML提供了简洁的语法来让任何人都能方便地发布文档，结合超链接（a标签）更加促进了信息交换的效率。

![/images/Untitled 1 22.png](/static/images/frontend-entry-level-course/first-web-page.png)

第一个网站

[http://info.cern.ch/](http://info.cern.ch/)

除了HTML，URI和HTTP协议也是互联网的基础（我们先不讲），有了这样的技术任何一个连接到网络的电脑都能通过浏览器连接服务器，下载数据并在浏览器中显示出文本。这样任何人都能方便地向另一个人或者一堆人交换文档。

看到这里你可能明白为什么有h1\h2\h3\p标签，因为一份只有纯文字的文档十分枯燥（你不可能只用TXT写毕业论文），不同的内容在屏幕上需要有不同的样式。

这些标签其实是一系列的约定。约定意味着，写网页的人遵守约定，那么浏览器就以约定的方式显示内容，这样写网页的人心里有数，使用浏览器浏览网站的人也能够完整地得到写网页的人想要传递的信息。

在web从实验室走向大众之后，出现了许多浏览器，带来了很多新的标签，网页的视觉效果可以变得更加丰富（例如strong标签可以对内容**加粗**），也一度带来了混乱，出现了几种不同的标准，不过现在我们通用的标准叫做HTML5。

  

### 一个标准的HTML5网页

```HTML
<!DOCTYPE html>
<html lang="en">
		<!--这是注释-->
    <head>
        <title>网页标题</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="css/style.css" rel="stylesheet">
    </head>
    <body>
			<!--从这里开始渲染内容-->
      <p>果果真可爱</p>
    </body>
</html>
```

  

### DOM树

```HTML
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>My Title</title>
    </head>
    <body>
      <a hred="#">My link</a>
			<h1>My header</h1>
    </body>
</html>
```

![/images/Untitled 2 17.png](/static/images/frontend-entry-level-course/Untitled%202%2017.png)

这是DOM树

  

![/images/Untitled 3 13.png](/static/images/frontend-entry-level-course/Untitled%203%2013.png)

倒过来是一颗🌲了吧

# **CSS**

在HTML刚刚诞生的时候是没有CSS的，原因很显然，那时候的计算机不太方便显示除了文字以外的东西，对于普通的电子文档，有换行，缩进已经足够。

不过随着计算机的飞速发展，HTML简单的样式已经不符合人们的需求，当时的浏览器出现了许多非标准标签来实现一些酷炫的视觉效果，比如`<blink>`会让里面的内容闪烁...

```HTML
<blink>Why would somebody use this?</blink>
```

后来W3C提出了CSS，决定让网页的样式与内容分离。

> 样式表有可能在不牺牲设备独立性或文档结构的情况下为Web添加样式。样式表不是将可视标记添加到HTML，而是将样式信息**附加**到SGML和HTML文档的结构中。

好处是显而易见的：新的标准制定后，支持CSS的浏览器能够支持更加定制化的样式，而由于样式与内容分离，不支持CSS的浏览器也能够正常访问使用CSS技术的网站（只是看不到样式），实现了向后兼容。

  

## 回到果果的例子

```HTML
<style>
p {
  color: red;
}
</style>
<p>果果真可爱</p>
```

  

[https://codepen.io/cosformula/pen/ZgqryL](https://codepen.io/cosformula/pen/ZgqryL)

  

![/images/Untitled 4 12.png](/static/images/frontend-entry-level-course/Untitled%204%2012.png)

这样的结构被称为一个规则集

一个规则集由两部分构成，分别是选择器和属性集，选择器决定了该规则集会被应用于网页上的哪个或哪些**DOM节点**，而属性集决定了这些节点会被应用到何种样式。

  

### 简单选择器：标签选择器、类选择器、ID选择器

```HTML
<style>
p {
  color: red;
}
.red {
  color: red;
}
\#guoguo {
  color: red;
}
</style>
<p>果果真可爱</p>
<h6 class="red">果果真可爱</h6>
<h6 id="guoguo">果果真可爱</h6>
```

<iframe
  height={300}
  style={{ width: "100%" }}
  scrolling="no"
  title="Untitled"
  src="https://codepen.io/cosformula/embed/ZgqryL?default-tab=html%2Cresult"
  frameBorder="no"
  loading="lazy"
  allowTransparency="true"
  allowFullScreen="true"
>
  See the Pen &lt;a href="https://codepen.io/cosformula/pen/ZgqryL"&gt;
  Untitled&lt;/a&gt; by formula (&lt;a
  href="https://codepen.io/cosformula"&gt;@cosformula&lt;/a&gt;) on &lt;a
  href="https://codepen.io"&gt;CodePen&lt;/a&gt;.
</iframe>


```HTML
<style>
p {
  color: red;
}
.bg-blue {
  background: blue;
}
\#guoguo {
  font-weight: bold;
}
</style>
<p class="bg-blue" id="guoguo">果果真可爱</p>
<h5 class="bg-blue">果果真可爱</h5>
```

<iframe
  height={300}
  style={{ width: "100%" }}
  scrolling="no"
  title="Untitled"
  src="https://codepen.io/cosformula/embed/voVdzP?default-tab=html%2Cresult"
  frameBorder="no"
  loading="lazy"
  allowTransparency="true"
  allowFullScreen="true"
>
  See the Pen &lt;a href="https://codepen.io/cosformula/pen/voVdzP"&gt;
  Untitled&lt;/a&gt; by formula (&lt;a
  href="https://codepen.io/cosformula"&gt;@cosformula&lt;/a&gt;) on &lt;a
  href="https://codepen.io"&gt;CodePen&lt;/a&gt;.
</iframe>


  

```HTML
<style>
.red {
  color: red
}
.bg-blue {
  background: blue;
}

</style>
<p class="bg-blue red">果果真可爱</p>
```

<iframe
  height={300}
  style={{ width: "100%" }}
  scrolling="no"
  title="Untitled"
  src="https://codepen.io/cosformula/embed/voVdQM?default-tab=html%2Cresult"
  frameBorder="no"
  loading="lazy"
  allowTransparency="true"
  allowFullScreen="true"
>
  See the Pen &lt;a href="https://codepen.io/cosformula/pen/voVdQM"&gt;
  Untitled&lt;/a&gt; by formula (&lt;a
  href="https://codepen.io/cosformula"&gt;@cosformula&lt;/a&gt;) on &lt;a
  href="https://codepen.io"&gt;CodePen&lt;/a&gt;.
</iframe>


### 属性选择器、伪类选择器、组合器...

留作习题

### 优先级与继承

```HTML
<style>
.red {
  color: red
}
\#guoguo {
  color: blue;
}

</style>
<p class="red" id="guoguo">果果真可爱</p>
```

<iframe
  height={300}
  style={{ width: "100%" }}
  scrolling="no"
  title="Untitled"
  src="https://codepen.io/cosformula/embed/bXmLzE?default-tab=html%2Cresult"
  frameBorder="no"
  loading="lazy"
  allowTransparency="true"
  allowFullScreen="true"
>
  See the Pen &lt;a href="https://codepen.io/cosformula/pen/bXmLzE"&gt;
  Untitled&lt;/a&gt; by formula (&lt;a
  href="https://codepen.io/cosformula"&gt;@cosformula&lt;/a&gt;) on &lt;a
  href="https://codepen.io"&gt;CodePen&lt;/a&gt;.
</iframe>


```HTML
<style>
.red {
  color: red;
}
</style>
<p class="red" id="guoguo"><span>果果</span>真可爱</p>
```

<iframe
  height={300}
  style={{ width: "100%" }}
  scrolling="no"
  title="Untitled"
  src="https://codepen.io/cosformula/embed/YmJeBg?default-tab=html%2Cresult"
  frameBorder="no"
  loading="lazy"
  allowTransparency="true"
  allowFullScreen="true"
>
  See the Pen &lt;a href="https://codepen.io/cosformula/pen/YmJeBg"&gt;
  Untitled&lt;/a&gt; by formula (&lt;a
  href="https://codepen.io/cosformula"&gt;@cosformula&lt;/a&gt;) on &lt;a
  href="https://codepen.io"&gt;CodePen&lt;/a&gt;.
</iframe>


```HTML
<style>
.red {
  color: red;
}
span {
  color: green;
}
</style>
<p class="red" id="guoguo"><span>果果</span>真可爱</p>
```

<iframe
  height={300}
  style={{ width: "100%" }}
  scrolling="no"
  title="Untitled"
  src="https://codepen.io/cosformula/embed/NQOyJN?default-tab=html%2Cresult"
  frameBorder="no"
  loading="lazy"
  allowTransparency="true"
  allowFullScreen="true"
>
  See the Pen &lt;a href="https://codepen.io/cosformula/pen/NQOyJN"&gt;
  Untitled&lt;/a&gt; by formula (&lt;a
  href="https://codepen.io/cosformula"&gt;@cosformula&lt;/a&gt;) on &lt;a
  href="https://codepen.io"&gt;CodePen&lt;/a&gt;.
</iframe>


  

### 盒模型

  

![/images/Untitled 5 8.png](/static/images/frontend-entry-level-course/Untitled%205%208.png)

  

![/images/Untitled 6 8.png](/static/images/frontend-entry-level-course/Untitled%206%208.png)

![/images/Untitled 7 7.png](/static/images/frontend-entry-level-course/Untitled%207%207.png)

```HTML
<style>
div {
  background-color: lightgrey;
  width: 300px;
  border: 15px solid green;
  padding: 50px;
  margin: 20px;
}
</style>

<h2>CSS盒模型</h2>

<p>果果说</p>

<div>可恶的人类</div>
```

[https://codepen.io/cosformula/pen/RXeQmz](https://codepen.io/cosformula/pen/RXeQmz)

```JavaScript
var css = document.createElement('style'); 
css.type = 'text/css'; 
css.appendChild(document.createTextNode('* {border: 1px solid red !important;}')); 
document.getElementsByTagName("head")[0].appendChild(css);
```

### 接下来是...

- 熟悉常用的CSS选择器
- 熟悉大多数CSS属性
- 理解盒模型
- 理解CSS位置
- 一些新东西：flexbox、grid
- CSS动画

# **JavaScript**

JavaScript的为网页带来了可交互性，它的出现是为了解决新的问题。在1995，HTML已经不只是为了分享文档（还记得HTML为什么诞生吗），用户可以在一个网站上登录、注册、发表内容。但由于HTML没有任何可以运行的逻辑，当时的网页是纯静态的。

纯静态的网页带来了一些麻烦和额外的工作，例如由于无法提供表单验证功能（例如你不能在电话输入框里输入你的名字），用户只能提交表单后再由服务端去验证表单内容是否合法，而当时网络传输速度有限，每多一次加载网页就多一些等待时间（想想如果你输错了十次），如果这个工作能在浏览器端完成，毫无疑问将会大大提升用户体验。

当时网景团队认为网页最终会变得动态，开始尝试在浏览器中引入一些脚本语言，最终他们选定了艾克用了十天左右开发出的脚本语言，并命名为JavaScript。

## DOM

> 文档对象模型 (DOM) 是HTML和XML文档的编程接口。它提供了对文档的结构化的表述，并定义了一种方式可以使从程序中对该结构进行访问，从而改变文档的结构，样式和内容。DOM 将文档解析为一个由节点和对象（包含属性和方法的对象）组成的结构集合。简言之，它会将web页面和脚本或程序语言连接起来。

总而言之，之前HTML只能是静态的，但是有了DOM，你可以使用程序语言来控制整个文档的结构，页面可以在无刷新的情况下改变内容、样式和结构。

```JavaScript
<script> 
function changeColor() {
  const guoguo = document.getElementById('guoguo');
  guoguo.style.color = 'red';
}
function appendElement() {
  const keke = document.createElement('p');
  const text = document.createTextNode('科科真可爱');
  keke.appendChild(text);
  document.body.appendChild(keke);
}
</script>
<p id="guoguo">果果真可爱</p>
<button onclick="changeColor()">color</button>
<button onclick="appendElement()">append</button>
```

<iframe
  height={300}
  style={{ width: "100%" }}
  scrolling="no"
  title="Untitled"
  src="https://codepen.io/cosformula/embed/NQOYGb?default-tab=html%2Cresult"
  frameBorder="no"
  loading="lazy"
  allowTransparency="true"
  allowFullScreen="true"
>
  See the Pen &lt;a href="https://codepen.io/cosformula/pen/NQOYGb"&gt;
  Untitled&lt;/a&gt; by formula (&lt;a
  href="https://codepen.io/cosformula"&gt;@cosformula&lt;/a&gt;) on &lt;a
  href="https://codepen.io"&gt;CodePen&lt;/a&gt;.
</iframe>

# 一些建议

- 不要关注细枝末节，例如你**不**需要背会所有的HTML标签，也**不**需要背会所有的CSS属性，但你可能需要知道他在那里，在需要的时候你也知道去哪里了解更多信息。
- 像学习任何语言一样学习JavaScript。

# 课后作业

- 认识所有的html5标签
- 认识所有的CSS属性

# 几个网站

[https://www.w3school.com.cn/html/index.asp](https://www.w3school.com.cn/html/index.asp)

  

---