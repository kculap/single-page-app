<script setup>
import { onMounted, ref } from 'vue';
import Login from './Login.vue';
import Registration from './Registration.vue';
import User from './user/User.vue';
import Admin from './admin/Admin.vue';

const page = ref();

onMounted(() => checkForPage());

function checkForPage() {
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (
    !userData ||
    !userData.firstname ||
    !userData.lastname ||
    !userData.username ||
    !userData.email ||
    !userData.id ||
    !userData.role ||
    !userData.password
  ) {
    localStorage.removeItem('userData');
    page.value = 'login';
  } else if (userData.role === 'libraryAdmin') page.value = 'libraryAdmin';
  else page.value = 'user';
}
</script>

<template>
  <div class="background-container">
    <User
      v-if="page === 'user'"
      @go-to-registration="page = 'registration'"
      @check-for-page="checkForPage"
    />
    <Admin
      v-else-if="page === 'libraryAdmin'"
      @go-to-login="page = 'login'"
      @check-for-page="checkForPage"
    />
    <Registration
      v-else-if="page === 'registration'"
      @go-to-login="page = 'login'"
      @check-for-page="checkForPage"
    />
    <Login
      v-else
      @go-to-registration="page = 'registration'"
      @check-for-page="checkForPage"
    />
  </div>
</template>

<style scoped></style>
