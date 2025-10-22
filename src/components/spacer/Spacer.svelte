<script>
    export let size = "md";
    export let line = false;

</script>

<div class="block w-full {size == 'xs' ? 'h-1':size == 'sm' ? 'h-2' : size == 'md' ? 'h-3' : size == 'lg' ? 'h-4' : size == 'xl' ? 'h-5' : 'h-6'} {line ? 'border-b border-border-mid': ''}"></div>