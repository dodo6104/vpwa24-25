<template>
  <div>
    <!-- Channel Name Input -->
    <q-input v-model="channelName" label="Channel Name" filled />

    <!-- Channel Type (Private/Public) -->
    <q-select
      v-model="channelType"
      :options="channelTypes"
      label="Channel Type"
      filled
      class="q-mt-md"
    />

    <!-- Add People (Multi-Select) -->
    <q-select
      v-model="selectedPeople"
      :options="peopleOptions"
      label="Add People"
      filled
      multiple
      class="q-mt-md"
    />


    <!-- Error message -->
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <!-- Action Buttons -->
    <q-btn @click="submitForm" label="Add Channel" color="primary" class="q-mt-md" />
    <q-btn @click="cancelForm" label="Cancel" flat class="q-ml-sm q-mt-md" />
  </div>
</template>
<script>
export default {
  data() {
    return {
      channelName: '',
      channelType: 'Public', // Default to public
      channelTypes: [
        { label: 'Public', value: 'Public' },
        { label: 'Private', value: 'Private' }
      ],
      selectedPeople: [],
      peopleOptions: [
        { label: 'John Doe', value: 'john_doe' },
        { label: 'Jane Smith', value: 'jane_smith' },
        { label: 'Alice Johnson', value: 'alice_johnson' },
        { label: 'Bob Brown', value: 'bob_brown' }
      ], // Mock data for people, replace with dynamic data if needed
      errorMessage: ''
    };
  },

  methods: {
    submitForm() {
      console.log('Channel type on submit:', this.selectedChannelTypeLabel); // Log the selected channel type label
      console.log('Channel type value on submit:', this.channelType); // Log the actual value (public/private)

      // Validate if the channel name is provided
      if (this.channelName.trim() === '') {
        this.errorMessage = 'Channel name is required!';
        return;
      }

      // Determine the icon based on the channel type
      const channelIcon = this.channelType === 'Public' ? 'tag' : 'lock';

      // Emit the new channel data to the parent component
      this.$emit('submit', {
        id: Date.now(),
        name: this.channelName,
        route: `chat/${this.channelName.toLowerCase().replace(/\s/g, '')}`,
        icon: channelIcon, // 'lock' for private, 'tag' for public
        type: this.channelType, // 'public' or 'private'
        people: this.selectedPeople // List of selected people
      });

      // Clear the input and selections
      this.channelName = '';

      this.selectedPeople = [];
      this.errorMessage = ''; // Clear the error message
    },
    cancelForm() {
      this.$emit('cancel'); // Emit the cancel event to close the form
      this.errorMessage = ''; // Clear the error message
    }
  }
};
</script>
<style>
.error-message{
  color: red;
}

</style>
