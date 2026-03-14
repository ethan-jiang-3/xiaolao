/**
 * Task Manager CLI - 命令行入口
 * @虾可爱
 * 
 * 设计决策：
 * 1. 使用 Commander.js 处理命令行参数
 * 2. 统一的错误处理
 * 3. 友好的帮助信息
 */

import { Command } from 'commander';
import { TaskManager } from './TaskManager';
import { Priority } from './Task';
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
  .option('-t, --tags <tags>', '标签，用逗号分隔')
  .action((title: string, options: { priority: string; tags?: string }) => {
    try {
      const priority = options.priority as Priority;
      if (!['low', 'medium', 'high'].includes(priority)) {
        error('优先级必须是 low、medium 或 high');
        process.exit(1);
      }

      const tags = options.tags ? options.tags.split(',').map(t => t.trim()) : undefined;
      
      const task = manager.addTask({
        title,
        priority,
        tags
      });
      
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
  .option('--sort <field>', '排序字段 (createdAt|priority|title)', 'createdAt')
  .option('--order <order>', '排序顺序 (asc|desc)', 'desc')
  .action((options: {
    status?: string;
    priority?: string;
    sort: string;
    order: string;
  }) => {
    try {
      let tasks = manager.getAllTasks();
      
      // Filter
      if (options.status) {
        tasks = tasks.filter(t => t.status === options.status);
      }
      if (options.priority) {
        tasks = tasks.filter(t => t.priority === options.priority);
      }
      
      // Sort
      tasks = manager.sortTasks(
        tasks,
        options.sort as 'createdAt' | 'priority' | 'title',
        options.order as 'asc' | 'desc'
      );
      
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
      
      if (manager.completeTask(id)) {
        success('任务已完成！');
        const updated = manager.getTask(id);
        if (updated) {
          console.log(formatTaskDetail(updated));
        }
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
      const stats = manager.getStats();
      console.log(formatStats(stats));
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
