<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()
const theme = useTheme()

const prefersDark = ref(true)

onMounted(() => {
  const savedTheme = localStorage.getItem('juno-matos-theme')
  if (savedTheme === 'light' || savedTheme === 'dark') {
    theme.global.name.value = savedTheme
  } else {
    theme.global.name.value = 'dark'
  }
  prefersDark.value = theme.global.name.value === 'dark'
})

function toggleTheme() {
  const nextTheme = theme.global.name.value === 'dark' ? 'light' : 'dark'
  theme.global.name.value = nextTheme
  localStorage.setItem('juno-matos-theme', nextTheme)
  prefersDark.value = nextTheme === 'dark'
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" elevation="2" density="comfortable">
      <v-container class="d-flex align-center px-3 px-sm-4">
        <v-toolbar-title class="font-weight-bold text-subtitle-1 text-sm-h6">
          Juno-Matos
        </v-toolbar-title>
        <v-spacer />
        <v-btn to="/" variant="text" prepend-icon="mdi-home" class="d-none d-sm-inline-flex">
          Accueil
        </v-btn>
        <v-btn to="/" variant="text" icon class="d-sm-none" aria-label="Accueil">
          <v-icon icon="mdi-home" />
        </v-btn>
        <v-btn icon variant="text" @click="toggleTheme" :aria-label="prefersDark ? 'Passer en mode clair' : 'Passer en mode sombre'">
          <v-icon :icon="prefersDark ? 'mdi-weather-sunny' : 'mdi-weather-night'" />
        </v-btn>
        <v-btn v-if="!loggedIn" to="/login" variant="text" prepend-icon="mdi-login" class="d-none d-sm-inline-flex">
          Connexion
        </v-btn>
        <v-btn v-else-if="!loggedIn" to="/login" variant="text" icon class="d-sm-none" aria-label="Connexion">
          <v-icon icon="mdi-login" />
        </v-btn>
        <template v-else>
          <v-btn
            v-if="user?.role === 'admin'"
            to="/admin/users"
            variant="text"
            prepend-icon="mdi-account-cog"
            class="d-none d-sm-inline-flex"
          >
            Administration
          </v-btn>
          <v-btn
            v-if="user?.role === 'admin'"
            to="/admin/users"
            variant="text"
            icon
            class="d-sm-none"
            aria-label="Administration"
          >
            <v-icon icon="mdi-account-cog" />
          </v-btn>
          <span class="text-caption mx-2 d-none d-sm-inline">{{ user?.email }}</span>
          <v-btn variant="text" prepend-icon="mdi-logout" class="d-none d-sm-inline-flex" @click="logout">
            Déconnexion
          </v-btn>
          <v-btn variant="text" icon class="d-sm-none" aria-label="Déconnexion" @click="logout">
            <v-icon icon="mdi-logout" />
          </v-btn>
        </template>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container class="py-4 py-sm-8 px-3 px-sm-6">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
