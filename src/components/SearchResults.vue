<template>
  <div class="search-results-root">
    <header>
      <h2>Please make sure to double check values!</h2>
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
        <div ref="selectedUnitsContainerRef" class="selected-units-container">
          <button type="button" @click="toggleShowUnits()">Show Units &#9660;</button>
          <div class="selected-units-popover" v-if="showUnitPopover">
            <ul>
              <li :key="`select-units-${unit}`" v-for="unit of units">
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
        </div>
      </div>
      <div class="result-container" v-if="Object.keys(results).length > 0">
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
      <div v-else class="no-results">
        <h3>Sorry, we couldn&apos;t find any results!</h3>
      </div>
    </main>

    <footer>
      <button class="clear" @click="clearResults()">CLOSE</button>
    </footer>

  </div>
</template>

<script>
import { openPage } from '@/browserUtils';

const ASCENDING = 'acending';
const DECENDING = 'decending';
const CLEAR_RESULTS = 'clearResults';
const FILTER_UNITS = 'filterUnits';

export default {
  props: {
    results: Object,
    units: Array,
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
      selectedUnits: new Set(Object.keys(this.results)),
      showUnitPopover: false,
    };
  },
  created() {
    // TODO - convert clickAwayListener to separate component
    document.addEventListener('click', event => {
      if (document.onclick) document.onclick();
      if (!this.showUnitPopover) return;
      const queue = [this.$refs.selectedUnitsContainerRef];
      let showUnitPopover = false;
      while (queue.length) {
        const current = queue.shift();
        if (current.children.length) {
          queue.push(...current.children);
        }
        if (event.target === current) {
          showUnitPopover = true;
          break;
        }
        showUnitPopover = false;
      }
      this.showUnitPopover = showUnitPopover;
    });
  },
  unmounted() {
    this.$emit(CLEAR_RESULTS);
    document.removeEventListener('click');
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
    toggleShowUnits() {
      this.showUnitPopover = !this.showUnitPopover;
    },
    toggleUnit(unit) {
      if (this.selectedUnits.has(unit)) {
        this.selectedUnits.delete(unit);
      } else {
        this.selectedUnits.add(unit);
      }
      this.$emit(FILTER_UNITS, this.selectedUnits);
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
