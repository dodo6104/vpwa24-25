<template>
  <q-page class="row items-center justify-evenly">
    <q-card square style="width: 400px; padding:50px">
      <q-card-section>
        <div class="text-h6">
          Register
        </div>
      </q-card-section>

      <q-form ref="form" class="q-gutter-md">
        <q-card-section>
          <q-input
            name="name"
            id="name"
            v-model.trim="form.name"
            type="text"
            label="Name"
            :error="!!errors.name"
            :error-message="errors.name"
          />
          <q-input
            name="lastname"
            id="lastname"
            v-model.trim="form.lastname"
            type="text"
            label="Last Name"
            :error="!!errors.lastname"
            :error-message="errors.lastname"
          />
          <q-input
            name="email"
            id="email"
            v-model.trim="form.email"
            type="email"
            label="Email"
            :error="!!errors.email"
            :error-message="errors.email"
          />
          <q-input
            name="nickname"
            id="nickname"
            v-model.trim="form.nickname"
            type="text"
            label="Nickname"
            :error="!!errors.nickname"
            :error-message="errors.nickname"
          />
          <q-input
            id="password"
            name="password"
            v-model="form.password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            :error="!!errors.password"
            :error-message="errors.password"
            bottom-slots
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
          <q-input
            id="password_confirmation"
            name="passwordConfirmation"
            v-model="form.passwordConfirmation"
            label="Confirm Password"
            :type="showPassword ? 'text' : 'password'"
            :error="!!errors.passwordConfirmation"
            :error-message="errors.passwordConfirmation"
            bottom-slots
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="between">
          <q-btn label="Login" size="sm" flat :to="{ name: 'login' }" />
          <q-btn
            label="Register"
            color="primary"
            :loading="loading"
            @click="onSubmit"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
  </template>

<script lang="ts">
import { defineComponent } from 'vue'
import { RouteLocationRaw } from 'vue-router'

export default defineComponent({
  name: 'RegisterPage',
  data () {
    return {
      form: {
        name: '',
        lastname: '',
        email: '',
        nickname: '',
        password: '',
        passwordConfirmation: ''
      },
      showPassword: false,
      errors: {} as Record<string, string>
    }
  },
  computed: {
    redirectTo (): RouteLocationRaw {
      return { name: 'login' }
    },
    loading (): boolean {
      return this.$store.state.auth.status === 'pending'
    }
  },
  methods: {
    onSubmit () {
      this.errors = {}
      this.$store.dispatch('auth/register', this.form)
        .then(() => this.$router.push(this.redirectTo))
        .catch((error) => {
          if (error.response && error.response.data && error.response.data.errors) {
            for (const err of error.response.data.errors) {
              this.errors[err.field] = err.message
            }
          } else {
            // handle unknown errors if necessary
          }
        })
    }
  }
})
</script>
