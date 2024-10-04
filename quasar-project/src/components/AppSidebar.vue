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

          <q-item clickable v-ripple @click="goTo('chat/general')">
            <q-item-section class="col-15">
              <span>
                &nbsp;&nbsp;&nbsp;<q-icon name="lock" size="sm"/>&nbsp;&nbsp;&nbsp; Channel 1
              </span>
            </q-item-section>
            <q-item-section class="col-1">
              <q-icon name="delete" size="xs" @click.stop="deleteChannel('chat/general')" />
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="goTo('chat/general')">
            <q-item-section class="col-15">
              <span>
                &nbsp;&nbsp;&nbsp;<q-icon name="tag" size="sm"/>&nbsp;&nbsp;&nbsp; Channel 1
              </span>
            </q-item-section>
            <q-item-section class="col-1">
              <q-icon name="delete" size="xs" @click.stop="deleteChannel('chat/general')" />
            </q-item-section>
          </q-item>

        </q-list>
      </div>

      <q-separator />
      <q-btn-dropdown anchor="top" ref="statusdropdown">
        <template v-slot:label>
          <div class="flex justify-between items-center q-border full-width">
            <div class="flex items-center">
              <q-icon name="circle" :color="statusColor" size="xs" class="q-ml-md"></q-icon>
              <div class="q-ml-xs q-pa-xs text-left">
                <strong>{{ userName }}</strong>
                <div class="text-grey text-caption">{{ status }}</div>
              </div>

            </div>
          </div>
        </template>
        <q-list>
          <q-item clickable @click="setStatus('Online')">
            <q-item-section avatar>
              <q-icon class="q-ml-md" name="circle" color="green" size="xs"/>
            </q-item-section>
            <q-item-section>Online</q-item-section>
          </q-item>
          <q-item clickable @click="setStatus('Offline')">
            <q-item-section avatar>
              <q-icon class="q-ml-md" name="circle" color="black" size="xs"/>
            </q-item-section>
            <q-item-section>Offline</q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>

    </div>
  </q-drawer>
</template>

<script>
export default {
  data () {
    return {
      userName: 'dodo6104',
      status: 'online',
      statusColor: 'green'
    }
  },
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
    },
    setStatus(value) {
      this.status = value;
      this.$refs.statusdropdown.hide();
      if (value === 'Online') {
      this.statusColor = 'green'
    } else {
      this.statusColor = 'black'
    }

    }
  }
};
</script>
