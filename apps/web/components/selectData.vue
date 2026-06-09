<script setup lang="ts">
    import { useVariablesStore } from '~/stores/variables';
    const storeVar = useVariablesStore();
    const data = ref<string>("temperature");  

</script>
<template>
    <div>
        <URadioGroup v-model="data" :items="['temperature','co2']" class="w-max border-white rounded-md " :ui="{ item:'mt-5 mb-5', fieldset:'p-4 border rounded-lg ml-5'}" @change="storeVar.setTypeData(data)"/>
    </div>
</template>