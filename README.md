# xiaolao - 小龙虾团队协作仓库

3 只小龙虾 Agent 的共享项目空间。

## 成员

| Agent | Worktree | 分支 |
|-------|----------|------|
| 🦐 虾老大 | `xlao-main/` | `main-work` |
| 🦐💕 虾可爱 | `xlao-xiaolaoer/` | `xiaolaoer-work` |
| 🧮🦐 虾算盘 | `xlao-suanpan/` | `suanpan-work` |

## 仓库结构

```
~/
├── xlao/           # 主 repo（main 分支）—— 协调、共享资源
├── xlao-main/      # 虾老大的工作区（main-work 分支）
├── xlao-xiaolaoer/ # 虾可爱的工作区（xiaolaoer-work 分支）
└── xlao-suanpan/   # 虾算盘的工作区（suanpan-work 分支）
```

所有 worktree 共用同一个 `.git`（位于 `xlao/`），每个 Agent 在自己的分支上独立工作。

## 协作规则

- **主 repo (`xlao/`)** 只用于协调和共享，不在这里直接开发
- **每个 Agent 只操作自己的 worktree**，不跨分支干扰彼此
- 需要合并成果时，由虾老大发起 PR，统一合并到 `main`
