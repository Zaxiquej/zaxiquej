//打分规则
//1:常见词条（伤害，抽牌
//1.5：体系词条（自残，弃牌
//1.6~2.5:稀有词条（盾。连击
//3~4:很稀有词条（回豆
//5~8：极稀有词条（公开，积蓄、狼王
//10~20：几乎独一无二的词条（特殊胜利、诗人、宇宙
//附属词条在以上规则下扣分（一回合一次、回合结束时失去等)，一般为1分以下
//

let ratioTable = {
  "damage": {reward:1, punish:1},
  "chant": {reward:0.5, punish:0.2}, //吟唱
  "draw": {reward:1, punish:1},
  "status_offense={op.inplay.unit.offense.max}": {reward:1.2, punish:0.4}, //攻击力最高
  "possess_ep_modifier": {reward:3, punish:3}, //回豆
  "cemetery_count": {reward:3, punish:3},//墓冥府
  "character=both": {reward:1.5, punish:1.5},//敌我不分
  "pp_modifier": {reward:1.3, punish:1.3}, //回/扣费
  "destroy": {reward:1, punish:1},
  "destroyField": {reward:3, punish:3}, //拆符
  "attach_skill": {reward:1.6, punish:1.2}, //获得能力
  "heal": {reward:1, punish:1},
  "discard": {reward:1.5, punish:1.5},
  "turn_start_skill_after_stop": {reward:0.5, punish:0.5},
  "banish": {reward:1.5, punish:1.5},
  "play_count": {reward:1.5, punish:1.5}, //连击
  "powerup": {reward:1, punish:1},
  "open_card": {reward:4, punish:4}, //公开
  "pp_fixeduse": {reward:1, punish:1}, //爆能
  "summon_token": {reward:1, punish:1},
  "{me.usable_ep}>{op.usable_ep}": {reward:2, punish:1}, //后手优势
  "play_count_change": {reward:5, punish:5}, //增加连击
  "rush": {reward:1, punish:1},
  "quick": {reward:1, punish:1}, //疾驰
  "repeat_count": {reward:0.5, punish:0.5}, //重复
  "trigger": {reward:1, punish:1},
  "lose": {reward:3, punish:3}, //沉默
  "{me.inplay.class.pp}": {reward:3, punish:3}, //余费
  "update_deck": {reward:1.5, punish:1.5}, //洗牌
  "shortage_deck_win": {reward:14, punish:14}, //天使
  "banish_deck": {reward:6, punish:3}, //消失牌库
  "banish_hand": {reward:4, punish:2}, //消失手牌
  "give_guard": {reward:7, punish:4}, //角力
  "clear_destroyed_card_list": {reward:5, punish:5}, //彻底炸牌库（倒吊）
  "{me.destroyed_card_list.tribe=artifact.unique_base_card_id_card.count}": {reward:1.9, punish:1.9}, //造物种类
  "{me.inplay.class.rally_count}": {reward:1.4, punish:0.5}, //连协
  "{me.inplay.unit.count}=1": {reward:2.5, punish:0.4}, //唯我
  "selfDestroyCount": {reward:1.5, punish:0.4}, //各种破坏任务
  "selfLeftCount": {reward:1.5, punish:0.5}, //离场任务
  "selfSummonCount": {reward:1.5, punish:0.5}, //入场任务
  "selfEvolveCount": {reward:1.5, punish:0.5}, //进化任务
  "selfDeckCount": {reward:1.5, punish:0.5}, //牌库任务
  "selfHandCount": {reward:1.5, punish:0.5}, //牌库任务
  "status_life": {reward:1.5, punish:0.5}, //屁股任务
  "selfInPlaySum": {reward:1.7, punish:0.5},//站场数
  "selfInPlayCount": {reward:1.7, punish:0.5},//站场
  "selfDrawCardCount": {reward:1.6, punish:0.5},//获得XX牌任务
  "{me.game_play_count}": {reward:3, punish:0.5}, //奥伯龙+深根的用牌任务
  "selfPlaySpCardCount": {reward:2, punish:0.5}, //使用过的XX次数
  "{me.inplay.game_necromance_count}": {reward:1.5, punish:0.5}, //墓地任务
  "{me.game_skill_discard_count}": {reward:2.5, punish:0.5}, //弃牌任务
  "selfTurnPlayCount": {reward:2, punish:0.5}, //一回合用牌
  "target=healing_card": {reward:2, punish:0.5}, //被奶扳机
  "{me.inplay.class.life}<{op.inplay.class.life}": {reward:2, punish:0.5}, //己方血少
  "selfShield": {reward:4.2, punish:2.1}, //脸无敌
  "looting": {reward:5, punish:1}, //财宝任务
  "when_buff": {reward:2.5, punish:1.5}, //被BUFF发动
  "when_discard": {reward:4, punish:2}, //被弃发动
  "when_return": {reward:4, punish:2}, //回手发动
  "when_destroy": {reward:0.5, punish:0.2}, //谢幕发动
  "when_evolve": {reward:0.5, punish:0.2}, //进化发动
  "when_attack": {reward:0.7, punish:0.3}, //攻击发动
  "when_fight": {reward:0.7, punish:0.3}, //交战发动
  "when_leave": {reward:1.5, punish:0.5}, //离场发动
  "when_evolve_other": {reward:1.5, punish:0.5}, //进化其他发动
  "when_discard_other": {reward:4, punish:2}, //弃牌发动
  "when_accelerate_other": {reward:4, punish:2}, //激奏其他发动
  "when_resonance_start": {reward:3, punish:1},//切共鸣
  "when_play_other": {reward:1, punish:0.5},//使用其他牌扳机
  "when_summon_other": {reward:1, punish:0.5},//召唤其他牌扳机
  "previous_turn_attacked=true": {reward:3, punish:0.5},//上一回合攻击过
  "when_damage": {reward:2, punish:0.8},//污蔑/伤脸
  "{me.inplay.unit.attack_count=pre_action.count}=0": {reward:2.4, punish:0.6},//安息
  "leader_attach_skill": {reward:0.9, punish:0.7}, //主战者贴效果
  "recycle": {reward:1.4, punish:1.4}, //回收/复制
  "none": {reward:1.1, punish:0.8}, //白板
  "long_token_draw": {reward:4, punish:4}, //长token
  "token_draw": {reward:1, punish:1},
  "select": {reward:1.2, punish:1.2},//选择目标
  "summon_card": {reward:1.5, punish:1.5},//拉东西
  "turn_end_stop": {reward:0.3, punish:0.3},//直到回合结束
  "turn_end_remove": {reward:0.4, punish:0.4},//回合结束失去能力
  "cost_change": {reward:1.3, punish:1.3}, //改变费用
  "power_down": {reward:1.5, punish:1.5}, //减能力
  "power_change": {reward:5, punish:2}, //改能力
  "self_power_change": {reward:4, punish:2.4}, //改自己能力
  "leaderPowerup": {reward:6, punish:3}, //加血限
  "leaderPowerdown": {reward:6, punish:3}, //扣血限
  "guard": {reward:1, punish:1},
  "ramp": {reward:3, punish:3}, //跳/扣费
  "change_affiliation": {reward:7, punish:7}, //改变种族
  "necromance": {reward:1.5, punish:1.2}, //死灵术
  "choice": {reward:1.5, punish:1.5}, //抉择
  "selfDamage": {reward:1.5, punish:1.2}, //自残
  "oppoHeal": {reward:3, punish:1.5}, //奶敌
  "selfReturn": {reward:3, punish:2.5}, //自回手
  "selfDestroy": {reward:2, punish:1.5}, //自杀
  "evolve": {reward:1.2, punish:1.2}, //进化
  "shield": {reward:1.6, punish:1.6}, //圣盾
  "lock": {reward:3, punish:3}, //锁
  "classCheck": {reward:5, punish:4}, //职业
  "permShield": {reward:5, punish:4}, //天盾1
  "independent": {reward:5, punish:4}, //天盾2
  "consume_ep_modifier": {reward:3, punish:2}, //不消费EP即可进化
  "special_win": {reward:12, punish:12}, //特殊胜利
  "preprocess_condition": {reward:1.7, punish:1.7},
  "per_turn": {reward:1.2, punish:0.8}, //一回合一次
  "indestructible": {reward:3, punish:2}, //金膜
  "selfCrystalCount": {reward:3, punish:1}, //结晶任务
  "{me.game_used_ep_count}": {reward:3, punish:1}, //吃豆任务
  "AOE": {reward:1.2, punish:0.6}, //aoe
  "AOEbuff": {reward:1.2, punish:0.6}, //aoeBUff
  "selfBuff": {reward:1.2, punish:0.6}, //selfBUff
  "deckBuff": {reward:1.2, punish:0.6}, //deckBUff
  "handBuff": {reward:1.2, punish:0.6}, //handBUff
  "{me.turn_play_cards_other_self=me:1.all.play_moment_tribe=hellbound.count}": {reward:2, punish:2}, //鲅鱼链
  "{me.game_skill_return_card_count}": {reward:3, punish:1}, //回手任务
  "{op.inplay.unit.count}": {reward:1.5, punish:1.1}, //敌方战场上的从者数
  "target=damaged_card": {reward:2.5, punish:1.5}, //敌方受伤
  "{me.damaged_card.unit.count}":{reward:2.5, punish:1.5}, //己方有受伤
  "selfDiscardThisTurnCardCount":{reward:3, punish:1}, //本回合弃牌
  "sneak": {reward:1.5, punish:1.5},
  "revive": {reward:1.8, punish:1.8}, // 亡召/复活
  "ignore_guard": {reward:2.1, punish:2.1}, //穿墙
  "turn_start_stop": {reward:0.4, punish:0.4}, //直到回合开始
  "chant_count_change": {reward:1.55, punish:1.55}, //改变吟唱
  "return_card": {reward:1.75, punish:1.75}, //回手
  "invocation": {reward:2.4, punish:2}, //瞬念
  "cant_attack": {reward:2.4, punish:2}, //无法攻击
  "obtain_self": {reward:3, punish:3}, //套娃
  "obtain_self_diff": {reward:5, punish:5}, //变异套娃
  "token_draw_modifier": {reward:6, punish:6}, //获得token修正（花叶之狐）
  "killer": {reward:1.1, punish:1.1},
  "drain": {reward:1.5, punish:1.5},
  "evolution_end_stop": {reward:2, punish:2}, //进化前后关键词不同
  "fusion": {reward:4, punish:2}, //融合
  "attack_count": {reward:2.2, punish:2.2}, //连击
  "change_rally_count": {reward:6, punish:6}, //改变连协
  "not_be_attacked": {reward:3, punish:2}, //物免
  "untouchable": {reward:3, punish:2}, //方块膜
  "ritual": {reward:1.5, punish:1.5}, //土秘
  "spell_charge": {reward:1.5, punish:1.5}, //魔力增幅效果
  "random_array": {reward:3, punish:3}, //随机数
  "damage_modifier": {reward:6, punish:6}, //项链
  "damage_zero": {reward:7.5, punish:7.5}, //伟大的意志
  "only_random_index": {reward:1.2, punish:1.2}, //随机数计数器，有randomarray了可以低
  "remove_from_inplay_stop": {reward:0.6, punish:0.6}, //站场光环
  "{self.charge_count}": {reward:1.5, punish:1.5}, //魔力增幅（到达X次）
  "change_white_ritual_stack": {reward:3, punish:3}, //增加积蓄
  "stack_white_ritual": {reward:3, punish:3}, //积蓄
  "awake": {reward:1.4, punish:1.1}, //觉醒
  "{me.inplay.class.max_pp}": {reward:3, punish:3}, //最大X PP
  "metamorphose": {reward:3, punish:3}, //变形
  "handMetamorphose": {reward:6, punish:6}, //手牌变形
  "change_cemetery": {reward:2.5, punish:2.5}, //改变墓地
  "change_union_burst_count": {reward:1.2, punish:1.2}, //UB
  "remove_by_banish": {reward:6, punish:6}, //离场时消失
  "burial_rite": {reward:2, punish:1.5}, //送葬
  "invoke_skill": {reward:6, punish:6}, //触发入场曲
  "damage_cut": {reward:2.5, punish:2.5}, //减伤、限伤
  "berserk": {reward:1.3, punish:1}, //复仇
  "wrath": {reward:1.5, punish:1.1}, //狂乱
  "resonance": {reward:1.5, punish:1.1}, //共鸣
  "avarice": {reward:1.8, punish:1.2}, //渴望
  "cant_evolution": {reward:3, punish:3}, //无法进化
  "use_pp": {reward:8, punish:5}, //消耗pp
  "per_game": {reward:5, punish:4}, //每场一次（收获的参谋长·喵鲁）
  "attack_by_life": {reward:9, punish:6}, //教会
  "no_duplication_random_array": {reward:6, punish:3}, //不重复的随机数
  "power_modifier": {reward:5, punish:3}, //光剑饿姐的不平衡加减
  "cant_activate_fanfare": {reward:12, punish:6}, //诗人
  "cant_summon": {reward:8, punish:4}, //闪耀
  "weird_evolve": {reward:1.5, punish:0.5}, //异形身材
  "flush": {reward:12, punish:6}, //20姐18弟
  "cosmos": {reward:12, punish:6}, //宇宙
  "cant_play": {reward:10, punish:6}, //无法使用XX卡
  "force_skill_target": {reward:7, punish:4}, //当敌方发动的能力可指定这个从者时，则只能指定这个从者
  "change_skybound_art_count": {reward:1.2, punish:1.2}, //奥义
  "change_super_skybound_art_count": {reward:0.3, punish:0.3}, //解放奥义（呃重复了）
  "use_ep": {reward:12, punish:8}, //消耗豆子
  "generic_value_modifier": {reward:6, punish:6},
  "accelerateORcrystallize": {reward:0.5, punish:0.5}, //激奏或结晶
  "remove_by_destroy": {reward:6, punish:4}, //能力无法破坏或使这个从者消失
  "special_lose": {reward:12, punish:4}, //特殊失败
  "force_berserk": {reward:8, punish:6}, //狼王
  "turn_end_period_of_stop_time": {reward:0.4, punish:0.4}, //到下个自己回合结束
  "heal_modifier": {reward:9, punish:9}, //主战者回复生命值时的数值转变为1
  "unite": {reward:10, punish:5}, //合体
  "Gacha": {reward:3, punish:0.5}, //扭蛋
  "geton": {reward:7, punish:4}, //操纵
  "getoff": {reward:1, punish:1}, //有上面那个啦
  "rob_skill": {reward:7, punish:3}, //偷
  "copy_skill": {reward:8, punish:3}, //复制
  "not_decrease_pp": {reward:7, punish:3}, //乔老师
  "repeat_skill": {reward:6, punish:6}, //复读（暮光）
  "force_avarice": {reward:2, punish:1}, //碑文
  "force_wrath": {reward:2, punish:1}, //碑文
  "evolve_to_other": {reward:6, punish:2}, //其他进化（莱瓦丁）
  "reflection": {reward:6, punish:2}, //玛丽反伤
  "loop_skill": {reward:5, punish:2}, //复读技能（旋镖修女）
  "turn_start_fixed_pp": {reward:6, punish:2}, //卡波
  "extra_turn": {reward:6, punish:2} //开门！
}
