> 版本：v1.07
>
> 国内视频地址：[Bilibili - YEP.7 – Victory Aftermath](https://www.bilibili.com/video/av3174787/#page=12)
>
> 原地址：[yanfly.moe - YEP.7 – Victory Aftermath](http://yanfly.moe/2015/10/13/yep-7-victory-aftermath/)
> 
> 推荐将原地址的 [主页](http://yanfly.moe/yep/) 保存下来，作者 Yanfly 会一直保持脚本的更新。
> 
> 脚本源码地址可以在每个原地址网页中找到。本节的脚本源码在 [这里](https://www.dropbox.com/s/iyf0pzmpwfozo8k/YEP_VictoryAftermath.js?dl=0)。

# 脚本功能概述

本脚本主要用于更改战斗胜利的结算信息。


# 脚本可设置参数

1. General

- Victory Order，胜利结算窗口弹出顺序，默认为 exp custom drops，分别表示经验窗口、自定义窗口、掉落物品窗口。

2. BGM

- Victory BGM，胜利背景音乐。
- BGM Volume，调整 BGM 音量。
- BGM Pitch，调整 BGM 音调。
- BGM Pan，调整 BGM 声道。

3. Battle Results

- Cheer Wait，显示胜利结算信息前等待时间，默认 90 帧。
- Battle Results Text，替代显示“战斗结果”标题的文本。
- Battle Drops Text，替代显示“物品掉落”标题的文本。

4. EXP Window

- Font Size，字号。
- Level Up Text，替代显示“升级啦”的文本。
- Max Level Text，替代显示“最高等级”的文本。
- Show Skills Learned，是否在升级时显示习得的技能。
- Gained EXP Text，替代显示“获取经验”的文本。
- Gained EXP Format，替代显示获取多少经验的文本。
- EXP Gauge Color 1，EXP 条的显示颜色 1
- EXP Gauge Color 2，EXP 条的显示颜色 2
- Level Gauge Color 1，升级时 EXP 条的显示颜色 1
- Level Gauge Color 2，升级时 EXP 条的显示颜色 2
- Gauge Ticks，EXP 条增加动画的时间，1 tick 为 4 帧，默认为 15 tick。
- Tick SE，EXP 条增加的时候的音效。
- Tick Volume，音效的音量。
- Tick Pitch，音效的音调。
- Tick Pan，音效的声道。

# 脚本指令表

脚本指令|功能
:-:|:-:
DisableVictoryAftermath|禁止胜利结算更改，取消胜利结算音乐
EnableVictoryAftermath|开启胜利结算更改
DisableVictoryMusic|禁止胜利结算音乐
EnableVictoryMusic|开启胜利结算音乐