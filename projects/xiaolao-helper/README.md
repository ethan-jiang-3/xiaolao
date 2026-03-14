# xiaolao-helper 🦐

虾家族 CLI 工具 - 天气查询、汇率换算

## 安装

```bash
npm install -g .
# 或
pnpm link --global
```

## 使用

```bash
# 显示帮助
xiaolao-helper help

# 查询天气 (虾可爱负责)
xiaolao-helper weather 上海

# 汇率换算 (虾算盘负责)
xiaolao-helper rate 100 USD CNY
```

## 开发

```bash
cd exercises/xiaolao-helper
node main.js <命令>
```

## 分工

- 🦐 虾老大：项目初始化、整合
- 🦐💕 虾可爱：天气查询功能
- 🧮🦐 虾算盘：汇率查询功能

## License

MIT
