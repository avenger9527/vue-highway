const lifeHooks = [
    "beforeCreate",
    "created",
    "beforeDestroy",
    "destroyed",
    "beforeMount",
    "mounted",
];
const CONTEXT_ID = "highway_ctx";
// for loader
const NEVER_LOADER_MYSELF = true;
class VueHighway {
    constructor(componentName) {
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
        const arrToObj = (pArr) => pArr.reduce((acc, cur) => {
            acc = Object.assign(Object.assign({}, acc), cur(_context));
            return acc;
        }, {});
        let objMethods = arrToObj(_context.methods);
        let objComputed = arrToObj(_context.computed);
        _context.methods = objMethods;
        _context.computed = objComputed;
        // TODO bindVue for hotReload
        return Object.assign(Object.assign({ context_id: _context.context_id, props: _context.props, computed: objComputed, methods: objMethods, components: _context.components, render: _context.render, staticRenderFns: _context.staticRenderFns, data: () => _context.data }, lifeHooks
            // in beforeCreate bind vue <-> context
            .filter((hook) => hook === "beforeCreate" || _context[hook].length)
            .reduce((acc, cur) => {
            if (cur === "beforeCreate") {
                acc[cur] = function () {
                    // bindVue(this);
                    _context.vue = this;
                    this._vhContext = _context;
                    _context[cur].forEach((i) => i(_context));
                };
            }
            else if (_context[cur].length) {
                acc[cur] = () => _context[cur].forEach((i) => i(_context));
            }
            return acc;
        }, {})), { vue: _context.vue, _compiled: _context.render ? true : false });
    }
    template(obj) {
        Object.assign(this.context, Object.assign({}, obj)); // __file _scopedId
        if (this.context.render)
            this.context._compiled = true;
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
    race(keyList, arr) {
        keyList.split("-").forEach((item, index) => {
            this[item](arr[index]);
        });
        return this;
    }
    data(obj) {
        Object.assign(this.context.data, Object.assign({}, obj));
        return this;
    }
    props(obj) {
        Object.assign(this.context.props, Object.assign({}, obj));
        return this;
    }
    computed(fn) {
        this.context.computed.push(fn);
        return this;
    }
    methods(fn) {
        this.context.methods.push(fn);
        return this;
    }
    components(obj) {
        Object.assign(this.context.components, Object.assign({}, obj));
        return this;
    }
    beforeCreate(fn) {
        this.context.beforeCreate.push(fn);
        return this;
    }
    created(fn) {
        this.context.created.push(fn);
        return this;
    }
    beforeDestroy(fn) {
        this.context.beforeDestroy.push(fn);
        return this;
    }
    destroyed(fn) {
        this.context.destroyed.push(fn);
        return this;
    }
    beforeMount(fn) {
        this.context.beforeMount.push(fn);
        return this;
    }
    mounted(fn) {
        this.context.mounted.push(fn);
        return this;
    }
}
function clone(obj) {
    if (obj === null || typeof obj !== "object")
        return obj;
    let res = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
        res[key] = clone(obj[key]);
    }
    return res;
}
export const loadVueHighway = (Vue) => {
    let backUp = Vue.extend;
    Vue.extend = function (options) {
        if (options.context && options.context.context_id === CONTEXT_ID) {
            // options = options.final ? options.final();
            if (options.final)
                options = options.final();
        }
        return backUp.call(this, options);
    };
};
export default VueHighway;
