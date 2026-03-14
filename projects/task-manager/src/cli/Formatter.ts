/**
 * Task Manager CLI - 格式化输出
 * @虾可爱
 * 
 * 设计决策：
 * 1. 使用 chalk 添加颜色，提升可读性
 * 2. 使用 cli-table3 创建表格输出
 * 3. 适配核心引擎 Task 类型
 * 4. 统一的输出风格
 */

import chalk from 'chalk';
import Table from 'cli-table3';
import { Task, TaskPriority } from './engine/Task';

/**
 * 优先级颜色映射
 */
const priorityColors: Record<TaskPriority, chalk.Chalk> = {
  high: chalk.red.bold,
  medium: chalk.yellow,
  low: chalk.green
};

/**
 * 优先级中文名称
 */
const priorityNames: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低'
};

/**
 * 格式化任务列表为表格
 * @虾可爱
 */
export function formatTaskTable(tasks: Task[]): string {
  if (tasks.length === 0) {
    return chalk.gray('暂无任务');
  }

  const table = new Table({
    head: [
      chalk.cyan('ID'),
      chalk.cyan('标题'),
      chalk.cyan('状态'),
      chalk.cyan('优先级'),
      chalk.cyan('创建时间')
    ],
    colWidths: [15, 30, 10, 10, 25]
  });

  tasks.forEach(task => {
    const status = task.status === 'completed' 
      ? chalk.green('✓ 完成') 
      : chalk.yellow('○ 待办');
    
    const priority = priorityColors[task.priority](priorityNames[task.priority]);
    
    table.push([
      task.id.slice(0, 12) + '...',
      task.title.length > 27 ? task.title.slice(0, 27) + '...' : task.title,
      status,
      priority,
      formatDate(task.createdAt)
    ]);
  });

  return table.toString();
}

/**
 * 格式化统计信息
 * @虾可爱
 */
export function formatStats(tasks: Task[]): string {
  const total = tasks.length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const high = tasks.filter(t => t.priority === 'high').length;
  const medium = tasks.filter(t => t.priority === 'medium').length;
  const low = tasks.filter(t => t.priority === 'low').length;
  
  const lines: string[] = [];
  
  lines.push(chalk.bold.cyan('\n📊 任务统计\n'));
  lines.push(chalk.gray('─'.repeat(30)));
  
  lines.push(`总任务数: ${chalk.bold(total)}`);
  lines.push(`  ${chalk.yellow('○ 待办')}: ${pending}`);
  lines.push(`  ${chalk.green('✓ 完成')}: ${completed}`);
  
  lines.push(chalk.gray('\n按优先级分布:'));
  lines.push(`  ${chalk.red('高')}: ${high}`);
  lines.push(`  ${chalk.yellow('中')}: ${medium}`);
  lines.push(`  ${chalk.green('低')}: ${low}`);
  
  if (total > 0) {
    const completionRate = ((completed / total) * 100).toFixed(1);
    lines.push(chalk.gray('\n完成率: ') + chalk.bold(`${completionRate}%`));
  }
  
  return lines.join('\n');
}

/**
 * 格式化单个任务详情
 * @虾可爱
 */
export function formatTaskDetail(task: Task): string {
  const lines: string[] = [];
  
  lines.push(chalk.bold.cyan('\n📋 任务详情\n'));
  lines.push(chalk.gray('─'.repeat(30)));
  
  lines.push(`ID: ${chalk.gray(task.id)}`);
  lines.push(`标题: ${chalk.bold(task.title)}`);
  
  const status = task.status === 'completed' 
    ? chalk.green('✓ 已完成') 
    : chalk.yellow('○ 待办中');
  lines.push(`状态: ${status}`);
  
  lines.push(`优先级: ${priorityColors[task.priority](priorityNames[task.priority])}`);
  lines.push(`创建时间: ${formatDate(task.createdAt)}`);
  
  if (task.completedAt) {
    lines.push(`完成时间: ${formatDate(task.completedAt)}`);
  }
  
  return lines.join('\n');
}

/**
 * 格式化日期
 */
function formatDate(date: Date): string {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * 成功消息
 */
export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

/**
 * 错误消息
 */
export function error(message: string): void {
  console.error(chalk.red('✗'), message);
}

/**
 * 警告消息
 */
export function warning(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

/**
 * 信息消息
 */
export function info(message: string): void {
  console.log(chalk.blue('ℹ'), message);
}

export default {
  formatTaskTable,
  formatStats,
  formatTaskDetail,
  success,
  error,
  warning,
  info
};
