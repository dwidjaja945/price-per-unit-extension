<template>
  <div ref="clickAwayListenerRef" :class="className">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'ClickAwayListener',
  props: {
    onClickAway: {
      type: Function,
      required: true,
    },
    className: {
      type: String,
      required: false,
    },
  },
  created() {
    document.addEventListener('click', event => {
      if (document.onclick) document.onclick();
      const queue = [this.$refs.clickAwayListenerRef];
      while (queue.length) {
        const current = queue.shift();
        if (current.children.length) {
          queue.push(...current.children);
        }
        if (event.target === current) {
          return;
        }
      }
      this.onClickAway();
    });
  },
  unmounted() {
    document.removeEventListener('click');
  },
};
</script>
