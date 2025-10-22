<script>
    import {get} from "svelte/store";
    import {LoaderState} from "./Loader.js";
</script>

{#if $LoaderState > 0}
    <div class="fixed inset-0 z-800 flex items-center justify-center w-full h-full bg-back/20 backdrop-blur-xs animate-fade-in transition-all">
        <div class="loader"></div>
    </div>
{/if}

<style>
    .loader {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        max-width: 6rem;
        margin-top: 3rem;
        margin-bottom: 3rem;
    }
    .loader:before,
    .loader:after {
        content: "";
        position: absolute;
        border-radius: 50%;
        animation: pulsOut 1.8s ease-in-out infinite;
        filter: drop-shadow(0 0 1rem var(--color-fore));
    }
    .loader:before {
        width: 100%;
        padding-bottom: 100%;
        box-shadow: inset 0 0 0 1rem var(--color-fore);
        animation-name: pulsIn;
    }
    .loader:after {
        width: calc(100% - 2rem);
        padding-bottom: calc(100% - 2rem);
        box-shadow: 0 0 0 0 var(--color-fore);
    }

    @keyframes pulsIn {
        0% {
            box-shadow: inset 0 0 0 1rem var(--color-fore);
            opacity: 1;
        }
        50%,
        100% {
            box-shadow: inset 0 0 0 0 var(--color-fore);
            opacity: 0;
        }
    }

    @keyframes pulsOut {
        0%,
        50% {
            box-shadow: 0 0 0 0 var(--color-fore);
            opacity: 0;
        }
        100% {
            box-shadow: 0 0 0 1rem var(--color-fore);
            opacity: 1;
        }
    }
</style>
