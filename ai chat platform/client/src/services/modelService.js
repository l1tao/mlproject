import axios from 'axios';

const API_URL = '/api';

// 模型相关API服务
export const modelService = {
  // 获取所有模型
  getAllModels: async () => {
    try {
      const response = await axios.get(`${API_URL}/models`);
      return response.data.models;
    } catch (error) {
      console.error('获取模型列表失败:', error);
      throw error;
    }
  },

  // 获取默认模型
  getDefaultModel: async () => {
    try {
      const response = await axios.get(`${API_URL}/models/default`);
      return response.data.model;
    } catch (error) {
      console.error('获取默认模型失败:', error);
      throw error;
    }
  },

  // 获取特定模型
  getModelById: async (modelId) => {
    try {
      const response = await axios.get(`${API_URL}/models/${modelId}`);
      return response.data.model;
    } catch (error) {
      console.error('获取模型详情失败:', error);
      throw error;
    }
  }
};