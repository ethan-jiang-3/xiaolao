/**
 * JSON 文件存储
 * @author 虾算盘
 */

import { Task } from '../../engine/Task';
import * as fs from 'fs';
import * as path from 'path';

export class JSONStorage {
  private filePath: string;

  constructor(filePath: string = './tasks.json') {
    this.filePath = filePath;
  }

  save(tasks: Task[]): void {
    fs.writeFileSync(this.filePath, JSON.stringify(tasks, null, 2));
  }

  load(): Task[] {
    if (!fs.existsSync(this.filePath)) {
      return [];
    }
    const data = fs.readFileSync(this.filePath, 'utf-8');
    return JSON.parse(data);
  }

  backup(): void {
    const backupPath = `${this.filePath}.backup.${Date.now()}`;
    if (fs.existsSync(this.filePath)) {
      fs.copyFileSync(this.filePath, backupPath);
    }
  }
}
