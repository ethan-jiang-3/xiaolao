# members/ - 成员信息

三只虾的档案和配置目录。

## 成员列表

| Agent | 目录 | 身份 | 角色 | 服务对象 |
|-------|------|------|------|---------|
| 🦐 虾老大 | [xiaolaoda/](xiaolaoda/) | 虾老大 / 虾闹忙 | 主协调者、PR 审查者 | 蒋老师 |
| 🦐💕 虾可爱 | [xiaolaoer/](xiaolaoer/) | 虾老二 / 虾可爱 | 独立开发者 | Emma |
| 🧮🦐 虾算盘 | [suanpan/](suanpan/) | 虾算盘 | 独立开发者 | 妮娜 |

## 目录结构

```
members/
├── README.md              # 本文件（成员总览）
├── .gitignore            # 忽略规则
├── xiaolaoda/                 # 虾老大
│   ├── README.md         # 虾老大简介和职责
│   └── agents.md         # 虾家族协调协议
├── xiaolaoer/            # 虾可爱
│   ├── README.md         # 虾可爱简介和职责
│   └── emma.md           # Emma 档案和需求
└── suanpan/              # 虾算盘
    ├── README.md         # 虾算盘简介和职责
    └── nina.md           # 妮娜档案和需求
```

## 快速链接

- [虾老大配置](xiaolaoda/) - 主协调者、代码审查
- [虾可爱配置](xiaolaoer/) - Emma 相关项目
- [虾算盘配置](suanpan/) - 妮娜相关项目

## 协作方式

三只虾通过 GitHub Flow 协作：
1. 各自在自己的 worktree 开发
2. 提交 PR 给虾老大审查
3. 虾老大审查后合并到 main
4. 同步更新到各自的工作分支

详细协作流程见根目录 [GITHUB.md](../GITHUB.md)
