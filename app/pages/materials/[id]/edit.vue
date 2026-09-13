<script setup lang="ts">
import type { MaterialFormValue } from '~/components/MaterialForm.vue'

interface Material extends MaterialFormValue {
  id: number
}

const route = useRoute()
const router = useRouter()
const { loggedIn } = useUserSession()
const loading = ref(false)
const errorMessage = ref('')
const { data: material, error, status } = await useFetch<Material>(`/api/materials/${route.params.id}`)

if (!loggedIn.value) {
  await navigateTo('/login')
}

async function updateMaterial(value: MaterialFormValue) {
  loading.value = true
  errorMessage.value = ''
  try {
    await $fetch(`/api/materials/${route.params.id}`, { method: 'PUT', body: value })
    await router.push(`/materials/${route.params.id}`)
  } catch (error: unknown) {
    errorMessage.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Modification impossible.')
      : 'Modification impossible.'
  } finally {
    loading.value = false
  }
}

useSeoMeta({ title: () => material.value ? `Modifier ${material.value.nom} | Juno-Matos` : 'Modifier un matériel | Juno-Matos' })
</script>

<template>
  <div>
    <v-btn :to="`/materials/${route.params.id}`" variant="text" prepend-icon="mdi-arrow-left" class="mb-4">Retour à la fiche</v-btn>
    <v-alert v-if="status === 'pending'" type="info">Chargement de la fiche…</v-alert>
    <v-alert v-else-if="error || !material" type="error">Cette fiche n'est pas disponible.</v-alert>
    <v-card v-else>
      <v-card-title>Modifier le matériel</v-card-title>
      <v-card-text>
        <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">{{ errorMessage }}</v-alert>
        <MaterialForm :initial-value="material" :loading="loading" submit-label="Enregistrer les modifications" @submit="updateMaterial" @cancel="router.push(`/materials/${route.params.id}`)" />
      </v-card-text>
    </v-card>
  </div>
</template>
