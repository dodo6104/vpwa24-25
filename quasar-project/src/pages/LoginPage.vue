<template>
  <q-page class="flex flex-center main">

    <q-card class="q-pa-md"  style="max-width: 600px;">

      <q-card-section class="logo_text">
        <div class="logo-container">
          <img src="~assets/Slack_logo.webp" alt="App Logo" class="logo">
        </div>
        <div class="text-h6">FakeSlack</div>
      </q-card-section>
      <q-card-section class="form_holder">
        <login-form />
      </q-card-section>

    </q-card>
  </q-page>
</template>

<script>
import LoginForm from 'components/LoginForm.vue'

export default {
  components: {
    LoginForm
  }
}
</script>

<style>


.logo_text {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 0;
  padding-bottom: 0;
}

.logo {
  max-width: 50px;
  height: auto;
  object-fit: contain;
  margin-right: 5px;

}




</style>
