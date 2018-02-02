import db from '../../datastore-snippets';

const octokit = require('@octokit/rest')({
  requestMedia: 'application/vnd.github.v3+json',
  headers: {
    'user-agent': 'octokit/rest.js v1.2.3'
  }
});

const state = {
  snippets: [],
  languageSelected: 'all',
  gistsSelected: false
};

const mutations = {
  LOAD_SNIPPETS(state, snippets) {
    state.snippets = snippets;
  },
  ADD_SNIPPET(state, snippet) {
    state.snippets.push(snippet);
  },
  DELETE_SNIPPET(state, snippet) {
    state.snippets = state.snippets.filter(s => s._id !== snippet._id);

    if (!state.snippets.some(s => s.language === snippet.language)) {
      state.languageSelected = 'all';
    }
  },
  SELECT_LANGUAGE(state, language) {
    state.languageSelected = language;
  },
  SELECT_GISTS(state, gistsSelected) {
    state.gistsSelected = gistsSelected;
  }
};

const actions = {
  loadSnippets(store) {
    if (store.state.gistsSelected) {
      octokit.authenticate({
        type: 'token',
        token: store.rootState.Settings.settings.githubPersonalAccessToken
      });
      octokit.gists.getAll().then((res) => {

        const snippets = [];

        res.data.forEach(gist => {
          Object.keys(gist.files).forEach(key => {
            snippets.push({
              name: key,
              description: gist.description,
              language: 'javascript',
              content: 'hello world'
            });
          });
        });

        store.commit('LOAD_SNIPPETS', snippets);
      });
    }
    return db.find({}, (err, snippets) => {
      if (!err) {
        store.commit('LOAD_SNIPPETS', snippets);
      }
    });
  },
  addSnippet(store, snippet) {
    return db.insert(snippet, (err, snippet) => {
      if (!err) {
        store.commit('ADD_SNIPPET', snippet);
      }
    });
  },
  updateSnippet(store, snippet) {
    return db.update({_id: snippet._id}, snippet, {}, err => {
      if (!err) {
        store.dispatch('loadSnippets');
      }
    });
  },
  deleteSnippet(store, snippet) {
    return db.remove({_id: snippet._id}, {}, err => {
      if (!err) {
        store.commit('DELETE_SNIPPET', snippet);
      }
    });
  },
  selectLanguage(store, language) {
    store.commit('SELECT_LANGUAGE', language);
  },
  selectGists(store, gists) {
    store.commit('SELECT_GISTS', gists);
    store.dispatch('loadSnippets');
  },
};

const getters = {
  snippets: state => state.snippets,
  snippetById: state => id =>
    state.snippets.find(snippet => snippet._id === id),
  languages: state => {
    const map = new Map();

    if (state.snippets.length > 0) {
      state.snippets.forEach(snippet => {
        if (map.has(snippet.language)) {
          map.set(snippet.language, map.get(snippet.language) + 1);
        } else {
          map.set(snippet.language, 1);
        }
      });
    }
    return map;
  },
  languageSelected: state => state.languageSelected,
  gistsSelected: state => state.gistsSelected,
};

export default {
  state,
  mutations,
  actions,
  getters,
};
