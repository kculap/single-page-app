<script setup>
import { ref } from 'vue';
import UserAppointments from './components/UserAppointments.vue';
import UserDetails from '../UserAndAdminDetails.vue';
import UserNewAppointment from './components/UserNewAppointment.vue';
import UserDashboardRoomsStatus from './components/UserDashboardRoomsStatus.vue';

const emit = defineEmits(['checkForPage']);
const userData = ref(JSON.parse(localStorage.getItem('userData')));
const tab = ref('Dashboard');

function logout() {
  localStorage.removeItem('userData');
  emit('checkForPage');
}
</script>

<template>
  <ElContainer class="user-main-container">
    <ElHeader>
      <div class="user-header-wrapper">
        <div class="user-header-part">
          <img
            src="../../assets/icon.png"
            alt="Library organizer"
            width="32"
            height="32"
          />
          <ElLink class="color-white" @click="tab = 'User Details'">
            {{
              `${userData.role[0].toUpperCase()}${userData.role.slice(1)}: ${userData.username}`
            }}
          </ElLink>
        </div>
        <div class="user-header-part">
          <ElLink class="color-white" :class="{ 'active-link': tab === 'Dashboard' }" @click="tab = 'Dashboard'">
            Početna
          </ElLink>
          <ElLink class="color-white" :class="{ 'active-link': tab === 'New Appointment' }" @click="tab = 'New Appointment'">
            Rezervacija
          </ElLink>
          <ElLink class="color-white" :class="{ 'active-link': tab === 'User Details' }" @click="tab = 'User Details'">
            {{ userData.username }}
          </ElLink>
        </div>
        <div class="user-header-part">
          <ElButton type="primary" plain @click="logout"> Odjava </ElButton>
        </div>
      </div>
    </ElHeader>
    <ElMain>
      
      <UserDetails v-if="tab === 'User Details'" />
      <UserNewAppointment
        v-else-if="tab === 'New Appointment'"
        @go-to-appointments="tab = 'Dashboard'"
      />
      <div v-else>
        <UserDashboardRoomsStatus />
        <UserAppointments />
      </div>
    </ElMain>
  </ElContainer>
</template>

<style scoped>
.user-main-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 90%;
  height: 100vh;
  margin: 0 5% 0 5%;
}
.user-header-wrapper {
  background-color: rgba(100, 108, 255, 0.7);
  border-radius: 5px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}
.user-header-part {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}
.active-link {
  text-decoration: underline;
  text-decoration-color: var(--main-color);
  text-underline-offset: 4px;
}
</style>
