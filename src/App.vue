<template>
  <div id="app">
    <Analyzer/>
  </div>
</template>

<script>
import Analyzer from './components/Analyzer';

export default {
  name: 'App',
  components: {
    Analyzer,
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 30px;
}
</style>
