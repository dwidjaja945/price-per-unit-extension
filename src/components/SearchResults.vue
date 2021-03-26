<template>
  <div class="search-results-root">
    <header>
      <h2>Please make sure to double check values!</h2>
      <button class="clear" @click="clearResults()">X</button>
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
        <ClickAwayListener :onClickAway="hidePopover" className="selected-units-container">
          <button type="button" @click="toggleShowUnits()">Show Units &#9660;</button>
          <div class="selected-units-popover" v-if="showUnitPopover">
            <ul>
              <li :key="`select-units-${unit}`" v-for="(value, unit) in results">
                <input
                  :id="`selected-unit-${unit}`"
                  type="checkbox" :checked="selectedUnits.has(unit)"
                  @change="toggleUnit(unit)"
                />
                <label :for="`selected-unit-${unit}`">
                  {{unit}}
                </label>
              </li>
            </ul>
          </div>
        </ClickAwayListener>
      </div>
      <div class="result-container" v-if="Object.keys(filteredResults).length > 0">
        <div class="unit-container" :key="unit" v-for="(value, unit) in filteredResults">
          <b>Unit: {{unit}}</b>
          <ul>
            <li
              :key="item"
              v-for="[price, item, link] in filteredResults[unit]"
              class="list-item"
              @click="openPage(link)"
            >
              <b>{{price}}: </b>
              <span>{{item}}</span>
            </li>
          </ul>
        </div>
      </div>
      <div v-else class="no-results">
        <h3>Sorry, we couldn&apos;t find any results!</h3>
      </div>
    </main>

    <footer>
      <button class="clear" @click="clearResults()">CLEAR</button>
    </footer>

  </div>
</template>

<script>
import ClickAwayListener from '@/components/ClickAwayListener.vue';
import { openPage } from '@/browserUtils';

const ASCENDING = 'acending';
const DECENDING = 'decending';
const CLEAR_RESULTS = 'clearResults';
const replaceRegex = /[ $a-z]/gim;

export default {
  components: {
    ClickAwayListener,
  },
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
      filteredResults: this.results,
      searchText: '',
      sortOrder: ASCENDING,
      selectedUnits: new Set(Object.keys(this.results)),
      showUnitPopover: false,
    };
  },
  unmounted() {
    this.$emit(CLEAR_RESULTS);
  },
  watch: {
    searchText() {
      if (!this.results) return;
      if (!this.searchText.length) {
        this.filteredResults = this.results;
        return;
      }
      const newFilteredResults = {};
      const units = Object.keys(this.results);
      units.forEach(unit => {
        this.results[unit].forEach(product => {
          const [, name] = product;
          if (name.toLowerCase().includes(this.searchText.toLowerCase())) {
            if (newFilteredResults[unit] === undefined) {
              newFilteredResults[unit] = [];
            }
            newFilteredResults[unit].push(product);
          }
        });
      });
      this.filteredResults = newFilteredResults;
    },
    sortOrder() {
      const isDecending = this.sortOrder === DECENDING;
      const units = Object.keys(this.results);
      const newResults = {};
      units.forEach(unit => {
        const unitResults = this.results[unit];
        newResults[unit] = unitResults.sort((a, b) => {
          const [first] = a;
          const [second] = b;
          const firstNumber = Number(first.replace(replaceRegex, ''));
          const secondNumber = Number(second.replace(replaceRegex, ''));
          if (isDecending) return secondNumber - firstNumber;
          return firstNumber - secondNumber;
        });
      });
      this.filteredResults = newResults;
    },
  },
  methods: {
    hidePopover() {
      this.showUnitPopover = false;
    },
    toggleShowUnits() {
      this.showUnitPopover = !this.showUnitPopover;
    },
    toggleUnit(unit) {
      if (this.selectedUnits.has(unit)) {
        this.selectedUnits.delete(unit);
      } else {
        this.selectedUnits.add(unit);
      }
      if (!this.results) return;
      const unitsToDelete = { ...this.results };
      this.selectedUnits.forEach(selectedUnit => {
        delete unitsToDelete[selectedUnit];
      });
      const newFilteredResults = { ...this.results };
      Object.keys(unitsToDelete).forEach(selectedUnit => {
        delete newFilteredResults[selectedUnit];
      });
      this.filteredResults = newFilteredResults;
    },
    clearResults() {
      this.$emit(CLEAR_RESULTS);
      window.close();
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

.selected-units-container {
  position: relative;
}

.selected-units-popover {
  position: absolute;
  z-index: 1;
  background-color: white;
  top: 100%;
  left: 0;
  right: 0;
  min-height: 100px;
  box-shadow: 0 0 7px 2px rgba(0, 0, 0, 0.25);
  ul {
    list-style-type: none;
  }
  li {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 5px;
    border-bottom: 1px solid $gray;
    &:last-of-type {
      border-bottom: none;
    }
    input {
      width: unset;
      margin-right: 10px;
    }
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

.no-results {
  padding: 1rem 2rem;
}
footer {
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem;
  box-shadow: 0 0px 12px 1px rgba(0, 0, 0, 0.25);
}
</style>
