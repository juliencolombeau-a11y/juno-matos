<script setup lang="ts">
interface Material {
  id: number
  nom: string
  domaine: string | null
  type: string | null
  theme: string | null
  ageMin: number | null
  nbreMin: number | null
  nbreMax: number | null
  cloudinaryUrl: string | null
  cloudinaryPublicId: string | null
  lieu: string | null
  description: string | null
  commentaire: string | null
  createdAt: string
  updatedAt: string
}

const route = useRoute()
const router = useRouter()
const { loggedIn } = useUserSession()
const { data: material, error, status } = await useFetch<Material>(`/api/materials/${route.params.id}`)
const deleting = ref(false)
const deleteError = ref('')

useSeoMeta({
  title: () => material.value?.nom ? `${material.value.nom} - Juno-Matos` : 'Matériel - Juno-Matos',
  description: () => material.value?.description || 'Fiche de matériel pédagogique.',
})

function formatPlayers(material: Material): string {
  if (material.nbreMin === null && material.nbreMax === null) return 'Non renseigné'
  if (material.nbreMin === material.nbreMax) return `${material.nbreMin} joueur${material.nbreMin === 1 ? '' : 's'}`
  return `${material.nbreMin ?? '?'} à ${material.nbreMax ?? '?'} joueurs`
}

async function deleteMaterial() {
  if (!material.value || !window.confirm(`Supprimer « ${material.value.nom} » ?`)) return
  deleting.value = true
  deleteError.value = ''
  try {
    await $fetch(`/api/materials/${material.value.id}`, { method: 'DELETE' })
    await router.push('/')
  } catch (error: unknown) {
    deleteError.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Suppression impossible.')
      : 'Suppression impossible.'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div>
    <v-btn to="/" variant="text" prepend-icon="mdi-arrow-left" class="mb-4">
      Retour au catalogue
    </v-btn>

    <v-alert v-if="status === 'pending'" type="info">
      Chargement de la fiche…
    </v-alert>
    <v-alert v-else-if="error" type="error">
      Cette fiche n'est pas disponible.
    </v-alert>
    <v-row v-else-if="material">
      <v-col cols="12" md="6">
        <v-img
          v-if="material.cloudinaryUrl"
          :src="material.cloudinaryUrl"
          :alt="`Image de ${material.nom}`"
          aspect-ratio="4/3"
          cover
          class="rounded-lg"
        />
        <v-sheet v-else color="grey-lighten-3" aspect-ratio="4/3" class="d-flex align-center justify-center rounded-lg">
          <span class="text-medium-emphasis">Aucune image disponible</span>
        </v-sheet>
      </v-col>
      <v-col cols="12" md="6">
        <div class="d-flex flex-wrap ga-2 mb-3">
          <v-chip v-if="material.domaine" color="primary" size="small">{{ material.domaine }}</v-chip>
          <v-chip v-if="material.type" size="small">{{ material.type }}</v-chip>
        </div>
        <h1 class="text-h3 mb-4">{{ material.nom }}</h1>
        <v-alert v-if="deleteError" type="error" variant="tonal" class="mb-4">{{ deleteError }}</v-alert>
        <p v-if="material.description" class="text-body-1 mb-6">{{ material.description }}</p>
        <v-list density="compact" lines="two">
          <v-list-item v-if="material.theme" title="Thème" :subtitle="material.theme" />
          <v-list-item v-if="material.lieu" title="Lieu" :subtitle="material.lieu" />
          <v-list-item title="Âge minimum" :subtitle="material.ageMin === null ? 'Non renseigné' : `${material.ageMin} ans`" />
          <v-list-item title="Nombre de joueurs" :subtitle="formatPlayers(material)" />
        </v-list>
        <v-alert v-if="material.commentaire" class="mt-4" variant="tonal" type="info">
          {{ material.commentaire }}
        </v-alert>
        <div v-if="loggedIn" class="d-flex flex-wrap ga-3 mt-6">
          <v-btn :to="`/materials/${material.id}/edit`" color="primary" prepend-icon="mdi-pencil">
            Modifier
          </v-btn>
          <v-btn color="error" variant="outlined" prepend-icon="mdi-delete" :loading="deleting" @click="deleteMaterial">
            Supprimer
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>
