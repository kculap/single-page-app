<script setup>
import { onMounted, ref } from 'vue';
import { useStore } from '../../stores/store';
import { ElNotification } from 'element-plus';
import AdminDetails from '../UserAndAdminDetails.vue';
import AdminRequests from './components/AdminRequests.vue';
import AdminAllRequests from './components/AdminAllRequests.vue';
import AdminGroupOverview from './components/AdminGroupOverview.vue';
import { storeToRefs } from 'pinia';

const emit = defineEmits(['checkForPage']);
const store = useStore();
const { adminRequestsNumber } = storeToRefs(store);
const userData = ref(JSON.parse(localStorage.getItem('userData')));
const tab = ref('New Requests');

onMounted(() => getRequestsNumber());

async function getRequestsNumber() {
  try {
    await store.getAdminRequestsNumber();
  } catch (error) {
    ElNotification({
      title: 'Getting request number error',
      message: 'Error occured while getting request number.',
      duration: 3000,
      type: 'error',
    });
  }
}

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
          <ElLink class="color-white" @click="tab = 'New Requests'">
            <span :class="{ 'active-new-request-link': tab === 'New Requests' }"
              >New Requests</span
            >
            <div v-if="adminRequestsNumber" class="requests-number">
              {{ adminRequestsNumber }}
            </div>
          </ElLink>
          <ElLink
            class="color-white"
            :class="{ 'active-link': tab === 'Requests' }"
            @click="tab = 'Requests'"
          >
            Requests
          </ElLink>
          <ElLink
            class="color-white"
            :class="{ 'active-link': tab === 'Quiet Work' }"
            @click="tab = 'Quiet Work'"
          >
            Quiet Work
          </ElLink>
          <ElLink
            class="color-white"
            :class="{ 'active-link': tab === 'Group Work' }"
            @click="tab = 'Group Work'"
          >
            Group Work
          </ElLink>
          <ElLink
            class="color-white"
            :class="{ 'active-link': tab === 'Reading Room' }"
            @click="tab = 'Reading Room'"
          >
            Reading Room
          </ElLink>
          <ElLink
            class="color-white"
            :class="{ 'active-link': tab === 'User Details' }"
            @click="tab = 'User Details'"
          >
            {{ userData.username }}
          </ElLink>
        </div>
        <div class="user-header-part">
          <ElButton type="primary" plain @click="logout"> Logout </ElButton>
        </div>
      </div>
    </ElHeader>
    <ElMain>
      <h3>{{ tab }}</h3>
      <AdminRequests v-if="tab === 'New Requests'" />
      <AdminAllRequests v-else-if="tab === 'Requests'" />
      <AdminGroupOverview
        v-else-if="
          (tab === 'Quiet Work') |
            (tab === 'Group Work') |
            (tab === 'Reading Room')
        "
        :group="tab"
      />
      <AdminDetails v-else />
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
.requests-number {
  background-color: red;
  border-radius: 100%;
  width: 20px;
  height: 20px;
  margin-bottom: 10px;
}
.active-link {
  text-decoration: underline;
  text-decoration-color: var(--main-color);
  text-underline-offset: 4px;
}
.active-new-request-link {
  text-decoration: underline;
  text-decoration-color: var(--main-color);
  text-underline-offset: 8px;
}
</style>
