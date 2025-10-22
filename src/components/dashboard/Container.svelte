<script>
    export let top = true;
</script>

<div
    class="
    w-full h-full
    {top ? 'pt-15' : ''} 
    duration-common
    print:pt-0
    print:h-auto
    print:min-h-0
    {$$props.class}
">
    <div
        class="
        w-full h-full
        p-4
        overflow-y-scroll
        print:overflow-visible
        print:h-auto
        print:block
    ">
        <slot />
    </div>
</div>
