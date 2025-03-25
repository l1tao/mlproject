const express = require('express');
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 所有聊天路由都需要认证
router.use(authMiddleware);

// 获取用户的所有聊天会话
router.get('/', (req, res) => {
  try {
    const db = getDb();
    db.all(
      'SELECT * FROM chats WHERE user_id = ? ORDER BY updated_at DESC',
      [req.userId],
      (err, chats) => {
        if (err) {
          console.error('获取聊天列表错误:', err);
          return res.status(500).json({ message: '服务器错误' });
        }
        res.json({ chats });
      }
    );
  } catch (error) {
    console.error('获取聊天列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取特定聊天会话及其消息
router.get('/:chatId', (req, res) => {
  try {
    const { chatId } = req.params;
    const db = getDb();

    // 获取聊天信息
    db.get(
      'SELECT * FROM chats WHERE id = ? AND user_id = ?',
      [chatId, req.userId],
      (err, chat) => {
        if (err) {
          console.error('获取聊天信息错误:', err);
          return res.status(500).json({ message: '服务器错误' });
        }

        if (!chat) {
          return res.status(404).json({ message: '聊天不存在或无权访问' });
        }

        // 获取聊天消息
        db.all(
          'SELECT * FROM messages WHERE chat_id = ? ORDER BY timestamp ASC',
          [chatId],
          (err, messages) => {
            if (err) {
              console.error('获取聊天消息错误:', err);
              return res.status(500).json({ message: '服务器错误' });
            }

            res.json({ chat, messages });
          }
        );
      }
    );
  } catch (error) {
    console.error('获取聊天详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建新的聊天会话
router.post('/', async (req, res) => {
  try {
    const { message, model = 'default' } = req.body;
    const db = getDb();

    // 开始事务
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // 创建聊天会话
      db.run(
        'INSERT INTO chats (user_id, title, model) VALUES (?, ?, ?)',
        [req.userId, '新对话', model],
        function(err) {
          if (err) {
            console.error('创建聊天错误:', err);
            db.run('ROLLBACK');
            return res.status(500).json({ message: '创建聊天失败' });
          }

          const chatId = this.lastID;

          // 添加用户消息
          db.run(
            'INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)',
            [chatId, 'user', message],
            function(err) {
              if (err) {
                console.error('添加用户消息错误:', err);
                db.run('ROLLBACK');
                return res.status(500).json({ message: '添加消息失败' });
              }

              // 模拟AI回复
              const aiResponse = {
                role: 'assistant',
                content: `这是对"${message}"的AI回复。`,
                timestamp: new Date().toISOString()
              };

              // 添加AI回复消息
              db.run(
                'INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)',
                [chatId, aiResponse.role, aiResponse.content],
                function(err) {
                  if (err) {
                    console.error('添加AI回复错误:', err);
                    db.run('ROLLBACK');
                    return res.status(500).json({ message: '添加AI回复失败' });
                  }

                  // 提交事务
                  db.run('COMMIT');

                  // 返回结果
                  res.status(201).json({
                    chatId,
                    message: aiResponse
                  });
                }
              );
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('创建聊天错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 向现有聊天添加消息
router.post('/:chatId/messages', (req, res) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const db = getDb();

    // 验证聊天存在且属于当前用户
    db.get(
      'SELECT * FROM chats WHERE id = ? AND user_id = ?',
      [chatId, req.userId],
      (err, chat) => {
        if (err) {
          console.error('验证聊天错误:', err);
          return res.status(500).json({ message: '服务器错误' });
        }

        if (!chat) {
          return res.status(404).json({ message: '聊天不存在或无权访问' });
        }

        // 开始事务
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');

          // 添加用户消息
          db.run(
            'INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)',
            [chatId, 'user', content],
            function(err) {
              if (err) {
                console.error('添加用户消息错误:', err);
                db.run('ROLLBACK');
                return res.status(500).json({ message: '添加消息失败' });
              }

              // 更新聊天的更新时间
              db.run(
                'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [chatId],
                (err) => {
                  if (err) {
                    console.error('更新聊天时间错误:', err);
                    db.run('ROLLBACK');
                    return res.status(500).json({ message: '更新聊天失败' });
                  }

                  // 模拟AI回复
                  const aiResponse = {
                    role: 'assistant',
                    content: `这是对"${content}"的AI回复。`,
                    timestamp: new Date().toISOString()
                  };

                  // 添加AI回复消息
                  db.run(
                    'INSERT INTO messages (chat_id, role, content) VALUES (?, ?, ?)',
                    [chatId, aiResponse.role, aiResponse.content],
                    function(err) {
                      if (err) {
                        console.error('添加AI回复错误:', err);
                        db.run('ROLLBACK');
                        return res.status(500).json({ message: '添加AI回复失败' });
                      }

                      // 提交事务
                      db.run('COMMIT');

                      // 返回结果
                      res.json({ message: aiResponse });
                    }
                  );
                }
              );
            }
          );
        });
      }
    );
  } catch (error) {
    console.error('添加消息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除聊天会话
router.delete('/:chatId', (req, res) => {
  try {
    const { chatId } = req.params;
    const db = getDb();

    // 验证聊天存在且属于当前用户
    db.get(
      'SELECT * FROM chats WHERE id = ? AND user_id = ?',
      [chatId, req.userId],
      (err, chat) => {
        if (err) {
          console.error('验证聊天错误:', err);
          return res.status(500).json({ message: '服务器错误' });
        }

        if (!chat) {
          return res.status(404).json({ message: '聊天不存在或无权访问' });
        }

        // 开始事务
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');

          // 删除聊天的所有消息
          db.run(
            'DELETE FROM messages WHERE chat_id = ?',
            [chatId],
            (err) => {
              if (err) {
                console.error('删除消息错误:', err);
                db.run('ROLLBACK');
                return res.status(500).json({ message: '删除消息失败' });
              }

              // 删除聊天
              db.run(
                'DELETE FROM chats WHERE id = ?',
                [chatId],
                (err) => {
                  if (err) {
                    console.error('删除聊天错误:', err);
                    db.run('ROLLBACK');
                    return res.status(500).json({ message: '删除聊天失败' });
                  }

                  // 提交事务
                  db.run('COMMIT');
                  res.json({ message: '聊天已删除' });
                }
              );
            }
          );
        });
      }
    );
  } catch (error) {
    console.error('删除聊天错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;