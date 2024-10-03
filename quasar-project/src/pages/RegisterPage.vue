<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md panel" style="max-width: 600px;">
      <!-- Logo and App Name -->
      <q-card-section class="logo_text">
        <div class="logo-container">
          <img src="~assets/Slack_logo.webp" alt="App Logo" class="logo" />
        </div>
        <div class="text-h6">FakeSlack</div>
      </q-card-section>

      <!-- Registration Form -->
      <q-form @submit.prevent="onSubmit">
        <q-card-section class="flex flex-center q-gutter-lg">
          <!-- First Column (Email, Name, Surname) -->
          <q-col class="jedna">
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
              v-model="name"
              label="Name"
              type="text"
              class="q-mt-md q-mb-lg"
              :error="nameError"
              :error-message="nameErrorMessage"
            />
            <q-input
              rounded
              outlined
              v-model="surname"
              label="Surname"
              type="text"
              class="q-mt-md q-mb-lg"
              :error="surnameError"
              :error-message="surnameErrorMessage"
            />
          </q-col>

          <!-- Second Column (Nickname, Password, Confirm Password) -->
          <q-col class="dva">
            <q-input
              rounded
              outlined
              v-model="nickname"
              label="Nickname"
              type="text"
              class="q-mt-md q-mb-lg"
              :error="nicknameError"
              :error-message="nicknameErrorMessage"
            />
            <q-input
              rounded
              outlined
              v-model="password"
              label="Password"
              type="password"
              class="q-mt-md q-mb-lg"
              :error="passwordError"
              :error-message="passwordErrorMessage"
            />
            <q-input
              rounded
              outlined
              v-model="confirmPassword"
              label="Confirm Password"
              type="password"
              class="q-mt-md q-mb-lg"
              :error="confirmPasswordError"
              :error-message="confirmPasswordErrorMessage"
            />
          </q-col>
        </q-card-section>

        <!-- Error or Success Message -->
        <q-card-section v-if="formMessage" :class="messageClass">
          {{ formMessage }}
        </q-card-section>

        <!-- Already have an account? Link -->
        <q-card-section align="center">
          <router-link to="/login">Already have an account? Sign in</router-link>
        </q-card-section>

        <!-- Submit Button -->
        <q-card-actions align="center" class="full-width">
          <q-btn
            color="primary"
            label="Register"
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
      name: '',
      surname: '',
      nickname: '',
      password: '',
      confirmPassword: '',

      emailError: false,
      emailErrorMessage: '',
      nameError: false,
      nameErrorMessage: '',
      surnameError: false,
      surnameErrorMessage: '',
      nicknameError: false,
      nicknameErrorMessage: '',
      passwordError: false,
      passwordErrorMessage: '',
      confirmPasswordError: false,
      confirmPasswordErrorMessage: '',

      formMessage: '',
      messageClass: ''
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
      this.emailError = this.nameError = this.surnameError = this.nicknameError = this.passwordError = this.confirmPasswordError = false;
      this.emailErrorMessage = this.nameErrorMessage = this.surnameErrorMessage = this.nicknameErrorMessage = this.passwordErrorMessage = this.confirmPasswordErrorMessage = '';
      this.formMessage = '';
      this.messageClass = '';
    },

    onSubmit() {
      this.resetErrors();


      if (this.isEmpty(this.email)) {
        this.emailError = true;
        this.emailErrorMessage = 'Email is required';
      }
      if (this.isEmpty(this.name)) {
        this.nameError = true;
        this.nameErrorMessage = 'Name is required';
      }
      if (this.isEmpty(this.surname)) {
        this.surnameError = true;
        this.surnameErrorMessage = 'Surname is required';
      }
      if (this.isEmpty(this.nickname)) {
        this.nicknameError = true;
        this.nicknameErrorMessage = 'Nickname is required';
      }
      if (this.isEmpty(this.password)) {
        this.passwordError = true;
        this.passwordErrorMessage = 'Password is required';
      }
      if (this.isEmpty(this.confirmPassword)) {
        this.confirmPasswordError = true;
        this.confirmPasswordErrorMessage = 'Confirmation password is required';
      }


      if (!this.emailError && !this.isValidEmail(this.email)) {
        this.emailError = true;
        this.emailErrorMessage = 'Invalid email format';
      }


      if (!this.passwordError && !this.confirmPasswordError && this.password !== this.confirmPassword) {
        this.confirmPasswordError = true;
        this.confirmPasswordErrorMessage = 'Passwords do not match';
      }


      if (!this.emailError && !this.nameError && !this.surnameError && !this.nicknameError && !this.passwordError && !this.confirmPasswordError) {

        this.formMessage = 'Registration successful!';
        this.messageClass = 'text-positive';

          this.$router.push('/');
      } else {
        this.formMessage = 'Please fix the errors in the form.';
        this.messageClass = 'text-negative';
      }
    }
  }
};
</script>

<style scoped>
.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}
.logo {
  max-width: 80px;
}
.logo_text {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}
.form_holder {
  margin-top: 20px;
}
.text-negative {
  color: red;
  text-align: center;
}
.text-positive {
  color: green;
  text-align: center;
}
</style>
