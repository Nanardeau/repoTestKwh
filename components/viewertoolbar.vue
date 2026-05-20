<template>

    <USelect v-model="spaceId" :items="idList"  placeholder="Chargement ..." @change="$emit('afficherSpcId')"/>
    
    <USelect v-model="idLot" :items="idListLots" placeholder="Numéro de lot" @change="$emit('colorerLot')" class="w-25"/>
    <USelect v-model="idScap" :items="listeScaps" @change="$emit('colorerScap')"/>
    <UButton :color="isPickingActivated ? 'error' : 'success'" @click="$emit('togglePicking')">
        {{ isPickingActivated ? "Désactiver le picking mode" : "Activer le picking" }}
    </UButton>
    <UCheckbox v-model="isMultiSelctingActivated" name="multi-select" label="Selection multiple" />
    <UButton :disabled="space === null && queryClient === null" :color="isMeasuringActivated ? 'error' : 'success'" @click="$emit('measure')">
        {{ isMeasuringActivated ? "Désactiver la règle" : "Activer la règle" }}
    </UButton>
        <UButton :color="isFurnitureShowing ? 'error' : 'success'" @click="$emit('afficherMeubles')"> <!-- colorerLot('lot_wrRRGnvdGZvY7YD') -->
            {{ isFurnitureShowing ? "Masquer les meubles" : "Montrer meubles" }}
        </UButton>            
        <UButton :color="'success'" @click="$emit('essaiHeatMap')">Essai Heatmap</UButton>
    <UButton
    icon="i-lucide-panel-left"
    color="neutral"
    variant="ghost"
    aria-label="Toggle sidebar"
    @click="openSideBar = !openSideBar"
    >Surfaces-Volumes</UButton>

</template>
<script setup lang="ts">
    defineEmits(['afficherSpcId', 'togglePicking', 'measure', 'essaiHeatMap', 'colorerLot', 'afficherMeubles', 'colorerScap']);
    const spaceId = defineModel<string>('spaceId');
    const idList = defineModel<any>('idlist');
    const idLot = defineModel<string>('idLot');
    const idListLots = defineModel<any>('idListLots');
    const isPickingActivated = defineModel('isPickingActivated');
    const isMultiSelctingActivated = defineModel('isMultiSelectingActivated');
    const queryClient = defineModel('queryClient');
    const space = defineModel('space');
    const isMeasuringActivated = defineModel('isMeasuringActivated');
    const openSideBar = defineModel('openSideBar');
    const isFurnitureShowing = defineModel('isFurnitureShowing');
    const idScap = defineModel<string>('idScap');
    const listeScaps = defineModel<any>('listeScaps');        

</script>

