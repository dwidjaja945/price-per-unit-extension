<template>
  <div id="app">
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
</template>

<script>
import runSearch from './runSearch';

const USER_UNDERSTANDS = 'userUnderstands';

export default {
  computed: {
    isUnderstood() {
      let localItem = localStorage.getItem(USER_UNDERSTANDS);
      if (localItem) {
        localItem = JSON.parse(localItem);
        const { expires } = localItem;
        const expireDate = new Date(expires);
        if (expireDate > new Date()) {
          return true;
        }
      }
      return false;
    },
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
    runSearch() {
      runSearch();
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
</style>
