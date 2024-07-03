import { defineStore } from 'pinia';
import { onMounted, ref } from 'vue';
import axios from 'axios';
const apiUrl = import.meta.env.VITE_JSON_SERVER_API;

export const useStore = defineStore('store', () => {
  const adminRequestsNumber = ref(0);

  async function checkRegistrationEmail(email) {
    try {
      const response = await axios.get(`${apiUrl}/users?email=${email}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function checkRegistrationUsername(username) {
    try {
      const response = await axios.get(`${apiUrl}/users?username=${username}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function userRegistration(userData) {
    try {
      const response = await axios.post(`${apiUrl}/users`, userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function userLogin(userData) {
    try {
      const response = await axios.get(
        `${apiUrl}/users?username=${userData.username}`
      );
      if (response.data[0].password !== userData.password)
        throw new Error('Wrong password');
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function changeUserPassword(password) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    userData.password = password;
    try {
      const response = await axios.put(
        `${apiUrl}/users/${userData.id}`,
        userData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function saveAppointmentRequest(appointment) {
    try {
      await axios.post(`${apiUrl}/request`, appointment);
    } catch (error) {
      throw error;
    }
  }

  async function getAppointmentRequests(filterString) {
    try {
      const response = await axios.get(
        `${apiUrl}/request?${filterString ? filterString : ''}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function getTotalAppointmentRequests(filterString) {
    try {
      const response = await axios.get(
        `${apiUrl}/request?${filterString ? filterString : ''}`
      );
      return response.data.length;
    } catch (error) {
      throw error;
    }
  }

  async function deleteAppointment(id) {
    try {
      await axios.delete(`${apiUrl}/request/${id}`);
    } catch (error) {
      throw error;
    }
  }

  async function getAdminRequestsNumber() {
    try {
      const response = await axios.get(`${apiUrl}/request?status=waiting`);
      adminRequestsNumber.value = response.data.length;
    } catch (error) {
      throw error;
    }
  }

  async function putRequest(request) {
    try {
      const response = await axios.put(
        `${apiUrl}/request/${request.id}`,
        request
      );
      adminRequestsNumber.value -= 1;
      return response;
    } catch (error) {
      throw error;
    }
  }

  return {
    adminRequestsNumber,
    checkRegistrationEmail,
    checkRegistrationUsername,
    userRegistration,
    userLogin,
    changeUserPassword,
    saveAppointmentRequest,
    getAppointmentRequests,
    getTotalAppointmentRequests,
    deleteAppointment,
    getAdminRequestsNumber,
    putRequest,
  };
});
