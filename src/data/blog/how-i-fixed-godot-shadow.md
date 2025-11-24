---
title: 从一无所知到修复了Godot引擎的定向阴影
lang: zh
translationOf: how-i-fix-godot-shadow
tags: []
pubDatetime: 2025-04-04T00:00:00.000Z
description: 从一无所知到修复了Godot引擎的定向阴影
---
在2024年6月的某一天，我在浏览器中测试自己用Godot开发的游戏原型时，突然发现本应出现的定向阴影消失了：

![shadow-bug.png](/static/images/how-i-fix-godot-shadow/shadow-bug.png)

那时，对底层渲染原理和Godot源码都不熟悉的我不会料到，这个问题会花费近十个小时解决，不仅促成了我在Godot的第一个PR，还帮助Chrome和Safari修复了同样的问题。

## Contents

## 背景

由于Unity糟糕的开发体验，2024年我开始使用Godot作为首选的游戏原型开发引擎。从Unity到Godot的迁移成本不算高。Godot作为原型开发的体验也足够好，脚本热重载极大缩短了迭代周期。总体而言我对迁移到Godot是满意的，尽管仍然偶尔有一些小问题。

六月份，我为了参加一个GameJam，使用Godot开发游戏原型，这时遇到了开头的问题。

## 最小可复现问题

按照Godot社区的指导原则，发现问题后，为了能让维护者修复问题，我需要提交一个最小可复现版本。

我搭建了一个最简单的场景，场景中仅有地面、正方体以及定向光，正常情况下，正方体阻挡定向光，在地面留下阴影，像这样：

![342240965-6ec37a0f-d4b1-4750-9b6a-0ff5436d13a9.png](/static/images/how-i-fix-godot-shadow/342240965-6ec37a0f-d4b1-4750-9b6a-0ff5436d13a9.png)

而我遇到的问题正是这道阴影消失了：

![shadow-bug.png](/static/images/how-i-fix-godot-shadow/shadow-bug.png)

进一步调查，发现阴影不是消失了，而是颜色不对（需要仔细看👀）：

![342247006-f9894f2d-a103-40eb-a3d3-7ce8e39338c9.png](/static/images/how-i-fix-godot-shadow/342247006-f9894f2d-a103-40eb-a3d3-7ce8e39338c9.png)

为了确认该问题的影响范围，我在多个平台进行了测试。测试结果是，该问题仅影响搭载Silicon芯片的Mac系统的Chrome、Safari浏览器，其他平台和浏览器正常。也确认了其他类型的阴影，如点光源等不受影响。

我为这个问题创建了一个[issue](https://github.com/godotengine/godot/issues/93537)。但究竟是什么导致了这个问题呢？当时的我对渲染一无所知，但出于好奇，开始寻找答案。

## 一些无效尝试

本能的，我开始寻找针对WebGL的Debug工具。我找到了由BabylonJS核心贡献者开发的SpectorJS。

SpectorJS能够捕获WebGL的帧，并显示在该帧期间对捕获的上下文执行的命令。也有一个很好的[浏览器扩展](https://chromewebstore.google.com/detail/spectorjs/denbgaamihkadbghdceggmchnflmhpmk)。

![2025-04-04 20.59.26.png](/static/images/how-i-fix-godot-shadow/2025-04-04%2020.59.26.png)

我用SpectorJS认真分析了一会，意识到这还是太低层了，一个最简单的场景也有非常复杂的命令，而且这些命令我也不是很懂🤷，所以没有任何发现。

## 迷失在代码库

于是我转向Godot源码，但从哪开始呢。Godot源码的文件组织结构非常清晰，对引擎有一定了解的前提下，可以大致确定功能对应的位置。我们遇到问题的范围很明确——渲染层、定向阴影、WebGL，所以很好定位。

```
godot
├── bin
├── core
├── doc
├── drivers
│   ├── ...
│   ├── gles3
│   ├── ...
├── editor
├── main
├── misc
├── modules
├── platform
├── scene
├── servers
│   ├── ...
│   ├── rendering
│   ├── ...
├── tests
└── thirdparty
```

在引擎内部，Godot 使用**服务器**的概念。服务器是Low-Level的 API，用于控制渲染、物理、声音等。

渲染由Rendering Server处理，对应目录的`servers/rendering`，Rendering Server支持不同的图形后端，注意到，这部分内容在`drivers`目录下。而我们出问题的平台——WebGL，对应的就是GLES3，该目录的内容如下：


```
gles3
├── SCsub
├── effects
├── environment
├── rasterizer_canvas_gles3.cpp
├── rasterizer_canvas_gles3.h
├── rasterizer_gles3.cpp
├── rasterizer_gles3.h
├── rasterizer_scene_gles3.cpp
├── rasterizer_scene_gles3.h
├── shader_gles3.cpp
├── shader_gles3.h
├── shaders
└── storage
```

在文件夹中进行查找，注意到`rasterizer_scene_gles3.cpp`存在以下代码，负责渲染场景和阴影和定向阴影，似乎正是我们要寻找的内容。

```cpp
void RasterizerSceneGLES3::render_scene(...) {
	...
	_render_shadows(&render_data, screen_size);
	...
}

// Render shadows
void RasterizerSceneGLES3::_render_shadows(...) {
  ...
	if (render_shadows) {
	...
	// Render directional shadows.
	for (uint32_t i = 0; i < directional_shadows.size(); i++) {
		...
		_render_shadow_pass(...);
		...
	}
	...
}
```

简化无关信息后，到目前为止的调用逻辑都很好理解，可以看到，关键应该在于`_render_shadow_pass`函数。我们看看这个函数具体干了什么，这是一个200行的函数，折叠一些代码分支后大概长这样：

![_render_shadow_pass.png](/static/images/how-i-fix-godot-shadow/_render_shadow_pass.png)

如果你感兴趣可以在[这里](https://github.com/godotengine/godot/blob/4.2/drivers/gles3/rasterizer_scene_gles3.cpp#L1981)看看完整代码。

你看明白了吗？反正我当时没看明白...于是我去学习了一下定向阴影究竟是如何实现的。

## 定向阴影的原理

### 场景从光源视角渲染

首先，游戏引擎会从定向光的视角出发，渲染整个场景，生成一张深度图（或称阴影贴图）。这张深度图记录了从光源出发到场景中各个物体的距离（深度信息）。

### 主渲染过程中的阴影检测

在主渲染过程中，对于每个像素，游戏引擎会将其转换到光源的坐标系中，然后将其深度值与阴影贴图中对应位置的深度进行比较：

如果当前像素的深度大于阴影贴图中存储的深度，则说明该像素处于阴影中；

如果深度相等或更小，则该像素被光源照亮。

## 来自shader的低语

学习完回来，我还是不能很好地理解这段代码究竟在做什么，但我猜测中间应该没有别的层次了。

于是我把目光转向了`shaders`目录，通过关键字检索，确认阴影相关内容位于`scene.glsl`。在这里我很快定位了定向阴影的关键代码：

```glsl
#if !defined(LIGHT_USE_PSSM2) && !defined(LIGHT_USE_PSSM4)

float directional_shadow = sample_shadow(directional_shadow_atlas, directional_shadows[directional_shadow_index].shadow_atlas_pixel_size, shadow_coord);

#endif // !defined(LIGHT_USE_PSSM2) && !defined(LIGHT_USE_PSSM4)
```

到这里必须解释一下`LIGHT_USE_PSSM2`等宏定义，渲染定向阴影时，有一种技术叫做平行分割阴影贴图（PSSM），PSSM通过性能交换更好的阴影质量，我们也可以选择不启用PSSM。

在我们遇到的Bug里，该问题与是否启用PSSM无关，而启用PSSM的代码路径更复杂，所以我们可以只关注不启用PSSM的代码路径，也就是上面复制粘贴的代码。

**点光源为什么可以正常工作呢？** 我们又看到点光源阴影的关键代码：

```glsl
omni_shadow = texture(omni_shadow_texture, vec4(light_ray, 1.0 - length(light_ray) * omni_lights[omni_light_index].inv_radius));
```

**一个是`texture`而一个是`sample_shadow`，有差异的地方必然是Bug出现的理由。**

我们看看`sample_shadow`做了什么（经过简化，删除了PSSM相关代码路径）：

```glsl
float sample_shadow(highp sampler2DShadow shadow, float shadow_pixel_size, vec4 pos) {
	...
	float avg = textureProj(shadow, pos);
	..
	return avg;
}
```

看起来非常简单，这么简单的函数怎么会出问题呢？不过首先，textureProj是什么？

## 推断

根据[OpenGL的文档](https://registry.khronos.org/OpenGL-Refpages/gl4/html/textureProj.xhtml)，`textureProj`的功能类似于`texture`，两者都是对一张纹理进行采样，区别在于`textureProj`执行带投影的纹理查找。

对于兼容性问题，我本来的预期是，由于不同平台执行路径的不同导致有微妙的Bug，但一路下钻到最底层，发现并没有任何平台特定代码路径。**也就是说，问题或许大概率出现在更底层！**

我开始想，这是一个很基础的需求，其他库大概率也是这样实现定向阴影的，如果shader没有任何逻辑问题，那么为什么其他WebGL渲染的框架没有这个问题呢？

我开始在其他库中寻找`textureProj`。

## 寻找textureProj

我在其他知名3D框架中以`textureProj`为关键字查询，在使用较为广泛的ThreeJS和BabylonJS竟然都**没有找到对这个API的使用**。

反向思考，虽然我对渲染一窍不通，只要我能够找到正常工作的阴影代码，逐步替换Godot现行的实现，那么要么能够修复问题，要么能够证明问题不在这一层。但从ThreeJS的代码库中寻找无异于大海捞针。

一番努力后我找到[picoGL](https://tsherif.github.io/picogl.js/)，正如其名，是一个最小版本的WebGL框架，而其demo页面正好有正常工作的定向阴影。

![CleanShot 2025-04-05 at 04.45.40@2x.png](/static/images/how-i-fix-godot-shadow/CleanShot%202025-04-05%20at%2004.45.40@2x.png)

## picoGL立大功

picoGL demo的源代码惊人的简单，我无需做任何简化：

```
 void main() {
            vec3 shadowCoord = (vPositionFromLight.xyz / vPositionFromLight.w) / 2.0 + 0.5;
            shadowCoord.z -= 0.01;
            float shadow = texture(uShadowMap, shadowCoord);

            vec4 baseColor = texture(uTextureMap, vTexCoord);

            vec3 normal = normalize(vNormal);
            vec3 eyeDirection = normalize(uEyePosition - vPosition);
            vec3 lightDirection = normalize(uLightPosition - vPosition);
            vec3 reflectionDirection = reflect(-lightDirection, normal);
            float diffuse = shadow * max(dot(lightDirection, normal), 0.0) * 0.7;
            float ambient = 0.2;
            float specular = shadow * pow(max(dot(reflectionDirection, eyeDirection), 0.0), 20.0) * 0.7;

            fragColor = vec4((ambient + diffuse + specular) * baseColor.rgb, baseColor.a);
        }
```

我们在第三行就看到了熟悉的内容：`float shadow = texture(uShadowMap, shadowCoord);`
也就是说，前三行代码等效于Godot源码中的`textureProj` 。

于是我在shader内新增了一个函数：

```glsl
float textureProjSimulated(highp sampler2DShadow shadow, vec4 pos) {
	float d = texture(shadow, pos.xyz/pos.w);
	return d;
}

```

尝试编译运行，看到了正常的阴影，所有问题竟然都解决了！

![342240965-6ec37a0f-d4b1-4750-9b6a-0ff5436d13a9.png](/static/images/how-i-fix-godot-shadow/342240965-6ec37a0f-d4b1-4750-9b6a-0ff5436d13a9.png)

## 追根溯源

理论上我已经找到了变通方案，但我的好奇心仍然没有得到满足，`textureProj`身上到底发生了什么？我写了一个[gist](https://jsgist.org/?src=60e40e12f617541a28c777523c23208d)来对比我自定义的`textureProj`和正版`textureProj`表现的区别。
左边是我手写的`textureProjSimulated`，而右边是正版`textureProj`。

在表现错误的平台上：

![texture-proj-error.png](/static/images/how-i-fix-godot-shadow/texture-proj-error.png)

在表现正确的平台上：

![texture-proj-correct.png](/static/images/how-i-fix-godot-shadow/texture-proj-correct.png)

可以看到，在出现问题的平台上，`textureProj`的表现不符合预期。那么我们可以确认，该问题来源于Silicon平台的Chrome、Safari自身无法正确执行`textureProj`，而恰好`textureProj`是个相对较新的API，又只有Godot采用了这个API，所以导致**在某些平台上Godot的Web导出无法正常渲染阴影**。

那么其他API有没有这个问题呢？我在OpenGL的文档里看到了`textureProjLod`：

![CleanShot 2025-04-05 at 05.12.21@2x.png](/static/images/how-i-fix-godot-shadow/CleanShot%202025-04-05%20at%2005.12.21@2x.png)

我尝试用`textureProjLod`替换`textureProj`，这个问题居然也神奇地解决了！也就是说，只有`textureProj`这一个API有问题。

那又是为什么，Safari和Chrome一同出现这个问题呢？我原以为这个问题要追溯到Metal API，经过简单检索后发现，Safari和Chrome都在使用[ANGLE](https://github.com/google/angle)实现OpenGL。


![chrome angle.png](/static/images/how-i-fix-godot-shadow/chrome%20angle.png)


> ANGLE是适用于 Windows、Mac、Linux、iOS 和 Android 的符合标准的 OpenGL ES 实现。
> ANGLE 的目标是允许多个操作系统的用户无缝运行 WebGL 和其他 OpenGL ES 内容，通过将 OpenGL ES API 调用转换为该平台上可用的硬件支持 API。ANGLE 目前提供从 OpenGL ES 2.0、3.0 和 3.1 到 Vulkan、桌面 OpenGL、OpenGL ES、Direct3D 9 和 Direct3D 11 的转换。未来计划包括 ES 3.2、转换到 Metal 以及对 MacOS、Chrome OS 和 Fuchsia 的支持。

那么问题就更加明朗了，**ANGLE是Chrome和Safari的上游依赖，依赖ANGLE在Mac系统上使用Metal API实现OpenGL，而ANGLE存在一个`textureProj`无法正常工作的Bug，造成最开始的阴影无法渲染。**

## 问题解决

现在我得到了我想知道的一切信息，我在issue里详细做了说明。由于存在两种技术方案，一种是自行实现`textureProj`而一种是利用还能正常工作的`textureProjLod`，我向维护人员询问建议。[@clayjohn](https://github.com/clayjohn) 给了我非常专业的回复，他认为应该使用不会有理论性能损失的`textureProjLod`。

由于担心引入新的问题，我找了一个更复杂的场景，在之前尝试的平台重新测试，既没有发现性能损失，也没有发现新的视觉问题。

![pr-image.png](/static/images/how-i-fix-godot-shadow/pr-image.png)

于是我打开了一个[PR](https://github.com/godotengine/godot/pull/94556)，这个PR在3天后被Merge到主分支，完成了我对Godot的第一次贡献。

![CleanShot 2025-04-05 at 05.31.35@2x.png](/static/images/how-i-fix-godot-shadow/CleanShot%202025-04-05%20at%2005.31.35@2x.png)

## 后续

当时我同时也将这个问题报告给了Chrome、Safari和ANGLE。在一个多月后，开发人员确认在新的Chromium中修复了该问题：

![CleanShot 2025-04-05 at 05.33.51@2x.png](/static/images/how-i-fix-godot-shadow/CleanShot%202025-04-05%20at%2005.33.51@2x.png)

Godot 4.3于8月15日正式发布，我被合入的修复也随着发布，Godot项目照例会在大版本更新里认真写一篇面向用户的更新日志，在结尾看到了我的名字，感慨万分。

想起那天，看到浏览器窗口里消失的阴影的一脸茫然的我，一定没有想到会是这样的结局。

![CleanShot 2025-04-05 at 05.38.47@2x.png](/static/images/how-i-fix-godot-shadow/CleanShot%202025-04-05%20at%2005.38.47@2x.png)
