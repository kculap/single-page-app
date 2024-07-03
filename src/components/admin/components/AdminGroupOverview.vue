<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from '../../../stores/store';
import { ElNotification } from 'element-plus';
import {
  formatToTime,
  formatToFilterDate,
} from '../../../composables/dateTimeConverter';

const props = defineProps(['group']);
const store = useStore();
const loading = ref({
  todayAppointments: true,
  calendarAppointments: true,
});
const nowTimestamp = new Date().getTime();
const liveAppointments = ref();
const calendarAppointments = ref();
const progressPercentage = computed(
  () => (100 / 20) * liveAppointments.value.length
);
const calendarDate = ref(new Date());

onMounted(() => {
  getTodayAppointments();
  getCalendarRequests();
});

watch(
  () => props.group,
  () => getTodayAppointments()
);
watch(
  () => calendarDate.value,
  () => getCalendarRequests()
);

async function getTodayAppointments() {
  loading.value.todayAppointments = true;
  try {
    const response = await store.getAppointmentRequests(
      `status=done&approved=true&room=${props.group}&_sort=startTime&_order=asc&date=${formatToFilterDate(nowTimestamp)}`
    );
    liveAppointments.value = response.data.filter(
      (appointment) =>
        nowTimestamp >= appointment.startTime &&
        nowTimestamp <= appointment.endTime
    );
  } catch (error) {
    ElNotification({
      title: 'Geting requests error',
      message: 'Error occured while geting requests.',
      duration: 3000,
      type: 'error',
    });
  } finally {
    loading.value.todayAppointments = false;
  }
}

async function getCalendarRequests() {
  loading.value.calendarAppointments = true;
  try {
    const response = await store.getAppointmentRequests(
      `status=done&approved=true&room=${props.group}&_sort=startTime&_order=asc&date=${formatToFilterDate(calendarDate.value)}`
    );
    calendarAppointments.value = response.data;
  } catch (error) {
    ElNotification({
      title: 'Geting requests error',
      message: 'Error occured while geting requests.',
      duration: 3000,
      type: 'error',
    });
  } finally {
    loading.value.calendarAppointments = false;
  }
}

function differenceInMinutes(endTime) {
  return (endTime - nowTimestamp) / (1000 * 60);
}
</script>

<template>
  <ElEmpty v-if="loading.todayAppointments" description="No appointments" />
  <div class="main-appointments-container" v-else>
    <h4>Live status</h4>
    <ElProgress
      :percentage="progressPercentage"
      :stroke-width="30"
      striped
      striped-flow
    />
    <span class="progress-subtext">{{
      `Occupancy: ${liveAppointments.length} / 20`
    }}</span>

    <h4>Live members</h4>
    <ElTable
      v-if="liveAppointments.length"
      :data="liveAppointments"
      stripe
      border
      fit
    >
      <ElTableColumn prop="fullname" label="Fullname" sortable />
      <ElTableColumn prop="username" label="Username" sortable />
      <ElTableColumn prop="startTime" label="Starting time" sortable>
        <template #default="appointments">
          {{ formatToTime(appointments.row.startTime) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="endTime" label="Ending time" sortable>
        <template #default="appointments">
          {{ formatToTime(appointments.row.endTime) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="timeLog" label="Time log" sortable />
      <ElTableColumn label="Ends in">
        <template #default="appointments">
          {{
            `${differenceInMinutes(appointments.row.endTime).toFixed(0)} min`
          }}
        </template>
      </ElTableColumn>
    </ElTable>
    <ElEmpty v-else description="No appointments at the moment" />

    <h4>Day information</h4>
    <div class="calendar-wrapper">
      <ElCalendar v-model="calendarDate" class="calendar" />
    </div>
    <ElTable
      v-if="calendarAppointments?.length"
      :data="calendarAppointments"
      stripe
      border
      fit
    >
      <ElTableColumn prop="fullname" label="Fullname" sortable />
      <ElTableColumn prop="username" label="Username" sortable />
      <ElTableColumn prop="startTime" label="Starting time" sortable>
        <template #default="appointments">
          {{ formatToTime(appointments.row.startTime) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="endTime" label="Ending time" sortable>
        <template #default="appointments">
          {{ formatToTime(appointments.row.endTime) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="timeLog" label="Time log" sortable />
      <ElTableColumn label="Ends in">
        <template #default="appointments">
          {{
            `${differenceInMinutes(appointments.row.endTime).toFixed(0)} min`
          }}
        </template>
      </ElTableColumn>
    </ElTable>
    <ElEmpty v-else description="No appointments for selected date" />
  </div>
</template>

<style scoped>
.main-appointments-container {
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-bottom: 50px;
}
.progress-subtext {
  color: var(--main-color);
  font-weight: 700;
}
.calendar-wrapper {
  display: flex;
  justify-content: center;
}
.calendar {
  width: 500px;
}
</style>
