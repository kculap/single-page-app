<script setup>
import { onMounted, ref } from 'vue';
import { ElNotification } from 'element-plus';
import { formatToFilterDate } from '../../../composables/dateTimeConverter';
import { useStore } from '../../../stores/store';

const store = useStore();
const roomsState = ref({
    quiet: 0,
    group: 0,
    reading: 0
})
const nowTimestamp = new Date().getTime();

onMounted(() => {
    getQuietRoomState()
    getGroupRoomState()
    getReadingRoomState()
})

async function getQuietRoomState() {
  try {
    const response = await store.getAppointmentRequests(
      `status=done&approved=true&room=Quiet Work&date=${formatToFilterDate(nowTimestamp)}`
    );
    roomsState.value.quiet = response.data.filter((appointment) => nowTimestamp >= appointment.startTime && nowTimestamp <= appointment.endTime).length
  } catch (error) {
    ElNotification({
      title: 'Geting quiet room appointments error',
      message: 'Error occured while geting quiet room appointments.',
      duration: 3000,
      type: 'error',
    });
  }
}

async function getGroupRoomState() {
  try {
    const response = await store.getAppointmentRequests(
      `status=done&approved=true&room=Group Work&_sort=startTime&_order=asc&date=${formatToFilterDate(nowTimestamp)}`
    );
    roomsState.value.group = response.data.filter((appointment) => nowTimestamp >= appointment.startTime && nowTimestamp <= appointment.endTime).length
  } catch (error) {
    ElNotification({
      title: 'Geting group room appointments error',
      message: 'Error occured while geting group room appointments.',
      duration: 3000,
      type: 'error',
    });
  }
}

async function getReadingRoomState() {
  try {
    const response = await store.getAppointmentRequests(
      `status=done&approved=true&room=Reading Room&_sort=startTime&_order=asc&date=${formatToFilterDate(nowTimestamp)}`
    );
    roomsState.value.reading = response.data.filter((appointment) => nowTimestamp >= appointment.startTime && nowTimestamp <= appointment.endTime).length
  } catch (error) {
    ElNotification({
      title: 'Geting reading room appointments error',
      message: 'Error occured while geting reading room appointments.',
      duration: 3000,
      type: 'error',
    });
  }
}
</script>

<template>
    <div class="rooms-status-container">
        <span class="room-label">Quiet Work Room Live State - <span class="main-color">{{ `${roomsState.quiet}/20` }}</span></span>
        <ElProgress
            :percentage="(100 / 20) * roomsState.quiet"
            :stroke-width="30"
            striped
            striped-flow
        />

        <span class="room-label">Group Work Room Live State - <span class="main-color">{{ `${roomsState.group}/20` }}</span></span>
        <ElProgress
            :percentage="(100 / 20) * roomsState.group"
            :stroke-width="30"
            striped
            striped-flow
        />

        <span class="room-label">Reading Room Live State - <span class="main-color">{{ `${roomsState.reading}/20` }}</span></span>
        <ElProgress
            :percentage="(100 / 20) * roomsState.reading"
            :stroke-width="30"
            striped
            striped-flow
        />
    </div>
</template>

<style scoped>
.rooms-status-container {
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-bottom: 18px;
}
.room-label {
    text-align: start;
    font-weight: 700;
}
</style>
