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
  "pp_modifier": 1.3, //回/扣费
  "destroy": 1,
  "heal": 1,
  "attach_skill": 1.3, //获得能力
  "discard": 1.5,
  "turn_start_skill_after_stop": 0.5,
  "banish": 1.5,
  "play_count": 1.5, //连击
  "powerup": 1,
  "open_card": 5,
  "pp_fixeduse": 1, //爆能
  "summon_token": 1,
  "play_count_change": 5, //增加连击
  "rush": 1,
  "quick": 1, //疾驰
  "trigger": 1.3,
  "lose": 4, //沉默
  "update_deck": 1.5, //洗牌
  "shortage_deck_win": 20, //天使
  "clear_destroyed_card_list": 20, //彻底炸牌库（倒吊）
  "leader_attach_skill": 1.1, //主战者贴效果
  "recycle": 1.4, //回收/复制
  "none": 1.1, //白板
  "token_draw": 1,
  "select": 1.2,//选择目标
  "summon_card": 1.5,//拉东西
  "turn_end_stop": 0.3,//直到回合结束
  "turn_end_remove": 0.5,//回合结束失去能力
  "cost_change": 1.3, //改变费用
  "power_down": 1.5, //减能力
  "guard": 1,
  "ramp": 2, //跳/扣费
  "change_affiliation": 10, //改变种族
  "necromance": 1.5, //死灵术
  "choice": 1.5, //抉择
  "selfDamage": 1.5, //自残
  "evolve": 1.2, //进化
  "shield": 1.6, //圣盾
  "independent": 12, //天盾
  "consume_ep_modifier": 79,
  "special_win": 15, //特殊胜利
  "preprocess_condition": 1.7, //不消费EP即可进化
  "per_turn": 1.2, //一回合一次
  "indestructible": 3, //金膜
  "{op.inplay.unit.count}": 1.5, //敌方战场上的从者数
  "sneak": 1.5,
  "ignore_guard": 2.1, //穿墙
  "turn_start_stop": 0.4, //直到回合开始
  "chant_count_change": 1.55, //改变吟唱
  "return_card": 1.75, //回手
  "invocation": 2.25, //瞬念
  "cant_attack": 1.7, //无法攻击
  "obtain_self": 1.5, //套娃
  "token_draw_modifier": 10, //获得token修正（花叶之狐）
  "killer": 1.1,
  "drain": 1.5,
  "evolution_end_stop": 2, //进化前后关键词不同
  "fusion": 2.4, //融合
  "attack_count": 2.2, //连击
  "change_rally_count": 8, //改变连协
  "not_be_attacked": 3, //物免
  "untouchable": 3, //方块膜
  "ritual": 1.5, //土秘
  "spell_charge": 1.5, //魔力增幅效果
  "random_array": 3, //随机数
  "damage_modifier": 8, //项链
  "damage_zero": 10, //伟大的意志
  "only_random_index": 1.2, //随机数计数器，有randomarray了可以低
  "remove_from_inplay_stop": 0.6, //站场光环
  "{self.charge_count}": 1.5, //魔力增幅（到达X次）
  "change_white_ritual_stack": 5, //增加积蓄
  "stack_white_ritual": 5, //积蓄
  "awake": 1.4, //觉醒
  "{me.inplay.class.max_pp}": 3.5, //最大X PP
  "metamorphose": 2.8, //变形
  "change_cemetery": 2.7, //改变墓地
  "change_union_burst_count": 4, //UB
  "remove_by_banish": 8, //离场时消失
  "burial_rite": 2, //送葬
  "invoke_skill": 6, //触发入场曲
  "damage_cut": 4, //减伤、限伤
  "berserk": 1.3, //复仇
  "wrath": 1.5, //狂乱
  "avarice": 1.8, //渴望
  "cant_evolution": 3, //无法进化
  "use_pp": 8, //消耗pp
  "per_game": 5, //每场一次（收获的参谋长·喵鲁）
  "attack_by_life": 12, //教会
  "no_duplication_random_array": 10, //不重复的随机数
  "power_modifier": 5, //光剑饿姐的不平衡加减
  "cant_activate_fanfare": 15, //诗人
  "cant_summon": 15, //闪耀
  "cosmos": 12, //宇宙
  "cant_play": 12, //无法使用XX卡
  "force_skill_target": 8, //当敌方发动的能力可指定这个从者时，则只能指定这个从者
  "change_skybound_art_count": 4, //奥义
  "change_super_skybound_art_count": 3, //解放奥义（呃重复了）
  "use_ep": 15, //消耗豆子
  "generic_value_modifier": 6,
  "accelerate": 1.1, //激奏
  "remove_by_destroy": 6, //能力无法破坏或使这个从者消失
  "special_lose": 20, //特殊失败
  "force_berserk": 8, //狼王
  "turn_end_period_of_stop_time": 0.4, //到下个自己回合结束
  "heal_modifier": 12, //主战者回复生命值时的数值转变为1
  "unite": 10, //合体
  "geton": 10, //操纵
  "getoff": 1, //有上面那个啦
  "rob_skill": 20, //偷
  "copy_skill": 10, //复制
  "crystallize": 1.2, //结晶
  "not_decrease_pp": 15, //乔老师
  "repeat_skill": 10, //复读（暮光）
  "force_avarice": 10, //碑文
  "force_wrath": 10, //碑文
  "evolve_to_other": 15, //其他进化（莱瓦丁）
  "reflection": 15, //玛丽反伤
  "loop_skill": 10, //复读技能（旋镖修女）
  "turn_start_fixed_pp": 10, //卡波
  "extra_turn": 10 //开门！
}
