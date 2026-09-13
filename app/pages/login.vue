<script setup lang="ts">
const { loggedIn, fetch: fetchSession } = useUserSession()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

if (loggedIn.value) {
  await navigateTo('/')
}

async function login() {
  errorMessage.value = ''
  loading.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })
    await fetchSession()
    await router.push('/')
  } catch (error: unknown) {
    errorMessage.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Connexion impossible.')
      : 'Connexion impossible.'
  } finally {
    loading.value = false
  }
}

useSeoMeta({
  title: 'Connexion | Juno-Matos',
})
</script>

<template>
  <v-row justify="center">
    <v-col cols="12" sm="8" md="5" lg="4">
      <v-card>
        <v-card-title>Connexion éditeur</v-card-title>
        <v-card-text>
          <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
            {{ errorMessage }}
          </v-alert>
          <v-form @submit.prevent="login">
            <v-text-field
              v-model="email"
              label="Adresse e-mail"
              type="email"
              autocomplete="username"
              required
            />
            <v-text-field
              v-model="password"
              label="Mot de passe"
              type="password"
              autocomplete="current-password"
              required
            />
            <v-btn type="submit" color="primary" block :loading="loading">
              Se connecter
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
