  
    <script setup lang="ts">
    const open = defineModel<boolean>("open", { default: false });
    function openModal(){
      open.value = true;
      console.log(open.value);
    }
    </script>
<template>
  <UButton label="Open" color="primary" variant="soft" :onClick="openModal"/>
  <UModal 
  v-model:open="open"
  title="Modal with title"
  :close="{
    color: 'primary',
    variant: 'outline',
    class: 'rounded-full'
  }" 
  >
    <template #body>
      <p>abcdefg</p>
    </template>
  </UModal>
</template>