<template>
  <div id="app">
    <div v-if="!results">
      <header>
        <h2>
          Calculate Price Per Unit
        </h2>
        <button
          :disabled="!isUnderstood || isRunning"
          type="button"
          id="Calculate"
          @click="runSearch"
        >
          GO!
        </button>
      </header>

      <main>
        <div>
          <blockquote>
            <p>
              Please note that the results may have a slight margin of error
              depending on the format in which the product has been titled.
            </p>
            <p>
              Make sure to double check to see if the values are accurate before
              making your decision.
            </p>
            <p>
              Lastly, make sure when you click the button below, you are doing so
              in the browser extension, <b>not</b> the popup window!
            </p>
          </blockquote>
        </div>
        <div class="understand-box">
          <input id="understand" type="checkbox" v-model="isUnderstood" />
          <label for="understand">Got it!</label>
        </div>
        <div v-if="attemptedSearch && !results">
          <p>We couldn't find any results... Try again!</p>
          <p>
            If it still does not work, try refreshing the browser, otherwise,
            uh oh! That's a bug!
          </p>
        </div>
        <div class="body">
          <button
            :disabled="!isUnderstood || isRunning"
            type="button"
            id="Calculate"
            @click="runSearch"
          >
            LET'S GO!
          </button>
        </div>
      </main>
    </div>

    <div v-else>
      <SearchResults
        :results="results"
        @runAgain="runSearch"
        @clearResults="clearResults"
      />
    </div>
  </div>
</template>

<script>
import SearchResults from '@/components/SearchResults.vue';
import { runSearch } from '@/browserUtils';

const RESULTS_CLASSNAME = 'results';
const USER_UNDERSTANDS = 'userUnderstands';
const CACHED_RESULTS = 'cachedResults';

export default {
  components: {
    SearchResults,
  },
  data() {
    return {
      isUnderstood: false,
      isRunning: false,
      results: null,
      attemptedSearch: false,
      expireTime: null,
    };
  },
  created() {
    this.getInitialUnderstood();
    this.getInitialResults();
  },
  updated() {
    if (this.$refs.poller === undefined) {
      this.$refs.poller = setInterval(() => {
        if (new Date(this.expireTime) < new Date()) {
          clearInterval(this.$refs.poller);
          delete this.$refs.poller;
          this.clearResults();
        }
      }, 3000);
    }
  },
  beforeUnmount() {
    if (this.$refs.poller) {
      clearInterval(this.$refs.poller);
      delete this.$refs.poller;
    }
  },
  watch: {
    isUnderstood() {
      if (this.isUnderstood) {
        let expires = new Date();
        expires = expires.setHours(expires.getHours() + 1);
        localStorage.setItem(USER_UNDERSTANDS, JSON.stringify({
          userUnderstands: true,
          expires,
        }));
      } else {
        localStorage.removeItem(USER_UNDERSTANDS);
      }
    },
    results() {
      if (this.results !== null) {
        document.body.classList.add(RESULTS_CLASSNAME);
      } else {
        document.body.classList.remove(RESULTS_CLASSNAME);
      }
    },
  },
  methods: {
    getInitialUnderstood() {
      const localItem = localStorage.getItem(USER_UNDERSTANDS);
      if (localItem) {
        const { expires } = JSON.parse(localItem);
        this.isUnderstood = new Date(expires) > new Date();
        return;
      }
      this.isUnderstood = false;
    },
    getInitialResults() {
      const cachedItem = localStorage.getItem(CACHED_RESULTS);
      if (cachedItem != null) {
        const { results, expires } = JSON.parse(cachedItem);
        if (new Date(expires) > new Date()) {
          this.results = results;
          this.expireTime = expires;
          return;
        }
      }
      localStorage.removeItem(CACHED_RESULTS);
      this.results = null;
    },
    async runSearch() {
      this.isRunning = true;
      const resp = await runSearch();
      if (resp) {
        let expires = new Date();
        expires = expires.setMinutes(expires.getMinutes() + 5);
        const stringified = JSON.stringify({
          results: resp,
          expires,
        });
        localStorage.setItem(CACHED_RESULTS, stringified);
        this.results = resp;
        window.open('../popup.html', 'Search Results', 'status=0, height=700, width=600, left=0');
        window.close();
      }
      this.isRunning = false;
      this.attemptedSearch = true;
    },
    clearResults() {
      localStorage.removeItem(CACHED_RESULTS);
      this.results = null;
      this.attemptedSearch = false;
    },
  },
};
</script>

// global styling
<style lang="scss">
@import "@/styles/variables.scss";
h2 {
  margin: 0;
}
button {
  padding: 10px;
  background-color: $primary;
  border-radius: 6px;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.25);
  transition: background-color 0.2s ease-in-out;
  &:hover {
    background-color: darken($primary, 5%);
  }
  &:active {
    background-color: lighten($primary, 5%);
    outline: none;
  }
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

// scoped styling
<style lang="scss" scoped>
@import "@/styles/variables.scss";
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-size: 16px;
  color: #2c3e50;
}

main {
  padding: 0 30px;
}

header {
  padding: 10px;
  background-color: $gray;
  display: flex;
  justify-content: space-between;
}

.understand-box {
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.body {
  display: flex;
  justify-content: center;
  padding: 20px;
}

</style>
