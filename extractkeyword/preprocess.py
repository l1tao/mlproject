import nltk
import re
import numpy as np
from nltk.corpus import stopwords

# 下载必要的NLTK资源
try:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('averaged_perceptron_tagger')
except:
    print("NLTK资源下载失败，将使用备选方法")

def preprocess_text(text):
    # 转换为小写
    text = text.lower()
    # 移除特殊字符和数字
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d+', '', text)
    
    # 使用简单的空格分词作为备选方案
    try:
        # 尝试使用NLTK的word_tokenize
        from nltk.tokenize import word_tokenize
        tokens = word_tokenize(text)
    except:
        # 如果失败，使用简单的空格分词
        print("使用简单分词方法作为备选")
        tokens = text.split()
    
    # 移除停用词
    try:
        stop_words = set(stopwords.words('english'))
        filtered_tokens = [word for word in tokens if word not in stop_words]
    except:
        # 如果无法加载停用词，则不过滤
        print("无法加载停用词，跳过停用词过滤")
        filtered_tokens = tokens
    
    # 确保返回的标记列表不为空
    if not filtered_tokens:
        return ["placeholder"]  # 返回一个占位符，避免空列表

    return filtered_tokens

def extract_noun_phrases(text):
    # 使用简单的分词作为备选方案
    try:
        from nltk.tokenize import word_tokenize
        tokens = word_tokenize(text)
        tagged = nltk.pos_tag(tokens)
    except:
        print("使用简单分词和词性标注作为备选")
        tokens = text.lower().split()
        # 简单地假设所有词都是名词
        tagged = [(word, 'NN') for word in tokens]
    
    # 提取名词和名词短语
    noun_phrases = []
    current_phrase = []
    
    for word, tag in tagged:
        # 如果是名词，添加到当前短语
        if tag.startswith('NN'):
            current_phrase.append(word.lower())
        # 如果不是名词且当前短语不为空，保存当前短语
        elif current_phrase:
            if len(current_phrase) > 0:
                noun_phrases.append(' '.join(current_phrase))
            current_phrase = []
    
    # 添加最后一个短语（如果有）
    if current_phrase:
        noun_phrases.append(' '.join(current_phrase))
    
    return noun_phrases

def safe_mean(arr):
    """安全计算平均值，处理空数组和NaN值的情况"""
    if len(arr) == 0:
        return 0.0
    # 过滤掉NaN值
    filtered = [x for x in arr if not (np.isnan(x) if hasattr(np, 'isnan') else (x != x))]
    if len(filtered) == 0:
        return 0.0
    return sum(filtered) / len(filtered)

def evaluate_keywords(predicted_keywords, reference_keywords):
    """评估关键词提取的性能，处理边缘情况"""
    if not predicted_keywords or not reference_keywords:
        return 0.0, 0.0, 0.0
    
    # 转换为集合以便计算交集
    pred_set = set(predicted_keywords)
    ref_set = set(reference_keywords)
    
    # 计算交集
    intersection = pred_set.intersection(ref_set)
    
    # 计算准确率、召回率和F1分数
    precision = len(intersection) / len(pred_set) if len(pred_set) > 0 else 0.0
    recall = len(intersection) / len(ref_set) if len(ref_set) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    
    return precision, recall, f1