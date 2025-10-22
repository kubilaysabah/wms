<script>
    import { onMount } from "svelte";
    import { API } from "$lib/api.js";
    import CNF from "$lib/conf.js";
    import { page } from "$app/stores";
    import Container from "$comp/dashboard/Container.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";
    import Print from "../Print.svelte";
    import { GOTO } from "$src/lib/utils";

    let loading = true;

    let asset_info = false;
    let asset_info_no = $page.params.asset_info_no;

    async function fetch_data() {
        let answer = await API("/asset/info/one", {
            no: asset_info_no,
            detail: 1,
        });
        if (!answer || !answer.success) {
            loading = false;
            Alerter.Error("Bir hata oluştu!", "Bilgi çekilemedi", () => {
                GOTO("/barcode/buy");
            });
            return;
        }
        asset_info = answer.data;
        loading = false;
    }

    onMount(async () => {
        await fetch_data();
    });
</script>

{#if loading}
    <PageLoader />
{/if}

{#if asset_info}
    <div class="flex w-full h-full print:hidden justify-center items-center">
        <button class="btn btn-primary" onclick={() => window.print()}>Yazdır</button>
    </div>
    <Print data={asset_info} />
{/if}
