import random
import numpy as np

class Character:
    def __init__(self, name, logic, psychology, intuition):
        self.name = name
        self.score = 0
        self.logic_weight = logic
        self.psychology_weight = psychology
        self.intuition_weight = intuition
        self.memory = []
        self.choice_weights = np.ones(101)  # 每个数字的选择权重，初始化为1
        self.is_training = True  # 用于区分训练和测试阶段
    
    def choose_number(self, history, other_choices):
        # 在测试阶段，不再学习，只根据当前权重选择
        if not self.is_training:
            return self.weighted_choice()
        
        # 根据权重选择数字
        choice = self.weighted_choice()
        
        # 学习机制：记录当前选择
        self.memory.append(choice)
        
        # 根据权重混合三种策略
        logic_part = self.logic_choice(history)
        psychology_part = self.psychological_choice(other_choices)
        intuition_part = self.intuitive_choice()
        
        # 最终选择依据混合权重
        final_choice = int(
            (self.logic_weight * logic_part + 
             self.psychology_weight * psychology_part + 
             self.intuition_weight * intuition_part) // 100
        )
        
        return final_choice
    
    def weighted_choice(self):
        # 根据权重进行选择，越高的权重被选择的概率越大
        return np.random.choice(range(101), p=self.choice_weights / self.choice_weights.sum())
    
    def logic_choice(self, history):
        if len(history) > 0:
            avg_guess = np.mean([sum(choices) * (len(choices) - 1) / len(choices) / len(choices) for choices in history])
            return avg_guess % 101
        else:
            return random.randint(0, 100)
    
    def psychological_choice(self, other_choices):
        if other_choices:
            most_common = max(set(other_choices), key=other_choices.count)
            return (most_common + random.randint(-10, 10)) % 101
        return random.randint(0, 100)
    
    def intuitive_choice(self):
        return random.randint(0, 100) if random.random() < 0.2 else random.choice(range(40, 60))
    
    def learn(self, success):
        # 训练阶段才会学习
        if self.is_training:
            if success:
                for choice in self.memory:
                    self.choice_weights[choice] += 1
            else:
                for choice in self.memory:
                    self.choice_weights[choice] = max(1, self.choice_weights[choice] - 0.5)
            self.memory = []
    
    def freeze_strategy(self):
        # 冻结策略，进入测试阶段
        self.is_training = False
