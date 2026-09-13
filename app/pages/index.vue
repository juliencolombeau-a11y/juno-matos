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
  lieu: string | null
  description: string | null
}

interface MaterialsResponse {
  data: Material[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

interface Reference {
  id: string | number
  nom: string | number
}

interface ReferencesResponse {
  domaines: Reference[]
  types: Reference[]
  themes: Reference[]
  lieux: Reference[]
  ages: Reference[]
}

const search = ref('')
const domaine = ref('')
const type = ref('')
const theme = ref('')
const lieu = ref('')
const age = ref('')
const page = ref(1)
const { loggedIn } = useUserSession()

const { data: references } = await useFetch<ReferencesResponse>('/api/references')
const query = computed(() => ({
  search: search.value || undefined,
  domaine: domaine.value || undefined,
  type: type.value || undefined,
  theme: theme.value || undefined,
  lieu: lieu.value || undefined,
  age: age.value || undefined,
  page: page.value,
}))
const { data: response, status, error } = await useFetch<MaterialsResponse>('/api/materials', {
  query,
  watch: [query],
  default: () => ({
    data: [],
    pagination: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
  }),
})

watch([search, domaine, type, theme, lieu, age], () => {
  page.value = 1
})

useSeoMeta({
  title: 'Juno-Matos - Matériel pédagogique',
  description: 'Recherchez et consultez le catalogue de matériel pédagogique.',
})

function clearFilters() {
  search.value = ''
  domaine.value = ''
  type.value = ''
  theme.value = ''
  lieu.value = ''
  age.value = ''
  page.value = 1
}

function playersLabel(material: Material): string | null {
  if (material.nbreMin === null && material.nbreMax === null) return null
  if (material.nbreMin === material.nbreMax) return `${material.nbreMin} joueur${material.nbreMin === 1 ? '' : 's'}`
  return `${material.nbreMin ?? '?'}-${material.nbreMax ?? '?'} joueurs`
}
</script>

<template>
  <main>
    <section class="mb-8">
      <p class="text-overline text-primary mb-2">Catalogue pédagogique</p>
      <h1 class="text-h2 text-md-h1 mb-3">Trouvez le matériel adapté</h1>
      <p class="text-body-1 text-medium-emphasis">
        Recherchez une fiche par nom, domaine, type, thème ou lieu.
      </p>
    </section>

    <v-card class="mb-8" variant="tonal">
      <v-card-text>
        <v-text-field
          v-model="search"
          label="Rechercher"
          placeholder="Nom, description ou commentaire"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          class="mb-4"
        />
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-select v-model="domaine" :items="references?.domaines" item-title="nom" item-value="nom" label="Domaine" clearable hide-details />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select v-model="type" :items="references?.types" item-title="nom" item-value="nom" label="Type" clearable hide-details />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select v-model="theme" :items="references?.themes" item-title="nom" item-value="nom" label="Thème" clearable hide-details />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select v-model="lieu" :items="references?.lieux" item-title="nom" item-value="nom" label="Lieu" clearable hide-details />
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select v-model="age" :items="references?.ages" item-title="nom" item-value="nom" label="Âge minimum" clearable hide-details />
          </v-col>
          <v-col cols="12" sm="6" md="4" class="d-flex align-center">
            <v-btn variant="text" prepend-icon="mdi-filter-off" @click="clearFilters">
              Réinitialiser
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5">Matériel disponible</h2>
      <div class="d-flex align-center ga-3">
        <span class="text-body-2 text-medium-emphasis">{{ response?.pagination.total ?? 0 }} résultat(s)</span>
        <v-btn v-if="loggedIn" to="/materials/new" color="primary" prepend-icon="mdi-plus">
          Ajouter
        </v-btn>
      </div>
    </div>

    <v-alert v-if="error" type="error" class="mb-4">
      Le catalogue est momentanément indisponible.
    </v-alert>
    <v-progress-linear v-else-if="status === 'pending'" indeterminate color="primary" class="mb-4" />
    <v-alert v-else-if="response?.data.length === 0" type="info" variant="tonal">
      Aucun matériel ne correspond à votre recherche.
    </v-alert>

    <v-row v-else>
      <v-col v-for="material in response?.data" :key="material.id" cols="12" sm="6" lg="4">
        <v-card class="h-100 d-flex flex-column" :to="`/materials/${material.id}`">
          <v-img
            v-if="material.cloudinaryUrl"
            :src="material.cloudinaryUrl"
            :alt="`Image de ${material.nom}`"
            height="220"
            cover
          />
          <v-sheet v-else color="grey-lighten-3" height="220" class="d-flex align-center justify-center">
            <span class="text-medium-emphasis">Aucune image</span>
          </v-sheet>
          <v-card-item>
            <v-card-title>{{ material.nom }}</v-card-title>
            <v-card-subtitle>{{ material.domaine || 'Domaine non renseigné' }}</v-card-subtitle>
          </v-card-item>
          <v-card-text class="flex-grow-1">
            <div class="d-flex flex-wrap ga-2 mb-3">
              <v-chip v-if="material.type" size="small">{{ material.type }}</v-chip>
              <v-chip v-if="material.ageMin !== null" size="small" variant="outlined">Dès {{ material.ageMin }} ans</v-chip>
              <v-chip v-if="playersLabel(material)" size="small" variant="outlined">{{ playersLabel(material) }}</v-chip>
            </div>
            <p v-if="material.description" class="text-body-2 text-medium-emphasis line-clamp-3">
              {{ material.description }}
            </p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" variant="text" append-icon="mdi-arrow-right">
              Voir la fiche
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="response && response.pagination.totalPages > 1" class="d-flex justify-center mt-8">
      <v-pagination v-model="page" :length="response.pagination.totalPages" :total-visible="5" />
    </div>
  </main>
</template>
