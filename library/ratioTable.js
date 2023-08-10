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
  "damage": 1,
  "draw": 1,
  "possess_ep_modifier": 3, //回豆
  "cemetery_count": 3,//墓冥府
  "character=both": 1.5,//敌我不分
  "pp_modifier": 1.3, //回/扣费
  "destroy": 1,
  "destroyField": 3, //拆符
  "heal": 1,
  "attach_skill": 1.3, //获得能力
  "discard": 1.5,
  "turn_start_skill_after_stop": 0.5,
  "banish": 1.5,
  "play_count": 1.5, //连击
  "powerup": 1,
  "open_card": 4, //公开
  "pp_fixeduse": 1, //爆能
  "summon_token": 1,
  "play_count_change": 5, //增加连击
  "rush": 1,
  "quick": 1, //疾驰
  "trigger": 1.3,
  "lose": 3, //沉默
  "{me.inplay.class.pp}": 3, //余费
  "update_deck": 1.5, //洗牌
  "shortage_deck_win": 14, //天使
  "banish_deck": 6, //消失牌库
  "banish_hand": 4, //消失手牌
  "give_guard": 7, //角力
  "clear_destroyed_card_list": 5, //彻底炸牌库（倒吊）
  "{me.destroyed_card_list.tribe=artifact.unique_base_card_id_card.count}": 1.9, //造物种类
  "{me.inplay.class.rally_count}": 1.4, //连协
  "selfDestroyCount": 2, //各种破坏任务
  "selfLeftCount": 2, //离场任务
  "selfSummonCount": 2, //入场任务
  "selfEvolveCount": 2, //进化任务
  "selfDeckCount": 2, //牌库任务
  "selfHandCount": 2, //牌库任务
  "status_life": 2, //屁股任务
  "selfInPlaySum": 2.2,//站场数
  "selfInPlayCount": 2.2,//站场
  "{me.game_play_count}": 1.5, //奥伯龙+深根的用牌任务
  "{me.inplay.game_necromance_count}": 2, //墓地任务
  "{me.game_skill_discard_count}": 3, //弃牌任务
  "selfTurnPlayCount": 3, //一回合用牌
  "selfShield": 4.2, //脸无敌
  "{me.game_play_cards_other_self.all.play_moment_tribe=looting.count}+{me.game_fusion_ingrediented_cards.all.tribe=looting.count}": 3, //财宝任务
  "when_buff": 2.5, //被BUFF发动
  "when_discard": 4, //被弃发动
  "when_discard_other": 4, //弃牌发动
  "when_resonance_start": 2,//切共鸣
  "leader_attach_skill": 1.1, //主战者贴效果
  "recycle": 1.4, //回收/复制
  "none": 1.1, //白板
  "long_token_draw": 4, //长随机
  "token_draw": 1,
  "select": 1.2,//选择目标
  "summon_card": 1.5,//拉东西
  "turn_end_stop": 0.3,//直到回合结束
  "turn_end_remove": 0.4,//回合结束失去能力
  "cost_change": 1.3, //改变费用
  "power_down": 1.5, //减能力
  "power_change": 2, //改能力
  "self_power_change": 2.4, //改自己能力
  "leaderPowerup": 8, //加血限
  "leaderPowerdown": 8, //扣血限
  "guard": 1,
  "ramp": 2, //跳/扣费
  "change_affiliation": 7, //改变种族
  "necromance": 1.5, //死灵术
  "choice": 1.5, //抉择
  "selfDamage": 1.5, //自残
  "selfDestroy": 2, //自杀
  "evolve": 1.2, //进化
  "shield": 1.6, //圣盾
  "lock": 3, //锁
  "classCheck": 5, //锁
  "permShield": 5, //天盾1
  "independent": 5, //天盾2
  "consume_ep_modifier": 3, //不消费EP即可进化
  "special_win": 12, //特殊胜利
  "preprocess_condition": 1.7,
  "per_turn": 1.2, //一回合一次
  "indestructible": 3, //金膜
  "selfCrystalCount": 3, //结晶任务
  "{me.game_used_ep_count}": 3, //吃豆任务
  "AOE": 2, //aoe
  "AOEbuff": 2, //aoeBUff
  "{me.turn_play_cards_other_self=me:1.all.play_moment_tribe=hellbound.count}": 2, //鲅鱼链
  "{me.game_skill_return_card_count}": 3, //回手任务
  "{op.inplay.unit.count}": 1.5, //敌方战场上的从者数
  "{op.last_target.unit.max_life}-{op.last_target.unit.life}":2.5, //敌方受伤
  "{me.damaged_card.unit.count}":2.5, //己方有受伤
  "sneak": 1.5,
  "revive": 1.8, // 亡召/复活
  "ignore_guard": 2.1, //穿墙
  "turn_start_stop": 0.4, //直到回合开始
  "chant_count_change": 1.55, //改变吟唱
  "return_card": 1.75, //回手
  "invocation": 2.25, //瞬念
  "cant_attack": 2.4, //无法攻击
  "obtain_self": 3, //套娃
  "obtain_self_diff": 5, //变异套娃
  "token_draw_modifier": 6, //获得token修正（花叶之狐）
  "killer": 1.1,
  "drain": 1.5,
  "evolution_end_stop": 2, //进化前后关键词不同
  "fusion": 2.4, //融合
  "attack_count": 2.2, //连击
  "change_rally_count": 6, //改变连协
  "not_be_attacked": 3, //物免
  "untouchable": 3, //方块膜
  "ritual": 1.5, //土秘
  "spell_charge": 1.5, //魔力增幅效果
  "random_array": 3, //随机数
  "damage_modifier": 6, //项链
  "damage_zero": 7.5, //伟大的意志
  "only_random_index": 1.2, //随机数计数器，有randomarray了可以低
  "remove_from_inplay_stop": 0.6, //站场光环
  "{self.charge_count}": 1.5, //魔力增幅（到达X次）
  "change_white_ritual_stack": 3, //增加积蓄
  "stack_white_ritual": 3, //积蓄
  "awake": 1.4, //觉醒
  "{me.inplay.class.max_pp}": 3, //最大X PP
  "metamorphose": 3, //变形
  "handMetamorphose": 6, //手牌变形
  "change_cemetery": 2.5, //改变墓地
  "change_union_burst_count": 1.2, //UB
  "remove_by_banish": 6, //离场时消失
  "burial_rite": 2, //送葬
  "invoke_skill": 6, //触发入场曲
  "damage_cut": 2.5, //减伤、限伤
  "berserk": 1.3, //复仇
  "wrath": 1.5, //狂乱
  "avarice": 1.8, //渴望
  "cant_evolution": 3, //无法进化
  "use_pp": 8, //消耗pp
  "per_game": 5, //每场一次（收获的参谋长·喵鲁）
  "attack_by_life": 9, //教会
  "no_duplication_random_array": 6, //不重复的随机数
  "power_modifier": 5, //光剑饿姐的不平衡加减
  "cant_activate_fanfare": 12, //诗人
  "cant_summon": 8, //闪耀
  "weird_evolve": 1.5, //异形身材
  "flush": 12, //20姐18弟
  "cosmos": 12, //宇宙
  "cant_play": 10, //无法使用XX卡
  "force_skill_target": 7, //当敌方发动的能力可指定这个从者时，则只能指定这个从者
  "change_skybound_art_count": 1.2, //奥义
  "change_super_skybound_art_count": 0.3, //解放奥义（呃重复了）
  "use_ep": 12, //消耗豆子
  "generic_value_modifier": 6,
  "accelerateORcrystallize": 1.1, //激奏或结晶
  "remove_by_destroy": 6, //能力无法破坏或使这个从者消失
  "special_lose": 12, //特殊失败
  "force_berserk": 8, //狼王
  "turn_end_period_of_stop_time": 0.4, //到下个自己回合结束
  "heal_modifier": 9, //主战者回复生命值时的数值转变为1
  "unite": 10, //合体
  "geton": 7, //操纵
  "getoff": 1, //有上面那个啦
  "rob_skill": 7, //偷
  "copy_skill": 8, //复制
  "not_decrease_pp": 7, //乔老师
  "repeat_skill": 6, //复读（暮光）
  "force_avarice": 2, //碑文
  "force_wrath": 2, //碑文
  "evolve_to_other": 6, //其他进化（莱瓦丁）
  "reflection": 6, //玛丽反伤
  "loop_skill": 5, //复读技能（旋镖修女）
  "turn_start_fixed_pp": 6, //卡波
  "extra_turn": 6 //开门！
}
