<script setup lang="ts">
import { ref } from 'vue';
import type { DropdownMenuItem, NavigationMenuItem } from '@nuxt/ui'

const colorMode = useColorMode();
const props = defineProps({
  surfaceTotale : Number,
  volumeTotal : Number,
  surfaceLot : Number,
  volumeLot : Number,  
  surfaceLvl : Number,
  volumeLvl : Number,
});
const open = ref(false);


const surfaces = [props.surfaceTotale, props.surfaceLot];
</script>

<template>
    <USidebar
    v-model:open="open"
    variant="inset"
    rail 
    side="right"
      :ui="{
        container: 'h-full w-max',
        inner: 'bg-elevated/100 divide-transparent',
        body: 'py-0'

      }"
      
    >
    <template #header>
      <div class="flex-1 flex flex-col">

        <UCard variant="solid" class="mt-10">
          <h1>Surfaces/Volumes</h1>
        </UCard>
        <UCard class="mt-10">

          <ul>
            <li>Surface Totale : {{ props.surfaceTotale?.toFixed(2) }} m² </li>
            <li>Volume Total : {{ props.volumeTotal?.toFixed(2) }} m³</li>          
          </ul>
        </UCard>
        <UCard class="mt-10">
          <ul>
            <li>Surface Lot : {{ props.surfaceLot?.toFixed(2) }} m²</li>
            <li>Volume Lot : {{ props.volumeLot?.toFixed(2) }} m³</li>
          </ul>

        </UCard>
        <UCard class="mt-10">
          <ul>
            <li>Surface Étage : {{ props.surfaceLvl?.toFixed(2) }} m²</li>
            <li>Volume Étage : {{ props.volumeLvl?.toFixed(2) }} m³</li>
          </ul>

        </UCard>
      </div>

    </template>

    
  </USidebar>

</template>
