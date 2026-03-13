#!/usr/bin/env node

/**
 * xiaolao-helper - 虾家族 CLI 助手
 * 
 * 命令：
 *   rate <金额> <源货币> <目标货币>  - 汇率查询与换算
 */

const https = require('https');

// 支持的货币列表
const SUPPORTED_CURRENCIES = ['CNY', 'USD', 'EUR', 'JPY', 'HKD'];

// 货币名称映射
const CURRENCY_NAMES = {
  'CNY': '人民币',
  'USD': '美元',
  'EUR': '欧元',
  'JPY': '日元',
  'HKD': '港币'
};

/**
 * 汇率查询函数
 * 使用 exchangerate-api.com 的免费 API
 */
async function fetchExchangeRate(fromCurrency, toCurrency) {
  return new Promise((resolve, reject) => {
    // 使用 exchangerate-api.com 的免费端点
    const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.rates && json.rates[toCurrency]) {
            resolve({
              rate: json.rates[toCurrency],
              date: json.date,
              base: json.base
            });
          } else {
            reject(new Error(`无法获取 ${fromCurrency} 到 ${toCurrency} 的汇率`));
          }
        } catch (err) {
          reject(new Error('解析汇率数据失败: ' + err.message));
        }
      });
    }).on('error', (err) => {
      reject(new Error('请求汇率 API 失败: ' + err.message));
    });
  });
}

/**
 * rate 命令实现
 * 用法: rate <金额> <源货币> <目标货币>
 * 示例: rate 100 USD CNY
 */
async function rate(args) {
  // 检查参数数量
  if (args.length < 3) {
    console.log('❌ 参数不足');
    console.log('用法: rate <金额> <源货币> <目标货币>');
    console.log('示例: rate 100 USD CNY');
    console.log('');
    console.log('支持的货币: ' + SUPPORTED_CURRENCIES.join(', '));
    return;
  }

  const [amountStr, fromCurrency, toCurrency] = args;
  const amount = parseFloat(amountStr);

  // 验证金额
  if (isNaN(amount) || amount <= 0) {
    console.log('❌ 金额必须是正数');
    return;
  }

  // 标准化货币代码（转大写）
  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  // 验证支持的货币
  if (!SUPPORTED_CURRENCIES.includes(from)) {
    console.log(`❌ 不支持的源货币: ${fromCurrency}`);
    console.log('支持的货币: ' + SUPPORTED_CURRENCIES.join(', '));
    return;
  }

  if (!SUPPORTED_CURRENCIES.includes(to)) {
    console.log(`❌ 不支持的目标货币: ${toCurrency}`);
    console.log('支持的货币: ' + SUPPORTED_CURRENCIES.join(', '));
    return;
  }

  console.log(`🧮 正在查询汇率: ${amount} ${from} → ${to} ...`);
  console.log('');

  try {
    const result = await fetchExchangeRate(from, to);
    const convertedAmount = (amount * result.rate).toFixed(2);
    const rateFormatted = result.rate.toFixed(4);

    // 格式化输出
    const fromName = CURRENCY_NAMES[from] || from;
    const toName = CURRENCY_NAMES[to] || to;

    console.log('═══════════════════════════════════════');
    console.log('           💱 汇率换算结果');
    console.log('═══════════════════════════════════════');
    console.log(`  汇率日期: ${result.date}`);
    console.log(`  汇率基准: ${result.base}`);
    console.log('───────────────────────────────────────');
    console.log(`  ${fromName} (${from}) → ${toName} (${to})`);
    console.log(`  当前汇率: 1 ${from} = ${rateFormatted} ${to}`);
    console.log('───────────────────────────────────────');
    console.log(`  换算金额: ${amount} ${from}`);
    console.log(`  换算结果: ${convertedAmount} ${to}`);
    console.log('═══════════════════════════════════════');

  } catch (err) {
    console.log('❌ 查询失败: ' + err.message);
  }
}

/**
 * 显示帮助信息
 */
function showHelp() {
  console.log('');
  console.log('🦐 xiaolao-helper - 虾家族 CLI 助手');
  console.log('');
  console.log('命令:');
  console.log('  rate <金额> <源货币> <目标货币>  汇率查询与换算');
  console.log('');
  console.log('示例:');
  console.log('  node main.js rate 100 USD CNY   # 100美元换算成人民币');
  console.log('  node main.js rate 500 CNY EUR   # 500人民币换算成欧元');
  console.log('');
  console.log('支持的货币: CNY, USD, EUR, JPY, HKD');
  console.log('');
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  switch (command) {
    case 'rate':
      await rate(args.slice(1));
      break;
    default:
      console.log(`❌ 未知命令: ${command}`);
      showHelp();
  }
}

// 运行主函数
main().catch(err => {
  console.error('程序错误:', err);
  process.exit(1);
});
