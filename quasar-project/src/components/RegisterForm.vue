<template>
  <q-form @submit="onSubmit">
    <q-card-section class="flex flex-center q-gutter-lg">
      <q-col class="jedna">
        <q-input rounded outlined v-model ="email" label="E-mail" type="text"    class="q-mt-md q-mb-lg"/>
        <q-input rounded outlined v-model ="email" label="Name" type="text"    class="q-mt-md q-mb-lg"/>
        <q-input rounded outlined v-model ="email" label="Surename" type="text"    class="q-mt-md q-mb-lg"/>
      </q-col>

      <q-col class="dva">
        <q-input rounded outlined v-model ="email" label="Nickname" type="text"    class="q-mt-md q-mb-lg"/>
        <q-input rounded outlined v-model ="email" label="Password" type="text"    class="q-mt-md q-mb-lg"/>
        <q-input rounded outlined v-model ="email" label="Confirm password" type="text"    class="q-mt-md q-mb-lg"/>
      </q-col>
    </q-card-section>
    <q-card-section align="center" >
      <router-link to="/login">Alredy have account? Sign in</router-link>
    </q-card-section>
    <q-card-actions align="center" class="full-width">
      <q-btn color="primary" label="Register" stretch class="full-width rounded-btn" />
    </q-card-actions>
  </q-form>
</template>

<script>
export default {
  data() {
    return {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  },
  methods: {
    onSubmit() {
      if (this.password !== this.confirmPassword) {
        this.$q.notify({
          type: 'negative',
          message: 'Passwords do not match'
        })
        return
      }

      // Handle registration logic (e.g., API call)
      console.log('Registering', this.name, this.email, this.password)
    }
  }
}
</script>

<style>
@media (max-width: 600px) {
  .jedna{
    margin-bottom:0px;
    padding: 0px;
  }
  .dva {
    margin-top: 0px; /* Reduce bottom margin */
    padding: 0px; /* Reduce padding */
  }


}
</style>
