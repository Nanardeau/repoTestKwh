
<script setup lang="ts">

import { dataTool, type EChartsOption } from 'echarts';
import { ref } from 'vue';
import 'echarts';
import type { isVariableDeclarationList } from 'typescript';



const modifiable = ref<boolean>(false);
//const pieceId = defineModel<string>("pieceId", {default : ''});
const name = defineModel<string>('name');
const open = defineModel<boolean>('open');
const props = defineProps(
  {pieceId: String,
    surfacePiece : Number,
    volumePiece:Number
  }
)

if(open){
  //const piece = $fetch(`/api/piece/${props.pieceId}`);
  console.log("OPEN LÀ C'EST OPEN");
 
  try{
    
    const data0 = ref();
    
    data0.value = await $fetch(`/api/capteur/warp10/${props.pieceId}`);
    
    console.log(data0.value);
  }catch(error){
    console.log("ERREUR "+error);
  }
    
}


const optionsChart = ref<EChartsOption>({
  dataset: {
    dimensions: ['1','2'],
    source: [{
      1: 1,
      2: 4,
    },
  {
    1:2,
    2:7,
  },{
    1:3,
    2:1 
  }],
  },
  xAxis: {type: 'value'},
  yAxis: {type:'value'},
  series:[{type:'line'}]
})
  
  



async function modifierNom(){
  modifiable.value = false;
  let res = await $fetch(`/api/piece/modif/${props.pieceId}&${name.value}`, {method:"post"});
  reloadNuxtApp();
}
//const data = useComfortData().fetchComfortData(14351664174917, "piece_D66sbrvzxtAVbye", "2024-09-04 12:00:00.000000", "2025-09-04 12:00:00.000000", "0");
//console.log(data);
const pieceId = ref(props.pieceId);
</script>

<template #wrapper>
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
      <!-- <img src="./faux.png"/> -->


      <!-- Ça charge avant le script "open"-->
      <div class="w-100 h-100">
        <VChart :option="optionsChart"/>
      </div>
    </template>
    
  </UModal>
</template>
