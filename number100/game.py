from collections import defaultdict

class Game:
    def __init__(self, characters):
        self.characters = characters
        self.history = []
    
    def play_round(self):
        choices = [char.choose_number(self.history, [c for c in range(len(self.characters))]) for char in self.characters]
        self.history.append(choices)
        
        total_sum = sum(choices)
        target = round(total_sum / len(choices) * (len(choices) - 1) / len(choices))
        
        closest_characters = []
        closest_distance = 101
        success = defaultdict(bool)

        for idx, choice in enumerate(choices):
            if choices.count(choice) > 1:  # 有相同选择则不计分
                continue
            distance = abs(choice - target)
            if distance < closest_distance:
                closest_characters = [idx]
                closest_distance = distance
            elif distance == closest_distance:
                closest_characters.append(idx)
        
        if closest_distance == 0:
            for idx in closest_characters:
                self.characters[idx].score += 2
                success[idx] = True
        else:
            for idx in closest_characters:
                self.characters[idx].score += 1
                success[idx] = True

        # 角色学习：训练阶段会根据是否成功调整策略
        for idx, char in enumerate(self.characters):
            char.learn(success[idx])

        return target, choices

    def check_winner(self):
        for char in self.characters:
            if char.score >= 10:
                return char.name
        return None
