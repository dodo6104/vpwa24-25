<template>
  <q-drawer
    :model-value="leftDrawerOpen"
    @update:model-value="updateLeftDrawer"
    side="left"
    bordered
  >
    <div class="column full-height">
      <!-- Sekcia kanálov (70%) s možnosťou scrollovania -->
      <div class="q-pa-md q-scroll" style="flex: 9; overflow-y: auto;">
        <q-list>
          <q-item>
            <q-item-section>
              <strong>Channels</strong>
            </q-item-section>
          </q-item>
          <q-separator />

          <!-- Pridanie viac kanálov na demonštráciu scrollovania -->
          <q-item clickable v-ripple @click="goTo('chat/general')">
            <q-item-section>
              &nbsp;&nbsp;&nbsp;# &nbsp;&nbsp;&nbsp;Channel 1
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="goTo('chat/general')">
            <q-item-section>
              &nbsp;&nbsp;&nbsp;# &nbsp;&nbsp;&nbsp;Channel 2
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="goTo('chat/general')">
            <q-item-section>
              &nbsp;&nbsp;&nbsp;# &nbsp;&nbsp;&nbsp;Channel 3
            </q-item-section>
          </q-item>

          <!-- Viac kanálov na ukážku scrollovania -->
          <q-item v-for="n in 20" :key="n" clickable v-ripple @click="goTo('chat/general')">
            <q-item-section>
              &nbsp;&nbsp;&nbsp;# &nbsp;&nbsp;&nbsp;Channel {{ n + 3 }}
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <q-separator />
      <q-btn-dropdown v-model="status">
        <template v-slot:label>
          <div class="flex justify-between items-center q-border full-width">
            <div class="flex items-center">
              <q-icon :name="statusIcon" :color="statusColor" size="sd" class="q-ml-md"></q-icon>
              <div class="q-ml-md">
                <strong>Meno</strong>
                <div class="text-grey text-caption">{{ status }}</div>
              </div>
            </div>
          </div>
        </template>

        <q-list>
          <q-item clickable @click="setStatus('Online')">
            <q-item-section avatar>
              <q-icon name="circle" color="green" />
            </q-item-section>
            <q-item-section>Online</q-item-section>
          </q-item>
          <q-item clickable @click="setStatus('Offline')">
            <q-item-section avatar>
              <q-icon name="circle" color="grey" />
            </q-item-section>
            <q-item-section>Offline</q-item-section>
          </q-item>
          <q-item clickable @click="setStatus('Invisible')">
            <q-item-section avatar>
              <q-icon name="circle" color="black" />
            </q-item-section>
            <q-item-section>Invisible</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

    </div>
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
  data() {
    return {
      status: 'Online', // Predvolený stav
    };
  },
  computed: {
    statusIcon() {
      return this.status === 'Online'
        ? 'circle'
        : this.status === 'Offline'
        ? 'circle'
        : 'circle';
    },
    statusColor() {
      return this.status === 'Online'
        ? 'green'
        : this.status === 'Offline'
        ? 'grey'
        : 'black';
    }
  },
  methods: {
    goTo(route) {
      this.$router.push(`/${route}`);
    },
    updateLeftDrawer(value) {
      this.$emit('update:leftDrawerOpen', value); // Emitne udalosť na aktualizáciu hodnoty
    },
    setStatus(status) {
      this.status = status; // Aktualizuje stav podľa zvoleného
    }
  }
};
</script>
