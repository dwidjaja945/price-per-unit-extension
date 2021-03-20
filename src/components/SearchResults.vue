<template>
  <div class="search-results-root">
    <header>
      <h2>Please make sure to double check values!</h2>
      <button class="clear" @click="clearResults()">CLEAR</button>
    </header>

    <main>
      <div class="search-container">
        <form>
          <label for="sort-order" aria-hidden="true" v-show="false">Sort Order</label>
          <select name="sort-order" v-model="sortOrder">
            <option :value="ASCENDING">Low - High</option>
            <option :value="DECENDING">High - Low</option>
          </select>
        </form>
        <div>
          <input type="text" v-model="searchText" placeholder="Search For...">
        </div>
      </div>
      <div class="result-container">
        <div class="unit-container" :key="unit" v-for="(value, unit) in results">
          <b>Unit: {{unit}}</b>
          <ul>
            <li
              :key="item"
              v-for="[price, item, link] in results[unit]"
              class="list-item"
              @click="openPage(link)"
            >
              <b>{{price}}: </b>
              <span>{{item}}</span>
            </li>
          </ul>
        </div>
      </div>
    </main>

    <footer>
      <button @click="$emit('runAgain')">RUN AGAIN</button>
    </footer>

  </div>
</template>

<script>
import { openPage } from '@/browserUtils';

const ASCENDING = 'acending';
const DECENDING = 'decending';

export default {
  props: {
    results: Object,
  },
  computed: {
    ASCENDING() {
      return ASCENDING;
    },
    DECENDING() {
      return DECENDING;
    },
  },
  data() {
    return {
      searchText: '',
      sortOrder: ASCENDING,
    };
  },
  watch: {
    searchText() {
      this.$emit('handleSearch', this.searchText);
    },
    sortOrder() {
      this.$emit('handleSort', this.sortOrder === DECENDING);
    },
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
@import "@/styles/variables.scss";

.search-results-root {
  min-height: 35rem;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.clear {
  background-color: $error;
  &:hover {
    background-color: darken($error, 5%);
  }
  &:active {
    background-color: lighten($error, 5%);
  }
}

header {
  background-color: #eee;
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  position: relative;
}
main {
  padding-top: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-container {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
  > * {
    display: flex;
    justify-content: center;
  }
  select {
    padding: 5px 10px;
    border-radius: 0.4rem;
    cursor: pointer;
  }
  input {
    width: 75%;
    padding: 0.5rem 0.75rem;
    border-radius: 1rem;
    &:focus {
      outline: none;
    }
  }
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

.result-container {
  overflow: scroll;
  padding: 0 1rem;
}

.unit-container:last-of-type {
  padding-bottom: 1rem;
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
