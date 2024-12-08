<template>
  <q-page class="row items-center justify-evenly">
    <q-card square style="width: 400px; padding:50px">
      <q-card-section>
        <div class="text-h6">
          Login
        </div>
      </q-card-section>

      <!-- If you want a generic error banner at the top -->
      <q-banner v-if="errors.credentials" class="q-mb-sm" dense inline-actions>
        <q-icon name="error" color="negative" class="q-mr-sm" />
        {{ errors.credentials }}
      </q-banner>

      <q-form ref="form" class="q-gutter-md">
        <q-card-section>
          <q-input
            name="email"
            id="email"
            v-model.trim="credentials.email"
            type="email"
            label="Email"
            autofocus
            :error="!!errors.credentials"
            :error-message="errors.credentials"
          />
          <q-input
            id="password"
            name="password"
            v-model="credentials.password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            bottom-slots
            :error="!!errors.credentials"
            :error-message="errors.credentials"
          >
            <template v-slot:append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>
          <q-checkbox
            id="rememberMe"
            v-model="credentials.remember"
            label="Remember me"
          />
        </q-card-section>

        <q-card-actions align="between">
          <q-btn label="Create account" size="sm" flat :to="{ name: 'register' }" />
          <q-btn
            label="Login"
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
  name: 'LoginPage',
  data () {
    return {
      credentials: { email: '', password: '', remember: false },
      showPassword: false,
      errors: {} as Record<string, string>
    }
  },
  computed: {
    redirectTo (): RouteLocationRaw {
      return (this.$route.query.redirect as string) || { name: 'home' }
    },
    loading (): boolean {
      return this.$store.state.auth.status === 'pending'
    }
  },
  methods: {
    onSubmit () {
      this.errors = {}
      this.$store.dispatch('auth/login', this.credentials)
        .then(() => this.$router.push(this.redirectTo))
        .catch((error) => {
          if (error.response && error.response.data && error.response.data.errors) {
            for (const err of error.response.data.errors) {
              // Here we assume only one kind of error: invalid credentials
              // You can modify this to target email or password specifically if needed
              this.errors[err.field] = err.message
            }
          } else {
            // If no structured error response, you can fallback to a generic message
            this.errors.credentials = 'An unexpected error occurred. Please try again.'
          }
        })
    }
  }
})
</script>
