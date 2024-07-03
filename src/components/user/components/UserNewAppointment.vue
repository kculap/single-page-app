<script setup>
import { computed, ref, watch } from 'vue';
import { ElNotification } from 'element-plus';
import { useStore } from '../../../stores/store';
import { formatToFilterDate } from '../../../composables/dateTimeConverter';

const emit = defineEmits(['goToAppointments']);
const store = useStore();
const userData = JSON.parse(localStorage.getItem('userData'));
const appointment = ref({
  room: 'Quiet Work',
  date: '',
  startTime: '',
  endTime: '',
  timeLog: '',
  username: userData.username,
  fullname: `${userData.firstname} ${userData.lastname}`,
  approved: false,
  status: 'waiting',
});
const typeOptions = ref([
  { label: 'Quiet Work', value: 'Quiet Work' },
  { label: 'Group Work', value: 'Group Work' },
  { label: 'Reading Room', value: 'Reading Room' },
]);
const selectedRoomState = ref(0);
const disabledDate = (time) => {
  return time.getTime() <= new Date().setDate(new Date().getDate() - 1);
};
const disabledStartHours = () => {
  const hoursArray = [];
  if (!todayIsSelected.value)
    for (let i = 0; i < new Date().getHours(); i++) hoursArray.push(i);
  return hoursArray;
};
const disabledStartMinutes = (hour) => {
  const hoursArray = [];
  if (todayIsSelected.value && new Date().getHours() === hour)
    for (let i = 0; i < new Date().getMinutes() + 1; i++) hoursArray.push(i);
  return hoursArray;
};
const disabledEndHours = () => {
  const hoursArray = [];
  for (let i = 0; i < new Date(appointment.value.startTime).getHours(); i++)
    hoursArray.push(i);
  return hoursArray;
};
const disabledEndMinutes = (hour) => {
  const hoursArray = [];
  if (new Date(appointment.value.startTime).getHours() === hour)
    for (
      let i = 0;
      i < new Date(appointment.value.startTime).getMinutes() + 1;
      i++
    )
      hoursArray.push(i);
  return hoursArray;
};
const disabledSeconds = () => {
  const hoursArray = [];
  for (let i = 1; i <= 60; i++) hoursArray.push(i);
  return hoursArray;
};
const timeLog = computed(() => {
  const startTime = new Date(appointment.value.startTime);
  const endTime = new Date(appointment.value.endTime);

  const differenceInMilliseconds = endTime - startTime;

  const totalMinutes = Math.floor(differenceInMilliseconds / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} hours and ${minutes} minutes`;
});
const todayIsSelected = computed(() => {
  if (appointment.value.date) {
    const appointmentDate = new Date(appointment.value.date);
    const today = new Date();

    const isSameDate =
      appointmentDate.getFullYear() === today.getFullYear() &&
      appointmentDate.getMonth() === today.getMonth() &&
      appointmentDate.getDate() === today.getDate();

    return isSameDate;
  }
  return false;
});

async function saveAppointmentHandler() {
  if (
    appointment.value.room &&
    appointment.value.date &&
    appointment.value.startTime &&
    appointment.value.endTime
  ) {
    setAppointmentData();
    try {
      await store.saveAppointmentRequest(appointment.value);
      ElNotification({
        title: 'Appointment successfully saved',
        message: 'Your appointment request successfully saved.',
        duration: 3000,
        type: 'success',
      });
      emit('goToAppointments');
    } catch (error) {
      ElNotification({
        title: 'Saving appointment error',
        message: 'Appointment saving error occured.',
        duration: 3000,
        type: 'error',
      });
    }
  } else
    ElNotification({
      title: 'Saving appointment error',
      message: 'Please fill out the form first.',
      duration: 3000,
      type: 'error',
    });
}

function setAppointmentData() {
  const date = new Date(appointment.value.date).getDate();
  const month = new Date(appointment.value.date).getMonth();
  const year = new Date(appointment.value.date).getFullYear();

  appointment.value.startTime = new Date(appointment.value.startTime).getTime();
  appointment.value.startTime = new Date(appointment.value.startTime).setDate(
    date
  );
  appointment.value.startTime = new Date(appointment.value.startTime).setMonth(
    month
  );
  appointment.value.startTime = new Date(
    appointment.value.startTime
  ).setFullYear(year);

  appointment.value.endTime = new Date(appointment.value.endTime).getTime();
  appointment.value.endTime = new Date(appointment.value.endTime).setDate(date);
  appointment.value.endTime = new Date(appointment.value.endTime).setMonth(
    month
  );
  appointment.value.endTime = new Date(appointment.value.endTime).setFullYear(
    year
  );

  appointment.value.timeLog = timeLog.value;
}

async function checkAppointmentState() {
  try {
    const response = await store.getAppointmentRequests(
      `status=done&approved=true&room=${appointment.value.room}&date=${formatToFilterDate(appointment.value.date)}`
    );
    selectedRoomState.value = response.data.filter(
      (request) =>
        appointment.value.startTime >= request.startTime &&
        appointment.value.endTime <= request.endTime
    ).length;
  } catch (error) {
    ElNotification({
      title: 'Geting appointment state error',
      message: 'Error occured while geting appointment state.',
      duration: 3000,
      type: 'error',
    });
  }
}

watch(
  () => appointment.value.startTime,
  (value) => (appointment.value.endTime = value)
);
watch(
  () => appointment.value,
  () => {
    if (appointment.value.date) checkAppointmentState();
  },
  { deep: true }
);
</script>

<template>
  <div class="new-appointment-container">
    <div class="flex-column">
      <span>Appointment Room</span>
      <ElSelect
        v-model="appointment.room"
        placeholder="Select type"
        style="width: 220px"
      >
        <ElOption
          v-for="option in typeOptions"
          :key="option.value"
          :label="option.label"
          :value="option.value"
        />
      </ElSelect>
    </div>
    <div class="flex-column">
      <span>Date</span>
      <ElDatePicker
        v-model="appointment.date"
        type="date"
        placeholder="Select date"
        :disabled-date="disabledDate"
        style="width: 220px"
      />
    </div>
    <div class="flex-column">
      <span>Starting Time</span>
      <ElTimePicker
        v-model="appointment.startTime"
        arrow-control
        :disabled-hours="disabledStartHours"
        :disabled-minutes="disabledStartMinutes"
        :disabled-seconds="disabledSeconds"
        placeholder="Start time"
        style="width: 220px"
      />
    </div>
    <div class="flex-column">
      <span>Ending Time</span>
      <ElTimePicker
        v-model="appointment.endTime"
        arrow-control
        :disabled-hours="disabledEndHours"
        :disabled-minutes="disabledEndMinutes"
        :disabled-seconds="disabledSeconds"
        placeholder="Start time"
        style="width: 220px"
      />
    </div>
    <div class="flex-column">
      <span>Log Time</span>
      <span>{{ timeLog }}</span>
    </div>
    <div class="flex-column" v-if="appointment.date">
      <span
        :class="{
          'main-color': selectedRoomState < 20,
          'color-danger': selectedRoomState >= 20,
        }"
        >{{ `Room state: ${selectedRoomState}/20` }}
        <span v-if="selectedRoomState >= 20"> - FULL</span></span
      >
    </div>
    <div class="flex-column">
      <ElButton
        type="primary"
        class="button"
        plain
        @click="saveAppointmentHandler"
        >Confirm</ElButton
      >
    </div>
  </div>
</template>

<style scoped>
.new-appointment-container {
  display: flex;
  flex-direction: column;
  row-gap: 18px;
}
.flex-column {
  display: flex;
  flex-direction: column;
  margin: auto;
}
.color-danger {
  color: #f56c6c;
}
</style>
