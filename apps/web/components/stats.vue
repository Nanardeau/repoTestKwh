
<script setup lang="ts">
import { ref } from 'vue';

const open = ref<boolean>(false);
const modifiable = ref<boolean>(false);
//const pieceId = defineModel<string>("pieceId", {default : ''});
const name = defineModel<string>('name');
const props = defineProps(
  {pieceId: String,
    surfacePiece : Number,
    volumePiece:Number
  }
)
async function modifierNom(){
  modifiable.value = false;
  let res = await $fetch(`/api/piece/modif/${props.pieceId}&${name.value}`, {method:"post"});
  reloadNuxtApp();
}
//const data = useComfortData().fetchComfortData(14351664174917, "piece_D66sbrvzxtAVbye", "2024-09-04 12:00:00.000000", "2025-09-04 12:00:00.000000", "0");
//console.log(data);
const pieceId = ref(props.pieceId);
</script>

<template>

  <UModal 
  v-model:open="open"
  >

    <template #header>
      <div class="text-lg font-semibold flex justify-between w-75">Pièce <p v-if="!modifiable">{{ name   }}</p>  <UInput v-else v-model="name"/> <UButton @click="modifiable = !modifiable">Modifier</UButton><UButton v-if="modifiable" @click="modifierNom">Valider</UButton></div>
    </template>
    <template #body>

      <!-- <span> {{ props.pieceId }} </span><br/> -->
      <span class="font-bold"> Surface : {{  }}</span><br/>
      <span class="font-bold">Volume : xx</span>
      <img src="./faux.png"/>

    </template>

  </UModal>
</template>
