<script>
    import { onMount } from "svelte";
    import { API } from "$lib/api.js";
    import CNF from "$lib/conf.js";
    import { page } from "$app/stores";
    import Container from "$comp/dashboard/Container.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";
    import Print from "./Print.svelte";
    import { GOTO } from "$src/lib/utils";

    let asset_info = false;
    let asset_info_no = $page.params.asset_info_no;

    async function fetch_data(serial) {
        let answer = await API("/asset/info/one", {
            serial,
            detail: 1,
        });
        if (!answer || !answer.success) {
            Alerter.Error("Bir hata oluştu!", "Bilgi çekilemedi");
            return;
        }
        console.log(answer.data);
        asset_info = answer.data;
    }

</script>

<div class="flex w-full h-full print:hidden justify-center items-center text-3xl p-6">
    <input type="text" placeholder="Seriyi Girin" class="w-full rounded-lg text-fore border-0 p-2 bg-float focus:ring-2 focus:ring-fore transition-all" onkeydown={(e) => {
        if(e.key === "Enter"){
            if(!e.target.value.length){
                return;
            }
            fetch_data(e.target.value);
            e.target.value = "";
            return;
        }
    }} />
</div>
{#if asset_info}
    <Print data={asset_info} auto={true} />
{/if}