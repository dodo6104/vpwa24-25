<template>
  <q-page class="flex flex-center main">
    <q-card class="q-pa-md" style="max-width: 600px;">
      <!-- Logo and App Name -->
      <q-card-section class="logo_text">
        <div class="logo-container">
          <img src="~assets/Slack_logo.webp" alt="App Logo" class="logo" />
        </div>
        <div class="text-h6">FakeSlack</div>
      </q-card-section>

      <!-- Login Form -->
      <q-form @submit.prevent="onSubmit">
        <q-card-section>
          <h1 class="title">Sign in to FakeSlack</h1>
          <q-input
            rounded
            outlined
            v-model="email"
            label="E-mail"
            type="text"
            class="q-mt-md q-mb-lg"
            :error="emailError"
            :error-message="emailErrorMessage"
          />
          <q-input
            rounded
            outlined
            v-model="password"
            label="Password"
            type="password"
            class="q-mt-md"
            :error="passwordError"
            :error-message="passwordErrorMessage"
          />
        </q-card-section>

        <!-- Error or Success Message -->
        <q-card-section v-if="formMessage" class="text-negative">
          {{ formMessage }}
        </q-card-section>

        <!-- New User Registration Link -->
        <q-card-section align="center">
          <router-link to="/register">New? Create an account.</router-link>
        </q-card-section>

        <!-- Login Button -->
        <q-card-actions align="center" class="full-width">
          <q-btn
            color="primary"
            label="LOGIN"
            stretch
            class="full-width rounded-btn"
            type="submit"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      emailError: false,
      emailErrorMessage: '',
      passwordError: false,
      passwordErrorMessage: '',
      formMessage: '',
    };
  },
  methods: {
    // Method to check if a field is empty
    isEmpty(value) {
      return value.trim() === '';
    },
    // Method to validate email format
    isValidEmail(email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(email);
    },
    // Reset all error messages
    resetErrors() {
      this.emailError = this.passwordError = false;
      this.emailErrorMessage = this.passwordErrorMessage = '';
      this.formMessage = '';
    },

    onSubmit() {
      this.resetErrors();


      if (this.isEmpty(this.email)) {
        this.emailError = true;
        this.emailErrorMessage = 'Email is required';
      }
      if (this.isEmpty(this.password)) {
        this.passwordError = true;
        this.passwordErrorMessage = 'Password is required';
      }


      if (!this.emailError && !this.isValidEmail(this.email)) {
        this.emailError = true;
        this.emailErrorMessage = 'Invalid email format';
      }


      if (!this.emailError && !this.passwordError) {
        this.formMessage = 'Login successful!';
        this.$nextTick(() => {
          this.$router.push('/');
        });

      } else {
        this.formMessage = 'Please fix the errors in the form.';
      }
    }
  }
};
</script>

<style scoped>
.title {
  font-family: 'Arial', sans-serif;
  font-size: 30px;
  text-align: center;
  margin-bottom: 20px;
}
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
.text-negative {
  color: red;
  text-align: center;
  margin-top: 10px;
}

</style>
