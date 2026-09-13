<script setup lang="ts">
import type { MaterialFormValue } from '~/components/MaterialForm.vue'

const router = useRouter()
const { loggedIn } = useUserSession()
const loading = ref(false)
const errorMessage = ref('')

if (!loggedIn.value) {
  await navigateTo('/login')
}

async function createMaterial(value: MaterialFormValue) {
  loading.value = true
  errorMessage.value = ''
  try {
    const material = await $fetch<{ id: number }>('/api/materials', { method: 'POST', body: value })
    await router.push(`/materials/${material.id}`)
  } catch (error: unknown) {
    errorMessage.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Création impossible.')
      : 'Création impossible.'
  } finally {
    loading.value = false
  }
}

useSeoMeta({ title: 'Ajouter un matériel | Juno-Matos' })
</script>

<template>
  <div>
    <v-btn to="/" variant="text" prepend-icon="mdi-arrow-left" class="mb-4">Retour au catalogue</v-btn>
    <v-card>
      <v-card-title>Ajouter un matériel</v-card-title>
      <v-card-text>
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">{{ errorMessage }}</v-alert>
        <MaterialForm submit-label="Créer le matériel" :loading="loading" @submit="createMaterial" @cancel="router.push('/')" />
      </v-card-text>
    </v-card>
  </div>
</template>
