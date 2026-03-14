/**
 * JSONStorage 单元测试
 * @虾算盘
 */

import { JSONStorage } from '../src/storage/JSONStorage';
import { Task } from '../src/engine/Task';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('JSONStorage', () => {
  const testDir = './test-data';
  const testBackupDir = './test-backup';
  let storage: JSONStorage;

  beforeEach(async () => {
    storage = new JSONStorage({
      dataDir: testDir,
      backupDir: testBackupDir,
    });
    
    // 清理测试目录
    try {
      await fs.rm(testDir, { recursive: true });
      await fs.rm(testBackupDir, { recursive: true });
    } catch {}
  });

  afterEach(async () => {
    storage.stopAutoSave();
    
    // 清理测试目录
    try {
      await fs.rm(testDir, { recursive: true });
      await fs.rm(testBackupDir, { recursive: true });
    } catch {}
  });

  describe('save', () => {
    it('应该保存任务到 JSON', async () => {
      const tasks = [
        new Task('1', '任务1'),
        new Task('2', '任务2', 'completed'),
      ];
      
      await storage.save(tasks);
      
      const content = await fs.readFile(path.join(testDir, 'tasks.json'), 'utf-8');
      const data = JSON.parse(content);
      
      expect(data.tasks).toHaveLength(2);
      expect(data.version).toBe('1.0');
    });
  });

  describe('load', () => {
    it('应该从 JSON 加载任务', async () => {
      const tasks = [new Task('1', '任务1'), new Task('2', '任务2')];
      await storage.save(tasks);
      
      const loaded = await storage.load();
      
      expect(loaded).toHaveLength(2);
      expect(loaded[0].title).toBe('任务1');
      expect(loaded[1].title).toBe('任务2');
    });

    it('文件不存在返回空数组', async () => {
      const loaded = await storage.load();
      expect(loaded).toEqual([]);
    });

    it('应该正确恢复 completedAt', async () => {
      const task = new Task('1', '任务');
      task.complete();
      await storage.save([task]);
      
      const loaded = await storage.load();
      
      expect(loaded[0].completedAt).toBeInstanceOf(Date);
      expect(loaded[0].status).toBe('completed');
    });
  });

  describe('backup', () => {
    it('应该创建备份', async () => {
      const tasks = [new Task('1', '任务')];
      await storage.save(tasks);
      await storage.backup();
      
      const files = await fs.readdir(testBackupDir);
      expect(files.length).toBeGreaterThan(0);
      expect(files[0]).toMatch(/tasks-.*\.json/);
    });
  });

  describe('autoSave', () => {
    it('应该自动保存', async () => {
      const saveFn = jest.fn().mockResolvedValue(undefined);
      
      storage.startAutoSave(saveFn, 100); // 100ms 间隔
      
      await new Promise(resolve => setTimeout(resolve, 250));
      
      expect(saveFn).toHaveBeenCalled();
      
      storage.stopAutoSave();
    });

    it('stopAutoSave 应该停止定时器', async () => {
      const saveFn = jest.fn().mockResolvedValue(undefined);
      
      storage.startAutoSave(saveFn, 100);
      storage.stopAutoSave();
      
      const callCount = saveFn.mock.calls.length;
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(saveFn.mock.calls.length).toBe(callCount);
    });
  });
});
