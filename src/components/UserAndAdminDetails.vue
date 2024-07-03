<script setup>
import { ref } from 'vue';
import { ElNotification } from 'element-plus';
import { useStore } from '../stores/store';
import CryptoJS from 'crypto-js';

const store = useStore();
const userData = ref(JSON.parse(localStorage.getItem('userData')));
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
const passwordForm = ref({
  newPassword: '',
  repeatPassword: '',
});

function savePasswordHandler() {
  checkPassword();
}

function checkPassword() {
  if (passwordForm.value.newPassword.length < 8)
    return ElNotification({
      title: 'Password error',
      message: 'Password is too short. Minimum length is 8 chars.',
      duration: 3000,
      type: 'error',
    });
  else if (passwordForm.value.newPassword.length > 30)
    return ElNotification({
      title: 'Password error',
      message: 'Password is too long. Maximum length is 30 chars.',
      duration: 3000,
      type: 'error',
    });
  else if (!passwordRegex.test(passwordForm.value.newPassword))
    return ElNotification({
      title: 'Password error',
      message: 'Password must contain at least 1 letter and 1 number.',
      duration: 3000,
      type: 'error',
    });
  else if (!passwordRegex.test(passwordForm.value.newPassword))
    return ElNotification({
      title: 'Password error',
      message: 'Password must contain at least 1 letter and 1 number.',
      duration: 3000,
      type: 'error',
    });
  else if (passwordForm.value.newPassword !== passwordForm.value.repeatPassword)
    return ElNotification({
      title: 'Password error',
      message: 'Passwords do not match.',
      duration: 3000,
      type: 'error',
    });
  else savePassword();
}

async function savePassword() {
  try {
    const response = await store.changeUserPassword(
      CryptoJS.MD5(passwordForm.value.newPassword).toString()
    );
    localStorage.setItem('userData', JSON.stringify(response.data));
    ElNotification({
      title: 'Password saved',
      message: 'Password saved successfully.',
      duration: 3000,
      type: 'success',
    });
    passwordForm.value.newPassword = '';
    passwordForm.value.repeatPassword = '';
  } catch (error) {
    ElNotification({
      title: 'Password change error',
      message: 'Password change error occured.',
      duration: 3000,
      type: 'error',
    });
  }
}
</script>

<template>
  <div class="user-details-container">
    <span> {{ `Username: ${userData.username}` }} </span>
    <span> {{ `Firstname: ${userData.firstname}` }} </span>
    <span> {{ `Lastname: ${userData.lastname}` }} </span>
    <span> {{ `Email: ${userData.email}` }} </span>
    <span>
      {{ `Role: ${userData.role[0].toUpperCase()}${userData.role.slice(1)}` }}
    </span>
  </div>
  <div class="change-pass-container user-details-container">
    <div class="flex-column">
      <span>New Password</span>
      <ElInput
        v-model="passwordForm.newPassword"
        class="input"
        placeholder="Password"
        show-password
        @keydown.enter="savePasswordHandler"
      />
    </div>
    <div class="flex-column">
      <span>Repeat Password</span>
      <ElInput
        v-model="passwordForm.repeatPassword"
        class="input"
        placeholder="Repeat Password"
        show-password
        @keydown.enter="savePasswordHandler"
      />
    </div>
    <div class="flex-column">
      <ElButton type="primary" class="button" plain @click="savePasswordHandler"
        >Save</ElButton
      >
    </div>
  </div>
</template>

<style scoped>
.user-details-container {
  display: flex;
  flex-direction: column;
  row-gap: 18px;
}
.change-pass-container {
  margin-top: 40px;
}
.input {
  width: 214px;
}
.button {
  width: 100px;
}
.flex-column {
  display: flex;
  flex-direction: column;
  margin: auto;
}
</style>
