<script setup>
import { onMounted, ref } from 'vue';
import { ElIcon, ElNotification } from 'element-plus';
import { useStore } from '../../../stores/store';
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
const userData = ref(JSON.parse(localStorage.getItem('userData')));
const appointments = ref([]);
const loading = ref(true);
const pagination = ref({
  page: 1,
  perPage: 5,
  total: 0,
});
const deleteDialog = ref({
  open: false,
  appointment: null,
});
const nowTimestamp = new Date().getTime();

onMounted(() => {
  getTotalAppointments();
  getAppointments();
});

async function getAppointments() {
  loading.value = true;
  try {
    const response = await store.getAppointmentRequests(
      `username=${userData.value.username}&_page=${pagination.value.page}&_limit=${pagination.value.perPage}&_sort=startTime&_order=asc`
    );
    appointments.value = response.data;
  } catch (error) {
    ElNotification({
      title: 'Greška u dohvaćanju zahtjeva',
      message: 'Pojavila se greška prilikom dohvaćanja zahtjeva',
      duration: 3000,
      type: 'error',
    });
  } finally {
    loading.value = false;
  }
}

async function getTotalAppointments() {
  try {
    const total = await store.getTotalAppointmentRequests(
      `username=${userData.value.username}`
    );
    pagination.value.total = total;
  } catch (error) {}
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
  getAppointments();
}

function openDeleteDialog(appointment) {
  deleteDialog.value.appointment = appointment;
  deleteDialog.value.open = true;
}

async function deleteAppointment() {
  try {
    await store.deleteAppointment(deleteDialog.value.appointment?.id);
    deleteDialog.value.open = false;
    deleteDialog.value.appointment = null;
    getAppointments();
  } catch (error) {
    ElNotification({
      title: 'Greška prilikom brisanja zahtjeva',
      message: 'Pojavila se greška prilikom brisanja zahtjeva. Pokušajte ponovo.',
      duration: 3000,
      type: 'error',
    });
  }
}
</script>

<template>
  <ElEmpty
    v-if="!loading && !appointments.length"
    description="Nema poslanih zahtjeva"
  />
  <div v-else>
    <h3>Zahtjevi</h3>
    <ElTimeline class="timeline">
      <ElTimelineItem
        v-bind:key="appointment.id"
        v-for="appointment in appointments"
        :timestamp="formatToDateTime(appointment.startTime)"
        placement="top"
        color="#646cff"
        size="large"
      >
        <div class="card">
          <span class="color-white"> Prostorija: {{ appointment.room }} </span>
          <span class="color-white">
            Početak: {{ formatToTime(appointment.startTime) }}
          </span>
          <span class="color-white">
            Završetak: {{ formatToTime(appointment.endTime) }}
          </span>
          <span class="color-white"> Trajanje termina: {{ appointment.timeLog }} </span>
          <div class="status-container">
            <span class="color-white">Status:</span>
            <ElIcon
              :color="
                appointment.approved && appointment.status === 'done'
                  ? '#67c23a'
                  : !appointment.approved && appointment.status === 'done'
                    ? '#f56c6c'
                    : 'white'
              "
              size="24"
            >
              <CircleCheckFilled
                v-if="appointment.approved && appointment.status === 'done'"
              />
              <CircleCloseFilled
                v-else-if="
                  !appointment.approved && appointment.status === 'done'
                "
              />
              <SemiSelect v-else />
            </ElIcon>
            <span class="color-white">{{
              appointment.status === 'waiting'
                ? 'Na čekanju'
                : appointment.approved
                  ? 'Zahtjev odobren'
                  : 'Zahtjev odbijen'
            }}</span>
          </div>
          <span
            v-if="nowTimestamp < appointment.startTime"
            style="color: #67c23a"
            >-- Nadolazi --</span
          >
          <span
            v-else-if="
              nowTimestamp >= appointment.startTime &&
              nowTimestamp <= appointment.endTime
            "
            >-- U tijeku --</span
          >
          <span v-else style="color: #f56c6c">-- Završeno --</span>
          <div>
            <ElButton
              type="danger"
              plain
              @click="openDeleteDialog(appointment)"
            >
              <ElIcon><DeleteFilled /></ElIcon>
            </ElButton>
          </div>
        </div>
      </ElTimelineItem>
    </ElTimeline>
    <ElPagination
      class="pagination-container"
      background
      layout="prev, pager, next"
      :total="pagination.total"
      :page-size="pagination.perPage"
      @current-change="handleCurrentChange"
    />
  </div>

  <ElDialog v-model="deleteDialog.open" title="Brisanje zahtjeva" width="500">
    <div class="dialog-card">
      <span> Prostorija: {{ deleteDialog.appointment?.room }} </span>
      <span>
        Datum:
        {{
          deleteDialog.appointment
            ? formatToDate(deleteDialog.appointment?.date)
            : undefined
        }}
      </span>
      <span>
        Početak:
        {{
          deleteDialog.appointment
            ? formatToTime(deleteDialog.appointment?.startTime)
            : undefined
        }}
      </span>
      <span>
        Završetak:
        {{
          deleteDialog.appointment
            ? formatToTime(deleteDialog.appointment?.endTime)
            : undefined
        }}
      </span>
      <span> Trajanje termina: {{ deleteDialog.appointment?.timeLog }} </span>
      <div class="status-container">
        <span>Status:</span>
        <ElIcon
          :color="deleteDialog.appointment?.approved ? '#67c23a' : '#f56c6c'"
          size="24"
        >
          <CircleCheckFilled v-if="deleteDialog.appointment?.approved" />
        </ElIcon>
        <span>{{
          deleteDialog.appointment?.approved ? 'Zahtjev odobren' : 'Zahtjev odbijen'
        }}</span>
      </div>
      <span
        v-if="nowTimestamp < deleteDialog.appointment?.startTime"
        style="color: #67c23a"
        >-- Nadolazi --</span
      >
      <span
        v-else-if="
          nowTimestamp >= deleteDialog.appointment?.startTime &&
          nowTimestamp <= deleteDialog.appointment?.endTime
        "
        class="color-black"
        >-- U tijeku --</span
      >
      <span v-else style="color: #f56c6c">-- Završeno --</span>
    </div>
    <template #footer>
      <ElButton plain @click="deleteDialog.open = false">Natrag</ElButton>
      <ElButton plain type="danger" @click="deleteAppointment">
        <ElIcon style="margin-right: 5px"><DeleteFilled /></ElIcon>
        Obriši
      </ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
.timeline {
  padding-right: 60px;
}
.card {
  background-color: var(--main-color);
  padding: 18px;
  border: solid 2px white;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.status-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
}
.pagination-container {
  justify-content: center;
  margin-bottom: 50px;
}
.first-card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dialog-card {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
