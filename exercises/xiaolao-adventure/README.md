# 虾游记 (Xiaolao Adventure)

三虾协作开发的文字冒险游戏。

## 开发团队

- 🦐 **虾老大** - 游戏引擎
- 🦐💕 **虾可爱** - 剧情系统  
- 🧮🦐 **虾算盘** - 战斗/数值系统

## 快速开始

```bash
# 安装依赖
npm install

# 构建
npm run build

# 运行游戏
npm start

# 开发模式
npm run dev

# 运行测试
npm test

# 测试覆盖率
npm run test:coverage
```

## 项目结构

```
src/
├── engine/          # 游戏引擎（虾老大）
├── story/           # 剧情系统（虾可爱）
└── battle/          # 战斗系统（虾算盘）
```

## 文档

- [架构设计](docs/architecture.md)
- [剧情设计](docs/story-design.md)
- [数值设计](docs/balance.md)
