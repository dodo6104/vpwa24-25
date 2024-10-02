<template>
  <q-drawer
    :model-value="leftDrawerOpen"
    @update:model-value="updateLeftDrawer"
    side="left"
    bordered
  >
    <q-list>

      <q-item>
        <q-item-section>
          <strong>Channels</strong>
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple @click="goTo('chat/general')">
        <q-item-section>
          General
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple @click="goTo('chat/channel1')">
        <q-item-section>
          Channel 1
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple @click="goTo('chat/channel2')">
        <q-item-section>
          Channel 2
        </q-item-section>
      </q-item>

    </q-list>
  </q-drawer>
</template>

<script>
export default {
  props: {
    leftDrawerOpen: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    goTo(route) {
      this.$router.push(`/${route}`);
    },
    updateLeftDrawer(value) {
      this.$emit('update:leftDrawerOpen', value); // Emitne udalosť na aktualizáciu hodnoty
    }
  }
};
</script>
