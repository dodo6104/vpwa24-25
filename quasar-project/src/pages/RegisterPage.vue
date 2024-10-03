<template>
  <q-page class="flex flex-center">

    <q-card class="q-pa-md panel" style="max-width: 600px;">

      <q-card-section class="logo_text">
        <div class="logo-container">
          <img src="~assets/Slack_logo.webp" alt="App Logo" class="logo">
        </div>
        <div class="text-h6">FakeSlack</div>

      </q-card-section>

      <q-card-section class="form_holder">
        <register-form />
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script>
import RegisterForm from 'components/RegisterForm.vue'

export default {
  components: {
    RegisterForm
  }
}
</script>

<style scoped>
.logo_text {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-bottom: 0;
  padding-bottom: 0;
}

.logo-container {
  margin-left: 10px;
}

.logo {
  max-width: 50px;
  height: auto;
  object-fit: contain;
}

</style>
