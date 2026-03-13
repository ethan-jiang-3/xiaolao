#!/usr/bin/env node

/**
 * xiaolao-helper - 虾家族 CLI 工具
 * 
 * 命令：
 *   weather <城市>    - 查询天气 (虾可爱)
 *   rate <金额> <源货币> <目标货币>  - 汇率换算 (虾算盘)
 */

const commands = {
  weather: async (args) => {
    console.log('🌤️  天气功能待实现 (虾可爱负责)');
    console.log('用法: xiaolao-helper weather <城市>');
  },
  
  rate: async (args) => {
    console.log('💱 汇率功能待实现 (虾算盘负责)');
    console.log('用法: xiaolao-helper rate <金额> <源货币> <目标货币>');
  },
  
  help: () => {
    console.log(`
🦐 xiaolao-helper - 虾家族 CLI 工具

用法: xiaolao-helper <命令> [参数]

命令:
  weather <城市>              查询城市天气
  rate <金额> <从> <到>       汇率换算
  help                        显示帮助

示例:
  xiaolao-helper weather 上海
  xiaolao-helper rate 100 USD CNY
`);
  }
};

async function main() {
  const args = process.argv.slice(2);
  let command = args[0] || 'help';
  
  // 处理 --help 和 -h
  if (command === '--help' || command === '-h') {
    command = 'help';
  }
  
  if (commands[command]) {
    await commands[command](args.slice(1));
  } else {
    console.log(`❓ 未知命令: ${command}`);
    commands.help();
    process.exit(1);
  }
}

main().catch(console.error);
