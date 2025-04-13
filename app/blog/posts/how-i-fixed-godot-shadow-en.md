---
title: How I Fixed Godot Shadows With Zero Knowledge
share: true
category: app/blog/posts
filename: how-i-fixed-godot-shadow-en
publishedAt: 2025-04-13
---
On a day in June 2024, while testing my Godot-developed game prototype in a browser, I suddenly realized that the directional shadows that were supposed to appear had disappeared:

![shadow-bug.png](/static/images/how-i-fix-godot-shadow/shadow-bug.png)

At the time, I wasn’t familiar with low-level rendering principles or the Godot source code. I had no idea this issue would take nearly ten hours to solve, ultimately resulting in my first PR to Godot and also helping Chrome and Safari fix the same problem.

## Contents

## Background

In 2024, frustrated by Unity’s poor development experience, I started using Godot as my primary engine for rapid prototyping. Transitioning from Unity to Godot isn’t too difficult, and Godot’s experience for prototyping is quite good—the script hot-reload feature significantly shortens the iteration cycle. Overall, I’m satisfied with the switch to Godot, though there are still occasional quirks.

In June, while developing a game prototype for a Game Jam, I encountered the problem mentioned at the beginning.

## Minimum Reproducible Issue

Following the Godot community guidelines, I needed to submit a minimal reproducible version to allow maintainers to fix the issue.

I set up the simplest scene: just a ground plane, a cube, and a directional light. Under normal conditions, the cube should block the directional light and cast a shadow on the ground, like this:

![342240965-6ec37a0f-d4b1-4750-9b6a-0ff5436d13a9.png](/static/images/how-i-fix-godot-shadow/342240965-6ec37a0f-d4b1-4750-9b6a-0ff5436d13a9.png)

The problem I encountered was that this shadow disappeared:

![shadow-bug.png](/static/images/how-i-fix-godot-shadow/shadow-bug.png)

Looking closer, I found the shadow wasn’t gone but its color was incorrect (you have to look carefully):

![342247006-f9894f2d-a103-40eb-a3d3-7ce8e39338c9.png](/static/images/how-i-fix-godot-shadow/342247006-f9894f2d-a103-40eb-a3d3-7ce8e39338c9.png)

To confirm the scope of the issue, I tested on multiple platforms. The result showed that only Mac systems with Silicon chips running Chrome and Safari were affected. Other platforms and browsers worked fine, and other types of shadows (like those from point lights) were unaffected.

I created a corresponding [issue](https://github.com/godotengine/godot/issues/93537). But what was causing the problem? I was clueless about rendering at the time, but my curiosity pushed me to find out.

## Some Ineffective Attempts

Instinctively, I started looking for debugging tools specific to WebGL. I discovered SpectorJS, developed by a core BabylonJS contributor.

SpectorJS can capture WebGL frames and display all the commands executed on the context during that frame. There’s also a handy [browser extension](https://chromewebstore.google.com/detail/spectorjs/denbgaamihkadbghdceggmchnflmhpmk).

![2025-04-04 20.59.26.png](/static/images/how-i-fix-godot-shadow/2025-04-04%2020.59.26.png)

I spent some time analyzing with SpectorJS and realized it was still too low-level. Even the simplest scene generated a very complex sequence of commands, and I wasn’t familiar enough with them. So, I found nothing useful there.

## Lost in the Codebase

So, I turned to Godot’s source code. The question was: where to start? Godot’s file structure is actually quite clear, once you have some knowledge of how the engine is organized. Our problem was specifically in the rendering layer, specifically related to directional shadows under WebGL, so it wasn’t hard to locate:

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

Within the engine, Godot uses the concept of **servers** — low-level APIs for rendering, physics, audio, etc.

Rendering is handled by the Rendering Server, found in `servers/rendering`. The Rendering Server supports different graphics backends, which live in the `drivers` folder. For our target platform—WebGL—the relevant backend is GLES3. That folder looks like this:

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

Searching within that folder, I noticed that `rasterizer_scene_gles3.cpp` contained code dealing with scene rendering, shadows, and directional shadows — precisely what we were looking for:

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

After simplifying unrelated details, the logic so far is understandable. The key likely lies in the `_render_shadow_pass` function, which is about 200 lines of code. After collapsing some branches, it looks something like this:

![_render_shadow_pass.png](/static/images/how-i-fix-godot-shadow/_render_shadow_pass.png)

If you’re interested, you can see the [full code here](https://github.com/godotengine/godot/blob/4.2/drivers/gles3/rasterizer_scene_gles3.cpp#L1981).

Can you figure it out? I certainly couldn’t at first. So I went away to learn how directional shadows actually work.

## The Principle of Directional Shadows

### Rendering the scene from the light’s perspective

First, the game engine renders the entire scene from the viewpoint of the directional light, generating a depth map (also called a shadow map). This depth map records the distance (depth information) from the light source to various objects in the scene.

### Shadow checking during the main rendering pass

During the main rendering process, for each pixel, the engine transforms that pixel into the light’s coordinate space and compares its depth value with the corresponding position in the shadow map:

- If the current pixel’s depth is greater than the depth stored in the shadow map, that pixel is in shadow.
    
- If it’s equal or smaller, that pixel is lit by the light source.
    

## Whispers from the Shader

Returning to the code after learning this, I still couldn’t fully grasp the logic. But I guessed there weren’t any further layers involved.

So I turned my attention to the `shaders` folder. By searching relevant keywords, I pinpointed the code for shadows in `scene.glsl`. I quickly found the crucial snippet for directional shadows:

```glsl
#if !defined(LIGHT_USE_PSSM2) && !defined(LIGHT_USE_PSSM4)

float directional_shadow = sample_shadow(directional_shadow_atlas, directional_shadows[directional_shadow_index].shadow_atlas_pixel_size, shadow_coord);

#endif // !defined(LIGHT_USE_PSSM2) && !defined(LIGHT_USE_PSSM4)
```

A quick explanation of `LIGHT_USE_PSSM2` and so on: there’s a technique called Parallel Split Shadow Maps (PSSM) for rendering directional shadows, which trades performance for better quality. You can also choose not to enable PSSM.

In our bug, the issue occurs whether PSSM is enabled or not. But the code path for PSSM is more complex, so we can focus on the non-PSSM path (the one above).

**Why do point lights work normally?** Let’s look at point light shadows:

```glsl
omni_shadow = texture(omni_shadow_texture, vec4(light_ray, 1.0 - length(light_ray) * omni_lights[omni_light_index].inv_radius));
```

One uses `texture` while the other uses `sample_shadow`. This difference could be where the bug lies.

Let’s see what `sample_shadow` does (after simplification and removing PSSM paths):

```glsl
float sample_shadow(highp sampler2DShadow shadow, float shadow_pixel_size, vec4 pos) {
	...
	float avg = textureProj(shadow, pos);
	...
	return avg;
}
```

It looks very simple. So how could this function be causing trouble? But first, what is `textureProj`?

## Reasoning

According to the [OpenGL documentation](https://registry.khronos.org/OpenGL-Refpages/gl4/html/textureProj.xhtml), `textureProj` is similar to `texture`, except it performs a projective texture lookup.

Initially, I suspected a subtle bug due to different platform code paths. But after following the logic all the way down, I found no platform-specific code. **In other words, the problem likely lies even deeper!**

Then I thought, “This is a very fundamental operation; other libraries probably implement directional shadows the same way. If there’s no logical error in the shader, why don’t other WebGL frameworks have this problem?”

So I started searching other libraries for `textureProj`.

## Searching for `textureProj`

I searched well-known 3D frameworks, but neither ThreeJS nor BabylonJS **use this API**.

From another angle: even though I’m clueless about rendering, if I can find a functioning shadow implementation, I can gradually replace Godot’s existing implementation. Either it’ll fix the bug, or it’ll prove the issue isn’t in this layer. But searching ThreeJS source was like hunting for a needle in a haystack.

Eventually, I found [picoGL](https://tsherif.github.io/picogl.js/), as small as its name suggests — a minimal WebGL framework. Its demo page conveniently had a working directional shadow example:

![CleanShot 2025-04-05 at 04.45.40@2x.png](/static/images/how-i-fix-godot-shadow/CleanShot%202025-04-05%20at%2004.45.40@2x.png)

## The Great Help of picoGL

Surprisingly, the picoGL demo code is extremely straightforward; I didn’t even need to simplify it:

```glsl
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

In line three, we see something familiar: `float shadow = texture(uShadowMap, shadowCoord);`  
That’s effectively the same as Godot’s `textureProj`, but in simpler form.

So, I added a custom function in Godot’s shader:

```glsl
float textureProjSimulated(highp sampler2DShadow shadow, vec4 pos) {
	float d = texture(shadow, pos.xyz/pos.w);
	return d;
}
```

I tried compiling and running it. Sure enough, the shadow worked normally, and all issues were resolved!

![342240965-6ec37a0f-d4b1-4750-9b6a-0ff5436d13a9.png](/static/images/how-i-fix-godot-shadow/342240965-6ec37a0f-d4b1-4750-9b6a-0ff5436d13a9.png)

## Root Cause

In theory, I’d already found a workaround. But my curiosity still wasn’t satisfied: **what went wrong with `textureProj`?**

I wrote a [gist](https://jsgist.org/?src=60e40e12f617541a28c777523c23208d) comparing my custom `textureProjSimulated` to the official `textureProj`. The left side uses my simulated version, and the right side uses the standard `textureProj`.

On problematic platforms:

![texture-proj-error.png](/static/images/how-i-fix-godot-shadow/texture-proj-error.png)

On platforms where it works correctly:

![texture-proj-correct.png](/static/images/how-i-fix-godot-shadow/texture-proj-correct.png)

On the broken platforms, `textureProj` behaves unexpectedly. We can conclude that on some Silicon Macs, Chrome and Safari simply can’t execute `textureProj` properly. And because `textureProj` is a relatively new API, and Godot happens to use it, **that’s why Godot’s web exports fail to render directional shadows properly on certain platforms.**

What about other related APIs? Scanning OpenGL documentation, I spotted `textureProjLod`:

![CleanShot 2025-04-05 at 05.12.21@2x.png](/static/images/how-i-fix-godot-shadow/CleanShot%202025-04-05%20at%2005.12.21@2x.png)

I tried using `textureProjLod` in place of `textureProj`, and that also magically solved the problem! So it’s specifically `textureProj` that’s broken.

But why do Safari and Chrome share the bug? I initially suspected Apple’s Metal API. However, it turned out both Safari and Chrome rely on [ANGLE](https://github.com/google/angle) for their OpenGL support:

![chrome angle.png](/static/images/how-i-fix-godot-shadow/chrome%20angle.png)

> ANGLE is a conformant OpenGL ES implementation for Windows, Mac, Linux, iOS, and Android.  
> ANGLE’s goal is to allow users to seamlessly run WebGL and other OpenGL ES content across multiple operating systems by translating OpenGL ES API calls to whatever underlying hardware support is available. ANGLE currently supports translating OpenGL ES 2.0, 3.0, and 3.1 to Vulkan, desktop GL, OpenGL ES, Direct3D 9, and Direct3D 11. Future plans include ES 3.2, translation to Metal, and support for macOS, Chrome OS, and Fuchsia.

That clarifies things: **ANGLE, used by Chrome and Safari on Mac systems to provide Metal-based OpenGL, has a bug in `textureProj` that prevents it from functioning correctly**, causing the initial missing shadow problem.

## Problem Solved

By now, I understood everything I wanted to know. I detailed my findings in the Godot issue. Since there were two workarounds—implement my own version of `textureProj` or switch to `textureProjLod`—I asked the maintainers for advice. [@clayjohn](https://github.com/clayjohn) offered a professional response, suggesting the use of `textureProjLod`, which shouldn’t have any theoretical performance downsides.

Worried about introducing new problems, I set up a more complex scene and tested it across multiple platforms. No performance drops or new visual artifacts emerged:

![pr-image.png](/static/images/how-i-fix-godot-shadow/pr-image.png)

So I opened a [PR](https://github.com/godotengine/godot/pull/94556). Three days later, it was merged into the main branch, marking my first contribution to Godot:

![CleanShot 2025-04-05 at 05.31.35@2x.png](/static/images/how-i-fix-godot-shadow/CleanShot%202025-04-05%20at%2005.31.35@2x.png)

## Follow-up

I also reported the issue to Chrome, Safari, and ANGLE. About a month later, developers confirmed the fix in a new Chromium release:

![CleanShot 2025-04-05 at 05.33.51@2x.png](/static/images/how-i-fix-godot-shadow/CleanShot%202025-04-05%20at%2005.33.51@2x.png)

Godot 4.3 was officially released on August 15th, and my fix went live with it. As usual, the Godot project wrote a detailed release note for the new version, where I saw my name at the end and felt quite emotional.

Thinking back to that day when I stared blankly at the missing shadow in my browser window—I certainly never imagined it would end this way.

![CleanShot 2025-04-05 at 05.38.47@2x.png](/static/images/how-i-fix-godot-shadow/CleanShot%202025-04-05%20at%2005.38.47@2x.png)