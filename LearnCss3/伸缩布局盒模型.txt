# 伸缩布局


## 一、旧版Flexbox模型基本使用
### 1.伸缩容器设置display

```
display: box | inline-box
```
* box: 设置为块伸缩容器；
* inline-box: 设置为内联级伸缩容器。

#### display属性的基本使用  
伸缩容器主要用来将元素设置伸缩容器。伸缩容器为其内容创建新的伸缩格式化上下文。除了伸缩排版用来替代块布局以外，创建一个伸缩格式化上下文与创建一个块格式化上下文是一样的。浮动无法影响伸缩容器，而且伸缩容器的`margin`与其内容的`margin`不会重叠。

如下面的例子所示：

```
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>旧版本flexbox</title>
	<style type="text/css">
		*{
			margin: 0;
			padding: 0;
		}
		body>div {
			border: 1px solid #ccc;
			margin: 20px;
			padding: 10px;
		}
		div > div {
			border: 1px solid #f36;
			width: 100px;
			height: 100px;
			text-align: center;
			line-height: 100px;
		}
		.box {
			display: -moz-box;
			display: -webkit-box;
			display: box;
		}
		.inline-box {
			display: -moz-inline-box;
			display: -webkit-inline-box;
			display: inline-box;
		}
	</style>
</head>
<body>
	<div class="box">
		<div>A</div>
		<div>B</div>
		<div>C</div>
		<div>D</div>
	</div>
	<div class="inline-box">
		<div>A</div>
		<div>B</div>
		<div>C</div>
		<div>D</div>
	</div>
</body>
</html>
```

![image](http://note.youdao.com/favicon.ico)

### 2.伸缩流方向 box-orient
> 伸缩流方向`box-orient` 属性主要用来创建主轴，从而定义了伸缩项目在伸缩容器中的流动布局方向。换句话说主要用来指定伸缩项目如何放置在伸缩容器的主轴上。

### 语法及参数

```
box-orient: horizontal | vertical | inline-axis | block-axis
```
* horizontal: 伸缩项目在伸缩容器中从左到右在一条平行线上排列显示。
* vertical: 伸缩项目在伸缩容器中从上到下在一条垂直线上排列显示。
* inline-axis: 伸缩项目沿着内联轴排列显示。
* block-axis: 伸缩项目沿着块轴排列显示。

看下面的例子
```
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>旧版伸缩流方向</title>
	<style type="text/css">
		*{
			margin: 0;
			padding: 0;
		}
		body>div {
			border: 1px solid #ccc;
			margin: 20px;
			padding: 10px;
		}
		div > div {
			border: 1px solid #f36;
		}
		.box {
			display: -moz-box;
			display: -webkit-box;
			display: box;
		}
		.box-horizontal {
			-moz-box-orient: horizontal;
			-webkit-box-orient: horizontal;
			box-orient: horizontal;
		}
		.box-vertical {
			-moz-box-orient: vertical;
			-webkit-box-orient: vertical;
			box-orient: vertical;
		}
		.box-inline-axis {
			-moz-box-orient: inline-axis;
			-webkit-box-orient: inline-axis;
			box-orient: inline-axis;
		}
		.box-block-axis {
			-moz-box-orient: block-axis;
			-webkit-box-orient: block-axis;
			box-orient: block-axis;
		}
	</style>
</head>
<body>
	<div class="box box-horizontal">
		<div>A</div>
		<div>B</div>
		<div>C</div>
		<div>D</div>
	</div>
	<div class="box box-vertical">
		<div>A</div>
		<div>B</div>
		<div>C</div>
		<div>D</div>
	</div>
	<div class="box box-inline-axis">
		<div>A</div>
		<div>B</div>
		<div>C</div>
		<div>D</div>
	</div>
	<div class="box box-block-axis">
		<div>A</div>
		<div>B</div>
		<div>C</div>
		<div>D</div>
	</div>
</body>
</html>
```

![image](http://note.youdao.com/favicon.ico)

### 3. 布局顺序 box-direction
`box-direction`属性主要是用来设置伸缩项目在伸缩容器中流动顺序。

```
box-direction: normal | reverse
```
* normal: 表示伸缩项目从主轴起始点开始按文档流结构，从上到下按顺序排列。
* reverse: 表示伸缩项目从主轴终点开始按文档流结构反向，从下往上排列。

[box-direction.html](http://note.youdao.com/)

![image](http://note.youdao.com/favicon.ico)

### 4. 伸缩换行 box-lines
`box-lines`可以用来设置伸缩容器的伸缩项目是单行还是多行显示。默认情况下都是单行或单列显示。

```
box-lines: single | multiple
```
* single: 伸缩容器的所有伸缩项目一行或一列显示。如果伸缩容器设置了overflow属性，可以直接控制伸缩项目是否隐藏、裁剪或者出现滚动条。
* multiple: 指定伸缩容器多行或多列显示伸缩项目，当伸缩容器没有足够空间放置所有伸缩项目的时候，伸缩项目就会自动换行或多列显示。


**注意：box-lines到目前为止还没有浏览器支持这个属性**

### 5. 主轴对齐 box-pack
主轴对齐用来设置伸缩器当前伸缩项目在主轴方向的对齐方式。指定如何在伸缩项目之间分布伸缩容器额外空间。当一行上的所有伸缩项目不能伸缩或可伸缩但是已达到最大长度时，这一属性才会对伸缩容器额外空间进行分配。

```
box-pack: start | end | center | justify
```
* start: 伸缩项目向一行的起始位置靠齐。伸缩容器沿着布局轴方向的所有额外空间被置于布局轴的末尾。 
* end: 和 start 值相反，伸缩项目向一行的结束位置靠齐。伸缩容器沿着布局轴方向的额外空间都被置于布局轴的开始。
* center: 伸缩项目向一行的中间位置靠齐。伸缩容器所有额外空间平均分布在第一伸缩项目前面和最后一个伸缩项目的后面。
* justify: 伸缩项目会平均分布在一行里。伸缩容器所有额外空间平均分布在所有伸缩项目之间，而且在第一个伸缩项目之前和最后一个伸缩项目之后不分配伸缩容器的任何额外空间。
