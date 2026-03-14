# 虾游记架构设计

> 作者：@虾老大

## 1. 系统概述

**虾游记（Xiaolao Adventure）** 是一个以文字叙事为核心、结合分支剧情与回合制战斗的 TypeScript 冒险游戏项目。

项目当前的目标不是直接把所有玩法揉在一个大模块里，而是把“游戏运行控制”“剧情推进”“战斗结算”“状态持久化”拆成职责清晰、边界明确的模块，便于多人协作、单元测试和后续扩展。

### 核心功能

- **游戏主循环**：由 `GameEngine` 统一驱动游戏运行状态与系统同步。
- **剧情推进**：由 `StoryManager` 和 `DialogueSystem` 负责对话、节点跳转、选项分支与上下文数据。
- **回合制战斗**：由 `BattleSystem` 负责战斗初始化、行动执行、回合推进与奖励结算。
- **场景切换**：由 `SceneManager` 记录当前场景、切换历史和切换轨迹。
- **状态管理**：由 `StateManager` 维护游戏运行中的状态快照，并持久化到 `localStorage`。
- **存档/读档**：由 `SaveManager` 负责游戏状态 JSON 序列化与恢复。

### 总体设计目标

- **职责分离**：引擎、剧情、战斗、状态、存档各自独立。
- **低耦合**：模块通过清晰接口交互，而不是互相直接操作内部细节。
- **易测试**：核心逻辑可以在 Node/Jest 环境中单独验证。
- **可扩展**：后续可继续接入 UI、音效、任务系统、地图系统等能力。

---

## 2. 架构图

下面的关系图展示了当前系统中的主要模块依赖关系：

```text
┌──────────────────────────────────────────────────────┐
│                   GameEngine                         │
│          游戏主引擎 / 主循环 / 系统协调层              │
└───────────────┬───────────────┬───────────────┬──────┘
                │               │               │
                │               │               │
                ▼               ▼               ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │ SceneManager │ │ StateManager │ │ SaveManager  │
        │ 场景切换管理  │ │ 运行状态管理  │ │ 存档与读档    │
        └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
               │                │                │
               │                │                │
               │                └────────┬───────┘
               │                         │
               ▼                         ▼
        ┌──────────────┐         ┌──────────────┐
        │ StoryManager │         │ localStorage │
        │ 剧情系统入口  │         │ 浏览器持久化  │
        └──────┬───────┘         └──────────────┘
               │
               ▼
        ┌──────────────┐
        │ DialogueSystem│
        │ 对话/选项/分支 │
        └──────────────┘

                GameEngine
                    │
                    ▼
            ┌──────────────┐
            │ BattleSystem │
            │ 回合制战斗    │
            └──────────────┘
```

### 分层理解

```text
应用协调层
└── GameEngine

领域能力层
├── StoryManager / DialogueSystem
├── BattleSystem
├── SceneManager
├── StateManager
└── SaveManager

基础设施层
└── localStorage / JSON 序列化
```

---

## 3. 模块说明

### 3.1 GameEngine

`GameEngine` 是整个系统的协调中心，是“游戏怎么运行”的统一入口，而不是“所有业务都自己实现”的超级类。

#### 核心职责

- 启动游戏：执行 `start()` 初始化起始场景与剧情。
- 驱动主循环：通过 `gameLoop()` 推进引擎 tick。
- 协调剧情系统：通过 `progressStory()` 推进剧情选项。
- 协调战斗系统：通过 `startBattle()` 触发战斗流程。
- 同步运行状态：把当前引擎状态写入 `StateManager`。
- 提供快照：通过 `getSnapshot()` 暴露当前游戏整体状态。

#### 对外接口

- `start(startSceneId?: string)`：启动游戏。
- `gameLoop()`：执行一次主循环。
- `pause()` / `resume()` / `stop()`：控制运行阶段。
- `progressStory(optionId: string)`：推进剧情分支。
- `startBattle(player, enemies)`：开始战斗。
- `getSnapshot()`：获取当前总览快照。

#### 设计定位

`GameEngine` 不直接管理剧情节点内容，也不实现伤害公式；它的职责是把多个子系统组织起来，确保它们在统一的运行节奏下工作。

---

### 3.2 SceneManager

`SceneManager` 负责“玩家现在在哪个场景，以及怎么从一个场景切到另一个场景”。

#### 核心职责

- 保存当前场景 `currentScene`
- 处理场景切换 `transitionTo(sceneId)`
- 记录场景历史 `getHistory()`
- 记录切换日志 `getTransitionLog()`
- 支持查询上一个场景 `getPreviousScene()`
- 支持重置场景状态 `reset()`

#### 适用场景

- 游戏启动时进入初始场景
- 剧情推进后从海滩切到村庄
- 战斗结束后返回原场景或进入奖励场景
- 读档后恢复历史场景轨迹

#### 设计定位

`SceneManager` 不关心为什么切换场景，它只负责**可靠记录和执行场景切换**。

---

### 3.3 StateManager

`StateManager` 负责保存游戏运行过程中的共享状态，并在可用时持久化到 `localStorage`。

#### 核心职责

- 获取状态：`getState(key)`
- 设置状态：`setState(key, value)`
- 批量写入：`setStates(partialState)`
- 整体替换：`replaceState(nextState)`
- 删除/清空：`removeState()`、`clear()`
- 状态持久化：`persist()`
- 启动恢复：`hydrate()`

#### 当前保存的典型状态

- `engine.tick`
- `engine.loopState`
- `scene.current`
- `scene.history`
- `story.status`
- `battle.state`
- `battle.turn`
- `battle.lastResult`

#### 设计定位

`StateManager` 是一个轻量级键值状态中心，适合当前项目规模。它不追求复杂状态机或全局事件总线，而是优先满足：

- 可读
- 可测
- 可持久化
- 易于和存档系统对接

---

### 3.4 SaveManager

`SaveManager` 负责将当前游戏状态打包为可保存的数据结构，并以 JSON 形式保存或恢复。

#### 核心职责

- 保存游戏：`save()`
- 加载游戏：`load()`
- 获取存档结构：`getSaveData()`
- 应用存档：`applySaveData(saveData)`

#### 存档内容

当前存档模型 `SaveData` 主要包含：

- `version`：存档版本号
- `timestamp`：存档时间戳
- `currentScene`：当前场景
- `sceneHistory`：场景历史
- `state`：状态管理器中的状态快照

#### 设计定位

`SaveManager` 不直接决定“哪些业务逻辑要恢复”，它只做两件事：

1. 组织可序列化数据
2. 把数据应用回 `SceneManager` 与 `StateManager`

这种方式让存档系统保持简单稳定，也便于未来做版本迁移。

---

### 3.5 StoryManager

`StoryManager` 是剧情系统的统一入口，对外屏蔽更底层的剧情节点注册与角色装配细节。

#### 核心职责

- 创建并持有 `DialogueSystem`
- 创建并持有 `CharacterManager`
- 注册全部角色信息
- 注册全部对话节点
- 提供 `startGame()` 启动初始剧情
- 提供 `getStatus()` 输出剧情摘要

#### 对外暴露的能力

- 启动游戏剧情
- 查询剧情是否激活
- 查询当前节点、访问数量、历史长度等状态
- 通过内部 `dialogueSystem` 继续进行选项推进

#### 设计定位

`StoryManager` 是剧情域的 Facade（门面）层：

- 对引擎提供简洁接口
- 对内部剧情内容保持封装
- 便于后续替换剧情资源来源

---

### 3.6 BattleSystem

`BattleSystem` 是回合制战斗核心，负责战斗中的规则计算与结果判定。

#### 核心职责

- 初始化战斗：`startBattle(player, enemies)`
- 计算行动顺序：`getActionOrder()`
- 执行动作：`executeAction(action)`
- 处理攻击/道具/逃跑
- 更新 Buff 持续时间
- 检查胜负状态
- 计算奖励：`calculateRewards()`
- 输出战斗日志与结果

#### 当前支持的战斗动作

- `ATTACK`：普通攻击
- `ITEM`：使用物品
- `ESCAPE`：尝试逃跑
- `SKILL`：类型已预留，便于扩展技能系统

#### 设计定位

`BattleSystem` 专注战斗规则本身，不承担剧情跳转、存档、场景切换等外围事务。这些协作行为由 `GameEngine` 在更高层统一组织。

---

## 4. 数据流

本节描述游戏在典型运行场景下，各模块之间的数据如何流动。

### 4.1 游戏启动流程

```text
用户/入口
  │
  ▼
GameEngine.start(startSceneId)
  │
  ├─> SceneManager.transitionTo(startSceneId)
  │      └─ 更新 currentScene 与 sceneHistory
  │
  ├─> StoryManager.startGame()
  │      └─ DialogueSystem.start('beach_start')
  │
  ├─> GameEngine.gameLoop()
  │
  └─> StateManager.setState(...)
         ├─ engine.tick
         ├─ engine.loopState
         ├─ scene.current
         ├─ scene.history
         ├─ story.status
         └─ battle.state / battle.turn
```

#### 启动阶段要点

- `GameEngine` 决定“何时启动”。
- `SceneManager` 决定“起点场景是什么”。
- `StoryManager` 决定“从哪个剧情节点开始”。
- `StateManager` 负责把当前整体状态落盘或缓存。

---

### 4.2 场景切换流程

```text
剧情选择 / 游戏事件
  │
  ▼
GameEngine 或其他上层调用者
  │
  ▼
SceneManager.transitionTo(sceneId)
  │
  ├─ 更新 currentScene
  ├─ 写入 history
  └─ 写入 transitionLog
        │
        ▼
GameEngine.gameLoop()
  │
  ▼
StateManager.setState('scene.current', ...)
StateManager.setState('scene.history', ...)
```

#### 场景切换的关键特性

- 场景切换历史被保留，可用于回退、回放和调试。
- 场景状态会同步进 `StateManager`，为存档和恢复提供基础。
- `SceneManager` 本身不耦合剧情逻辑，因此可被剧情、战斗、任务等系统复用。

---

### 4.3 战斗流程

```text
剧情事件 / 玩家触敌
  │
  ▼
GameEngine.startBattle(player, enemies)
  │
  ├─> BattleSystem.startBattle(...)
  │      ├─ 初始化单位列表
  │      ├─ 重置回合数
  │      ├─ 设置战斗状态为 IN_PROGRESS
  │      └─ 记录战斗开始日志
  │
  ├─> StateManager.setState('battle.lastResult', result)
  └─> GameEngine.gameLoop()

随后每个回合：

BattleSystem.executeAction(action)
  │
  ├─ 处理攻击 / 道具 / 逃跑
  ├─ 更新 Buff
  ├─ 检查胜负
  └─ 推进 turn
        │
        ▼
GameEngine.gameLoop()
  │
  ▼
StateManager 同步 battle.state / battle.turn
```

#### 战斗结束后的结果流向

- `BattleSystem` 负责给出胜负结果与奖励。
- `GameEngine` 负责把结果同步到全局状态。
- 未来可以由上层 UI 或剧情逻辑根据结果触发：
  - 奖励结算
  - 剧情分支
  - 场景返回
  - 自动存档

---

### 4.4 存档与读档流程

```text
保存游戏
  │
  ▼
SaveManager.save()
  │
  ├─ 读取 SceneManager.currentScene
  ├─ 读取 SceneManager.getHistory()
  ├─ 读取 StateManager.getAllState()
  ├─ 组合为 SaveData
  └─ JSON.stringify(...) -> localStorage

加载游戏
  │
  ▼
SaveManager.load()
  │
  ├─ 从 localStorage 读取 JSON
  ├─ JSON.parse(...)
  └─ applySaveData(saveData)
         ├─ StateManager.replaceState(state)
         └─ SceneManager.reset()/transitionTo(...)
```

#### 存档设计特点

- 存档结构明确、简单，便于调试。
- JSON 格式天然适合本项目当前的数据规模。
- `version` 字段为未来存档兼容升级预留空间。

---

## 5. 设计决策

### 5.1 为什么使用 `GameEngine` 作为协调中心

如果剧情、战斗、场景、状态互相直接调用，会很快出现以下问题：

- 依赖关系混乱
- 修改一个系统容易影响多个系统
- 测试时难以隔离
- 主流程不清晰

因此当前架构选择让 `GameEngine` 作为上层协调者，统一调度：

- 谁先启动
- 谁在循环中同步
- 哪些数据进入全局状态

这样做的好处是：**流程集中，领域逻辑仍然分散且可维护。**

---

### 5.2 为什么把场景、状态、存档拆开

这三个模块看起来都和“游戏状态”有关，但职责不同：

- `SceneManager`：只关心场景与切换历史
- `StateManager`：只关心键值状态与持久化
- `SaveManager`：只关心存档格式与恢复动作

如果把它们合并成一个大状态类，会导致：

- API 不清晰
- 场景逻辑和存档逻辑耦合
- 很难单独测试边界条件

拆分之后，每个模块都更小、更容易理解。

---

### 5.3 为什么 `StoryManager` 和 `BattleSystem` 保持独立

剧情系统和战斗系统是两个不同的领域：

- 剧情系统关注节点、选项、角色、上下文变量
- 战斗系统关注单位属性、回合顺序、动作结算、胜负判断

它们有交集，但不应该彼此侵入实现细节。

当前设计下：

- 剧情触发战斗，由 `GameEngine` 组织
- 战斗影响剧情，也通过 `GameEngine` 或状态层回传

这可以避免“剧情类里充满战斗公式”或“战斗类里写剧情跳转”的问题。

---

### 5.4 为什么使用 `localStorage + JSON`

对于当前项目规模，`localStorage + JSON` 是一个非常实用的选择：

- 实现简单
- 浏览器环境天然支持
- 调试方便，可直接查看存档内容
- 与 TypeScript 的对象结构天然契合

这比一开始就引入数据库、二进制序列化或复杂中间层更合适。

同时，当前实现还通过存储接口抽象做了兼容：

- 在浏览器环境可直接使用 `localStorage`
- 在 Jest/Node 环境可注入内存存储进行测试

---

### 5.5 为什么当前主循环是“显式推进”而不是实时帧循环

目前的 `gameLoop()` 是一次调用推进一次状态同步，而不是 `requestAnimationFrame` 或固定帧率循环。

这是有意为之，原因包括：

- 文字冒险与回合制玩法对实时帧更新要求不高
- 显式推进更利于测试和断点调试
- 可以先稳定逻辑层，再根据需要对接图形/UI 层

未来如果接入前端界面，可以在 UI 层再包一层调度器，而不必重写引擎核心。

---

## 6. 后续扩展建议

基于当前架构，未来可以自然扩展以下模块：

- **任务系统**：记录主线/支线任务状态
- **地图系统**：管理场景之间的空间连接关系
- **事件系统**：统一处理全局广播与订阅
- **UI 适配层**：将当前控制台/逻辑层接入 Web 前端
- **存档版本迁移器**：处理不同版本存档兼容问题
- **战斗 AI**：给敌方单位增加策略决策能力

当前架构的核心价值在于：这些新增能力大多可以作为新模块接入，而不需要推翻已有结构。

---

## 7. 总结

虾游记当前采用的是一种**轻量、清晰、可测试的模块化架构**：

- `GameEngine` 负责统一协调
- `StoryManager` 负责剧情入口
- `BattleSystem` 负责战斗规则
- `SceneManager` 负责场景切换
- `StateManager` 负责共享状态与持久化
- `SaveManager` 负责存档和恢复

这种设计非常适合当前项目阶段：

- 对协作开发友好
- 对测试友好
- 对后续扩展友好
- 对维护成本友好

随着项目规模增长，这套架构仍然可以继续演进，而不需要从“单体脚本式实现”重新推倒重来。
