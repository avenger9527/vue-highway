declare type NormalObj = {
    [key: string]: any;
};
declare type VueInstance = {
    readonly $refs: any;
    readonly $vnode: any;
    $nextTick(): Promise<void>;
    _vfContext: VFContext;
    vflow: VueFlow;
};
export interface VFContext {
    context_id: "flow_ctx";
    name: string;
    vue: null | VueInstance;
    data: NormalObj;
    props: NormalObj;
    computed: ((ctx: VFContext) => NormalObj)[];
    methods: ((ctx: VFContext) => NormalObj)[];
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
declare type doCtx = (ctx: VFContext) => void;
declare type lifeHook = doCtx[];
declare namespace JSX {
    interface IntrinsicElements {
        foo: {
            bar?: boolean;
        };
        [elemName: string]: any;
    }
}
declare class VueFlow {
    context: VFContext;
    componentName?: string;
    constructor(componentName?: string);
    done(): this;
    final(): {
        _scopeId?: any;
        vue: any;
        _compiled: boolean;
        context_id: any;
        props: any;
        computed: any;
        methods: any;
        components: any;
        render: any;
        staticRenderFns: any;
        data: () => any;
    };
    template(obj: (...rest: any[]) => JSX.IntrinsicElements): this;
    style(): this;
    flow<P = (NormalObj | doCtx)[]>(keyList: string, arr: P): this;
    data<D = NormalObj>(obj: D): this;
    props(obj: NormalObj): this;
    computed(fn: (ctx: VFContext) => NormalObj): this;
    methods(fn: (ctx: VFContext) => NormalObj): this;
    components(obj: NormalObj): this;
    beforeCreate(fn: doCtx): this;
    created(fn: doCtx): this;
    beforeDestroy(fn: doCtx): this;
    destroyed(fn: doCtx): this;
    beforeMount(fn: doCtx): this;
    mounted(fn: doCtx): this;
}
export declare const ExtendFlow: (Vue: any) => void;
export default VueFlow;
