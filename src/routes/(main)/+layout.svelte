<script>
    import "$src/app.css";
    import "$lib/global.js";
    import Header from "$comp/dashboard/Header.svelte";
    import Toaster from "$comp/toast/Toaster.svelte";
    import Alerter from "$comp/alert/Alerter.svelte";
    import Alert from "$comp/alert/Alert.svelte";
    import { T } from "$lang/lang.js";
    import { onMount } from "svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";
    import { AUTH_CHECK,AUTH_REDIRECT_URL } from "$lib/api.js";
    import { GOTO } from "$src/lib/utils.js";
    import { page } from "$app/stores";

    let {children} = $props();

    let loading = $state(true);
    let answer = $state(false);

    onMount(async () => {
    });

    let current = false;

    $effect(async () => {
        if($page.url.hash !== current){
            current = $page.url.hash;
            answer = await AUTH_CHECK();

            if(!answer && current.indexOf("login") == -1){
                AUTH_REDIRECT_URL(current); 
            }

            loading = false;
        }
    });
</script>

{#if loading}
    <PageLoader />
{:else if !answer}
    <Alert type="info" title="Giriş Başarısız" message="Lütfen giriş yapın!" positive="Giriş Yap" onPositive={() => GOTO("/login", true)} />
{:else}
    <Alerter />
    <Toaster />
    <Header />
    {@render children()}
{/if}
