/**
 * 场景单元测试
 * @虾可爱
 */

import { beachScene, villageScene, caveScene, getAllNodes } from '../../src/story/scenes';

describe('场景定义', () => {
  describe('海滩场景', () => {
    test('应该有起始节点', () => {
      const startNode = beachScene.find(n => n.id === 'beach_start');
      expect(startNode).toBeDefined();
      expect(startNode?.speakerId).toBe('narrator');
    });

    test('应该有选择分支', () => {
      const choiceNode = beachScene.find(n => n.id === 'beach_choice');
      expect(choiceNode?.options).toBeDefined();
      expect(choiceNode?.options?.length).toBe(2);
    });

    test('应该有结束节点', () => {
      const endNode = beachScene.find(n => n.id === 'beach_departure');
      expect(endNode?.isEnd).toBe(true);
    });
  });

  describe('村庄场景', () => {
    test('应该有村长和小芳的分支', () => {
      const exploreNode = villageScene.find(n => n.id === 'village_explore');
      expect(exploreNode?.options?.length).toBe(2);
      
      const optionIds = exploreNode?.options?.map(o => o.id);
      expect(optionIds).toContain('approach_chief');
      expect(optionIds).toContain('talk_xiaofang');
    });

    test('帮助小芳应该有条件判断', () => {
      const choiceNode = villageScene.find(n => n.id === 'xiaofang_explain');
      const helpOption = choiceNode?.options?.find(o => o.id === 'help_xiaofang');
      
      expect(helpOption).toBeDefined();
      expect(helpOption?.onSelect).toBeDefined();
    });

    test('应该有多个结局路径', () => {
      const endNodes = villageScene.filter(n => n.id.includes('end'));
      expect(endNodes.length).toBeGreaterThan(0);
    });
  });

  describe('洞穴场景', () => {
    test('应该有光源相关的条件选项', () => {
      const darkNode = caveScene.find(n => n.id === 'cave_darkness');
      const conditionalOptions = darkNode?.options?.filter(o => o.condition);
      
      expect(conditionalOptions?.length).toBeGreaterThan(0);
    });

    test('应该有多个结局', () => {
      const endings = caveScene.filter(n => 
        n.id.startsWith('ending_') && n.isEnd
      );
      expect(endings.length).toBe(3); // 财富、智慧、友情
    });

    test('友情结局应该有前置条件', () => {
      const finalChoice = caveScene.find(n => n.id === 'final_choice');
      const friendshipOption = finalChoice?.options?.find(
        o => o.id === 'choose_friendship'
      );
      
      expect(friendshipOption?.condition).toBeDefined();
    });
  });

  describe('所有节点', () => {
    test('所有节点应该有唯一ID', () => {
      const allNodes = getAllNodes();
      const ids = allNodes.map(n => n.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('所有节点应该有说话者', () => {
      const allNodes = getAllNodes();
      allNodes.forEach(node => {
        expect(node.speakerId).toBeDefined();
        expect(node.speakerId.length).toBeGreaterThan(0);
      });
    });

    test('所有节点应该有内容', () => {
      const allNodes = getAllNodes();
      allNodes.forEach(node => {
        expect(node.content).toBeDefined();
        expect(node.content.length).toBeGreaterThan(0);
      });
    });
  });
});
