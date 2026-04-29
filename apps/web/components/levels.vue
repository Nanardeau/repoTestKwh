<template>
    <div class="w-5/6" :style="{display:'flex'}">
    
    <div :style="{ display : 'flex', flexDirection: 'column', alignSelf:'center' }">
        <UButton :color="'success'" :disabled="currentLevel! == maxLevels!" @click="level('up')"> +1 </UButton>
        <p>{{ currentLevelName ? currentLevelName : "" }}</p>
        <UButton :color="'success'" :disabled="currentLevel! == 0" @click="level('down')"> -1</UButton>
    </div>
    </div>

</template>
<script setup lang="ts">
    import {useLevels} from '../composables/levels';
    const currentLevel = defineModel('currentLevel');
    const currentLevelName = defineModel('currentLevelName');
    const maxLevels = defineModel('maxLevels');
    const surfaceTotaleLevel = defineModel('surfaceTotaleLevel');
    const volumeTotalLevel = defineModel('volumeTotalLevel');
    const levelNames = defineModel('levelNames');
    const queryClient = defineModel('queryClient');
    const spaceId = defineModel('spaceId');
    const space = defineModel('space');
    const idPieces = defineModel('idPieces');
    const { level } = useLevels(surfaceTotaleLevel, volumeTotalLevel, idPieces, currentLevel, maxLevels, currentLevelName, levelNames, 
    queryClient, spaceId, space);
    //useLevels(surfaceTotaleLevel, volumeTotalLevel, estUnePiece, currentLevel, maxLevels, currentLevelName, levelNames, queryClient, spaceId, space, totalSurfaceRenderer);
</script>