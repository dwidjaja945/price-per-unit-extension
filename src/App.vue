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
        <input id="understand" type="checkbox" v-model="isUnderstood"/>
        <label for="understand">Got it!</label>
      </div>
      <div class="body">
        <button :disabled="!isUnderstood" type="button" id="Calculate">LET'S GO!</button>
      </div>
    </main>

  </div>
</template>

<script>

export default {
  data() {
    return {
      isUnderstood: false,
    };
  },
  watch: {
    isUnderstood() {
      console.log(this.isUnderstood);
      debugger;
    },
  },
  methods: {

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
