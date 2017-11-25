# 前言

上一节我们来到了 `SceneManager` 的 `goto` 方法。

![rpg_manager_SceneManager_goto.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/1.jpg "rpg_manager_SceneManager_goto.js")

> `goto` 从下图中可以看出，只是 `new` 了一个值，并将这个值赋给理应是私有的 `_nextScene` 变量（下一个背景过渡后的背景，猜想最终会被赋值给 `_scene` 变量），第二个 `if` 块表明，如果当前已经有背景，那么马上停止（stop）它（读完源码后会发现，实际上是将它的 `_active` 属性设为 `false`）。

那么，被传进 `goto` 函数的 `sceneClass` 形参的类型是什么呢？

退回到 `run` 函数，再退回至 `main.js`，发现是 `Scene_Boot` 传给了 `run` 函数，那么接下来我们全局搜索一下 `Scene_Boot`。

# Scene_Boot

![rpg_scenes_Scene_Boot.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/2.jpg "rpg_scenes_Scene_Boot.js")

`Scene_Boot` 这个函数[^1]位于 `rpg_scenes.js` 中，从 152 行可以看出，`Scene_Boot` 继承了 `Scene_Base` 的原型链。

`Scene_Base` 继承了 `Stage` 的原型链，它有一些基本的函数，比如 `isActive`、`isReady` 等，都是和背景过渡相关的基本操作。而 `Stage` 的定义在 `rpg_core.js` 中，这里的 `Stage` 则是继承了 `PIXI.js` 的 `Stage`。

![rpg_core_Stage.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/3.jpg "rpg_scenes_Stage.js")

![PIXI_Stage.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/4.jpg "PIXI_Stage.js")

> Pixi.js 使用 WebGL ，是一个超快的 HTML5 2D 渲染引擎。作为一个 Javascript 的 2D 渲染器，Pixi.js 的目标是提供一个快速的、轻量级而且是兼任所有设备的 2D 库。提供无缝 Canvas 回退，支持主流浏览器，包括桌面和移动。 Pixi 渲染器可以开发者享受到硬件加速，但并不需要了解 WebGL。
> 来源：[《pixi.js教程中文版--基础篇》](https://www.cnblogs.com/afrog/p/4056378.html)

虽然已经猜到 MV 的跨平台是浏览器包了游戏本体，但是没想到它竟然还用上了 Pixi。上面关于 Pixi 的中文教程短小精悍，可以快速了解到 Pixi 的 stage、renderer、texture、sprite、event 这几个概念，以及它们的关系，推荐先浏览完，再回来继续探索[^2]。

# Scene_Base

让我们回到 `Scene_Base`。

![rpg_scenes_Scene_Base.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/5.jpg "rpg_scenes_Scene_Base.js")

`The superclass of all scenes within the game`，意为，游戏中所有背景的父类。我们从私有变量[^3]出发，看看这个父类都提供了什么功能。

### _active

![rpg_scenes_Scene_Base__active.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/6.jpg "rpg_scenes_Scene_Base__active.js")

比较简单，`isActive` 方法可以获取到 `_active` 的值，`start` 和 `stop` 方法分别改变 `_active` 的值。在 `rpg_scenes.js` 查找后可以发现，`isActive` 主要在执行预处理操作的时候被调用。至于后两个方法，主要在 `Scene_Manager` 执行背景过渡时调用。

### _fadeSign

![rpg_scenes_Scene_Base__fadeSign_1.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/7.jpg "rpg_scenes_Scene_Base__fadeSign_1.js")

这个值一开始是 0，而 `startFadeIn` 和 `startFadeOut` 分别将它设置为 1 和 -1，这些都是赋值，`_fadeSign` 并没有被使用到，它真正被使用到的地方是在 `updateFade` 方法中。

![rpg_scenes_Scene_Base__fadeSign_2.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/8.jpg "rpg_scenes_Scene_Base__fadeSign_2.js")

很显然，这里是在做一个背景过渡的不透明度（opacity）计算，且 `_fadeSign` 的正负直接影响到了不透明度变化的趋势[^4]，随着持续时间（duration）的不断递减，不透明度也在逐渐逼近目标值（从 255 到 0 或者反之）。

那么 `updateFade` 在什么时候被调用呢？

![rpg_scenes_Scene_Base_updateFade.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/9.jpg "rpg_scenes_Scene_Base_updateFade.js")

`updateFade` 只在这个 `update` 方法中被调用。嗯？这个 `update` 有点眼熟。

回到 `SceneManager.requestUpdate` （第 1 节有提到）来:

![rpg_manager_SceneManager_requestUpdate.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/10.jpg "rpg_manager_SceneManager_requestUpdate.js")

注意这里的 `this` 指向的不是 `Scene_Base` 及其子类，而是 `SceneManager` ，所以我们得继续Ctrl+鼠标左键[^5]：

![rpg_manager_SceneManager_update.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/11.jpg "rpg_manager_SceneManager_update.js")

直觉告诉我是 `updateMain`（错了没关系，调头回来继续找）：

![rpg_manager_SceneManager_updateMain.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/12.jpg "rpg_manager_SceneManager_updateMain.js")

`updateScene` 没跑了：

![rpg_manager_SceneManager_updateScene.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/13.jpg "rpg_manager_SceneManager_updateScene.js")

终于找到你了。

可见，`Scene_Base.update` 方法是被 `Scene_Manger` 调用的（可能还有其他调用）。

当然，这条寻找 `Scene_Base.update` 方法调用的路，途中还有很多其他的方法需要探索[^6]，我们回去看一下剩下的两个私有属性。

### _fadeDuration 和 _fadeSprite

事实上，除了上面提到的 `startFadeIn`、`startFadeOut`、`updateFade` 方法有出现 `_fadeDuration` 外，还有一个叫 `isBusy` 的方法也用到了它。

![rpg_scenes_Scene_Base_isBusy.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/14.jpg "rpg_scenes_Scene_Base_isBusy.js")

综合其他方法可以得出，这个方法可以用来判断当前背景是否在（被 `SceneManager`）执行过渡工作。

至于 `_fadeSprite`，除了出现在上面提到的`startFadeIn`、`startFadeOut`、`updateFade` 方法以外，还出现在 `createFadeSprite` 里。

![rpg_scenes_Scene_Base_createFadeSprite.js](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/2/15.jpg "rpg_scenes_Scene_Base_createFadeSprite.js")

综合其他方法可以得出，这个方法是在背景过渡前做一些准备工作。创建出 `ScreenSprite` 实例后，将其赋值给 `_fadeSprite`，然后使用 `addChild` 方法将其添加进当前背景中（回顾上面的 Pixi 中文基础教程）。`white` 应该是一个 `bool` 类型的值，用于设置 `_fadeSprite` 的一些东西（调用了 `setWhite` 和 `setBlack`）。

至于 `setWhite` 和 `setBlack` 做了什么， `ScreenSprite` 又是一个什么样子的类，就在下一节讨论吧。

- - -

[^1]: VSCode 有个转换功能：将光标移动到 `Scene_Boot` 上，会有小灯泡出现，按下小灯泡里的选项，就会把 `Scene_Boot` 用 `class` 封装成一个类。当然，`class` 不过是 Js 的语法糖，既然用 Js，还是坚持看 `prototype` 吧。

[^2]: 说起来国内关于 Pixi 的教程真的很少很少，估计是因为有其他前端 2D 游戏开发引擎，比如 LayaBox、Egret，我只能通过官网的[教程](http://www.pixijs.com/tutorials)，还有一本叫《Learn Pixi.js》的外语书来学习，不过目前看来，MV 已经把 Pixi 封装好了，所以现在重点还是先看 MV 的源码。

[^3]: 或者叫“私有属性”，这是方便的说法。Js 实际上没有私有变量这个概念，但是 **在属性名前加 _ 表示这个属性不应该被公开访问** 成了一种约定，方法同理。

[^4]: 这里我其实不太理解，一般来说只有淡入画面和淡出画面两种选择，而且源码里确实是这么认为的（关于当前不透明度的计算方式倒是有点意思），这样的话为什么不把 `_fadeSign` 当成 `bool` 类型呢？

[^5]: VSCode 的 `跳转到定义` 的快捷键，很多代码文本编辑器或者 IDE 都有类似的功能。

[^6]: 最后我尝试看了这些方法，发现跟 `Graphics` 这个类有紧密的联系，应该涉及到很多渲染方面的问题；另外，在 `updateMain` 方法中，我们能看到 `requestUpdate` 方法再次出现了。