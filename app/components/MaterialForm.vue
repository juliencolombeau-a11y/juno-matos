<script setup lang="ts">
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

export interface MaterialFormValue {
  nom: string
  domaine: string | null
  type: string | null
  theme: string | null
  ageMin: number | null
  nbreMin: number | null
  nbreMax: number | null
  lieu: string | null
  description: string | null
  commentaire: string | null
  cloudinaryPublicId: string | null
  cloudinaryUrl: string | null
}

const props = withDefaults(defineProps<{
  initialValue?: Partial<MaterialFormValue>
  submitLabel?: string
  loading?: boolean
}>(), {
  initialValue: () => ({}),
  submitLabel: 'Enregistrer',
  loading: false,
})

const emit = defineEmits<{
  submit: [value: MaterialFormValue]
  cancel: []
}>()

const { data: references, refresh: refreshReferences } = await useFetch<ReferencesResponse>('/api/references')
const form = reactive<MaterialFormValue>({
  nom: props.initialValue.nom ?? '',
  domaine: props.initialValue.domaine ?? null,
  type: props.initialValue.type ?? null,
  theme: props.initialValue.theme ?? null,
  ageMin: props.initialValue.ageMin ?? null,
  nbreMin: props.initialValue.nbreMin ?? null,
  nbreMax: props.initialValue.nbreMax ?? null,
  lieu: props.initialValue.lieu ?? null,
  description: props.initialValue.description ?? null,
  commentaire: props.initialValue.commentaire ?? null,
  cloudinaryPublicId: props.initialValue.cloudinaryPublicId ?? null,
  cloudinaryUrl: props.initialValue.cloudinaryUrl ?? null,
})

const referenceKeyMap = {
  domaines: 'domaine',
  types: 'type',
  themes: 'theme',
} as const

type ReferenceKind = keyof typeof referenceKeyMap

function referenceOptions(kind: ReferenceKind) {
  return references.value?.[kind] ?? []
}

async function ensureReference(kind: ReferenceKind, value: string | null) {
  const candidate = value?.trim()
  if (!candidate) {
    form[referenceKeyMap[kind]] = null
    return
  }

  const existing = referenceOptions(kind).some((item) => String(item.nom).toLowerCase() === candidate.toLowerCase())
  if (!existing) {
    await $fetch('/api/references', {
      method: 'POST',
      body: { kind, nom: candidate },
    })
    await refreshReferences()
  }

  form[referenceKeyMap[kind]] = candidate
}

const valid = ref(false)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(form.cloudinaryUrl)
const imageLoading = ref(false)
const imageError = ref('')

watch(() => props.initialValue.cloudinaryUrl, (url) => {
  if (!selectedFile.value) {
    previewUrl.value = url ?? null
  }
})

function selectImage(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0] ?? null
  imageError.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    imageError.value = 'Sélectionnez un fichier image.'
    return
  }
  if (file.size > 15 * 1024 * 1024) {
    imageError.value = 'L’image ne doit pas dépasser 15 Mo.'
    return
  }
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  form.cloudinaryPublicId = null
  form.cloudinaryUrl = null
}

async function uploadSelectedImage() {
  if (!selectedFile.value) return
  imageLoading.value = true
  imageError.value = ''
  const body = new FormData()
  body.append('file', selectedFile.value)
  try {
    const uploaded = await $fetch<{ publicId: string, url: string }>('/api/media/image', {
      method: 'POST',
      body,
    })
    form.cloudinaryPublicId = uploaded.publicId
    form.cloudinaryUrl = uploaded.url
    selectedFile.value = null
  } catch (error: unknown) {
    imageError.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Téléversement impossible.')
      : 'Téléversement impossible.'
    throw error
  } finally {
    imageLoading.value = false
  }
}

async function submit() {
  if (!valid.value) return
  if (selectedFile.value) {
    try {
      await uploadSelectedImage()
    } catch {
      return
    }
  }
  emit('submit', { ...form })
}

onUnmounted(() => {
  if (previewUrl.value?.startsWith('blob:')) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <v-form v-model="valid" @submit.prevent="submit">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="form.nom"
          label="Nom du matériel"
          :rules="[(value: string) => !!value?.trim() || 'Le nom est obligatoire.']"
          maxlength="200"
          required
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-combobox
          :model-value="form.domaine"
          :items="referenceOptions('domaines')"
          item-title="nom"
          item-value="nom"
          label="Domaine"
          clearable
          :allow-custom="true"
          @update:model-value="(value) => ensureReference('domaines', value as string | null)"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-combobox
          :model-value="form.type"
          :items="referenceOptions('types')"
          item-title="nom"
          item-value="nom"
          label="Type"
          clearable
          :allow-custom="true"
          @update:model-value="(value) => ensureReference('types', value as string | null)"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-combobox
          :model-value="form.theme"
          :items="referenceOptions('themes')"
          item-title="nom"
          item-value="nom"
          label="Thème"
          clearable
          :allow-custom="true"
          @update:model-value="(value) => ensureReference('themes', value as string | null)"
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select v-model="form.lieu" :items="references?.lieux" item-title="nom" item-value="nom" label="Lieu" clearable />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field v-model.number="form.ageMin" label="Âge minimum" type="number" min="0" max="120" clearable />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field v-model.number="form.nbreMin" label="Joueurs minimum" type="number" min="0" clearable />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field v-model.number="form.nbreMax" label="Joueurs maximum" type="number" min="0" clearable />
      </v-col>
      <v-col cols="12">
        <v-file-input
          label="Image du matériel"
          accept="image/*"
          prepend-icon="mdi-camera"
          show-size
          clearable
          hint="JPG, PNG, WebP ou autre image, 15 Mo maximum."
          persistent-hint
          @change="selectImage"
        />
        <v-alert v-if="imageError" type="error" variant="tonal" class="mt-3">{{ imageError }}</v-alert>
        <v-img v-if="previewUrl" :src="previewUrl" alt="Prévisualisation de l'image" max-height="240" contain class="mt-4 rounded" />
        <v-text-field
          v-model="form.cloudinaryUrl"
          label="URL Cloudinary"
          type="url"
          clearable
          hint="Vous pouvez aussi renseigner une URL existante."
          persistent-hint
          class="mt-3"
        />
      </v-col>
      <v-col cols="12">
        <v-textarea v-model="form.description" label="Description" rows="4" maxlength="10000" />
      </v-col>
      <v-col cols="12">
        <v-textarea v-model="form.commentaire" label="Commentaire" rows="3" maxlength="10000" />
      </v-col>
    </v-row>
    <div class="d-flex flex-wrap justify-end ga-3 mt-4">
      <v-btn variant="text" @click="emit('cancel')">Annuler</v-btn>
      <v-btn type="submit" color="primary" :loading="loading || imageLoading">{{ submitLabel }}</v-btn>
    </div>
  </v-form>
</template>
