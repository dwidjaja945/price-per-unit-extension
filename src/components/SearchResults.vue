<template>
  <div class="search-results-root">
    <header>
      <h2>Please make sure to double check values!</h2>
      <button class="clear" @click="clearResults()">Clear</button>
    </header>

    <main>
      <div :key="unit" v-for="unit in units">
        <b>Unit: {{unit}}</b>
        <ul>
          <li
            :key="item"
            v-for="[price, item, link] in results[unit]"
            class="list-item"
            @click="openPage(link)"
          >
            <b>{{price}}: </b><span>{{item}}</span>
          </li>
        </ul>
      </div>
    </main>

    <footer>
      <button @click="$emit('runAgain')">Run Again</button>
    </footer>

  </div>
</template>

<script>
import { openPage } from '@/browserUtils';

export default {
  props: {
    results: Object,
  },
  data() {
    return {
      units: [],
    };
  },
  created() {
    this.units = Object.keys(this.results);
    console.log(this.results[this.units[0]][0]);
  },
  methods: {
    clearResults() {
      this.$emit('clearResults');
    },
    openPage,
  },
};
</script>

<style lang="scss" scoped>

.search-results-root {
  height: 35rem;
  display: flex;
  flex-direction: column;
}
.clear {
  background-color: #a31616;
}

header {
  background-color: #eee;
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  position: relative;
  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    height: 24px;
    background: linear-gradient(0deg, rgba(255, 255, 255, 0), white);
  }
}
main {
  padding: 1rem;
  flex: 1;
  overflow: scroll;
}
ul {
  padding: 0;
  margin: 0;
}
li {
  cursor: pointer;
}
.list-item {
  padding: 0.75rem;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
footer {
  padding: 0.75rem;
  box-shadow: 0 0px 12px 1px rgba(0, 0, 0, 0.25);
}
</style>
