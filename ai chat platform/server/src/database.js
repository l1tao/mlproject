const sqlite3 = require('sqlite3').verbose();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// 确保数据目录存在
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// SQLite数据库路径
const dbPath = process.env.DB_PATH || path.join(dataDir, 'chat.db');

// 初始化SQLite数据库
const initSqliteDb = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('SQLite数据库连接失败:', err.message);
        reject(err);
        return;
      }
      console.log('已连接到SQLite数据库');
      
      // 创建用户表
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
      
      // 创建聊天会话表
      db.run(`CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        model TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);
      
      // 创建消息表
      db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chat_id) REFERENCES chats (id)
      )`, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      });
      
      // 创建模型配置表
      db.run(`CREATE TABLE IF NOT EXISTS model_configs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        api_type TEXT NOT NULL,
        api_key TEXT,
        api_url TEXT,
        model_name TEXT NOT NULL,
        is_default BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
    });
  });
};

// 初始化MongoDB数据库（可选）
const initMongoDb = async () => {
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('已连接到MongoDB数据库');
      return true;
    } catch (error) {
      console.error('MongoDB数据库连接失败:', error.message);
      return false;
    }
  }
  return false;
};

// 数据库连接实例
let db = null;
let mongoConnected = false;

// 设置数据库
const setupDatabase = async () => {
  try {
    // 初始化SQLite
    db = await initSqliteDb();
    
    // 尝试初始化MongoDB（如果配置了）
    mongoConnected = await initMongoDb();
    
    return { db, mongoConnected };
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

// 获取SQLite数据库实例
const getDb = () => {
  if (!db) {
    throw new Error('数据库未初始化');
  }
  return db;
};

// 检查MongoDB是否已连接
const isMongoConnected = () => mongoConnected;

module.exports = {
  setupDatabase,
  getDb,
  isMongoConnected,
};