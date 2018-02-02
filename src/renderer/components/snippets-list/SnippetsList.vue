<template src="./SnippetsList.html">
</template>

<script>
import Vuex from 'vuex';
import SnippetCard from './snippet-card/SnippetCard';
import CreateSnippetModal from '../modals/create-snippet-modal/CreateSnippetModal';
import SettingsModal from '../modals/settings-modal/SettingsModal';

export default {
  name: 'cb-snippets-list',
  components: {
    'cb-snippet-card': SnippetCard,
    'cb-create-snippet-modal': CreateSnippetModal,
    'cb-settings-modal': SettingsModal,
  },
  data() {
    return {
      searchField: '',
      createSnippetModalActive: false,
      settingsModalActive: false
    };
  },
  mounted() {},
  methods: {},
  computed: {
    ...Vuex.mapGetters(['snippets', 'snippetById', 'languageSelected', 'gistsSelected']),
    snippetsFiltered() {
      const snippetsFiltered = this.snippets.filter(item =>
        this.searchField
          .split(' ')
          .every(
            el =>
              item.name.indexOf(el) > -1 ||
              item.description.indexOf(el) > -1 ||
              item.language.indexOf(el) > -1
          )
      );

      if (this.languageSelected !== 'all') {
        return snippetsFiltered.filter(
          snippet => snippet.language === this.languageSelected
        );
      }

      return snippetsFiltered;
    },
  },
  beforeRouteEnter(route, redirect, next) {
    next(vm => {
      vm.$store.dispatch('loadSnippets');
      vm.$store.dispatch('loadSettings');
    });
  },
};
</script>

<style src="./SnippetsList.scss" lang="scss">
</style>
