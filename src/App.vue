<template>
  <div id="app">
    <div v-if="!results">
      <header>
        <h2>
          Calculate Price Per Unit
        </h2>
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
            :disabled="!isUnderstood"
            type="button"
            id="Calculate"
            @click="runSearch"
          >
            LET'S GO!
          </button>
        </div>
      </main>
    </div>

    <div v-if="results">
      <SearchResults
        :results="filteredResults"
        @handleSearch="handleSearch"
        @runAgain="runSearch()"
        @clearResults="clearResults()"
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
      results: null,
      filteredResults: null,
      attemptedSearch: false,
    };
  },
  created() {
    this.getInitialUnderstood();
    this.getInitialResults();
  },
  updated() {
    this.$refs.poller = setInterval(() => {
      if (new Date(this.expireTime) < new Date()) {
        clearInterval(this.$refs.poller);
        this.clearResults();
      }
    }, 3000);
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
      let localItem = localStorage.getItem(USER_UNDERSTANDS);
      if (localItem) {
        localItem = JSON.parse(localItem);
        const { expires } = localItem;
        const expireDate = new Date(expires);
        if (expireDate > new Date()) {
          this.isUnderstood = true;
        }
      } else {
        this.isUnderstood = false;
      }
    },
    getInitialResults() {
      const cachedItem = localStorage.getItem(CACHED_RESULTS);
      if (cachedItem != null) {
        const { results, expires } = JSON.parse(cachedItem);
        if (new Date(expires) > new Date()) {
          this.results = results;
          this.filteredResults = results;
          this.expireTime = expires;
          return;
        }
      }
      localStorage.removeItem(CACHED_RESULTS);
      this.results = null;
    },
    async runSearch() {
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
        this.filteredResults = resp;
      }
      this.attemptedSearch = true;
    },
    handleSearch(searchText) {
      if (!this.results) return;
      if (!searchText.length) {
        this.filteredResults = this.results;
        return;
      }
      const newFilteredResults = {};
      const units = Object.keys(this.results);
      units.forEach(unit => {
        console.log('this.results[unit]: ', this.results[unit]);
        this.results[unit].forEach(product => {
          const [, name] = product;
          if (name.toLowerCase().includes(searchText.toLowerCase())) {
            if (newFilteredResults[unit] === undefined) {
              newFilteredResults[unit] = [];
            }
            newFilteredResults[unit].push(product);
          }
        });
      });
      console.log('newFilteredResults: ', newFilteredResults);
      this.filteredResults = newFilteredResults;
    },
    clearResults() {
      localStorage.removeItem(CACHED_RESULTS);
      this.results = null;
      this.filteredResults = null;
      this.attemptedSearch = false;
    },
  },
};
</script>

// global styling
<style lang="scss">

h2 {
  margin: 0;
}
button {
  padding: 10px;
  background-color: #185e18;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 0 6px 1px rgba(0, 0, 0, 0.25);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

// scoped styling
<style lang="scss" scoped>
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
  background-color: #eee;
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
