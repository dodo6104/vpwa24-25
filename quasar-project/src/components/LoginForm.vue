<template>
  <q-form @submit="onSubmit">
    <q-card-section>
      <h1 class="title">Sign in to fakeSlack</h1>
      <q-input rounded outlined v-model ="email" label="E-mail" type="text"    class="q-mt-md q-mb-lg"/>
      <q-input rounded outlined v-model="password" label="Password" type="password"  class="q-mt-md"/>

    </q-card-section>

    <q-card-section align="center" >
      <router-link to="/register">New? Create an account.</router-link>
    </q-card-section>

    <q-card-actions align="center" class="full-width">
      <q-btn color="primary" label="LOGIN" stretch class="full-width rounded-btn" />
    </q-card-actions>
  </q-form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'LoginForm',
  setup() {
    const email = ref<string>('');
    const password = ref<string>('');

    const onSubmit = () => {
      // Handle form submission and validation
      console.log('Email:', email.value);
      console.log('Password:', password.value);
    };

    return {
      email,
      password,
      onSubmit,
    };
  }
});
</script>

<style scoped>
.title {
  font-family: 'Arial', sans-serif;
  font-size: 30px;
  text-align: center;
  margin-bottom: 20px;
}



</style>
