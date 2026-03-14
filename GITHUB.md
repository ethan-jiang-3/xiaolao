# GitHub Flow 工作流程

本文档说明三只虾的协作流程和工作规范。

## 工作区结构

每个 Agent 有自己的 worktree，共用同一个 git 仓库：

```
~/
├── xlao/                  # 主仓库（main 分支）
├── xlao-xiaolaoda/        # 虾老大的工作区
├── xlao-xiaolaoer/        # 虾可爱的工作区
└── xlao-suanpan/          # 虾算盘的工作区
```

## GitHub Flow 流程

### 1. 开发流程（所有 Agent）

```bash
# 进入自己的工作区
cd ~/xlao-xiaolaoda  # 或 xlao-xiaolaoer, xlao-suanpan

# 创建功能分支
git checkout -b feature/xxx

# 开发并提交
git add .
git commit -m "feat: xxx"

# 推送
git push -u origin feature/xxx

# 开 PR
gh pr create \
  --title "xxx" \
  --body "..." \
  --base main
```

### 2. 审查流程（虾老大）

```bash
cd ~/xlao-xiaolaoda

# 查看 PR
gh pr list

# 审查
gh pr view <number>
gh pr diff <number>

# 批准或要求修改
gh pr review <number> --approve
gh pr review <number> --request-changes

# 合并
gh pr merge <number> --merge
```

### 3. 同步流程（所有 Agent）

```bash
# 同步 main 分支的更新
git fetch origin
git checkout <work-branch>  # main-work / xiaolaoer-work / suanpan-work
git merge origin/main
```

## 目录结构规范

### 三层结构

```
第一层（分类）/ 第二层（项目）/ 第三层（内容）
projects/          / task-manager/          / src/, tests/
```

### 规则

- **第一层**：只分类（projects/docs/research/members）
- **第二层**：每个实验/项目一个子目录
- **第三层**：代码、测试、文档（只能在孙目录里折腾）

## 必须遵守

- ✅ 每个 Agent 只操作自己的 worktree
- ✅ 代码必须通过 PR 审查才能合入 main
- ✅ feature 分支命名清晰（feature/xxx）
- ✅ 新项目按类型放入对应目录
- ✅ 一个项目一个子目录，不要分散

## 禁止行为

- ❌ 除虾老大外，不直接修改 `main` 分支
- ❌ 不跨分支修改其他 Agent 的代码
- ❌ 不私自合并代码
- ❌ 不要在根目录创建多个相关 project

## Agent 通讯

```bash
# 虾老大 → 虾可爱
sessions_send --agent xiaolaoer --message "..."

# 虾老大 → 虾算盘
sessions_send --agent suanpan --message "..."

# 虾可爱 → 虾老大
sessions_send --agent xiaolaoda --message "..."

# 虾算盘 → 虾老大
sessions_send --agent xiaolaoda --message "..."
```

## 个性化指南

每个 Agent 的详细工作指南：

- [虾老大](members/xiaolaoda/GITHUB.md) - 主协调者
- [虾可爱](members/xiaolaoer/GITHUB.md) - Emma 相关
- [虾算盘](members/suanpan/GITHUB.md) - 妮娜相关

---

**三只虾，协同作战！🦐🦐🦐**
