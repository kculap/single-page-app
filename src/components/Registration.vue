<script setup>
import { ref, defineEmits } from 'vue';
import { ElNotification } from 'element-plus';
import CryptoJS from 'crypto-js';
import { useStore } from '../stores/store';

const store = useStore();
const emit = defineEmits(['goToLogin', 'checkForPage']);
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
const registrationData = ref({
  firstname: '',
  lastname: '',
  email: '',
  username: '',
  password: '',
  role: 'user',
});
const passwordModel = ref('');
const repeatPasswordModel = ref('');

function register() {
  checkData();
}

async function checkData() {
  let isError = false;

  // Firsname check
  if (registrationData.value.firstname.length < 3)
    return ElNotification({
      title: 'Firstname error',
      message: 'Firstname is too short. Minimum length is 3 chars.',
      duration: 3000,
      type: 'error',
    });
  else if (registrationData.value.firstname.length > 30)
    return ElNotification({
      title: 'Firstname error',
      message: 'Firstname is too long. Maximum length is 30 chars.',
      duration: 3000,
      type: 'error',
    });
  // Lastname check
  else if (registrationData.value.lastname.length < 3)
    return ElNotification({
      title: 'Lastname error',
      message: 'Lastname is too short. Minimum length is 3 chars.',
      duration: 3000,
      type: 'error',
    });
  else if (registrationData.value.lastname.length > 30)
    return ElNotification({
      title: 'Lastname error',
      message: 'Lastname is too long. Maximum length is 30 chars.',
      duration: 3000,
      type: 'error',
    });
  // Email check
  else if (!emailRegex.test(registrationData.value.email)) {
    return ElNotification({
      title: 'Email error',
      message: 'Wrong email form. Please type valid email.',
      duration: 3000,
      type: 'error',
    });
  }

  // Username check
  else if (registrationData.value.username.length < 5)
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
  else if (passwordModel.value !== repeatPasswordModel.value)
    return ElNotification({
      title: 'Password error',
      message: 'Passwords do not match.',
      duration: 3000,
      type: 'error',
    });

  // Email already exist check
  try {
    const response = await store.checkRegistrationEmail(
      registrationData.value.email
    );
    if (response.data[0]) {
      isError = true;
      ElNotification({
        title: 'Email already exist',
        message: 'This email already exist.',
        duration: 3000,
        type: 'error',
      });
    }
  } catch (error) {
    isError = true;
    ElNotification({
      title: 'Error occured',
      message: 'Something went wrong.',
      duration: 3000,
      type: 'error',
    });
  }

  // Username already exist check
  try {
    const response = await store.checkRegistrationUsername(
      registrationData.value.username
    );
    if (response.data[0]) {
      isError = true;
      ElNotification({
        title: 'Username already exist',
        message: 'This username already exist.',
        duration: 3000,
        type: 'error',
      });
    }
  } catch (error) {
    isError = true;
    ElNotification({
      title: 'Error occured',
      message: 'Something went wrong.',
      duration: 3000,
      type: 'error',
    });
  }

  if (!isError) save();
}

async function save() {
  registrationData.value.password = CryptoJS.MD5(
    passwordModel.value
  ).toString();
  try {
    const response = await store.userRegistration(registrationData.value);
    localStorage.setItem('userData', JSON.stringify(response.data));
    emit('checkForPage');
  } catch (error) {
    ElNotification({
      title: 'Registration error',
      message: 'Registration error occured.',
      duration: 3000,
      type: 'error',
    });
  }
}
</script>

<template>
  <div class="registration-container">
    <h3 class="main-color">Registration</h3>
    <div>
      <span>Fistname</span>
      <ElInput
        v-model="registrationData.firstname"
        placeholder="Firstname"
        @keyup.enter="register"
      />
    </div>
    <div>
      <span>Lastname</span>
      <ElInput
        v-model="registrationData.lastname"
        placeholder="Lastname"
        @keyup.enter="register"
      />
    </div>
    <div>
      <span>Email</span>
      <ElInput
        v-model="registrationData.email"
        placeholder="Email"
        @keyup.enter="register"
      />
    </div>
    <div>
      <span>Username</span>
      <ElInput
        v-model="registrationData.username"
        placeholder="Username"
        @keyup.enter="register"
      />
    </div>
    <div>
      <span>Password</span>
      <ElInput
        v-model="passwordModel"
        placeholder="Password"
        show-password
        @keydown.enter="register"
      />
    </div>
    <div>
      <span>Repeat Password</span>
      <ElInput
        v-model="repeatPasswordModel"
        placeholder="Repeat Password"
        show-password
        @keydown.enter="register"
      />
    </div>
    <br />
    <ElButton type="primary" plain @click="register">Register</ElButton>
    <ElLink type="primary" @click="emit('goToLogin')"
      >Have an account? Go to login</ElLink
    >
  </div>
</template>

<style scoped>
.registration-container {
  display: flex;
  flex-direction: column;
  row-gap: 18px;
}
</style>
