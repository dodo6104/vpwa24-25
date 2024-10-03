<template>
  <q-layout view="hHh LpR fFf" class="full-height-layout">
    <!-- Hlavička -->
    <q-header elevated>
      <q-toolbar>
        <!-- Skry tento button na veľkých obrazovkách -->
        <q-btn v-if="isSmallScreen" flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />
        <q-toolbar-title>
          Fake Slack
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <!-- Bočný panel (Sidebar) -->
    <AppSidebar :leftDrawerOpen="leftDrawerOpen" @update:leftDrawerOpen="leftDrawerOpen = $event" />

    <!-- Hlavná obsahová časť -->
    <q-page-container class="no-scroll main-content">
      <!-- Sekcia pre kanál (Channel) -->
      <div class="channel-section">
        <router-view />
      </div>

      <!-- Komponent CommandLine -->
      <CommandLine class="commandline" />
    </q-page-container>

    <!-- Observer na veľkosť okna -->
    <q-resize-observer @resize="onResize" />
  </q-layout>
</template>

<script>
import AppSidebar from 'components/AppSidebar.vue';
import CommandLine from 'components/CommandLine.vue'; // Import CommandLine komponentu

export default {
  components: {
    AppSidebar,
    CommandLine
  },
  data() {
    return {
      leftDrawerOpen: true, // Základný stav - bočný panel je otvorený
      isSmallScreen: false, // Premenná na kontrolu veľkosti obrazovky
    };
  },
  methods: {
    onResize({ width }) {
      // Ak je šírka menšia ako 768px, povol otváranie/zatváranie bočného panelu
      if (width < 768) {
        this.isSmallScreen = true;
        this.leftDrawerOpen = false; // Automaticky zatvor panel pri malej obrazovke
      } else {
        this.isSmallScreen = false;
        this.leftDrawerOpen = true; // Neumožni zatváranie panelu pri väčších obrazovkách
      }
    }
  },
  mounted() {
    // Nastav úvodný stav podľa aktuálnej šírky obrazovky
    this.onResize({ width: window.innerWidth });
  }
};
</script>

<style scoped>
.full-height-layout {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-content {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
}

.channel-section {
  flex-grow: 1;
  overflow: hidden;
}

.commandline {
  background-color: #f5f5f5;
  padding: 10px;
  border-top: 1px solid #ccc;
}
</style>
