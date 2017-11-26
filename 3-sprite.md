# 前言

上一节中，我们留下了两个问题：

> - `setWhite` 和 `setBlack` 做了什么？
> - `ScreenSprite` 是一个什么类？

其实只要把第二个问题解决了，第一个问题自然就迎刃而解。

那么现在我们全局搜索 `ScreenSprite`，一探究竟吧。

# ScreenSprite

![rpg_core_ScreenSprite.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/3/1.jpg "rpg_core_ScreenSprite.js")

`ScreenSprite` 继承了 `PIXI.Sprite` 的原型链。在初始化方法 `initialize` 中，该实例（this）通过 `new PIXI.Texture(new PIXI.BaseTexture());` 得到默认纹理（texture），构造精灵[^1]（sprite）。

接着，该实例设其 `_bitmap` 私有属性的宽高各仅 1 像素，之后获取这个 bitmap 的 `baseTexture` 赋值给自己的 `baseTexture`，之后通过 `setFrame` 方法[^2]确定截取纹理的位置和大小（实际上就是整个纹理），然后设定缩放程度至全屏[^3]，赋值不透明度为 0，颜色负值（实际上和 0 差不多），`_colorText` 则为空字符串；最后调用了 `setBlack` 方法。

![rpg_core_setBlack_setWhite.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/3/2.jpg "rpg_core_setBlack_setWhite.js")

发现这两个上一节也提到的方法都调用了 `setColor` 方法。

![rpg_core_setColor.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/3/3.jpg "rpg_core_setColor.js")

该方法最后调用了 `fillAll` 方法，可以看出这是在设置该精灵的背景颜色，那么很显然，`setBlack` 就是设置该精灵的背景颜色为黑色，`setWhite` 则为白色。下面追踪 `fillAll` 方法确认一下。

![rpg_core_fillAll.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/3/4.jpg "rpg_core_fillAll.js")

由上图可知 `fillAll` 又调用了 `fillRect`，后者调用了 `context.restore` 方法。继续查（这个 `context` 是 `Bitmap` 的，查找的时候不要和其他类的弄混了）:

![rpg_core_Bitmap_init.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/3/5.jpg "rpg_core_Bitmap_init.js")

可见，这其实就是 HTML 里的 `canvas` 元素（element）。这说明了什么？说明 **精灵是通过 bitmap，将纹理信息显示在画布上的** 。

那么当我们回到 `fillRect` 方法时，745 到 748 行的代码都可以理解了：这其实是在使用原生的 canvas 绘图 API！[^4]

稍等，还有最后的 `this._setDirty()`。这是什么？

# _setDirty()

![rpg_core_Bitmap__setDirty.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/3/6.jpg "rpg_core_Bitmap__setDirty.js")

结合这张图和上面 `Bitmap` 的初始化函数可知，`Bitmap._baseTexture` 私有属性的类型跟 `ScreenSprite.texture.baseTexture` 一样，都是 `PIXI.BaseTexture`，只是这次传入的参数是 `_canvas`，也就是 HTML 的 `canvas` 元素。

而在 `PIXI.BaseTexture` 中，`dirty` 方法的定义是这样的：

![pixi_PIXI.BaseTexture_dirty.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/3/8.jpg "pixi_PIXI.BaseTexture_dirty.js")

注释意思：将所有的 `glTextures` 设为 `true`。

再看看 `_dirty` 和 `_glTextures` 的定义

![pixi_PIXI.BaseTexture__dirty.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/3/7.jpg "pixi_PIXI.BaseTexture__dirty.js")

![pixi_PIXI.BaseTexture__glTextures.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/3/9.jpg "pixi_PIXI.BaseTexture__glTextures.js")

由 `_dirty` 的注释中得知，这个属性和纹理更新工作相关。又根据 `dirty` 方法可以知道，将 `_dirty` 的元素设置为 `ture` 就会 **提醒绘制引擎重新绘制纹理** 。

`_dirty` 只出现在这两个地方，而 `_glTextures` 还出现在一个叫 `unloadFromGPU` 的方法中：

![pixi_PIXI.BaseTexture_unloadFromGPU.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/3/10.jpg "pixi_PIXI.BaseTexture_unloadFromGPU.js")

由注释中可以得知，这个方法对 GPU 的资源管理有益处，而如果在这之中的一些纹理还在被精灵所使用（或者说“需要”），那么它（们）就还是可用的，而且还会再次上传加载（reuploaded）。

# 回到 startFadeXXX()

现在再来回顾第 2 节提到的两个方法（或许再看一遍第 2 节更好）：

![rpg_scenes_Scene_Base__fadeXXX.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/3/11.jpg "rpg_scenes_Scene_Base__fadeXXX.js")

以 `startFadeIn` 为例，这个函数做了以下工作：

1. 创建布满整个屏幕的精灵，这个精灵的背景色要么是黑色要么是白色
2. 设置渐变标志位，正负影响到渐变方向（淡入还是淡出，这里是淡入）
3. 设置渐变时间
4. 初始化渐变不透明度为255

再根据其他方法（如 `updateFade`）可以得出，这其实是有个蒙板遮住了整个画面，然后这个蒙板渐渐变得透明，从而制造出一种简单的淡入效果。

# 还需要探索什么

在 `rpg_core.js` 中，`Bitmap` 和 `Graphics` 的定义是相邻的，而上一节的脚注 6 有提到，`Graphics` 中并没有像 `PIXI.Grapphics` 那样支持各种自定义绘图，那么 `Bitmap` 有吗？这个问题的答案就留到下一节探索解答吧。

- - -

[^1]: 我对“精灵”这个翻译一开始是不太理解的，精灵明明应该是 elf 嘛，不过在知道 pixi 精灵的行为后，我大概理解了这个长得像精神（spirit）的单词的意思：纹理的显示需要以精灵作为载体，而纹理在画布类事物（stage、scene 等）上的运动也需要通过精灵的平移、缩放、旋转等动作直接体现，而这些动作一般是对用户输入的响应，这就是常说的交互效果。精灵的身体是纹理，而其精神则是交互效果。

[^2]: 参考我另外写的 [Pixi笔记](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/extra-pixi/1-base.md) 中的 *切图仔* 小节。

[^3]: `Graphics.width` 其实是整个窗口的宽度，而该精灵的纹理宽度是 1，再加上 `scale.x` 的意思是 **x 方向上的缩放率** ，所以最终缩放的结果就是该精灵的纹理宽度等于整个窗口的宽度。高度同理。

[^4]: 关于 `context.restore()` 参考 [CanvasRenderingContext2D.restore](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/restore)，其实是做了画布恢复工作（不是撤销操作，而是恢复上一次画布的内部设置状态，如 `fillStyle` 在上一次调用 `save` 时的值）。