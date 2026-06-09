<script setup lang="ts">
import { ref } from 'vue';
import { useSurfacesStore } from '~/stores/surfaces';
const colorMode = useColorMode();
const storeSurfaces = useSurfacesStore();
const open = ref(false);


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
            <li>Surface Totale : {{ storeSurfaces.surfaceTotale?.toFixed(2) }} m² </li>
            <li>Volume Total : {{ storeSurfaces.volumeTotal?.toFixed(2) }} m³</li>          
          </ul>
        </UCard>
        <UCard class="mt-10">
          <ul>
            <li>Surface Lot : {{ storeSurfaces.surfaceTotaleLot?.toFixed(2) }} m²</li>
            <li>Volume Lot : {{ storeSurfaces.volumeTotalLot?.toFixed(2) }} m³</li>
          </ul>

        </UCard>
        <UCard class="mt-10">
          <ul>
            <li>Surface Étage : {{ storeSurfaces.surfaceTotaleLevel?.toFixed(2) }} m²</li>
            <li>Volume Étage : {{ storeSurfaces.volumeTotalLevel?.toFixed(2) }} m³</li>
          </ul>

        </UCard>
      </div>

    </template>

    
  </USidebar>

</template>
