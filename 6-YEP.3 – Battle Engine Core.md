> 版本：v1.45
>
> 国内视频地址：[Bilibili - YEP.3 – Battle Engine Core](https://www.bilibili.com/video/av3174787/#page=7)
>
> 原地址：[yanfly.moe - YEP.3 – Battle Engine Core](http://yanfly.moe/2015/10/10/yep-3-battle-engine-core/)
> 
> 推荐将原地址的 [主页](http://yanfly.moe/yep/) 保存下来，作者 Yanfly 会一直保持脚本的更新。
> 
> 脚本源码地址可以在每个原地址网页中找到。本节的脚本源码在 [这里](http://yanfly.moe/plugins/en/YEP_BattleEngineCore.js)。

# 脚本功能概述

> 这个脚本大幅度改善并扩展了 MV 自带的战斗引擎，特别是 *Action Sequence Tags* 更是可以独立做一个知识体系。本节主要从源码的帮助 *@help* 注释出发简述该脚本的功能。

- 每回合直接进入角色命令窗口而不是队伍命令窗口（即默认战斗）
- 设置决定角色执行先后的因素（即角色速度，默认仅由 AGI 决定）
- 使用多重打击技能时锁定不死状态，这样可以等技能释放完成后再让目标死亡（需要确保有对应的不死状态 ID）
- 伤害计算文本合并快速显示
- 添加施法前摇动画
- 反击、魔法反射生效后，原施放对象也会有 Effect Animation，且该动画可自定义
- ***Action Sequence Tags***
- 其余见附录

# 脚本可设置参数

> 本小节参考源码中 *Parameter Variables* 部分。
> 
> 粗体表示今后可能会对其分析。

1. General

    - Action Speed，动作速度
    - Default System，战斗系统，可选择 dtb、atb、ctb、stb，后三者需要有支持脚本

2. Escape

    - Escape Ratio，逃跑成功率
    - Fail Escape Boost，每次逃跑失败后为下次逃跑增加的成功率

3. Animation

    - Animation Base Delay，设置动画间隔帧数
    - Animation Next Delay，设置顺序动画间隔帧数
    - Certain Hit Animation，设置 Certain Hit 动画
    - Physical Animation，设置攻击动画
    - Magical Animation，设置施法动画
    - Enemy Attack Animation，设置敌人攻击动画
    - Reflect Animation，设置反射类动画
    - Motion Waiting，连续的动画是否重叠播放（Play animations during performing an action）

4. FrontView

    - Front Position X，设置角色的初始 X 位置
    - Front Position Y，设置角色的初始 Y 位置
    - Front Actor Sprite，是否显示角色战斗精灵
    - Front Sprite Priority，设置战斗精灵的显示优先级

5. SideView

    - Home Position X，设置角色的初始 X 位置
    - Home Position Y，设置角色的初始 Y 位置
    - Side Sprite Priority，设置战斗精灵的显示优先级

6. Sprites

    - Default X Anchor，设置锚点 X 值
    - Default Y Anchor，设置锚点 Y 值
    - Step Distance，动作时偏离队伍的距离
    - Flinch Distance，受到伤害或躲避时移动的距离
    - Show Shadows，是否显示阴影

7. Damage Popups

    - Newest Popup Bottom，新的伤害值提示是否在之前的伤害值提醒的下方
    - Popup Overlap Rate，多个伤害值提示出现时会互相重叠，这个值用来调整重叠率
    - Critical Popup，设置暴击伤害值提示的颜色
    - Critical Duration，设置暴击伤害值提示的持续帧数

8. Tick-Settings

    该类设置针对 Tick-based 战斗系统。

    - Timed States，使用时间来代替回合计算状态持续时间
    - Timed Buffs，使用时间来代替回合计算加成持续时间
    - Turn Time，设置等效于 1 回合的时间
    - AI Self Turns，独立 AI 的回合计算

9. Window Settings

    - Lower Windows，设置技能和物品窗口在背景（scene）的下方
    - Window Rows，在 Lower Windows 模式下，设置显示技能和物品的行数
    - Command Window Rows，设置所有命令窗口的行数
    - Command Alignment，设置所有命令窗口的文本对齐方式
    - Start Actor Command，设置是否跳过队伍命令窗口，从而直接到角色命令窗口
    - Current Max，设置是否为 HP、MP 显示完整的 当前值/最大值 信息

10. Selection Help

    - **Mouse Over，能否用鼠标移动选择战斗精灵**
    - Select Help Window，选择角色和敌人时，是否显示帮助窗口
    - User Help Text，Ally Help Text，Allies Help Text，Enemy Help Text，Enemies Help Text，All Help Text，Random Help Text，帮助窗口的提示文字设置

11. Enemy Select

    - **Visual Enemy Select，能否用鼠标点击选择敌人**
    - Show Enemy Name，是否在 screen 显示敌人的名字
    - Show Select Box，在选择敌人的时候是否显示 Select Box
    - Enemy Font Size，Show Enemy Name 开启时名字的文本字号
    - Enemy Auto Select，设置哪个敌人是默认目标

12. Actor Select
    - **Visual Actor Select，能否用鼠标点击选择友军**

13. Battle Log

    - Show Emerge Text，显示“敌人出现了！”类信息
    - Show Pre-Emptive Text，显示“先发制人”类信息
    - Show Surprise Text，显示意外攻击类信息
    - Optimize Speed，优化显示速度
    - Show Action Text，显示动作信息
    - Show State Text，显示状态信息
    - Show Buff Text，显示加成信息
    - Show Counter Text，显示反击信息
    - Show Reflect Text，显示反射信息
    - Show Substitute Text，显示代替伤害文本
    - Show Fail Text，显示攻击失败文本
    - Show Critical Text，显示暴击文本
    - Show Miss Text，显示攻击被闪避文本
    - Show Evasion Text，显示闪避攻击文本
    - Show HP Text，显示 HP 变化文本
    - Show MP Text，显示 MP 变化文本
    - Show TP Text，显示 TP 变化文本

# Action Sequences

不得不说 Yanfly 真的很强大，这个完全可以独立出另一个 RM 开发类别了。

Action Sequences，动作序列，通过在备注里写下它，就可以实现很多丰富的功能。

Yanfly 甚至还编写了 3 个扩展的 [文档](https://onedrive.live.com/view.aspx?cid=5b384122eea0ef60&page=view&resid=5B384122EEA0EF60!1566&parId=5B384122EEA0EF60!131&authkey=!ADifjezQXuL8DSg&app=Word) 和 [编辑器](http://actionsequence.cf/) 。

- - -

# 附录：备注信息表、脚本指令表

### 1. 备注信息表

备注信息|可作用范围|功能
:-:|:-:|:-:
&lt;CENTER>|？|使战斗文本居中
&lt;Display Text: x>|技能、物品|设置显示文本
&lt;Display Icon: x>|技能、物品|设置显示图标
&lt;speed: +x>|技能、物品|设置速度加成
&lt;speed: -x>|技能、物品|设置速度反加成
&lt;Cast Animation: x>|技能|设置施法前摇动画
&lt;Reflect Animation ID: x>|角色、职业、敌人、武器、防具、状态|设置反射动画 *[1]*
&lt;Sprite Cannot Move>|角色、职业、敌人、武器、防具、状态|精灵攻击、施法时无法移动 *[2]*
&lt;Anchor Y: y.z>|角色、职业、武器、防具、状态|设置 X 轴的锚点 *[3]*
&lt;Anchor Y: y.z>|角色、职业、武器、防具、状态|设置 Y 轴的锚点 *[4]*
&lt;Attack Animation: x>|敌人|设置攻击动画
&lt;Action Start: x>|状态|设置持续数，单位是剩余行动初始点的次数 *[5]*
&lt;Action Start: x to y>|状态|同上，只是持续数为 x 到 y 之间的一个随机数
&lt;Action Start: x>|状态|设置持续数，单位是剩余战斗回合初始点的次数 *[6]*
&lt;Action Start: x to y>|状态|同上，只是持续数为 x 到 y 之间的一个随机数

\[1]: 优先级：角色、职业、敌人、武器、防具、状态、默认（即原动画）

\[2]: 优先级：角色、职业、敌人、武器、防具、状态、默认（即原动画）

\[3]: 优先级：状态、武器、防具、职业、角色、默认

\[4]: 优先级：状态、武器、防具、职业、角色、默认

\[5]: Remaining at the start of an action，不太好翻译。

\[6]: Remaining at the start of a battle turn

### 2. 脚本指令表

脚本指令|功能
:-:|:-:
setBattleSys DTB|设置战斗系统为 DTB（非战斗情况下使用）
