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
      title: 'Greška prilikom dohvaćanja zahtjeva',
      message: 'Pojavila se greška prilikom dohvaćanja zahtjeva.',
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
      title: 'Pojavila se greška',
      message: 'Pojavila se greška prilikom dohvaćanja zahtjeva',
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
    

  <ElEmpty v-if="loading.todayAppointments" description="Nema rezerviranih termina" />
  <div class="main-appointments-container" v-else>

    <h4>Trenutno stanje</h4>
    <ElProgress
      :percentage="progressPercentage"
      :stroke-width="30"
      striped
      striped-flow
    />
    <span class="progress-subtext">{{
      `Zauzetost: ${liveAppointments.length} / 20`
    }}</span>

    <h4>Trenutno prijavljeni korisnici</h4>
    <ElTable
      v-if="liveAppointments.length"
      :data="liveAppointments"
      stripe
      border
      fit
    >
      <ElTableColumn prop="fullname" label="Ime i prezime" sortable />
      <ElTableColumn prop="username" label="Korisničko ime" sortable />
      <ElTableColumn prop="startTime" label="Početak termina" sortable>
        <template #default="appointments">
          {{ formatToTime(appointments.row.startTime) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="endTime" label="Završetak" sortable>
        <template #default="appointments">
          {{ formatToTime(appointments.row.endTime) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="timeLog" label="Trajanje termina" sortable />
      <ElTableColumn label="Završava za">
        <template #default="appointments">
          {{
            `${differenceInMinutes(appointments.row.endTime).toFixed(0)} min`
          }}
        </template>
      </ElTableColumn>
    </ElTable>
    <ElEmpty v-else description="Trenutno nema rezerviranih termina" />

    <h4>Kalendar</h4>
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
      <ElTableColumn prop="fullname" label="Ime" sortable />
      <ElTableColumn prop="username" label="Korisničo ime" sortable />
      <ElTableColumn prop="startTime" label="Početak termina" sortable>
        <template #default="appointments">
          {{ formatToTime(appointments.row.startTime) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="endTime" label="Kraj termina" sortable>
        <template #default="appointments">
          {{ formatToTime(appointments.row.endTime) }}
        </template>
      </ElTableColumn>
      <ElTableColumn prop="timeLog" label="Trajanje termina" sortable />
      <ElTableColumn label="Završava za">
        <template #default="appointments">
          {{
            `${differenceInMinutes(appointments.row.endTime).toFixed(0)} min`
          }}
        </template>
      </ElTableColumn>
    </ElTable>
    <ElEmpty v-else description="Nema rezerviranih termina za odabrani datum" />
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
