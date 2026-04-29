
<script setup lang="ts">
import { ref } from 'vue';
const open = ref<boolean>(false);
//const pieceId = defineModel<string>("pieceId", {default : ''});

const props = defineProps(
  {pieceId: String,
    name:String
  }
)
const pieceId = ref(props.pieceId);
</script>

<template>

  <UModal 
  v-model:open="open"
  >

    <template #header>
      <div class="text-lg font-semibold">Pièce {{ props.name }}</div>
    </template>
    <template #body>

      <span> {{ props.pieceId }} </span><br/>
      <span class="font-bold"> {{  }}</span><br/>
      <span class="font-bold">Volume : xx</span>
      <img src="./faux.png"/>

    </template>

  </UModal>
</template>