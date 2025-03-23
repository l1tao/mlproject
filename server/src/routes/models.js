const express = require('express');
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 所有模型路由都需要认证
router.use(authMiddleware);

// 获取所有可用模型
router.get('/', (req, res) => {
  try {
    const db = getDb();
    db.all('SELECT id, name, api_type, model_name, is_default FROM model_configs', (err, models) => {
      if (err) {
        console.error('获取模型列表错误:', err);
        return res.status(500).json({ message: '服务器错误' });
      }
      res.json({ models });
    });
  } catch (error) {
    console.error('获取模型列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取默认模型
router.get('/default', (req, res) => {
  try {
    const db = getDb();
    db.get('SELECT id, name, api_type, model_name FROM model_configs WHERE is_default = 1', (err, model) => {
      if (err) {
        console.error('获取默认模型错误:', err);
        return res.status(500).json({ message: '服务器错误' });
      }
      
      if (!model) {
        return res.status(404).json({ message: '未找到默认模型' });
      }
      
      res.json({ model });
    });
  } catch (error) {
    console.error('获取默认模型错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取特定模型
router.get('/:modelId', (req, res) => {
  try {
    const { modelId } = req.params;
    const db = getDb();
    
    db.get(
      'SELECT id, name, api_type, model_name, is_default FROM model_configs WHERE id = ?',
      [modelId],
      (err, model) => {
        if (err) {
          console.error('获取模型详情错误:', err);
          return res.status(500).json({ message: '服务器错误' });
        }
        
        if (!model) {
          return res.status(404).json({ message: '模型不存在' });
        }
        
        res.json({ model });
      }
    );
  } catch (error) {
    console.error('获取模型详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;