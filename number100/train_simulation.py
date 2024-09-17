import random
from character import Character
from game import Game

def train_characters(characters, num_rounds):
    for _ in range(num_rounds):
        random.shuffle(characters)
        game = Game(characters)
        winner = None
        while winner is None:
            game.play_round()
            winner = game.check_winner()

    # 完成训练，冻结角色策略
    for char in characters:
        char.freeze_strategy()

def reset_scores(characters):
    for char in characters:
        char.score = 0

def simulate_game_with_player(characters):
    player_name = input("请输入玩家的名字: ")
    player_score = 0
    game = Game(characters)
    round_count = 0
    winner = None

    # 重置所有角色的分数
    reset_scores(characters)

    while winner is None:
        round_count += 1
        print(f"\n第 {round_count} 轮游戏")

        # 玩家输入数字
        player_choice = int(input(f"{player_name}, 请选择一个0-100的数字: "))
        player_choice = max(0, min(100, player_choice))  # 限制玩家选择在0-100之间

        # 角色选择数字
        choices = [char.choose_number(game.history, [player_choice] + [c for c in range(len(characters))]) for char in characters]

        # 显示每个角色的选择
        for idx, char in enumerate(characters):
            print(f"{char.name} 选择了 {choices[idx]}")

        # 加入玩家的选择
        all_choices = choices + [player_choice]
        game.history.append(all_choices)

        total_sum = sum(all_choices)
        target = round(total_sum / len(all_choices) * (len(all_choices) - 1) / len(all_choices))
        print(f"本轮的目标数字是: {target}")

        # 判断每个玩家和角色的得分情况
        closest_distance = 101
        closest_characters = []
        success = [False] * (len(characters) + 1)

        for idx, choice in enumerate(all_choices):
            if all_choices.count(choice) > 1:
                continue  # 有相同选择则不计分
            distance = abs(choice - target)
            if distance < closest_distance:
                closest_characters = [idx]
                closest_distance = distance
            elif distance == closest_distance:
                closest_characters.append(idx)

        # 如果命中目标，得2分；否则最接近者得1分
        if closest_distance == 0:
            for idx in closest_characters:
                if idx == len(characters):
                    player_score += 2
                else:
                    characters[idx].score += 2
        else:
            for idx in closest_characters:
                if idx == len(characters):
                    player_score += 1
                else:
                    characters[idx].score += 1

        # 显示当前得分
        print(f"{player_name} 的当前分数: {player_score}")
        for char in characters:
            print(f"{char.name}: {char.score} 分")

        # 检查胜利者
        if player_score >= 10:
            winner = player_name
        else:
            winner = game.check_winner()

    print(f"\n游戏结束，胜利者是: {winner}!")
    return winner

# 定义几名不同性格的角色
characters = [
    Character('Alice', logic=60, psychology=40, intuition=0),
    Character('Bob', logic=30, psychology=30, intuition=40),
    Character('Carol', logic=10, psychology=40, intuition=50),
    Character('Dave', logic=50, psychology=25, intuition=25)
]

# 训练角色，每个角色与随机对手博弈 100 轮
train_characters(characters, 100)

# 允许玩家和角色进行一次游戏
simulate_game_with_player(characters)
