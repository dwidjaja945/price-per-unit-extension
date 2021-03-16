<template>
  <div id="app">
    <div v-show="!results">
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

    <div v-show="results">
      <button @click="clearResults()">Clear Results</button>
    </div>
  </div>
</template>

<script>
import runSearch from './runSearch';

const USER_UNDERSTANDS = 'userUnderstands';
const CACHED_RESULTS = 'cachedResults';

export default {
  data() {
    return {
      isUnderstood: false,
      results: null,
    };
  },
  created() {
    this.getInitialUnderstood();
    this.getInitialResults();
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
      if (cachedItem) {
        this.results = JSON.parse(cachedItem);
      } else {
        this.results = null;
      }
    },
    updateResults(results) {
      this.results = results;
    },
    async runSearch() {
      const resp = await runSearch();
      const stringified = JSON.stringify(resp);
      localStorage.setItem(CACHED_RESULTS, stringified);
      this.updateResults(resp);
    },
    clearResults() {
      localStorage.removeItem(CACHED_RESULTS);
      this.updateResults(null);
    },
  },
};
</script>

<style lang="scss" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

header {
  padding: 10px;
  background-color: #eee;
}

h2 {
  margin: 0;
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
