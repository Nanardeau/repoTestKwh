
<script setup lang="ts">

import { dataTool, type EChartsOption } from 'echarts';
import { ref } from 'vue';
import 'echarts';
import { TooltipComponent } from 'echarts/components';
import type { isVariableDeclarationList } from 'typescript';
import { useStatsStore } from '~/stores/stats';
import { useVariablesStore } from '~/stores/variables';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import duration from "dayjs/plugin/duration";
dayjs.extend(utc);
dayjs.extend(duration);

const storeVar = useVariablesStore();


const data0 = ref();
const source = ref<Array<any>>([]);
const modifiable = ref<boolean>(false);
const storeStats = useStatsStore();

  //const pieceId = defineModel<string>("pieceId", {default : ''});
const name = defineModel<string>('name');
watch(
  () => storeStats.openModalPiece,
  async (nouvelEtat) => {
    if (nouvelEtat) {
      console.log("OPEN LÀ C'EST OPEN");
      try{
        data0.value = await $fetch(`/api/capteur/warp10/${storeStats._deveui[storeStats._pieceIdModale]}&${storeVar._typeData}`);
      
        if(data0.value[0].v){
          let count = data0.value[0].v.length;
          
          let temp = data0.value[0]["v"].map((d: any) => ({"date": /*new Date(d[0] / 1000).getHours().toLocaleString() + "h"*/ count--, "valeur": d[1]}));
          
          //Vu que warp10 donne les données sous forme de pile, j'inverse manuellement le tableau pour avoir
          //les résultats dans l'ordre chronologique
          for(let i =  temp.length - 1; i > 0 ; i-- ){
              source.value!.push(temp[i]);
            
          } 
          console.log("SOURCE VALUE");
          console.log(source.value);  
          optionsChart.value = {
            dataset: {
              dimensions: ["date","valeur"],//source.value!
              source: source.value!,
            },
            xAxis: {type: 'category'},
            yAxis: {type:'value'},
            series:[{type:'line'}]
          }
        }

      }catch(error){
        console.log("Pas de capteur dans cette pièce " + error);
      }

      // try {
      //   //data0.value = await $fetch(`/api/capteur/warp10/${storeStats._deveui}`);
      //   console.log(data0.value[0].v);
      // } catch(error) {
      //   console.log("ERREUR " + error);
      // }
    }
  }
);
  
const optionsChart = ref<EChartsOption>()
  
  

const props = defineProps({
  pieceId : {type:String}
})

async function modifierNom(){
  modifiable.value = false;
  //let res = await $fetch(`/api/piece/modif/${props.pieceId}&${name.value}`, {method:"post"});
  reloadNuxtApp();
}
//const data = useComfortData().fetchComfortData(14351664174917, "piece_D66sbrvzxtAVbye", "2024-09-04 12:00:00.000000", "2025-09-04 12:00:00.000000", "0");
//console.log(data);
const pieceId = ref(props.pieceId);
</script>

<template #wrapper>
  <UModal 
  v-model:open="storeStats.openModalPiece"
  >

    <template #header>
      <div class="text-lg font-semibold flex justify-between w-75">Pièce <p v-if="!modifiable">{{ name   }}</p>  <UInput v-else v-model="name"/> <UButton @click="modifiable = !modifiable">Modifier</UButton><UButton v-if="modifiable" @click="modifierNom">Valider</UButton></div>
    </template>
    <template #body>
      
      
      <!-- <span> {{ props.pieceId }} </span><br/> -->
      <span class="font-bold"> Surface : {{ }}</span><br/>
      <span class="font-bold">Volume : xx</span>
      <!--<span>{{ data0 }}</span> -->
      <!-- <img src="./faux.png"/> -->


      <!-- Ça charge avant le script "open"-->
      <div class="w-100 h-100">
        <VChart :option="optionsChart"/>
      </div>
    </template>
    
  </UModal>
</template>
