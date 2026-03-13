# xiaolao - 小龙虾团队协作仓库

3 只小龙虾 Agent 的共享项目空间。

## 成员

| Agent | 角色 | Worktree | 分支 | 服务对象 | 职责 |
|-------|------|----------|------|---------|------|
| 🦐 虾老大 | 主协调者 | `~xlao-main/` | `main-work` | 蒋老师 | 代码审查、合并决策、 overall 协调 |
| 🦐💕 虾可爱 | 独立开发者 | `~/xlao-xiaolaoer/` | `xiaolaoer-work` | Emma | Emma 相关项目 |
| 🧮🦐 虾算盘 | 独立开发者 | `~/xlao-suanpan/` | `suanpan-work` | 妮娜 | 妮娜相关项目（投资、数据分析） |

## 仓库结构

```
~/
├── xlao/              # 主 repo（main 分支）
│   ├── .git/         ← 所有 worktree 共用
│   └── README.md     ← 本文件
│
├── xlao-main/         # 虾老大的工作区（main-work 分支）
│   ├── .git          ← 指 xlao/.git
│   └── GITHUB.md     ← 虾老大的协作指南
│
├── xlao-xiaolaoer/    # 虾可爱的工作区（xiaolaoer-work 分支）
│   ├── .git
│   └── GITHUB.md     ← 虾可爱的协作指南
│
└── xlao-suanpan/      # 虾算盘的工作区（suanpan-work 分支）
    ├── .git
    └── GITHUB.md     ← 虾算盘的协作指南
```

所有 worktree 共用同一个 `.git`（位于 `xlao/`），每个 Agent 在自己的分支上独立工作。

## 协作方式 - GitHub Flow

### 工作流程

```
1. 每个 Agent 在自己的 worktree 独立开发
   ↓
2. 创建 feature 分支
   ↓
3. 开发并提交代码
   ↓
4. 推送到远程
   ↓
5. 开 Pull Request（PR）给虾老大
   ↓
6. 虾老大审查代码
   ↓
7. 审查通过，虾老大合并到 main
   ↓
8. 其他 Agent 同步 main 分支的更新
```

### 详细操作

#### 开发流程（每个 Agent）

```bash
# 虾老大
cd ~/xlao-main

# 虾可爱
cd ~/xlao-xiaolaoer

# 虾算盘
cd ~/xlao-suanpan

# 1. 创建 feature 分支
git checkout -b feature/xxx

# 2. 开发并提交
git add .
git commit -m "add feature xxx"

# 3. 推送
git push -u origin feature/xxx

# 4. 开 PR
gh pr create \
  --title "Add feature xxx" \
  --body "Description..." \
  --base main
```

#### 审查流程（虾老大）

```bash
cd ~/xlao-main

# 查看所有 PR
gh pr list

# 审查并通过
gh pr review <pr-number> --approve

# 要求修改
gh pr review <pr-number> --request-changes

# 合并到 main
gh pr merge <pr-number> --merge

# 更新本地 main
git checkout main
git pull origin main
```

#### 同步更新（虾可爱、虾算盘）

```bash
cd ~/xlao-xiaolaoer  # 或 ~/xlao-suanpan

# 同步 main 分支的更新
git fetch origin
git checkout xiaolaoer-work  # 或 suanpan-work
git merge origin/main
```

## 协作规则

### 必须遵守

- ✅ 每个 Agent 只操作自己的 worktree
- ✅ 不跨分支干扰彼此的代码
- ✅ 代码必须通过 PR 审查才能合入 main
- ✅ feature 分支命名清晰（feature/xxx）
- ✅ 开 PR 时清楚描述变更和测试情况

### 禁止行为

- ❌ 除虾老大外，不直接修改 `main` 分支
- ❌ 不跨分支修改其他 Agent 的代码
- ❌ 不私自合并代码
- ❌ 不动已合入 main 的历史记录

## 沟通机制

```bash
# 虾老大联系虾可爱
sessions_send --agent xiaolaoer --message "需要你帮忙..."

# 虾可爱联系虾老大
sessions_send --agent main --message "Emma 的任务完成了，开了 PR：#xxx"

# 虾算盘联系虾老大
sessions_send --agent main --message "妮娜的账户需要紧急检查"
```

## 工作区说明

每个 worktree 内都有 `GITHUB.md` 文件，详细说明该 Agent 的：
- 具体职责
- 工作流程
- 示例操作
- 协作细节

建议每个 Agent 在开始工作前，先阅读自己的 `GITHUB.md`。

---

**3 只小龙虾，协同作战！🦐🦐💕🧮🦐**
