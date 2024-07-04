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
      title: 'Greška u imenu',
      message: 'Ime je prekratko. Najmanja dužina znakova je 3',
      duration: 3000,
      type: 'error',
    });
  else if (registrationData.value.firstname.length > 30)
    return ElNotification({
      title: 'Greška u imenu',
      message: 'Ime je predugačko. Najveća dopuštena dužina znakova je 30',
      duration: 3000,
      type: 'error',
    });
  // Lastname check
  else if (registrationData.value.lastname.length < 3)
    return ElNotification({
      title: 'Greška u prezimenu',
      message: 'Prezime je prekratko. Najmanja dopuštena dužina je 3 znaka',
      duration: 3000,
      type: 'error',
    });
  else if (registrationData.value.lastname.length > 30)
    return ElNotification({
      title: 'Greška u prezimenu',
      message: 'Prezime je predugačko. Najveća dopuštena dužina znakova je 30',
      duration: 3000,
      type: 'error',
    });
  // Email check
  else if (!emailRegex.test(registrationData.value.email)) {
    return ElNotification({
      title: 'Greška u email adresi',
      message: 'Email adresa ne postoji. Upišite ispravnu email adresu.',
      duration: 3000,
      type: 'error',
    });
  }

  // Username check
  else if (registrationData.value.username.length < 5)
    return ElNotification({
      title: 'Greška u korisničkom imenu',
      message: 'Korisničko ime je prekratko. Najmanja dopuštena dužina je 5 znakova.',
      duration: 3000,
      type: 'error',
    });
  // Password check
  else if (passwordModel.value.length < 8)
    return ElNotification({
      title: 'Greška u lozinci',
      message: 'Lozinka je prekratka. Minimalna dopuštena dužina je 8 znakova.',
      duration: 3000,
      type: 'error',
    });
  else if (passwordModel.value.length > 30)
    return ElNotification({
      title: 'Greška u lozinci',
      message: 'Lozinka je preduga. Najveća dopuštena dužina je 30 znakova',
      duration: 3000,
      type: 'error',
    });
  else if (!passwordRegex.test(passwordModel.value))
    return ElNotification({
      title: 'Greška u lozinci',
      message: 'Lozinka mora sadržavati barem jedno slovo i jedan broj.',
      duration: 3000,
      type: 'error',
    });
  else if (passwordModel.value !== repeatPasswordModel.value)
    return ElNotification({
      title: 'Greška u lozinci',
      message: 'Lozinke se ne podudaraju',
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
        title: 'Email adresa se već koristi',
        message: 'Korisnik s istom email adresom je već registiran',
        duration: 3000,
        type: 'error',
      });
    }
  } catch (error) {
    isError = true;
    ElNotification({
      title: 'Pojavila se greška',
      message: 'Nešto je pošlo po krivu.',
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
        title: 'Greška s korisničkim imenom',
        message: 'Korisničko ime koje ste upisali se već koristi',
        duration: 3000,
        type: 'error',
      });
    }
  } catch (error) {
    isError = true;
    ElNotification({
      title: 'Pojavila se greška',
      message: 'Nešto je pošlo po krivu',
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
      title: 'Greška u registraciji',
      message: 'Pojavila se greška prilikom registracije',
      duration: 3000,
      type: 'error',
    });
  }
}
</script>

<template>
  <div class="registration-container">
    <h3 class="main-color">Registracija</h3>
    <div>
      <span>Ime</span>
      <ElInput
        v-model="registrationData.firstname"
        placeholder="Ime"
        @keyup.enter="register"
      />
    </div>
    <div>
      <span>Prezime</span>
      <ElInput
        v-model="registrationData.lastname"
        placeholder="Prezime"
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
      <span>Korisničko ime</span>
      <ElInput
        v-model="registrationData.username"
        placeholder="Korisničko ime"
        @keyup.enter="register"
      />
    </div>
    <div>
      <span>Lozinka</span>
      <ElInput
        v-model="passwordModel"
        placeholder="Lozinka"
        show-password
        @keydown.enter="register"
      />
    </div>
    <div>
      <span>Ponovite lozinku</span>
      <ElInput
        v-model="repeatPasswordModel"
        placeholder="Ponovite lozinku"
        show-password
        @keydown.enter="register"
      />
    </div>
    <br />
    <ElButton type="primary" plain @click="register">Registracija</ElButton>
    <ElLink type="primary" @click="emit('goToLogin')"
      >Već imate račun? Prijavite se.</ElLink
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
