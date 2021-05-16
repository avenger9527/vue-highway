declare type NormalObj = {
    [key: string]: any;
};
declare type VueInstance = {
    readonly $refs: any;
    readonly $vnode: any;
    $nextTick(): Promise<void>;
    _vhContext: VHContext;
};
export interface VHContext {
    context_id: "highway_ctx";
    name: string;
    vue: null | VueInstance;
    data: NormalObj;
    props: NormalObj;
    computed: ((ctx: VHContext) => NormalObj)[];
    methods: ((ctx: VHContext) => NormalObj)[];
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
declare type doCtx = (ctx: VHContext) => void;
declare type lifeHook = doCtx[];
declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}
declare class VueHighway {
    context: VHContext;
    componentName?: string;
    constructor(componentName?: string);
    done(): this;
    final(): {
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
    race<P = (NormalObj | doCtx)[]>(keyList: string, arr: P): this;
    data<D = NormalObj>(obj: D): this;
    props(obj: NormalObj): this;
    computed(fn: (ctx: VHContext) => NormalObj): this;
    methods(fn: (ctx: VHContext) => NormalObj): this;
    components(obj: NormalObj): this;
    beforeCreate(fn: doCtx): this;
    created(fn: doCtx): this;
    beforeDestroy(fn: doCtx): this;
    destroyed(fn: doCtx): this;
    beforeMount(fn: doCtx): this;
    mounted(fn: doCtx): this;
}
export declare const loadVueHighway: (Vue: any) => void;
export default VueHighway;
