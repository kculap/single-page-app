<script setup>
import { ref, defineEmits } from 'vue';
import CryptoJS from 'crypto-js';
import { useStore } from '../stores/store';
import { ElNotification } from 'element-plus';

const store = useStore();
const emit = defineEmits(['goToRegistration', 'checkForPage']);
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
const loginData = ref({
  username: '',
  password: '',
});
const passwordModel = ref('');

function login() {
  checkData();
}

function checkData() {
  if (loginData.value.username.length < 5)
    return ElNotification({
      title: 'Username error',
      message: 'Username is too short. Minimum length is 5 chars.',
      duration: 3000,
      type: 'error',
    });
  // Password check
  else if (passwordModel.value.length < 8)
    return ElNotification({
      title: 'Password error',
      message: 'Password is too short. Minimum length is 8 chars.',
      duration: 3000,
      type: 'error',
    });
  else if (passwordModel.value.length > 30)
    return ElNotification({
      title: 'Password error',
      message: 'Password is too long. Maximum length is 30 chars.',
      duration: 3000,
      type: 'error',
    });
  else if (!passwordRegex.test(passwordModel.value))
    return ElNotification({
      title: 'Password error',
      message: 'Password must contain at least 1 letter and 1 number.',
      duration: 3000,
      type: 'error',
    });

  loginUser();
}

async function loginUser() {
  loginData.value.password = CryptoJS.MD5(passwordModel.value).toString();
  try {
    const response = await store.userLogin(loginData.value);
    localStorage.setItem('userData', JSON.stringify(response.data[0]));
    emit('checkForPage');
  } catch (error) {
    ElNotification({
      title: 'Login error',
      message: "Username or password doesn't exist.",
      duration: 3000,
      type: 'error',
    });
  }
}
</script>

<template>
  <div class="login-container">
    <h3 class="main-color">Login</h3>
    <ElInput
      v-model="loginData.username"
      placeholder="Username"
      @keyup.enter="login"
    />
    <ElInput
      v-model="passwordModel"
      placeholder="Password"
      show-password
      @keydown.enter="login"
    />
    <ElButton type="primary" plain @click="login">Login</ElButton>
    <ElLink type="primary" @click="emit('goToRegistration')"
      >Don't have an account? Go to registration</ElLink
    >
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  row-gap: 18px;
}
</style>
