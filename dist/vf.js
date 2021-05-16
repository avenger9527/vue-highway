"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendFlow = void 0;
var lifeHooks = [
    "beforeCreate",
    "created",
    "beforeDestroy",
    "destroyed",
    "beforeMount",
    "mounted",
];
var CONTEXT_ID = "flow_ctx";
// for loader
var NEVER_LOADER_MYSELF = true;
var VueFlow = /** @class */ (function () {
    function VueFlow(componentName) {
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
    VueFlow.prototype.done = function () {
        return this;
    };
    VueFlow.prototype.final = function () {
        // every Vue.extend copy context
        var _context = clone(this.context);
        var arrToObj = function (pArr) {
            return pArr.reduce(function (acc, cur) {
                acc = __assign(__assign({}, acc), cur(_context));
                return acc;
            }, {});
        };
        var objMethods = arrToObj(_context.methods);
        var objComputed = arrToObj(_context.computed);
        _context.methods = objMethods;
        _context.computed = objComputed;
        // TODO bindVue for hotReload
        // const bindVue = (vueInstance: VueInstance) => {
        //   this.vue = vueInstance;
        //   vueInstance.vflow = this;
        // };
        return __assign(__assign({ context_id: _context.context_id, props: _context.props, computed: objComputed, methods: objMethods, components: _context.components, render: _context.render, staticRenderFns: _context.staticRenderFns, data: function () { return _context.data; } }, lifeHooks
            // in beforeCreate bind vue <-> context
            .filter(function (hook) { return hook === "beforeCreate" || _context[hook].length; })
            .reduce(function (acc, cur) {
            if (cur === "beforeCreate") {
                acc[cur] = function () {
                    // bindVue(this);
                    _context.vue = this;
                    this._vfContext = _context;
                    _context[cur].forEach(function (i) { return i(_context); });
                };
            }
            else if (_context[cur].length) {
                acc[cur] = function () { return _context[cur].forEach(function (i) { return i(_context); }); };
            }
            return acc;
        }, {})), { vue: _context.vue, _compiled: _context.render ? true : false });
    };
    VueFlow.prototype.template = function (obj) {
        Object.assign(this.context, __assign({}, obj)); // __file _scopedId
        if (this.context.render)
            this.context._compiled = true;
        return this;
    };
    // template(obj: JSX.IntrinsicElements) {
    //   Object.assign(this.context, { ...obj }); // __file _scopedId
    //   if (this.context.render) this.context._compiled = true;
    //   return this;
    // }
    // style() {
    //   return this;
    // }
    // link any style work
    VueFlow.prototype.flow = function (keyList, arr) {
        var _this = this;
        keyList.split("-").forEach(function (item, index) {
            _this[item](arr[index]);
        });
        return this;
    };
    VueFlow.prototype.data = function (obj) {
        Object.assign(this.context.data, __assign({}, obj));
        return this;
    };
    VueFlow.prototype.props = function (obj) {
        Object.assign(this.context.props, __assign({}, obj));
        return this;
    };
    VueFlow.prototype.computed = function (fn) {
        this.context.computed.push(fn);
        return this;
    };
    VueFlow.prototype.methods = function (fn) {
        this.context.methods.push(fn);
        return this;
    };
    VueFlow.prototype.components = function (obj) {
        Object.assign(this.context.components, __assign({}, obj));
        return this;
    };
    VueFlow.prototype.beforeCreate = function (fn) {
        this.context.beforeCreate.push(fn);
        return this;
    };
    VueFlow.prototype.created = function (fn) {
        this.context.created.push(fn);
        return this;
    };
    VueFlow.prototype.beforeDestroy = function (fn) {
        this.context.beforeDestroy.push(fn);
        return this;
    };
    VueFlow.prototype.destroyed = function (fn) {
        this.context.destroyed.push(fn);
        return this;
    };
    VueFlow.prototype.beforeMount = function (fn) {
        this.context.beforeMount.push(fn);
        return this;
    };
    VueFlow.prototype.mounted = function (fn) {
        this.context.mounted.push(fn);
        return this;
    };
    return VueFlow;
}());
function clone(obj) {
    if (obj === null || typeof obj !== "object")
        return obj;
    var res = Array.isArray(obj) ? [] : {};
    for (var key in obj) {
        res[key] = clone(obj[key]);
    }
    return res;
}
var ExtendFlow = function (Vue) {
    var backUp = Vue.extend;
    Vue.extend = function (options) {
        if (options.context && options.context.context_id === CONTEXT_ID) {
            // options = options.final ? options.final();
            if (options.final)
                options = options.final();
        }
        return backUp.call(this, options);
    };
};
exports.ExtendFlow = ExtendFlow;
exports.default = VueFlow;
