#!/usr/bin/env node

/**
 * xiaolao-helper - 小龙虾助手 CLI 工具
 * 
 * 命令列表：
 *   weather <城市>    - 查询指定城市天气
 */

const https = require('https');

// 简单的 HTTP GET 请求封装
function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// 显示帮助信息
function showHelp() {
  console.log(`
🦐 小龙虾助手 xiaolao-helper

用法: node main.js <命令> [参数]

命令:
  weather <城市>    查询指定城市的天气
  help              显示帮助信息

示例:
  node main.js weather 北京
  node main.js weather Shanghai
`);
}

// 查询天气
async function weather(city) {
  if (!city) {
    console.log('❌ 请提供城市名称，例如: node main.js weather 北京');
    process.exit(1);
  }

  console.log(`🌤️  正在查询 ${city} 的天气...\n`);

  try {
    // 使用 wttr.in API 获取天气数据
    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;
    const response = await httpGet(url);
    const data = JSON.parse(response);

    if (!data || !data.current_condition || !data.current_condition[0]) {
      console.log('❌ 无法获取天气信息，请检查城市名称是否正确');
      process.exit(1);
    }

    const current = data.current_condition[0];
    const location = data.nearest_area ? data.nearest_area[0] : null;

    // 格式化输出
    console.log('╔══════════════════════════════════════╗');
    console.log(`║  🌤️  ${location ? location.areaName[0].value : city} 天气预报`.padEnd(39) + '║');
    console.log('╠══════════════════════════════════════╣');
    console.log(`║  🌡️  温度:     ${current.temp_C}°C (${current.temp_F}°F)`.padEnd(39) + '║');
    console.log(`║  🌈 天气:     ${current.lang_zh ? current.lang_zh[0].value : current.weatherDesc[0].value}`.padEnd(39) + '║');
    console.log(`║  💨 风力:     ${current.windspeedKmph} km/h ${current.winddir16Point}`.padEnd(39) + '║');
    console.log(`║  💧 湿度:     ${current.humidity}%`.padEnd(39) + '║');
    console.log(`║  👁️  能见度:   ${current.visibility} km`.padEnd(39) + '║');
    console.log('╚══════════════════════════════════════╝');

    // 额外建议
    const feelsLike = parseInt(current.FeelsLikeC);
    const temp = parseInt(current.temp_C);
    
    console.log('\n💡 贴心提示:');
    if (temp < 10) {
      console.log('   天气较冷，记得多穿点衣服哦～ 🧥');
    } else if (temp > 30) {
      console.log('   天气较热，注意防晒和补水～ 🌞');
    } else {
      console.log('   温度适宜，是个好日子呢～ 🌸');
    }
    
    if (current.humidity > 80) {
      console.log('   湿度较高，可能会感觉闷热～ 💦');
    }

  } catch (error) {
    if (error.message && error.message.includes('ENOTFOUND')) {
      console.log('❌ 网络连接失败，请检查网络设置');
    } else if (error.message && error.message.includes('Unexpected token')) {
      console.log(`❌ 城市 "${city}" 不存在，请检查城市名称`);
    } else {
      console.log('❌ 查询天气时出错:', error.message);
    }
    process.exit(1);
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'weather':
      await weather(args[1]);
      break;
    case 'help':
    case '--help':
    case '-h':
    default:
      showHelp();
      break;
  }
}

main();
