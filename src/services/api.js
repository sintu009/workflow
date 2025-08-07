import axios from 'axios';

const BASE_URL = '/api';

export const api = {
  getAllConditions: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getAllConditions`);
      return response.data.conditions || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching conditions:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
      } else {
        console.error('Error fetching conditions:', error);
      }
      return [];
    }
  },

  getNodeDetails: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getNodeDetails`);
      return {
        tasks: response.data.tasks || [],
        gateways: response.data.gateways || [],
        events: response.data.events || []
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error fetching node details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
      } else {
        console.error('Error fetching node details:', error);
      }
      return { tasks: [], gateways: [] };
    }
  },

  // ✅ NEW: Get all workflows
  getAllWorkflows: async () => {
    try {
      const response = await axios.get('/workflow-api/all-workflows');
      return response.data || [];
    } catch (error) {
      console.error("Error fetching workflows:", error);
      return [];
    }
  },

  // ✅ NEW: Get workflow JSON by name
  getWorkflowJson: async (workflowName) => {
    try {
      const response = await axios.get(`/workflow-api/json/${workflowName}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching workflow JSON for ${workflowName}:`, error);
      return null;
    }
  }
};
