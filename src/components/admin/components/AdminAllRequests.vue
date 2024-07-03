<script setup>
import { onMounted, ref } from 'vue';
import { useStore } from '../../../stores/store';
import { ElNotification } from 'element-plus';
import { storeToRefs } from 'pinia';
import {
  formatToDateTime,
  formatToDate,
  formatToTime,
} from '../../../composables/dateTimeConverter';
import {
  CircleCheckFilled,
  CircleCloseFilled,
  DeleteFilled,
  SemiSelect,
} from '@element-plus/icons-vue';

const store = useStore();
const loading = ref(true);
const requests = ref([]);
const pagination = ref({
  page: 1,
  perPage: 5,
  total: 0,
});
const deleteDialog = ref({
  open: false,
  request: null,
});
const nowTimestamp = new Date().getTime();

onMounted(() => {
  getTotalRequests();
  getRequests();
});

async function getRequests() {
  loading.value = true;
  try {
    const response = await store.getAppointmentRequests(
      `status=done&_page=${pagination.value.page}&_limit=${pagination.value.perPage}&_sort=startTime&_order=asc`
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

async function getTotalRequests() {
  try {
    const total = await store.getTotalAppointmentRequests(`status=done`);
    pagination.value.total = total;
  } catch (error) {}
}

function handleCurrentChange(page) {
  pagination.value.page = page;
  scrollToTop();
  getRequests();
}

function openDeleteDialog(request) {
  deleteDialog.value.request = request;
  deleteDialog.value.open = true;
}

async function deleteRequest() {
  try {
    await store.deleteAppointment(deleteDialog.value.request?.id);
    deleteDialog.value.open = false;
    deleteDialog.value.request = null;
    scrollToTop();
    getRequests();
  } catch (error) {
    ElNotification({
      title: 'Request delete error',
      message: 'Error occured while deleting request.',
      duration: 3000,
      type: 'error',
    });
  }
}

function scrollToTop() {
  const mainDiv = document.querySelector('.el-main');
  if (mainDiv) {
    mainDiv.scrollTo({
      top: 0,
      behavior: 'smooth',
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
      <div class="status-container">
        <span class="color-white">Status:</span>
        <ElIcon
          :color="
            request.approved && request.status === 'done'
              ? '#67c23a'
              : !request.approved && request.status === 'done'
                ? '#f56c6c'
                : 'white'
          "
          size="24"
        >
          <CircleCheckFilled
            v-if="request.approved && request.status === 'done'"
          />
          <CircleCloseFilled
            v-else-if="!request.approved && request.status === 'done'"
          />
          <SemiSelect v-else />
        </ElIcon>
        <span class="color-white">{{
          request.status === 'waiting'
            ? 'Waiting'
            : request.approved
              ? 'Approved'
              : 'Not Approved'
        }}</span>
      </div>
      <span v-if="nowTimestamp < request.startTime" style="color: #67c23a"
        >-- Upcoming --</span
      >
      <span
        v-else-if="
          nowTimestamp >= request.startTime && nowTimestamp <= request.endTime
        "
        class="color-black"
        >-- In progress --</span
      >
      <span v-else style="color: #f56c6c">-- Completed --</span>
      <div class="button-footer-container">
        <ElButton type="danger" plain @click="openDeleteDialog(request)">
          <ElIcon><DeleteFilled /></ElIcon>
        </ElButton>
      </div>
    </div>
    <ElPagination
      class="pagination-container"
      background
      layout="prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.perPage"
      @current-change="handleCurrentChange"
    />
  </div>

  <ElDialog v-model="deleteDialog.open" title="Delete Request" width="500">
    <div class="dialog-card">
      <span> Room: {{ deleteDialog.request?.room }} </span>
      <span>
        Date:
        {{
          deleteDialog.request
            ? formatToDate(deleteDialog.request?.date)
            : undefined
        }}
      </span>
      <span>
        Starting time:
        {{
          deleteDialog.request
            ? formatToTime(deleteDialog.request?.startTime)
            : undefined
        }}
      </span>
      <span>
        Ending time:
        {{
          deleteDialog.request
            ? formatToTime(deleteDialog.request?.endTime)
            : undefined
        }}
      </span>
      <span> Log time: {{ deleteDialog.request?.timeLog }} </span>
      <div class="status-container">
        <span>Status:</span>
        <ElIcon
          :color="deleteDialog.request?.approved ? '#67c23a' : '#f56c6c'"
          size="24"
        >
          <CircleCheckFilled v-if="deleteDialog.request?.approved" />
        </ElIcon>
        <span>{{
          deleteDialog.request?.approved ? 'Approved' : 'Not Approved'
        }}</span>
      </div>
      <span
        v-if="nowTimestamp < deleteDialog.request?.startTime"
        style="color: #67c23a"
        >-- Upcoming --</span
      >
      <span
        v-else-if="
          nowTimestamp >= deleteDialog.request?.startTime &&
          nowTimestamp <= deleteDialog.request?.endTime
        "
        class="color-black"
        >-- In progress --</span
      >
      <span v-else style="color: #f56c6c">-- Completed --</span>
    </div>
    <template #footer>
      <ElButton plain @click="deleteDialog.open = false">Cancel</ElButton>
      <ElButton plain type="danger" @click="deleteRequest">
        <ElIcon style="margin-right: 5px"><DeleteFilled /></ElIcon>
        Delete
      </ElButton>
    </template>
  </ElDialog>
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
.status-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
.dialog-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
