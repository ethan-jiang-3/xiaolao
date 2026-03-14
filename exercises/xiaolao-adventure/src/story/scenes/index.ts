/**
 * 虾游记 - 场景定义
 * @虾可爱
 * 
 * 设计决策：
 * 1. 每个场景包含完整的对话节点网络
 * 2. 场景之间通过特定选项连接
 * 3. 分支选择影响后续剧情和角色关系
 */

import { DialogueNode, DialogueOption } from '../DialogueSystem';

/**
 * 场景1：起点 - 海滩
 * 
 * 设计理由：
 * - 作为游戏开场，介绍世界观和主角背景
 * - 简单的二元选择让玩家熟悉系统
 * - 选择影响初始道具
 */
export const beachScene: DialogueNode[] = [
  {
    id: 'beach_start',
    speakerId: 'narrator',
    content: '清晨的阳光洒在金色的沙滩上。小劳站在海边，手中紧握着那张神秘的地图。海风轻拂，带来远方的呼唤...',
    nextNodeId: 'beach_reflection'
  },
  {
    id: 'beach_reflection',
    speakerId: 'xiaolao',
    content: '这就是传说中的藏宝图吗...看起来指向北方的青石村。今天是个好天气，适合出发冒险！',
    nextNodeId: 'beach_choice'
  },
  {
    id: 'beach_choice',
    speakerId: 'xiaolao',
    content: '不过，在出发前，我应该...',
    options: [
      {
        id: 'check_supplies',
        text: '仔细检查背包，确保带齐了补给',
        nextNodeId: 'beath_supplies',
        onSelect: (ctx) => {
          ctx.data.hasExtraSupplies = true;
          ctx.variables.prepared = true;
        }
      },
      {
        id: 'rush_departure',
        text: '迫不及待地出发，冒险不能等！',
        nextNodeId: 'beach_hasty',
        onSelect: (ctx) => {
          ctx.data.hasExtraSupplies = false;
          ctx.variables.prepared = false;
        }
      }
    ]
  },
  {
    id: 'beath_supplies',
    speakerId: 'xiaolao',
    content: '让我看看...水壶、干粮、火把、绳索，还有爷爷给的护身符。准备万全，出发！',
    nextNodeId: 'beach_departure'
  },
  {
    id: 'beach_hasty',
    speakerId: 'xiaolao',
    content: '冒险的呼唤太强烈了！带上水壶和干粮就出发，其他的路上再说吧！',
    nextNodeId: 'beach_departure'
  },
  {
    id: 'beach_departure',
    speakerId: 'narrator',
    content: '小劳踏上了通往青石村的道路。沙滩渐渐远去，前方是未知的冒险...',
    isEnd: true
  }
];

/**
 * 场景2：村庄 - 青石村广场
 * 
 * 设计理由：
 * - 引入NPC系统，展示角色互动
 * - 多个NPC提供不同信息和任务
 * - 重要分支：是否帮助小芳，影响后续获得信息
 */
export const villageScene: DialogueNode[] = [
  {
    id: 'village_entrance',
    speakerId: 'narrator',
    content: '经过半天的跋涉，小劳来到了青石村。村庄不大，但充满生活气息。广场中央有一口古老的水井，几位村民正在闲聊。',
    nextNodeId: 'village_explore'
  },
  {
    id: 'village_explore',
    speakerId: 'xiaolao',
    content: '终于到青石村了！这里看起来是个安静的地方。我应该先去哪里呢？',
    options: [
      {
        id: 'approach_chief',
        text: '去找村长询问地图的事情',
        nextNodeId: 'meet_chief'
      },
      {
        id: 'talk_xiaofang',
        text: '和那个活泼的女孩搭话',
        nextNodeId: 'meet_xiaofang'
      }
    ]
  },
  // 分支A：先找村长
  {
    id: 'meet_chief',
    speakerId: 'village_chief',
    content: '年轻人，我看你手里拿着的东西...那是一张古老的地图吧？我已经很多年没见过这样的地图了。',
    nextNodeId: 'chief_inquiry'
  },
  {
    id: 'chief_inquiry',
    speakerId: 'xiaolao',
    content: '村长您认识这张地图？我在海边发现的，上面标记着北方的某个地方。',
    nextNodeId: 'chief_warning'
  },
  {
    id: 'chief_warning',
    speakerId: 'village_chief',
    content: '这地图指向迷雾洞穴，那里藏着古老的秘密，但也充满危险。年轻人，你确定要去吗？',
    options: [
      {
        id: 'determined_go',
        text: '我确定！冒险就是我的生活！',
        nextNodeId: 'chief_advice_brave',
        onSelect: (ctx) => {
          ctx.variables.braveChoice = true;
        }
      },
      {
        id: 'ask_more_info',
        text: '请告诉我更多关于洞穴的事情',
        nextNodeId: 'chief_advice_cautious',
        onSelect: (ctx) => {
          ctx.variables.braveChoice = false;
        }
      }
    ]
  },
  // 分支A1：勇敢选择
  {
    id: 'chief_advice_brave',
    speakerId: 'village_chief',
    content: '哈哈哈！年轻人有胆识！拿着这个火把，洞穴里漆黑一片。还有，如果你遇到神秘老人，一定要听他说完话。',
    nextNodeId: 'village_after_chief',
    onEnter: (ctx) => {
      ctx.data.hasTorch = true;
      ctx.data.knowsAboutElder = true;
    }
  },
  // 分支A2：谨慎选择
  {
    id: 'chief_advice_cautious',
    speakerId: 'village_chief',
    content: '谨慎是好事。迷雾洞穴在村子北边，里面住着一位神秘老人。传说他知道所有秘密，但只有心地纯净的人才能见到他。',
    nextNodeId: 'village_after_chief',
    onEnter: (ctx) => {
      ctx.data.knowsAboutElder = true;
      ctx.data.hasTorch = false;
    }
  },
  // 分支B：先找小芳
  {
    id: 'meet_xiaofang',
    speakerId: 'xiaofang',
    content: '哇！你是冒险者吗？我叫小芳，是村长的孙女！你是来寻找迷雾洞穴的吗？',
    nextNodeId: 'xiaofang_surprise'
  },
  {
    id: 'xiaofang_surprise',
    speakerId: 'xiaolao',
    content: '你怎么知道我要找洞穴？',
    nextNodeId: 'xiaofang_explain'
  },
  {
    id: 'xiaofang_explain',
    speakerId: 'xiaofang',
    content: '因为拿着那种地图的人都会去那里！不过...我的小猫昨天跑进了洞穴入口，你能帮我找回来吗？',
    options: [
      {
        id: 'help_xiaofang',
        text: '当然！小猫的安全最重要',
        nextNodeId: 'xiaofang_grateful',
        onSelect: (ctx) => {
          ctx.variables.helpedXiaofang = true;
        }
      },
      {
        id: 'decline_help',
        text: '抱歉，我有更重要的事情要做',
        nextNodeId: 'xiaofang_disappointed',
        onSelect: (ctx) => {
          ctx.variables.helpedXiaofang = false;
        }
      }
    ]
  },
  // 分支B1：帮助小芳
  {
    id: 'xiaofang_grateful',
    speakerId: 'xiaofang',
    content: '太感谢了！作为谢礼，这个给你——是爷爷给我的护身符，据说能在黑暗中指引方向。洞穴里很黑的！',
    nextNodeId: 'village_after_xiaofang',
    onEnter: (ctx) => {
      ctx.data.hasAmulet = true;
      ctx.data.hasTorch = true;
    }
  },
  // 分支B2：不帮助
  {
    id: 'xiaofang_disappointed',
    speakerId: 'xiaofang',
    content: '哦...好吧。那你自己小心，洞穴里很危险的。爷爷说里面住着一位奇怪的老人...',
    nextNodeId: 'village_after_xiaofang',
    onEnter: (ctx) => {
      ctx.data.knowsAboutElder = true;
    }
  },
  // 汇合点
  {
    id: 'village_after_chief',
    speakerId: 'narrator',
    content: '获得了村长的建议后，小劳准备前往迷雾洞穴。村口的方向标指向北方...',
    nextNodeId: 'village_end'
  },
  {
    id: 'village_after_xiaofang',
    speakerId: 'narrator',
    content: '告别了村庄，小劳踏上了通往迷雾洞穴的道路。无论选择如何，冒险都在继续...',
    nextNodeId: 'village_end'
  },
  {
    id: 'village_end',
    speakerId: 'narrator',
    content: '青石村渐渐远去，前方的道路被薄雾笼罩。迷雾洞穴就在不远处等待着...',
    isEnd: true
  }
];

/**
 * 场景3：洞穴 - 迷雾洞穴深处
 * 
 * 设计理由：
 * - 高潮场景，引入神秘老人
 * - 之前的选择在这里产生后果
 * - 多重结局：根据准备程度和选择不同
 */
export const caveScene: DialogueNode[] = [
  {
    id: 'cave_entrance',
    speakerId: 'narrator',
    content: '迷雾洞穴入口被藤蔓遮掩，洞内传来阵阵冷风。小劳深吸一口气，踏入了黑暗之中...',
    nextNodeId: 'cave_darkness'
  },
  {
    id: 'cave_darkness',
    speakerId: 'narrator',
    content: '洞穴内果然漆黑一片。小劳摸索着前进，脚下的石头发出咔哒声响...',
    options: [
      {
        id: 'use_torch',
        text: '点燃火把照亮前路',
        condition: (ctx) => ctx.data.hasTorch === true,
        nextNodeId: 'cave_with_light'
      },
      {
        id: 'use_amulet',
        text: '使用护身符的光芒',
        condition: (ctx) => ctx.data.hasAmulet === true,
        nextNodeId: 'cave_with_light'
      },
      {
        id: 'stumble_dark',
        text: '摸黑前进',
        condition: (ctx) => !ctx.data.hasTorch && !ctx.data.hasAmulet,
        nextNodeId: 'cave_stumble'
      }
    ]
  },
  // 有光源
  {
    id: 'cave_with_light',
    speakerId: 'xiaolao',
    content: '有光就好多了。这些岩壁上好像刻着什么古老的符号...',
    nextNodeId: 'cave_deep'
  },
  // 摸黑前进
  {
    id: 'cave_stumble',
    speakerId: 'xiaolao',
    content: '哎呀！好痛...撞到石头了。不过好像摸到了墙壁，沿着墙走应该安全些。',
    nextNodeId: 'cave_deep'
  },
  // 深入洞穴
  {
    id: 'cave_deep',
    speakerId: 'narrator',
    content: '越往深处走，空气越加神秘。突然，前方出现了一个身影——一位白发老人坐在石台上，仿佛早已等待多时。',
    nextNodeId: 'meet_elder'
  },
  {
    id: 'meet_elder',
    speakerId: 'mysterious_elder',
    content: '终于来了...我等你很久了，年轻的冒险者。你手中的地图，可知道它的真正含义？',
    options: [
      {
        id: 'ask_meaning',
        text: '请告诉我，这张地图到底指向什么？',
        nextNodeId: 'elder_revelation'
      },
      {
        id: 'ask_identity',
        text: '您是谁？为什么在这里等我？',
        nextNodeId: 'elder_identity',
        condition: (ctx) => ctx.variables.braveChoice !== true
      }
    ]
  },
  // 询问身份（只有谨慎选择可见）
  {
    id: 'elder_identity',
    speakerId: 'mysterious_elder',
    content: '我是谁？我是过去与未来的守门人。你的谨慎让你看到了别人看不到的路...',
    nextNodeId: 'elder_revelation'
  },
  // 揭示真相
  {
    id: 'elder_revelation',
    speakerId: 'mysterious_elder',
    content: '这张地图指向的不是宝藏，而是选择。每一个来到这里的冒险者，都必须做出最终的选择...',
    nextNodeId: 'final_choice'
  },
  {
    id: 'final_choice',
    speakerId: 'mysterious_elder',
    content: '你可以选择：带走洞穴深处的宝物，成为富有的人；或者带走知识，成为智者。但不能两者兼得。',
    options: [
      {
        id: 'choose_wealth',
        text: '我选择宝物，财富可以改变生活',
        nextNodeId: 'ending_wealth',
        onSelect: (ctx) => {
          ctx.variables.ending = 'wealth';
        }
      },
      {
        id: 'choose_wisdom',
        text: '我选择知识，智慧是无价的',
        nextNodeId: 'ending_wisdom',
        onSelect: (ctx) => {
          ctx.variables.ending = 'wisdom';
        }
      },
      {
        id: 'choose_friendship',
        text: '我能不能...两者都不要？我更珍惜旅途中遇到的朋友',
        condition: (ctx) => ctx.variables.helpedXiaofang === true,
        nextNodeId: 'ending_friendship',
        onSelect: (ctx) => {
          ctx.variables.ending = 'friendship';
        }
      }
    ]
  },
  // 结局1：财富
  {
    id: 'ending_wealth',
    speakerId: 'narrator',
    content: '小劳选择了宝物。当他走出洞穴时，口袋里装满了金币。他成为了富有的人，但总觉得心里少了些什么...',
    isEnd: true
  },
  // 结局2：智慧
  {
    id: 'ending_wisdom',
    speakerId: 'narrator',
    content: '小劳选择了知识。老人的话语化作光芒融入他的心中。他成为了智者，用所学帮助了无数人...',
    isEnd: true
  },
  // 结局3：友情（隐藏结局）
  {
    id: 'ending_friendship',
    speakerId: 'mysterious_elder',
    content: '有趣的选择...你帮助了那个女孩的善良，让你看到了第三条路。真正的宝藏，是旅途中收获的一切。',
    nextNodeId: 'ending_friendship_2'
  },
  {
    id: 'ending_friendship_2',
    speakerId: 'narrator',
    content: '小劳没有带走任何宝物，但他的心中充满了温暖的回忆。当他回到村庄时，小芳开心地迎接了他。这才是真正的宝藏...',
    isEnd: true
  }
];

/**
 * 导出所有场景
 */
export const allScenes = {
  beach: beachScene,
  village: villageScene,
  cave: caveScene
};

/**
 * 获取所有对话节点
 */
export function getAllNodes(): DialogueNode[] {
  return [
    ...beachScene,
    ...villageScene,
    ...caveScene
  ];
}

export default allScenes;
