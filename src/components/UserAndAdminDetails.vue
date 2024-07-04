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
      title: 'Greška u lozinci',
      message: 'Lozinka je prekratka. Najmanje dopušteni broj znakova je 8.',
      duration: 3000,
      type: 'error',
    });
  else if (passwordForm.value.newPassword.length > 30)
    return ElNotification({
      title: 'Greška u lozinci',
      message: 'Lozinka je preduga. Najveći dopušteni broj znakova je 30.',
      duration: 3000,
      type: 'error',
    });
  else if (!passwordRegex.test(passwordForm.value.newPassword))
    return ElNotification({
      title: 'Greška u lozinci',
      message: 'Lozinka mora sadržavati najmanje jedno slovo i jedan broj.',
      duration: 3000,
      type: 'error',
    });
  else if (!passwordRegex.test(passwordForm.value.newPassword))
    return ElNotification({
      title: 'Greška u lozinci',
      message: 'Lozinka mora sadržavati najmanje jedno slovo i jedan broj.',
      duration: 3000,
      type: 'error',
    });
  else if (passwordForm.value.newPassword !== passwordForm.value.repeatPassword)
    return ElNotification({
      title: 'Greška u lozinci',
      message: 'Lozinke se ne podudaraju',
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
      title: 'Lozinka promijenjena',
      message: 'Lozinka je uspješno promijenjena',
      duration: 3000,
      type: 'success',
    });
    passwordForm.value.newPassword = '';
    passwordForm.value.repeatPassword = '';
  } catch (error) {
    ElNotification({
      title: 'Greška prilikom promjene lozinke',
      message: 'Pojavila se greška prilikom promjene lozinke. Pokušajte ponovo.',
      duration: 3000,
      type: 'error',
    });
  }
}
</script>

<template>
  <div class="user-details-container">
  <h3>Detalji</h3>
    <span> {{ `Korisničko ime: ${userData.username}` }} </span>
    <span> {{ `Ime: ${userData.firstname}` }} </span>
    <span> {{ `Prezime: ${userData.lastname}` }} </span>
    <span> {{ `Email: ${userData.email}` }} </span>
    <span>
      {{ `Uloga: ${userData.role[0].toUpperCase()}${userData.role.slice(1)}` }}
    </span>
  </div>
  <div class="change-pass-container user-details-container">
    <div class="flex-column">
      <span>Nova lozinka</span>
      <ElInput
        v-model="passwordForm.newPassword"
        class="input"
        placeholder="Lozinka"
        show-password
        @keydown.enter="savePasswordHandler"
      />
    </div>
    <div class="flex-column">
      <span>Ponovite lozinku</span>
      <ElInput
        v-model="passwordForm.repeatPassword"
        class="input"
        placeholder="Ponovite lozinku"
        show-password
        @keydown.enter="savePasswordHandler"
      />
    </div>
    <div class="flex-column">
      <ElButton type="primary" class="button" plain @click="savePasswordHandler"
        >Spremi</ElButton
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
