// !important transform to js target should be ES5 ! or can't run.
type NormalObj = {
  [key: string]: any;
};
type VueInstance = {
  // TODO
  readonly $refs: any;
  readonly $vnode: any;
  $nextTick(): Promise<void>;
  _vfContext: VFContext; 
  vflow: VueFlow;
};
// ((createElement: CreateElement) => VNode)[];
export interface VFContext {
  context_id: "flow_ctx";
  name: string;
  vue: null | VueInstance;
  data: NormalObj;
  props: NormalObj;
  computed: ((ctx: VFContext) => NormalObj)[];
  methods: ((ctx: VFContext) => NormalObj)[]; //
  components: NormalObj;

  render: any;
  staticRenderFns: any;

  beforeCreate: lifeHook;
  created: lifeHook;
  beforeDestroy: lifeHook;
  destroyed: lifeHook;
  beforeMount: lifeHook;
  mounted: lifeHook;
  _compiled?: boolean;
  _scopeId?: string;
  [key: string]: any;
}
type doCtx = (ctx: VFContext) => void;
type lifeHook = doCtx[];
const lifeHooks = [
  "beforeCreate",
  "created",
  "beforeDestroy",
  "destroyed",
  "beforeMount",
  "mounted",
];
declare namespace JSX {
  interface IntrinsicElements {
    foo: { bar?: boolean };
    [elemName: string]: any;
  }
}
const CONTEXT_ID = "flow_ctx";
// for loader
const NEVER_LOADER_MYSELF = true;
class VueFlow {
  context: VFContext;
  // vue: null | VueInstance;
  componentName?: string;
  constructor(componentName?: string) {
    // this.vue = null;
    this.context = {
      context_id: CONTEXT_ID,
      name: componentName || "",
      vue: null,
      data: {},
      props: {},
      computed: [],
      methods: [],
      components: {},
      render: undefined,
      staticRenderFns: undefined,
      beforeCreate: [],
      created: [],
      beforeDestroy: [],
      destroyed: [],
      beforeMount: [],
      mounted: [],
    };
  }
  done() {
    return this;
  }
  final() {
    // every Vue.extend copy context
    const _context = clone(this.context);
    const arrToObj = (pArr: ((ctx: VFContext) => NormalObj)[]) =>
      pArr.reduce((acc, cur) => {
        acc = {
          ...acc,
          ...cur(_context), // call new context
        };
        return acc;
      }, {});
    let objMethods: any = arrToObj(_context.methods);
    let objComputed: any = arrToObj(_context.computed);
    _context.methods = objMethods;
    _context.computed = objComputed;
    // TODO bindVue for hotReload
    // const bindVue = (vueInstance: VueInstance) => {
    //   this.vue = vueInstance;
    //   vueInstance.vflow = this;
    // };
    return {
      context_id: _context.context_id,
      props: _context.props,
      computed: objComputed,
      methods: objMethods,
      components: _context.components,
      render: _context.render,
      staticRenderFns: _context.staticRenderFns,
      data: () => _context.data, // data should be a fn in v options?
      //lifeHooks
      //...{
      // mounted: () => this.context.mounted.forEach((i) => i())
      // }
      ...lifeHooks
        // in beforeCreate bind vue <-> context
        .filter(
          (hook: string) => hook === "beforeCreate" || _context[hook].length
        )
        .reduce<{ [key: string]: any }>((acc, cur) => {
          if (cur === "beforeCreate") {
            acc[cur] = function(this: VueInstance) {
              // bindVue(this);
              _context.vue = this;
              this._vfContext = _context;
              _context[cur].forEach((i: doCtx) => i(_context));
            };
          } else if (_context[cur].length) {
            acc[cur] = () => _context[cur].forEach((i: doCtx) => i(_context));
          }
          return acc;
        }, {}),
      vue: _context.vue,
      _compiled: _context.render ? true : false,
      // ...(_context._scopeId // for style scoped
      //   ? {
      //       _scopeId: _context._scopeId,
      //     }
      //   : {}),
    };
  }
  template(obj: (...rest: any[]) => JSX.IntrinsicElements) {
    Object.assign(this.context, { ...obj }); // __file _scopedId
    if (this.context.render) this.context._compiled = true;
    return this;
  }
  // template(obj: JSX.IntrinsicElements) {
  //   Object.assign(this.context, { ...obj }); // __file _scopedId
  //   if (this.context.render) this.context._compiled = true;
  //   return this;
  // }
  // style() {
  //   return this;
  // }
  // link any style work
  flow<P = (NormalObj | doCtx)[]>(keyList: string, arr: P) {
    keyList.split("-").forEach((item, index) => {
      (this as any)[item](arr[index]);
    });
    return this;
  }
  data<D = NormalObj>(obj: D) {
    Object.assign(this.context.data, { ...obj });
    return this;
  }
  props(obj: NormalObj) {
    Object.assign(this.context.props, { ...obj });
    return this;
  }
  computed(fn: (ctx: VFContext) => NormalObj) {
    this.context.computed.push(fn);
    return this;
  }
  methods(fn: (ctx: VFContext) => NormalObj) {
    this.context.methods.push(fn);
    return this;
  }
  components(obj: NormalObj) {
    Object.assign(this.context.components, { ...obj });
    return this;
  }
  beforeCreate(fn: doCtx) {
    this.context.beforeCreate.push(fn);
    return this;
  }
  created(fn: doCtx) {
    this.context.created.push(fn);
    return this;
  }
  beforeDestroy(fn: doCtx) {
    this.context.beforeDestroy.push(fn);
    return this;
  }
  destroyed(fn: doCtx) {
    this.context.destroyed.push(fn);
    return this;
  }
  beforeMount(fn: doCtx) {
    this.context.beforeMount.push(fn);
    return this;
  }
  mounted(fn: doCtx) {
    this.context.mounted.push(fn);
    return this;
  }
}
function clone(obj: any) {
  if (obj === null || typeof obj !== "object") return obj;
  let res: any = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    res[key] = clone(obj[key]);
  }
  return res;
}

export const ExtendFlow = (Vue: any) => {
  let backUp = Vue.extend;
  Vue.extend = function(options: any) {
    if (options.context && options.context.context_id === CONTEXT_ID) {
      // options = options.final ? options.final();
      if (options.final) options = options.final();
    }
    return backUp.call(this, options);
  };
};

export default VueFlow;
