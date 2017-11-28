> 版本：v1.19
>
> 国内视频地址：[Bilibili - YEP.2 - Message Core](https://www.bilibili.com/video/av3174787/#page=6)
>
> 原地址：[yanfly.moe - YEP.2 - Message Core](http://yanfly.moe/2015/10/10/yep-2-message-core/)
> 
> 推荐将原地址的 [主页](http://yanfly.moe/yep/) 保存下来，作者 Yanfly 会一直保持脚本的更新。
> 
> 脚本源码地址可以在每个原地址网页中找到。本节的脚本源码在 [这里](http://yanfly.moe/plugins/en/YEP_MessageCore.js)。

# 脚本功能概述

> 这个脚本主要用于消息框的一些文字格式处理，在 MV 自带的 *`\.` 等待 1/4 秒* 这些控制字符的基础上扩展了许多其他控制字符，以及 *插件指令* 。
> 
> 这一节主要从源码 *Parameter Variables* 中定义的变量出发讲述脚本功能， **实际运用见本博客最后的 *扩展控制字符表* 和 *插件指令表*** 。
>
> *斜体* 表示不在之后分析。

1. *General*

    - 消息（Message）框可显示行数
    - 消息框宽度
    - 消息文本和头像的距离
    - 设置跳过对话快捷键、是否可以跳过
    - 文本自动换行相关（Word Wrapping、Description Wrap、Word Wrap Space、Tight Wrap），不支持中文

2. *Font*

    - 设置 Message Window 的：默认字体、中文字体、韩文字体、字号、字号范围、字号单次缩放量（即使用一次 `\{` 和 `\}` 时变化的幅度）
    - 对 Message Window 的文本描边
    - 在同一 Message Window 中呈现不同字体

3. Name Box

    - 设置 Name Box 的位置、内边距、背景色、字体颜色
    - Name Box 内文本变化时重新生成新 Name Box

# 脚本可设置参数

![parameters_1](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/1.jpg "parameters_1")

![parameters_2](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/2.jpg "parameters_2")

# 脚本实现原理

由于 `YEP_MessageCore.js` 中大部分功能都是对 MV API 的封装，所以博主只探索之前没有探索到的东西，那就是 **如何自定义 Window** 。

### 1. Window_NameBox 分析

Yanfly 自定义了一个 `Window_NameBox`，主要用于显示当前消息框发言者的名字。我们来看看它的初始化函数：

![initialize](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/3.jpg "initialize")

以及添加这个 `window` 的方式：

![createSubWindows](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/4.jpg "createSubWindows")

很容易看出初始化函数中的 `parentWindow` 是 `Window_Message`，也就是一般显示在游戏界面下方的消息框。1055 行初始化了 `_parentWindow` 变量，用于存储 `Window_Message` 的实例，将其作为父窗口。

1056 行调用了 `Window_Base.initialize`：

![Window_Base.initialize](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/5.jpg "Window_Base.initialize")

四个形参很好理解，它们是决定 `window` 的位置和大小的参数；`loadWindowskin` 方法则是读取 `img/system/Window.png` 文件。

第 20 行的 `move` 方法很有意思，我无论怎么找都找不到它的定义在哪里。

`updatePadding` 方法调用了 `standardPadding` 方法，后者返回 18，也就是说默认窗口的内边距是 18 像素；`updateBackOpacity` 方法原理一样，它返回的是 192，也就是默认窗口为半透明；`updateTone` 方法返回 `$gameSystem.windowTone()` 的值。

![updateTone](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/7.jpg "updateTone")

`createContents` 方法：

![createContents](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/6.jpg "createContents")

正如我们前面所探索到的，窗口的 `contents` 其实就是一个 `Bitmap` 实例，而 `contentsWidth` 方法自然返回的是宽度减去内边距乘以二：

![contentsWidth](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/8.jpg "contentsWidth")

`Window_Base.initialize` 还定义了三个属性，`_opening`、`_closing`、`_dimmerSprite`，暂时放下，回到 `Window_NameBox.initialize`。

`_text` 和 `_lastNameText` 应该是两个需要被显示出来的属性，暂定为空字符串；`_openness` 从 0 开始，在 `update` 方法被调用时通过 `updateOpen` 方法每次增加 32，然后在 `Window._openness` 的 `set` 方法中通过 `clamp` 函数锁定 `_openness` 的上限。

![update](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/9.jpg "update")

![updateOpen](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/10.jpg "updateOpen")

![Window._openness](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/11.jpg "Window._openness")

可以看出，`_openness` 作用于 `_windowSpriteContainer` 在 Y 轴方向的缩放。另外，观察各个属性的作用域后其实可以发现，目前 `Window_NameBox.initialize` 中定义的 `_openness` 属性是没有必要的，将其出现的地方注释掉效果其实一样（MV 源码在写 `Window_Base` 时也没有新定义一个 `_openness` 变量，而是直接用了父类的`openness` 属性）；`_closeCounter` 同理，注释后并无变化。

`deactivate` 和 `hide` 则是设置该窗口的活动性和可见性为 `false`：

![deactivate_hide](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/12.jpg "deactivate_hide")

这两个属性什么时候为 `true` 呢？在 `refresh` 方法被调用的时候：

![refresh](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/13.jpg "refresh")

需要注意的是，`refresh` 方法是 `Window_Base` 乃至 `Window` 类也没有的，`update` 则反之。所以我们能得出一个重要结论： **`update` 方法一直被调用，用于重绘，`refresh` 方法则被用于改变窗口状态以影响重绘** 。

如果我们把 `Window_NameBox.initialize` 的 `this.deactivate();` 和 `this.hide();` 注释掉，会发现在进行对话前有个空白 Window 会出现在游戏窗口的左上角，只有发生对话间接触发 `Window_NameBox.refresh` 方法，才能使游戏看起来正常运行。

另外有个有趣的地方：`Window_NameBox.windowHeight` 的内部其实调用了 `Window_Base.fittingHeight` 方法：

![windowHeight](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/14.jpg "windowHeight")

![fittingHeight](https://github.com/Sora-Shiro/RMMV-Learn/blob/master/img/5/15.jpg "fittingHeight")

利用行数乘行高减去基础内边距乘二得出窗口高度，是一种比较简便的写法。

好，现在我们能得到自定义 Window 的一种通用做法了。

### 2. 自定义 Window 通用做法

**自定义 Window 时，一般继承 `Window_Base` 的原型链，然后重写 `initialize` 定义初始化工作，接着重写 `update` 方法定义重绘工作，同时可以选择自定义 `refresh` 方法更改 *Window* 的状态，以影响 `update` 方法的结果。**

当然，这仅仅是初步工作，为了让自定义 Window 有更丰富的功能，我们还需要进一步探索。拭目以待吧。

- - -

# 附录：控制字符表、脚本指令表（待翻译）

### 1. 控制字符表（后面加 *Note* 表示仅消息窗口可用）

控制字符|功能
:-:|:-:
**Text Code**|**-----**
\\V[n]|替换为第 n 个变量的值
\\N[n]|替换为第 n 个角色的名字
\\P[n]|替换为第 n 个队伍成员的名字
\\G|替换为货币单位
\\C[n]|设置文本颜色为第 n 号
\\I[n]|绘制第 n 号图标
\\{|增加一个单位的字号
\\}|减小一个单位的字号
\\\\|替代为反斜线符号
\$|打开金币 window，可用于显示当前金钱值
\\.|等待 1/4 秒
\&#124;|等待 1 秒
\\!|等待键盘输入
\\>|立即显示剩余文本
\\<|取消显示剩余文本
\\^|显示文本后不等待输入
**Wait**|**-----**
\\w[x]|等待 x 帧（60 帧为 1 秒） *Note*
**NameWindow**|**-----**
\\n<x>|创建一个带有 x 字符串的 name box，靠左 *Note*
\\nc<x>|创建一个带有 x 字符串的 name box，居中 *Note*
\\nr<x>|创建一个带有 x 字符串的 name box，靠右 *Note*
**Line Break**|**-----**
&lt;br>|如果开启了 word wrap mode, 这个标签视为换行
**Position**|**-----**
\\px[x]|设置文本 x 坐标
\\py[x]|设置文本 y 坐标
**Outline**|**-----**
\\oc[x]|设置描边颜色
\\ow[x]|设置描边粗细度
**Font**|**-----**
\\fr|重置所有字体设置
\\fs[x]|设置字体字号
\\fn<x>|设置字体名
\\fb|切换粗体
\\fi|切换斜体
Actor|**-----**
\\af[x]|显示第 x 个角色的头像 *Note*
\\ac[x]|显示第 x 个角色的职业
\\an[x]|显示第 x 个角色的昵称
Party|**-----**
\\pf[x]|显示第 x 个队伍成员的头像 *Note*
\\pc[x]|显示第 x 个队伍成员的职业
\\pn[x]|显示第 x 个队伍成员的昵称
**Names**|**-----**
\\nc[x]|显示第 x 个职业名
\\ni[x]|显示第 x 个物品名
\\nw[x]|显示第 x 个武器名
\\na[x]|显示第 x 个防具名
\\ns[x]|显示第 x 个技能名
\\nt[x]|显示第 x 个状态名
**Icon Names**|**-----**
\\ii[x]|显示第 x 个物品名同时显示对应图标
\\iw[x]|显示第 x 个武器名同时显示对应图标
\\ia[x]|显示第 x 个防具名同时显示对应图标
\\is[x]|显示第 x 个技能名同时显示对应图标
\\it[x]|显示第 x 个状态名同时显示对应图标

### 2. 脚本指令表

脚本指令|功能
:-:|:-:
MessageRows 6|改变消息行数为 6，如果你正在使用多个 *显示文字* 事件，它们会被合并直到总行数超过 6 行，然后它们会以 6 行显示，剩下的行会被删除。（博主注：这不是个很好的特性，但这是 RM 一直有的问题）
MessageWidth 400|改变消息窗口宽度为 400 像素，这么小会切掉很多本来可以显示出来的文字，所以需要自己调整。
EnableWordWrap|开启自动换行。（博主注：不支持中文）
DisableWordWrap|关闭自动换行。（博主注：不支持中文）
EnableFastForward|开启跳过消息功能
DisableFastForward|关闭跳过消息功能