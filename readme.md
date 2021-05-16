## 1. What

this project includes:  
<strong>VueHighway class</strong> : i call it 'vue component options translator', to write several components in single js file.  
<strong>doTemplate loader</strong>: webpack loader,use vue compiler to transform templateCode to render function

## 2. How it works

in js file, use new Class and then add properties or fn to the instance's context
webpack will use template loader to transform the template block' code to iife which return render fns  
Vue.extend then call the instance's context and render fn to make new Vuecomponents.

## 3. api (for now)

```javascript
// all api execpt final, return this(itself)
.template() // write jsx
.done() //  only use after .template, to match the Regex
.race() // compose other api
.data() // add data properties
.props()
.computed()
.methods()
.components()
.beforeCreate() // lifeCycle hook  (ctx)=>{//do thins}
.created()
.beforeDestroy()
.destroyed()
.beforeMount()
.mounted()
.final() // return  vueoptions
```

## 4. examples

from: app.vue

```vue
<template>
  <div>{{ message }}</div>
</template>
<script>
export default {
  data() {
    return {
      message: "test",
    };
  },
};
</script>
```

to: app.js

```javascript
export default new VueHighway()
  .template(() => <div>{{ message }}</div>)
  .data({
    message: "test",
  });
```

or one js file for several components:

```javascript
// app.js
let Header = new VueHighway()
  .template(() => (
    <div>
      <h1 v-if="isShow">{{ headerMessage }}</h1>
      <button v-on:click="onSwitch">switch</button>
    </div>
  ))
  .done()
  // .done is required after template
  // because loader is using Regex ex:.template.*.done to read the html code
  .data({ headerMessage: "hey,i am header", isShow: false })
  .methods((ctx) => ({
    onSwitch: () => (ctx.data.isShow = !ctx.data.isShow),
  }));

let Content = new VueHighway().template(() => <div>content</div>).done();

export default new VueHighway()
  .components({
    Header,
    Content,
  })
  .template(() => (
    <div>
      <Header />
      <Content />
      <footer>thanks for watching!</footer>
    </div>
  ))
  .done();
```

> loader: sourceCode from vue-loader
