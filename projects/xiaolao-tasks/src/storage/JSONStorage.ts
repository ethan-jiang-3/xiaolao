/**
 * JSONStorage - JSON 文件存储
 * @虾算盘
 * 
 * 设计决策：
 * - 异步 IO 避免阻塞
 * - 自动备份机制
 * - 原子写入（先写临时文件再重命名）
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Task, TaskData } from '../engine/Task';

export interface StorageConfig {
  dataDir: string;
  filename: string;
  backupDir: string;
  autoSaveInterval?: number; // ms, undefined 表示不自动保存
}

export class JSONStorage {
  private config: StorageConfig;
  private autoSaveTimer?: NodeJS.Timeout;
  private pendingTasks: Task[] = [];

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      dataDir: config.dataDir || './data',
      filename: config.filename || 'tasks.json',
      backupDir: config.backupDir || './backup',
      autoSaveInterval: config.autoSaveInterval,
    };
  }

  /**
   * 获取数据文件路径
   */
  private getDataPath(): string {
    return path.join(this.config.dataDir, this.config.filename);
  }

  /**
   * 确保目录存在
   */
  private async ensureDir(dir: string): Promise<void> {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  /**
   * 保存任务到 JSON
   */
  async save(tasks: Task[]): Promise<void> {
    await this.ensureDir(this.config.dataDir);
    
    const data = {
      version: '1.0',
      updatedAt: new Date().toISOString(),
      tasks: tasks.map(t => t.toJSON()),
    };

    const filePath = this.getDataPath();
    const tempPath = `${filePath}.tmp`;

    // 原子写入：先写临时文件，再重命名
    await fs.writeFile(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempPath, filePath);
    
    this.pendingTasks = [];
  }

  /**
   * 从 JSON 加载任务
   */
  async load(): Promise<Task[]> {
    const filePath = this.getDataPath();
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      if (!data.tasks || !Array.isArray(data.tasks)) {
        return [];
      }
      
      return data.tasks.map((t: TaskData) => Task.fromJSON(t));
    } catch (error) {
      // 文件不存在或格式错误，返回空数组
      return [];
    }
  }

  /**
   * 创建备份
   */
  async backup(): Promise<void> {
    await this.ensureDir(this.config.backupDir);
    
    const dataPath = this.getDataPath();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.config.backupDir, `tasks-${timestamp}.json`);

    try {
      await fs.copyFile(dataPath, backupPath);
    } catch (error) {
      // 源文件不存在，忽略
    }
  }

  /**
   * 启动自动保存
   */
  startAutoSave(saveFn: () => Promise<void>, interval?: number): void {
    this.stopAutoSave();
    
    const ms = interval || this.config.autoSaveInterval || 60000; // 默认 1 分钟
    this.autoSaveTimer = setInterval(async () => {
      await saveFn();
    }, ms);
  }

  /**
   * 停止自动保存
   */
  stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }
  }

  /**
   * 标记有待保存的任务
   */
  markPending(tasks: Task[]): void {
    this.pendingTasks = tasks;
  }

  /**
   * 获取待保存的任务
   */
  getPending(): Task[] {
    return [...this.pendingTasks];
  }
}
