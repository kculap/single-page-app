<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <span>Error 404</span>
  <br />
  <br />
  <span>Error page</span>
  <br />
  <br />
  <ElButton plain type="primary" @click="router.push('/')"
    >Natrag na početnu</ElButton
  >
</template>
