<template>
  <div class="commandline">
    <q-input
      v-model="command"
      filled
      placeholder="Zadajte príkaz alebo správu..."
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      command: '' // Uchováva text, ktorý používateľ píše
    };
  }
};
</script>

<style scoped>
.commandline {
  background-color: #f5f5f5;
  padding: 10px;
  border-top: 1px solid #ccc;
}
</style>
