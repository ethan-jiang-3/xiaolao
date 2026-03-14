/**
 * DialogueSystem 单元测试
 * @虾可爱
 */

import { DialogueSystem, DialogueNode, DialogueOption } from '../../src/story/DialogueSystem';

describe('DialogueSystem', () => {
  let system: DialogueSystem;

  beforeEach(() => {
    system = new DialogueSystem();
  });

  afterEach(() => {
    system.fullReset();
  });

  describe('节点注册', () => {
    test('应该能注册单个节点', () => {
      const node: DialogueNode = {
        id: 'test_node',
        speakerId: 'test_speaker',
        content: '测试内容',
        isEnd: true
      };

      system.registerNode(node);
      expect(system.getNode('test_node')).toEqual(node);
    });

    test('应该能批量注册节点', () => {
      const nodes: DialogueNode[] = [
        { id: 'node1', speakerId: 's1', content: '内容1' },
        { id: 'node2', speakerId: 's2', content: '内容2' }
      ];

      system.registerNodes(nodes);
      expect(system.getNode('node1')).toBeDefined();
      expect(system.getNode('node2')).toBeDefined();
    });

    test('获取不存在的节点应返回undefined', () => {
      expect(system.getNode('nonexistent')).toBeUndefined();
    });
  });

  describe('对话流程', () => {
    const setupSimpleDialogue = () => {
      const nodes: DialogueNode[] = [
        {
          id: 'start',
          speakerId: 'narrator',
          content: '开始',
          nextNodeId: 'middle'
        },
        {
          id: 'middle',
          speakerId: 'npc',
          content: '中间',
          options: [
            { id: 'opt1', text: '选项1', nextNodeId: 'end1' },
            { id: 'opt2', text: '选项2', nextNodeId: 'end2' }
          ]
        },
        { id: 'end1', speakerId: 'narrator', content: '结局1', isEnd: true },
        { id: 'end2', speakerId: 'narrator', content: '结局2', isEnd: true }
      ];
      system.registerNodes(nodes);
    };

    test('应该能开始对话', () => {
      setupSimpleDialogue();
      const context = system.start('start');

      // 由于自动跳转，currentNodeId 会是跳转后的节点
      expect(system.getIsActive()).toBe(true);
      expect(context.visitedNodes.has('start')).toBe(true);
    });

    test('开始不存在的节点应抛出错误', () => {
      expect(() => system.start('nonexistent')).toThrow('起始节点不存在');
    });

    test('应该自动跳转到下一个节点', () => {
      setupSimpleDialogue();
      system.start('start');

      // 等待自动跳转
      expect(system.getCurrentNode()?.id).toBe('middle');
    });

    test('应该能选择选项', () => {
      setupSimpleDialogue();
      system.start('start');

      system.selectOption('opt1');
      expect(system.getCurrentNode()?.id).toBe('end1');
    });

    test('选择不存在的选项应抛出错误', () => {
      setupSimpleDialogue();
      system.start('start');

      expect(() => system.selectOption('nonexistent')).toThrow('选项不存在');
    });

    test('选择不可用的选项应抛出错误', () => {
      const nodes: DialogueNode[] = [
        {
          id: 'start',
          speakerId: 'npc',
          content: '开始',
          options: [
            { 
              id: 'blocked', 
              text: '被阻挡', 
              condition: () => false,
              nextNodeId: 'end' 
            }
          ]
        },
        { id: 'end', speakerId: 'narrator', content: '结束', isEnd: true }
      ];
      system.registerNodes(nodes);
      system.start('start');

      expect(() => system.selectOption('blocked')).toThrow('选项不可用');
    });
  });

  describe('上下文和数据', () => {
    test('应该能存储和获取变量', () => {
      system.registerNode({
        id: 'start',
        speakerId: 'npc',
        content: '开始',
        isEnd: true
      });
      system.start('start');

      system.setVariable('testKey', 'testValue');
      expect(system.getVariable('testKey')).toBe('testValue');
    });

    test('应该能传递初始数据', () => {
      system.registerNode({
        id: 'start',
        speakerId: 'npc',
        content: '开始',
        isEnd: true
      });
      
      const context = system.start('start', { playerName: '小劳' });
      expect(context.data.playerName).toBe('小劳');
    });

    test('未开始对话时获取变量应抛出错误', () => {
      expect(() => system.getVariable('key')).toThrow('对话未开始');
    });
  });

  describe('历史记录', () => {
    test('应该记录对话历史', () => {
      const nodes: DialogueNode[] = [
        { id: 'n1', speakerId: 's1', content: '内容1', nextNodeId: 'n2' },
        { id: 'n2', speakerId: 's2', content: '内容2', isEnd: true }
      ];
      system.registerNodes(nodes);
      system.start('n1');

      const history = system.getHistory();
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].speakerId).toBe('s1');
    });

    test('应该记录选项选择', () => {
      const nodes: DialogueNode[] = [
        {
          id: 'start',
          speakerId: 'npc',
          content: '开始',
          options: [{ id: 'opt1', text: '选项', nextNodeId: 'end' }]
        },
        { id: 'end', speakerId: 'narrator', content: '结束', isEnd: true }
      ];
      system.registerNodes(nodes);
      system.start('start');
      system.selectOption('opt1');

      const history = system.getHistory();
      // 选项选择记录在起始节点（选择前的节点）
      const startRecord = history.find(h => h.nodeId === 'start');
      expect(startRecord?.selectedOptionId).toBe('opt1');
    });

    test('应该能清空历史', () => {
      system.registerNode({
        id: 'start',
        speakerId: 'npc',
        content: '开始',
        isEnd: true
      });
      system.start('start');

      system.clearHistory();
      expect(system.getHistory().length).toBe(0);
    });
  });

  describe('访问记录', () => {
    test('应该记录访问过的节点', () => {
      const nodes: DialogueNode[] = [
        { id: 'n1', speakerId: 's1', content: '内容1', nextNodeId: 'n2' },
        { id: 'n2', speakerId: 's2', content: '内容2', isEnd: true }
      ];
      system.registerNodes(nodes);
      system.start('n1');

      expect(system.hasVisited('n1')).toBe(true);
      expect(system.hasVisited('n2')).toBe(true);
    });

    test('未访问的节点应返回false', () => {
      system.registerNode({
        id: 'start',
        speakerId: 'npc',
        content: '开始',
        isEnd: true
      });
      system.start('start');

      expect(system.hasVisited('nonexistent')).toBe(false);
    });
  });

  describe('条件选项', () => {
    test('应该根据条件过滤选项', () => {
      const nodes: DialogueNode[] = [
        {
          id: 'start',
          speakerId: 'npc',
          content: '开始',
          options: [
            { id: 'always', text: '总是可用' },
            { id: 'conditional', text: '条件可用', condition: (ctx) => ctx.variables.unlocked === true }
          ]
        }
      ];
      system.registerNodes(nodes);
      system.start('start');

      // 初始状态只有一个选项
      let options = system.getAvailableOptions();
      expect(options.length).toBe(1);
      expect(options[0].id).toBe('always');

      // 解锁后有两个选项
      system.setVariable('unlocked', true);
      options = system.getAvailableOptions();
      expect(options.length).toBe(2);
    });
  });

  describe('事件系统', () => {
    test('应该能监听和触发事件', () => {
      const listener = jest.fn();
      system.on('dialogue:start', listener);

      system.registerNode({
        id: 'start',
        speakerId: 'npc',
        content: '开始',
        isEnd: true
      });
      system.start('start');

      expect(listener).toHaveBeenCalled();
    });

    test('应该能移除监听器', () => {
      const listener = jest.fn();
      system.on('dialogue:start', listener);
      system.off('dialogue:start', listener);

      system.registerNode({
        id: 'start',
        speakerId: 'npc',
        content: '开始',
        isEnd: true
      });
      system.start('start');

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('回调函数', () => {
    test('节点进入回调应该被执行', () => {
      const onEnter = jest.fn();
      system.registerNode({
        id: 'start',
        speakerId: 'npc',
        content: '开始',
        onEnter,
        isEnd: true
      });
      system.start('start');

      expect(onEnter).toHaveBeenCalled();
    });

    test('选项选择回调应该被执行', () => {
      const onSelect = jest.fn();
      system.registerNode({
        id: 'start',
        speakerId: 'npc',
        content: '开始',
        options: [{ id: 'opt1', text: '选项', onSelect, nextNodeId: 'end' }]
      });
      system.registerNode({
        id: 'end',
        speakerId: 'narrator',
        content: '结束',
        isEnd: true
      });
      system.start('start');
      system.selectOption('opt1');

      expect(onSelect).toHaveBeenCalled();
    });
  });

  describe('重置功能', () => {
    test('reset应该只重置状态，保留节点', () => {
      system.registerNode({
        id: 'start',
        speakerId: 'npc',
        content: '开始',
        isEnd: true
      });
      system.start('start');
      system.reset();

      expect(system.getIsActive()).toBe(false);
      expect(system.getNode('start')).toBeDefined(); // 节点还在
    });

    test('fullReset应该清除所有内容', () => {
      system.registerNode({
        id: 'start',
        speakerId: 'npc',
        content: '开始',
        isEnd: true
      });
      system.start('start');
      system.fullReset();

      expect(system.getNode('start')).toBeUndefined();
    });
  });

  describe('边界情况', () => {
    test('未开始对话时获取当前节点应返回null', () => {
      expect(system.getCurrentNode()).toBeNull();
    });

    test('未开始对话时获取上下文应返回null', () => {
      expect(system.getContext()).toBeNull();
    });

    test('未开始对话时获取历史应返回空数组', () => {
      expect(system.getHistory()).toEqual([]);
    });

    test('未开始对话时获取已访问节点应返回空Set', () => {
      expect(system.getVisitedNodes().size).toBe(0);
    });

    test('未开始对话时设置变量应抛出错误', () => {
      expect(() => system.setVariable('key', 'value')).toThrow('对话未开始');
    });

    test('未开始对话时清空历史不应报错', () => {
      expect(() => system.clearHistory()).not.toThrow();
    });

    test('未开始对话时结束不应报错', () => {
      expect(() => system.end()).not.toThrow();
    });

    test('没有选项的节点应返回空数组', () => {
      system.registerNode({
        id: 'start',
        speakerId: 'npc',
        content: '开始',
        isEnd: true
      });
      system.start('start');
      expect(system.getAvailableOptions()).toEqual([]);
    });

    test('没有上下文的节点应返回空选项', () => {
      // 不开始对话直接获取选项
      expect(system.getAvailableOptions()).toEqual([]);
    });

    test('自动跳转到结束节点应结束对话', () => {
      const nodes: DialogueNode[] = [
        { id: 'start', speakerId: 's1', content: '开始', nextNodeId: 'end' },
        { id: 'end', speakerId: 's2', content: '结束', isEnd: true }
      ];
      system.registerNodes(nodes);
      system.start('start');
      expect(system.getIsActive()).toBe(false);
    });

    test('选择isEnd选项应结束对话', () => {
      const nodes: DialogueNode[] = [
        {
          id: 'start',
          speakerId: 'npc',
          content: '开始',
          options: [{ id: 'end_opt', text: '结束', isEnd: true }]
        }
      ];
      system.registerNodes(nodes);
      system.start('start');
      system.selectOption('end_opt');
      expect(system.getIsActive()).toBe(false);
    });

    test('不存在的节点应抛出错误', () => {
      system.registerNode({
        id: 'start',
        speakerId: 'npc',
        content: '开始',
        nextNodeId: 'nonexistent'
      });
      // 由于自动跳转会尝试进入不存在的节点
      expect(() => system.start('start')).toThrow('节点不存在');
    });

    test('选择没有nextNodeId的选项应保持当前状态', () => {
      const nodes: DialogueNode[] = [
        {
          id: 'start',
          speakerId: 'npc',
          content: '开始',
          options: [{ id: 'opt1', text: '选项' }] // 没有nextNodeId
        }
      ];
      system.registerNodes(nodes);
      system.start('start');
      system.selectOption('opt1');
      // 选择后没有跳转，对话可能结束或保持原状
      expect(system.getContext()?.currentNodeId).toBe('start');
    });
  });
});
