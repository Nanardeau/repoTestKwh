<template>

    <USelect v-model="spaceId" :items="idList"  placeholder="Chargement ..." @change="$emit('afficherSpcId')"/>
    
    <USelect v-model="idLotTemp" :items="storeLots._idListLots" placeholder="Numéro de lot" @change="changement" class="w-25"/>
    <USelect v-model="idScapTemp" :items="listeScaps" @change="changementScap"/>
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
        <UButton :color="'success'" @click="essaiHeatMap">Essai Heatmap</UButton>
    <UButton
    icon="i-lucide-panel-left"
    color="neutral"
    variant="ghost"
    aria-label="Toggle sidebar"
    @click="openSideBar = !openSideBar"
    >Surfaces-Volumes</UButton>

</template>
<script setup lang="ts">
    import { useVariablesStore } from '~/stores/variables';
    import { useLotsStore } from '~/stores/lots';
    import { useGradientRooms } from '#imports';
    import { useDataScap } from '#imports';
    import { useScapStore } from '~/stores/scap';
    const {essaiHeatMap} = useGradientRooms();
    const {colorerScap} = useDataScap();
    const storeVar = useVariablesStore();
    const storeLots = useLotsStore();
    const storeScap = useScapStore();
    import { useDataLots } from '#imports';
    const {colorerLot }= useDataLots();
    const emit = defineEmits(['afficherSpcId', 'togglePicking', 'measure', 'afficherMeubles', 'colorerScap']);
    const spaceId = defineModel<string>('spaceId');
    const idList = defineModel<any>('idlist');
    const idLotTemp = ref<string>('aucun');
    const idScapTemp = ref<string>('aucun');
    const isPickingActivated = defineModel('isPickingActivated');
    const isMultiSelctingActivated = defineModel('isMultiSelectingActivated');
    const queryClient = defineModel('queryClient');
    const space = defineModel('space');
    const isMeasuringActivated = defineModel('isMeasuringActivated');
    const openSideBar = defineModel('openSideBar');
    const isFurnitureShowing = defineModel('isFurnitureShowing');
    const idScap = defineModel<string>('idScap');
    const listeScaps = computed(() => storeScap._idListScap);      
    
    function changement(){
        storeVar.setIdLot(idLotTemp.value!);
        colorerLot();
    }
    function changementScap(){
        storeVar.setIdScap(idScapTemp.value!);
        colorerScap();
    }
</script>

