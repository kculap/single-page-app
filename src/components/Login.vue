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
      title: 'Greška s korisničkim imenom',
      message: 'Korisničko ime je prekratko. Najmanja dopuštena dužina je 5 znakova',
      duration: 3000,
      type: 'error',
    });
  // Password check
  else if (passwordModel.value.length < 8)
    return ElNotification({
      title: 'Pogreška u lozinci',
      message: 'Lozinka je prekratka. Najmanja dopuštena dužina je 8 znakova',
      duration: 3000,
      type: 'error',
    });
  else if (passwordModel.value.length > 30)
    return ElNotification({
      title: 'Greška u lozinci',
      message: 'Lozinka je predugačka. Najviše dozvoljeni broj znakova je 30',
      duration: 3000,
      type: 'error',
    });
  else if (!passwordRegex.test(passwordModel.value))
    return ElNotification({
      title: 'Greška u lozinci',
      message: 'Lozinka mora sadržavati barem jedno slovo i jedan broj',
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
      title: 'Greška prilikom prijave',
      message: "Korisničko ime ili lozinka ne postoje",
      duration: 3000,
      type: 'error',
    });
  }
}
</script>

<template>
  <div class="login-container">
    <h3 class="main-color">Prijava</h3>
    <ElInput
      v-model="loginData.username"
      placeholder="Korisničko ime"
      @keyup.enter="login"
    />
    <ElInput
      v-model="passwordModel"
      placeholder="Lozinka"
      show-password
      @keydown.enter="login"
    />
    <ElButton type="primary" plain @click="login">Prijava</ElButton>
    <ElLink type="primary" @click="emit('goToRegistration')"
      >Nemate račun? Registrirajte se</ElLink
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
