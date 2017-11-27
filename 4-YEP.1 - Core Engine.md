> 版本：v1.25
>
> 国内视频地址：[Bilibili - YEP.1 - Core Engine](https://www.bilibili.com/video/av3174787/#page=5)
>
> 原地址：[yanfly.moe - YEP.1 – Core Engine](http://yanfly.moe/2015/10/09/yep-1-core-engine/)
> 
> 推荐将原地址的 [主页](http://yanfly.moe/yep/) 保存下来，作者 Yanfly 会一直保持脚本的更新，如本博客编写时（2017.11.27），MV 已经更新到 1.5.1 版本，而作者根据 1.5.1 版本，针对 PC 端写了优化脚本同时发布了 [相关教程](http://yanfly.moe/2017/09/13/yanflys-desktop-optimized-version-update-rpg-maker-mv-1-5-1/)。
> 
> 本博客在探索这类脚本源码时，会先概述脚本的功能（主要来源于源码的注释，有时视频提到的只是一部分特性），然后再探索，所以 **如果只想知道脚本能干什么，不关心背后实现原理的话，可以只看 *脚本功能概述* 一节，并结合视频理解如何使用** 。
> 
> 脚本源码地址可以在每个原地址网页中找到。本节的脚本源码在 [这里](http://yanfly.moe/plugins/en/YEP_CoreEngine.js)。

# 脚本功能概述

> 斜体表示不在之后分析

1. Screen

    - 调整屏幕分辨率
    - *缩放：战斗背景、标题界面（开始界面）、Game Over 界面*
    - 运行同时打开调试窗口，方便调试
    - 在大分辨率下调整战斗时友/敌方角色位置
    - 设置加载游戏字体时超时时间
    - *优化 RAM*

2. Gold

    - *调整：金币持有数上限、金币显示字号*
    - 金币 window 里是否显示金币图标
    - 设置金币超出显示区域时的提示文字

3. Item

    - 调整：物品持有数上限、物品数的字号

4. Parameters

    - 调整：等级上限、友/敌方的 HP、MP、其余属性值上限、物品价格、技能习得所需等级
    - 为物品、武器添加加成效果

5. Battle

    - *调整：过渡动画速度*
    - 被选中的敌方目标是否闪烁
    - *在地图遭遇战斗时有过渡动画，默认只显示地图，通过该脚本可以在显示纯地图的基础上显示事件块（包括玩家）*[^1]

6. Font

    - 设置不同语言环境下对应的字体（中文、韩文、其他）
    - *调整：字号大小、command window 文字对齐方向*

7. Windows

    - 使用逗号格式化数字（9,999 这种，属于英文习惯）
    - *调整：段落行高、icon 宽高、face 宽高、window 内边距、文本内边距、window 透明度*
    - 添加 gague 边框，*修改 gague 的高度*
    - 在角色状态 window 绘制 TP 条

8. Window Colors

    - *修改游戏中各种 window 的其他文本颜色*

# 脚本可设置参数

![parameters_1](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/9.jpg "parameters_1")

![parameters_2](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/10.jpg "parameters_2")

![parameters_3](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/11.jpg "parameters_3")

# 脚本实现原理

打开 `YEP_CoreEngine.js`，GO。

> 一些十分简单的比如 *设置加载游戏字体时超时时间* ，该脚本的源码几乎和 MV 的源码一样，只是封装了一下，让超时时间可以自定义，这类情况大多数不会讨论。

### 1. 调整屏幕分辨率

![screenResolutionChange](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/1.jpg "screenResolutionChange")

可见，在脚本设置[^2]中，*Screen Width* 和 *Screen Height* 分别被赋值给 `SceneManager` 的四个似乎和分辨率相关的属性： **`_screenWidth`、`_screenHeight`、`_boxWidth`、`_boxHeight`** 。

追踪这四个变量的出现的地点，发现 `_screenWidth`、`_screenHeight` 仅在 `rpg_manager.js` 中出现了两次：一次是初始化赋值为 816 和 624，也就是我们熟悉的 RM 系列分辨率；一次是在 `SceneManager.initGraphics` 方法中。

![SceneManager.initGraphics](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/2.jpg "SceneManager.initGraphics")

`Graphics.initialize` 方法部分源码：

![Graphics.initialize](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/3.jpg "Graphics.initialize")

显然，`_width` 和 `_height` 分别对应 `_boxWidth` 和 `_boxHeight`。

出于面向对象设计的考虑，`Graphics` 封装了它们：

![package](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/4.jpg "package")

`width` 和 `boxWidth` 的用法：

![x_and_boxXdifference](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/5.jpg "x_and_boxXdifference")

我选了一个对比比较明显的代码片段。如果用相框打比方，那么 **`width` 相当于一个相框的宽度，`boxWidth` 相当于相框内照片的宽度，两者的差就是设计中常说的 `padding`，内边距** 。这可以被应用在之前提到的 [frame 切图](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/extra-pixi/1-base.md) 上。

而在 `rpg_windows.js` 中，几乎所有[^3]的 `Window_XXX` 的宽度是通过 `Graphics.boxWidth` 直接决定的：

![whereBoxWidth](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/6.jpg "whereBoxWidth")

剩下的宽度有的是定值，有的通过 `Graphics.boxWidth` 间接决定：

![constantBoxWidth](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/7.jpg "constantBoxWidth")

![calculateBoxWidth](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/8.jpg "calculateBoxWidth")

回到 `YEP_CoreEngine.js`，现在可以确定 *Screen Width* 和 *Screen Height* 确实是改变了游戏显示分辨率，一个直观的感受就是能见度变广啦！

### 2. 自动打开调试窗口

核心是这部分代码：

![openConsole](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/12.jpg "openConsole")

第一个 `if` 判断条件中，首先检查当前平台是否为 `NW.js`，其次检查当前是否有 `test` 这个参数存在；接着 **调用 `require('nw.gui').Window.get().showDevTools()` 显示调试窗口** ；最后将这个调试窗口移动到左上角，由于调试窗口在游戏窗口打开之后才打开，所以焦点会被转移到调试窗口，这时就 **需要 `window.focus();` 来将焦点返回至游戏窗口** 。

比较简单（但也知道了一些实用 API :)），我们去看点别的。

### 3. 在大分辨率下调整战斗时友/敌方角色位置

![actorPos](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/13.jpg "actorPos")

![enemyPos](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/14.jpg "enemyPos")

先看看 *Sprite_Actor（我方角色）* 部分：Yanfly 重写了 `Sprite_Actor` 的两个方法 `setActorHome` 和 `retreat`，不难得出 **前者用来设置角色的起始坐标，后者用来设置角色的移动动画** ，这个动画通过调用 `startMove` 实现：

![startMove](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/15.jpg "startMove")

![updatePosition](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/16.jpg "updatePosition")

一个角色的位置[^4]是由 `_homeX` 属性和 `_offsetX` 属性决定的，所以 `startMove` 方法通过改变 `_targetOffsetX`，从而间接改变 `_offsetX` 来实现角色的平移动画。

![updateMove](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/17.jpg "updateMove")

再看看 *Sprite_Enemy（敌方角色）* 部分：Yanfly 重写了 `Sprite_Enemy` 的 `setBattler` 方法，只是修改了敌人的起始坐标。

可以看出敌方角色在战斗开始时是没有平移动画的，但因为 `startMove` 方法属于 `Sprite_Battler`，而 `Sprite_Enemy` 与 `Sprite_Actor` 一样继承了 `Sprite_Battler` 的原型链，所以事实上 **我们可以用 `startMove` 给任何战斗时的角色添加平移动画** 。

1803 行的 `isSideView` 方法用于判断当前是否为横版战斗模式[^5]，可以看出下方的代码把敌人在 x 轴上的位置向右移动了一些（为什么要加这个判断还不是很清楚，）。

### 4. 调整各类数值上限

先看看金币上限是怎么修改的：

![maxGold](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/18.jpg "maxGold")

简单粗暴，只是封装了一下 MV 的 API， **重写 `Game_Party.prototype.maxGold` 方法就能设定金币的上限了** ，其他的值上限也是这样的吗？

我们来看看等级上限的修改：

![maxLevel](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/19.jpg "maxLevel")

这个代码主要逻辑分为三个部分：

第一部分，第一个 `for` 循环的前两句，初始化 `obj` 和 `notedata` 变量。`obj` 其实就是我们在 MV 里的 *数据库 - 角色* 标签页中定义的一个个可操作角色。比如 `group[0]` 得到的就是第 1 个角色（默认叫哈罗尔德的那位）；而 `notedata` 则是你在标签页中设置角色信息时， *备注* 一栏的处理后字符串。

第二部分，1157 行，`Yanfly.Param.MaxLevel` 的值直接赋给了 `obj.maxLevel` 变量，可见 **`obj.maxLevel` 就是每个角色的等级上限** 。

第三部分，是剩下的 `for` 循环。`notedata` 在这个循环里被解析，遇到形如 `<MAX LEVEL: 666>` 的字符串，就将该角色的等级上限设置为 666；遇到形如 `<INITIAL LEVEL: 233>` 的字符串，就将该角色的等级上限设置为 233[^6]。

综上所述，在 *备注* 里定义的等级上限优先级最高，其次是在脚本设置中定义的值。

那么这个 `processCORENotetags3` 方法的参数从何而来？

![isDatabaseLoaded](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/20.jpg "isDatabaseLoaded")

![_databaseFiles](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/21.jpg "_databaseFiles")

拨云见日，`$dataActors` 是我们在 MV 设定了角色信息后，存储在 `data/Actors.json` 经过处理后的信息。

事实上，其他诸如物品价格、最大持有数、为物品武器附加加成、技能习得所需等级的修改，都是 **通过在 *备注* 里添加 *自定义格式* 的字符串，然后在脚本运行时解析，最后达到修改游戏系统核心设置的效果** 。

这种做法我第一次见，实在佩服，原来备注可以这么用。至于哪些值能被修改，其实 **只要是写进了 json 里的数据，都是可以修改的** ，这里就不一一列举了。

### 5. 金币 window 相关

![drawCurrencyValue](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/22.jpg "drawCurrencyValue")

（`Yanfly.Icon.Gold` 是一个整数，是 `https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/system/IconSet.png` 的图标编号，默认的 313 则是那个贴了紫色蒙板的金块图标）

可见关键函数是 `drawIcon`：

![drawIcon](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/23.jpg "drawIcon")

这其实就是在切图[^7]啦。

所以， **`Window_Base.drawIcon` 可以用来绘制图标，这个图标的信息存储在 `https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/system/IconSet.png` 中** 。

至于绘制金币过量时的文字，则在上一张图的 2174 到 2177 行，可见， **`Window_Base.drawText` 可以用来绘制文字** 。

另外，2173 行的 `Yanfly.Util.toGroup` 方法，它的功能就是使用逗号格式化数字；2167 行则改变了显示金币字体的字号。

### 6. 是否在敌方被选为目标时闪烁

![Yanfly.Core.Sprite_Battler_updateSelectionEffect](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/24.jpg "Yanfly.Core.Sprite_Battler_updateSelectionEffect")

![Sprite_Battler_updateSelectionEffect](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/25.jpg "Sprite_Battler_updateSelectionEffect")

`Sprite_Battler` 的 `updateSelectionEffect` 方法在目标被选中时应该是会一直调用的，所以通过在 561 行自增 `_selectionEffectCount` ，令它对 30 求余（单位应该是帧），与后面的 `if` 语句相结合，从而达到每 15 帧改变蒙板颜色的效果。

回到 `Yanfly.Core.Sprite_Battler_updateSelectionEffect`，可以发现如果设置 `FlashTarget` 为 `false`，就会导致友方角色被选中时才闪烁，敌方角色被选中时它们则会一直贴着半透明的白色蒙板。

`startEffect` 方法干了什么？我们来看看：

![startEffect](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/26.jpg "startEffect")

可见，MV 的 API 提供了很多预设值，而 Yanfly 则用了 *whiten* 这一预设值，我们继续看看 `startWhiten` 做了什么：

![startWhiten](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/27.jpg "startWhiten")

只是设置了对应效果的持续时间，但是别忘了，`startEffect` 方法还做了两件事。一件事是在 1016 行，`this._effectType = effectType;`，这个 `_effectType` 变量在 `updateEffect` 方法中有很大用处：

![updateEffect](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/28.jpg "updateEffect")

`updateWhiten` 方法：

![updateWhiten](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/29.jpg "updateWhiten")

嗯？似乎这个效果持续时间只有 16 帧啊，实际效果却是在被选中时一直被蒙着白色蒙板，怎么回事？这就跟 `startEffect` 做的另一件事有关，那就是在 1040 行调用了 `revertToNormal` 方法。

![revertToNormal](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/30.jpg "revertToNormal")

由于 `Sprite.updateSelectionEffect` 方法会一直被 `Sprite.update` 方法调用（也就是不断重绘），所以重写了前者的 `Sprite_Battler.updateSelectionEffect` 方法也会被一直调用，而 Yanfly 将其再次重写时，对敌方被选中角色一直调用 `startEffect('whiten');` ，再加上 `revertToNormal` 方法，分析调用顺序后，我们就能得出结论： **这样设置的效果会在敌方角色失去选中时才正式开始，否则只会展示第 1 帧的效果** 。

验证一下：将 Yanfly 写的 `this.startEffect('whiten');` 改成 `this.startEffect('blink');` 试试，看看敌方角色被选中时会不会消失，这其实就是 *blink* 第 1 帧的效果。

综上所述，这样取消敌方目标的闪烁效果，其实是一种 *trick*，不过这也为我们今后要修改选中效果时提供了一些参考。

**跟选中效果关系紧密的方法：`Sprite_Battler.updateSelectionEffect`、`Sprite_Enemy.updateEffect`** ，这两者的重写可能有一点设计难度 :) 。

### 7. 字体相关

![standardFontFace](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/31.jpg "standardFontFace")

比较简单， **通过重写 `standardFontFace` 方法设置不同语言环境下的字体，通过 `$gameSystem.isChinese()` 判断是否为中文环境** 。

### 8. 添加 gague 边框

*gague* 其实就是 HP、MP、SP 条的称呼，那么给它们加上边框（outline）其实就是所谓的描边了。

![drawGauge](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/32.jpg "drawGauge")

关于绘制的逻辑基本没什么可以说的[^8]。需要注意的一个地方是 `this.contents` 的类型是 `Bitmap`，这个在第 3 节有提到，忘记了的话就再回去看看吧。

### 9. 在角色状态 window 绘制 TP 条

对比两个方法后就能知道 Yanfly 做了啥啦：

![drawActorSimpleStatus](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/33.jpg "drawActorSimpleStatus")

![drawActorSimpleStatus_origin](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/34.jpg "drawActorSimpleStatus_origin")

关于绘制的逻辑基本没什么可以说的，而我们 **从第一张图中可以知道，与绘制角色状态相关的 `Window_Base.*` 方法** 。

### 10. 其他

`YEP.CoreEngine.js` 还有其他方法没有在脚本最上方的注释里详细说明它们做了什么，但是研究它们却能知道很多关于 MV API 的经典用法。由于 MV 已经封装好了很多底层逻辑，而我们大多数时候想修改的是 UI，所以 `YEP.CoreEngine.js` 有很高的参考价值。

另外，`YEP.CoreEngine.js` 为 MV 的部分 API 添加了一些错误检查，如 `Game_Character.processMoveCommand`。

![processMoveCommand](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/35.jpg "processMoveCommand")

这能让错误信息提示得友好些。

`YEP.CoreEngine.js` 还重构了一些 MV API，比如 `Game_Map.updateVehicles`、`Game_Screen.updatePictures` ，但实际上它们的运行效率并没有不同，只是 MV API 用了 forEach 语句，而 Yanfly 将其展开了而已，可能今后会有所优化吧。

![updateVehicles_ori](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/37.jpg "updateVehicles_ori")

![updateVehicles](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/36.jpg "updateVehicles")

另外，`YEP.CoreEngine.js` 有个有趣的地方，在 2448 行重写了 `showNormalAnimation` 方法：

![showNormalAnimation](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/4/38.jpg "showNormalAnimation")

比起 MV API，这个方法多了对 `animation.position` （也就是 *动画 - 基本设置 - 位置* 的 *index* 值）的判断，如果动画的基本位置不是预设值范围（0 到 3），那么这个动画就没有延迟。不太懂为什么会有这个函数，可能其他 Yanfly 系列脚本需要用到？就留着这个疑问吧。

那么关于 `YEP.CoreEngine.js` 的探索就到这里，在本文的最后献给 Yanfly 大神膝盖 orz 。

- - -

[^1]: 实际上是调用了 `Scene_Map._spriteset` 的 `hideCharacters` 和 `showCharacters` 方法。`YEP_CoreEngine.js` 还封装了一些 MV 的其他 API，使开发者能在插件管理器中方便地设定一些东西，而开发者知道了这些 API 的存在后，以后想自己封装也能更快上手。

[^2]: 也就是 MV 的插件管理器中，选择加载哪个插件后，在 *参数* 一栏的设置。

[^3]: 得到这个统计的方法：使用正则表达式 `(Window)+.*.prototype.windowWidth =` 查看匹配个数。

[^4]: 更严谨地说是 **在 X 轴上的位置** ，但是这类处理往往会同时作用于 X 轴和 Y 轴，作用效果一样，所以为了简便，采用简略的说法，同时不再对 Y 的情况讨论。

[^5]: MV 使用的新战斗模式，不过以前也有人用 XP 还是 VA 写过横版战斗的 RPG，如《东方年代记》。

[^6]: Yanfly 在这里使用了正则表达式解析备注中的字符串，然后根据匹配结果选取子表达式解析。关于正则表达式的测试可以用这个网站： [RegExr](https://regexr.com/) ，很强大。

[^7]: 我又想到 [切图仔](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/extra-pixi/1-base.md) 了

[^8]: 这让我想到 Android 的自定义 View，以前所学的知识还是能时不时派上用场的。