const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ message: '用户名至少需要3个字符' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: '密码至少需要6个字符' });
    }
    
    const db = getDb();
    
    // 检查用户名是否已存在
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: '服务器错误' });
      }
      
      if (user) {
        return res.status(400).json({ message: '用户名已存在' });
      }
      
      // 加密密码
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // 创建新用户
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', 
        [username, hashedPassword], 
        function(err) {
          if (err) {
            return res.status(500).json({ message: '创建用户失败' });
          }
          
          const userId = this.lastID;
          
          // 生成JWT令牌
          const token = jwt.sign(
            { id: userId, username },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '24h' }
          );
          
          res.status(201).json({
            token,
            user: { id: userId, username }
          });
        }
      );
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 用户登录
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    
    const db = getDb();
    
    // 查找用户
    db.get('SELECT id, username, password FROM users WHERE username = ?', 
      [username], 
      async (err, user) => {
        if (err) {
          return res.status(500).json({ message: '服务器错误' });
        }
        
        if (!user) {
          return res.status(401).json({ message: '用户名或密码不正确' });
        }
        
        // 验证密码
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
          return res.status(401).json({ message: '用户名或密码不正确' });
        }
        
        // 生成JWT令牌
        const token = jwt.sign(
          { id: user.id, username: user.username },
          process.env.JWT_SECRET || 'your_jwt_secret',
          { expiresIn: '24h' }
        );
        
        res.json({
          token,
          user: { id: user.id, username: user.username }
        });
      }
    );
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取当前用户信息
router.get('/me', authMiddleware, (req, res) => {
  res.json(req.user);
});

module.exports = router;