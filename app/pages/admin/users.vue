<script setup lang="ts">
interface User {
  id: number
  email: string
  role: 'admin' | 'editor'
  createdAt: string | null
  updatedAt: string | null
}

const { loggedIn, user } = useUserSession()

if (!loggedIn.value || user.value?.role !== 'admin') {
  await navigateTo('/')
}

const email = ref('')
const password = ref('')
const role = ref<'admin' | 'editor'>('editor')
const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const { data: usersResponse, refresh } = await useFetch<{ users: User[] }>('/api/admin/users', {
  server: false,
  immediate: loggedIn.value && user.value?.role === 'admin',
})

const users = computed(() => usersResponse.value?.users ?? [])

async function createUser() {
  errorMessage.value = ''
  successMessage.value = ''
  loading.value = true

  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value,
        role: role.value,
      },
    })
    successMessage.value = 'Le compte a été créé.'
    email.value = ''
    password.value = ''
    role.value = 'editor'
    await refresh()
  } catch (error: unknown) {
    errorMessage.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'Impossible de créer ce compte.')
      : 'Impossible de créer ce compte.'
  } finally {
    loading.value = false
  }
}

async function updateRole(userId: number, nextRole: 'admin' | 'editor') {
  try {
    await $fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      body: { role: nextRole },
    })
    await refresh()
  } catch (error: unknown) {
    errorMessage.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'La mise à jour du rôle a échoué.')
      : 'La mise à jour du rôle a échoué.'
  }
}

async function deleteUser(userId: number) {
  try {
    await $fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    await refresh()
  } catch (error: unknown) {
    errorMessage.value = error && typeof error === 'object' && 'data' in error
      ? String((error as { data?: { statusMessage?: string } }).data?.statusMessage ?? 'La suppression a échoué.')
      : 'La suppression a échoué.'
  }
}

useSeoMeta({
  title: 'Administration des comptes | Juno-Matos',
})
</script>

<template>
  <main>
    <v-row>
      <v-col cols="12" md="5">
        <v-card>
          <v-card-title>Créer un compte</v-card-title>
          <v-card-text>
            <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-4">
              {{ errorMessage }}
            </v-alert>
            <v-alert v-if="successMessage" type="success" variant="tonal" class="mb-4">
              {{ successMessage }}
            </v-alert>

            <v-form @submit.prevent="createUser">
              <v-text-field v-model="email" label="Adresse e-mail" type="email" required />
              <v-text-field v-model="password" label="Mot de passe" type="password" required />
              <v-select
                v-model="role"
                :items="['editor', 'admin']"
                label="Rôle"
                class="mb-4"
              />
              <v-btn type="submit" color="primary" block :loading="loading">
                Créer le compte
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-card>
          <v-card-title>Utilisateurs</v-card-title>
          <v-card-text>
            <v-list v-if="users.length" lines="two">
              <v-list-item v-for="entry in users" :key="entry.id">
                <template #prepend>
                  <v-avatar color="primary" size="40">{{ entry.email.charAt(0).toUpperCase() }}</v-avatar>
                </template>

                <v-list-item-title>{{ entry.email }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ entry.role === 'admin' ? 'Administrateur' : 'Éditeur' }}
                </v-list-item-subtitle>

                <template #append>
                  <div class="d-flex align-center ga-2">
                    <v-select
                      :model-value="entry.role"
                      :items="['editor', 'admin']"
                      density="compact"
                      variant="outlined"
                      hide-details
                      style="max-width: 140px;"
                      @update:model-value="(value) => updateRole(entry.id, value as 'admin' | 'editor')"
                    />
                    <v-btn
                      v-if="entry.id !== user?.id"
                      color="error"
                      variant="text"
                      icon="mdi-delete"
                      @click="deleteUser(entry.id)"
                    />
                  </div>
                </template>
              </v-list-item>
            </v-list>
            <v-alert v-else type="info" variant="tonal">
              Aucun utilisateur n’est enregistré.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </main>
</template>
