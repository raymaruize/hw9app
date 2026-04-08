export type PoemRecord = {
  line_text: string;
  title: string;
  author: string;
  dynasty: string;
  full_text: string;
  source_collection: string;
  tags: {
    moods: string[];
    weather: string[];
    seasons: string[];
    times: string[];
    environments: string[];
    regions: string[];
    landscapes: string[];
  };
  popularity_score: number;
};

export const POEMS: PoemRecord[] = [
  {
    line_text: '海上生明月，天涯共此时。',
    title: '望月怀远',
    author: '张九龄',
    dynasty: '唐',
    full_text: '海上生明月，天涯共此时。情人怨遥夜，竟夕起相思。灭烛怜光满，披衣觉露滋。不堪盈手赠，还寝梦佳期。',
    source_collection: '全唐诗',
    tags: {
      moods: ['思念', '宁静', '感怀'],
      weather: ['晴', '微风'],
      seasons: ['秋', '冬'],
      times: ['夜晚'],
      environments: ['江海', '远望', '安静'],
      regions: ['沿海', '华南'],
      landscapes: ['moon', 'sea'],
    },
    popularity_score: 0.95,
  },
  {
    line_text: '举杯邀明月，对影成三人。',
    title: '月下独酌',
    author: '李白',
    dynasty: '唐',
    full_text: '花间一壶酒，独酌无相亲。举杯邀明月，对影成三人。月既不解饮，影徒随我身。暂伴月将影，行乐须及春。',
    source_collection: '全唐诗',
    tags: {
      moods: ['孤独', '旷达', '饮酒'],
      weather: ['晴'],
      seasons: ['春'],
      times: ['夜晚'],
      environments: ['庭院', '花间'],
      regions: ['西北', '四川'],
      landscapes: ['moon', 'flowers'],
    },
    popularity_score: 0.98,
  },
  {
    line_text: '空山新雨后，天气晚来秋。',
    title: '山居秋暝',
    author: '王维',
    dynasty: '唐',
    full_text: '空山新雨后，天气晚来秋。明月松间照，清泉石上流。竹喧归浣女，莲动下渔舟。随意春芳歇，王孙自可留。',
    source_collection: '全唐诗',
    tags: {
      moods: ['平静', '疗愈', '清新'],
      weather: ['雨后', '凉爽'],
      seasons: ['秋'],
      times: ['傍晚'],
      environments: ['山林', '自然', '清幽'],
      regions: ['华北', '秦岭'],
      landscapes: ['mountain', 'rain', 'stream'],
    },
    popularity_score: 0.97,
  },
  {
    line_text: '迟日江山丽，春风花草香。',
    title: '绝句二首·其一',
    author: '杜甫',
    dynasty: '唐',
    full_text: '迟日江山丽，春风花草香。泥融飞燕子，沙暖睡鸳鸯。',
    source_collection: '全唐诗',
    tags: {
      moods: ['轻快', '希望', '放松'],
      weather: ['晴', '温暖'],
      seasons: ['春'],
      times: ['白天'],
      environments: ['郊野', '江边', '花草'],
      regions: ['西南', '成都'],
      landscapes: ['river', 'flowers'],
    },
    popularity_score: 0.9,
  },
  {
    line_text: '大漠孤烟直，长河落日圆。',
    title: '使至塞上',
    author: '王维',
    dynasty: '唐',
    full_text: '单车欲问边，属国过居延。征蓬出汉塞，归雁入胡天。大漠孤烟直，长河落日圆。萧关逢候骑，都护在燕然。',
    source_collection: '全唐诗',
    tags: {
      moods: ['苍茫', '壮阔', '远行'],
      weather: ['晴', '干燥'],
      seasons: ['秋', '冬'],
      times: ['傍晚'],
      environments: ['荒野', '边塞'],
      regions: ['西北'],
      landscapes: ['desert', 'sunset', 'river'],
    },
    popularity_score: 0.93,
  },
  {
    line_text: '明月几时有？把酒问青天。',
    title: '水调歌头',
    author: '苏轼',
    dynasty: '宋',
    full_text: '明月几时有？把酒问青天。不知天上宫阙，今夕是何年。',
    source_collection: '东坡乐府',
    tags: {
      moods: ['思亲', '哲思', '节日'],
      weather: ['晴'],
      seasons: ['秋'],
      times: ['夜晚'],
      environments: ['高处', '庭院'],
      regions: ['华东'],
      landscapes: ['moon', 'sky'],
    },
    popularity_score: 0.99,
  },
  {
    line_text: '等闲识得东风面，万紫千红总是春。',
    title: '春日',
    author: '朱熹',
    dynasty: '宋',
    full_text: '胜日寻芳泗水滨，无边光景一时新。等闲识得东风面，万紫千红总是春。',
    source_collection: '朱子诗集',
    tags: {
      moods: ['振奋', '积极', '明朗'],
      weather: ['晴', '和风'],
      seasons: ['春'],
      times: ['白天'],
      environments: ['公园', '河畔', '花海'],
      regions: ['华东'],
      landscapes: ['flowers', 'river', 'spring'],
    },
    popularity_score: 0.88,
  },
  {
    line_text: '日照香炉生紫烟，遥看瀑布挂前川。',
    title: '望庐山瀑布',
    author: '李白',
    dynasty: '唐',
    full_text: '日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。',
    source_collection: '全唐诗',
    tags: {
      moods: ['惊叹', '开阔', '振奋'],
      weather: ['晴', '多云'],
      seasons: ['夏', '秋'],
      times: ['白天'],
      environments: ['山川', '瀑布', '旅行'],
      regions: ['华东', '江西'],
      landscapes: ['mountain', 'waterfall'],
    },
    popularity_score: 0.94,
  },
  {
    line_text: '停车坐爱枫林晚，霜叶红于二月花。',
    title: '山行',
    author: '杜牧',
    dynasty: '唐',
    full_text: '远上寒山石径斜，白云生处有人家。停车坐爱枫林晚，霜叶红于二月花。',
    source_collection: '全唐诗',
    tags: {
      moods: ['欣赏', '悠然', '治愈'],
      weather: ['晴', '微冷'],
      seasons: ['秋'],
      times: ['傍晚'],
      environments: ['山路', '林间'],
      regions: ['华中'],
      landscapes: ['mountain', 'forest'],
    },
    popularity_score: 0.89,
  },
  {
    line_text: '千山鸟飞绝，万径人踪灭。',
    title: '江雪',
    author: '柳宗元',
    dynasty: '唐',
    full_text: '千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。',
    source_collection: '全唐诗',
    tags: {
      moods: ['孤清', '沉思', '冷静'],
      weather: ['雪', '寒冷'],
      seasons: ['冬'],
      times: ['白天'],
      environments: ['江边', '雪景'],
      regions: ['华南', '桂林'],
      landscapes: ['snow', 'river'],
    },
    popularity_score: 0.91,
  },
];