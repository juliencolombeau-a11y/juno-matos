<script setup lang="ts">
const { loggedIn, user, clear } = useUserSession()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" elevation="2">
      <v-container class="d-flex align-center">
        <v-toolbar-title class="font-weight-bold">
          Juno-Matos
        </v-toolbar-title>
        <v-spacer />
        <v-btn to="/" variant="text" prepend-icon="mdi-home">
          Catalogue
        </v-btn>
        <v-btn v-if="!loggedIn" to="/login" variant="text" prepend-icon="mdi-login">
          Connexion
        </v-btn>
        <template v-else>
          <span class="text-caption mx-2">{{ user?.email }}</span>
          <v-btn variant="text" prepend-icon="mdi-logout" @click="logout">
            Déconnexion
          </v-btn>
        </template>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container class="py-8">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>
