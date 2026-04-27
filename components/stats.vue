  
    <script lang="ts">
    const open = ref(false);
    export default{}
    function openModal(){
      open.value = true;
      console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    }
    </script>
<template>
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