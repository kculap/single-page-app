<script setup>
import { onMounted, ref } from 'vue';
import { useStore } from '../../../stores/store';
import { ElNotification } from 'element-plus';
import { storeToRefs } from 'pinia';
import {
  formatToDate,
  formatToTime,
} from '../../../composables/dateTimeConverter';

const store = useStore();
const { adminRequestsNumber } = storeToRefs(store);
const loading = ref(true);
const requests = ref([]);
const pagination = ref({
  page: 1,
  perPage: 5,
});

onMounted(() => getRequests());

async function getRequests() {
  loading.value = true;
  try {
    const response = await store.getAppointmentRequests(
      `status=waiting&_page=${pagination.value.page}&_limit=${pagination.value.perPage}&_sort=startTime&_order=asc`
    );
    requests.value = response.data;
  } catch (error) {
    ElNotification({
      title: 'Geting requests error',
      message: 'Error occured while geting requests.',
      duration: 3000,
      type: 'error',
    });
  } finally {
    loading.value = false;
  }
}

function handleCurrentChange(page) {
  pagination.value.page = page;
  const mainDiv = document.querySelector('.el-main');
  if (mainDiv) {
    mainDiv.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
  getRequests();
}

function rejectRequestHandler(request) {
  request.status = 'done';
  saveRequest(request);
}

function approveRequestHandler(request) {
  request.approved = true;
  request.status = 'done';
  saveRequest(request);
}

async function saveRequest(request) {
  try {
    await store.putRequest(request);
    getRequests();
  } catch (error) {
    ElNotification({
      title: 'Saving request error',
      message: 'Error occured while saving requests changes.',
      duration: 3000,
      type: 'error',
    });
  }
}
</script>

<template>
  <ElEmpty v-if="!loading && !requests?.length" description="No requests" />
  <div class="request-cards-container" v-else>
    <div
      v-bind:key="request.id"
      v-for="request in requests"
      class="request-card"
    >
      <span>Room: {{ request.room }}</span>
      <span>Username: {{ request.username }}</span>
      <span>Fullname: {{ request.fullname }}</span>
      <span>Date: {{ formatToDate(request.date) }}</span>
      <span>Starting time: {{ formatToTime(request.startTime) }}</span>
      <span>Ending time: {{ formatToTime(request.endTime) }}</span>
      <span>Log time: {{ request.timeLog }}</span>
      <div class="button-footer-container">
        <ElButton type="danger" plain @click="rejectRequestHandler(request)">
          Reject
        </ElButton>
        <ElButton type="success" plain @click="approveRequestHandler(request)">
          Approve
        </ElButton>
      </div>
    </div>
    <ElPagination
      class="pagination-container"
      background
      layout="prev, pager, next"
      :total="adminRequestsNumber"
      :page-size="pagination.perPage"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<style scoped>
.request-cards-container {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.request-card {
  background-color: var(--main-color);
  padding: 18px;
  border: solid 2px white;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.button-footer-container {
  display: flex;
  gap: 18px;
  justify-content: center;
  align-items: center;
}
.pagination-container {
  justify-content: center;
  margin-bottom: 50px;
}
</style>
