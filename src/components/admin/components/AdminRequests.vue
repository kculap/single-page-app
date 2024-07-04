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
      title: 'Greška prilikom dohvaćanja zahtjeva',
      message: 'Dogodila se greška prilikom dohvaćanja zahtjeva',
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
      title: 'Greška prilikom spremanja',
      message: 'Pojavila se greška prilikom spremanja promjena',
      duration: 3000,
      type: 'error',
    });
  }
}
</script>

<template>
<h3>Novi zahtjevi</h3>
  <ElEmpty v-if="!loading && !requests?.length" description="Nema novih zahtjeva" />
  <div class="request-cards-container" v-else>
    <div
      v-bind:key="request.id"
      v-for="request in requests"
      class="request-card"
    >
      <span>Prostorija: {{ request.room }}</span>
      <span>Korisničko ime: {{ request.username }}</span>
      <span>Ime: {{ request.fullname }}</span>
      <span>Datum: {{ formatToDate(request.date) }}</span>
      <span>Početak termina: {{ formatToTime(request.startTime) }}</span>
      <span>Kraj termina: {{ formatToTime(request.endTime) }}</span>
      <span>Trajanje termina: {{ request.timeLog }}</span>
      <div class="button-footer-container">
        <ElButton type="danger" plain @click="rejectRequestHandler(request)">
          Odbij zahtjev
        </ElButton>
        <ElButton type="success" plain @click="approveRequestHandler(request)">
          Prihvati zahtjev
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
