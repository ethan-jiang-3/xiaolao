/**
 * Task Manager CLI - 命令行入口
 * @虾可爱
 * 
 * 设计决策：
 * 1. 使用 Commander.js 处理命令行参数
 * 2. 挂载核心引擎 API（虾老大的 TaskManager）
 * 3. 统一的错误处理
 * 4. 友好的帮助信息
 */

import { Command } from 'commander';
import { TaskManager } from './engine/TaskManager';
import { TaskPriority } from './engine/Task';
import {
  formatTaskTable,
  formatStats,
  formatTaskDetail,
  success,
  error,
  warning,
  info
} from './Formatter';

const program = new Command();
const manager = new TaskManager();

program
  .name('task')
  .description('Task Manager CLI - 虾可爱 🦐')
  .version('0.1.0');

// Add command
program
  .command('add <title>')
  .description('添加新任务')
  .option('-p, --priority <level>', '优先级 (low|medium|high)', 'medium')
  .action((title: string, options: { priority: string }) => {
    try {
      const priority = options.priority as TaskPriority;
      if (!['low', 'medium', 'high'].includes(priority)) {
        error('优先级必须是 low、medium 或 high');
        process.exit(1);
      }
      
      const task = manager.addTask(title, priority);
      
      success(`任务已添加: ${task.title}`);
      console.log(formatTaskDetail(task));
    } catch (err) {
      error(`添加任务失败: ${err}`);
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .description('列出所有任务')
  .option('-s, --status <status>', '过滤状态 (pending|completed)')
  .option('-p, --priority <priority>', '过滤优先级 (low|medium|high)')
  .action((options: { status?: string; priority?: string }) => {
    try {
      let tasks = manager.getAllTasks();
      
      // Filter by status
      if (options.status) {
        tasks = tasks.filter(t => t.status === options.status);
      }
      
      // Filter by priority
      if (options.priority) {
        tasks = tasks.filter(t => t.priority === options.priority);
      }
      
      if (tasks.length === 0) {
        info('暂无任务');
        return;
      }
      
      console.log(formatTaskTable(tasks));
      info(`\n共 ${tasks.length} 个任务`);
    } catch (err) {
      error(`列出任务失败: ${err}`);
      process.exit(1);
    }
  });

// Done command
program
  .command('done <id>')
  .description('完成任务')
  .action((id: string) => {
    try {
      const task = manager.getTask(id);
      if (!task) {
        error(`未找到任务: ${id}`);
        process.exit(1);
      }
      
      if (task.status === 'completed') {
        warning('任务已完成');
        return;
      }
      
      const completed = manager.completeTask(id);
      if (completed) {
        success('任务已完成！');
        console.log(formatTaskDetail(completed));
      } else {
        error('完成任务失败');
        process.exit(1);
      }
    } catch (err) {
      error(`完成任务失败: ${err}`);
      process.exit(1);
    }
  });

// Delete command
program
  .command('delete <id>')
  .description('删除任务')
  .option('-f, --force', '强制删除，不确认')
  .action((id: string, options: { force?: boolean }) => {
    try {
      const task = manager.getTask(id);
      if (!task) {
        error(`未找到任务: ${id}`);
        process.exit(1);
      }
      
      if (!options.force) {
        warning(`确定要删除任务 "${task.title}" 吗？`);
        // 简化处理，实际项目中可以使用 inquirer 等库
      }
      
      if (manager.deleteTask(id)) {
        success('任务已删除');
      } else {
        error('删除任务失败');
        process.exit(1);
      }
    } catch (err) {
      error(`删除任务失败: ${err}`);
      process.exit(1);
    }
  });

// Stats command
program
  .command('stats')
  .description('显示统计信息')
  .action(() => {
    try {
      const tasks = manager.getAllTasks();
      console.log(formatStats(tasks));
    } catch (err) {
      error(`获取统计失败: ${err}`);
      process.exit(1);
    }
  });

// Interactive mode (simplified)
program
  .command('interactive')
  .alias('i')
  .description('交互模式（简化版）')
  .action(() => {
    info('交互模式 - 输入命令 (add/list/done/delete/stats/quit)');
    info('提示: 使用非交互模式更高效，例如: task add "标题" --priority=high');
  });

program.parse();

// Show help if no command
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
