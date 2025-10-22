<script>
    import { API } from "$lib/api.js";
    import { onMount } from "svelte";
    import Container from "$comp/dashboard/Container.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";
    import Heading from "$comp/dashboard/Heading.svelte";
    import Form from "$comp/form/Form.svelte";
    import Input from "$comp/form/Input.svelte";
    import Submit from "$comp/form/Submit.svelte";

    let title = "Ayarlar";

    let loading = true;

    let settings = null;

    onMount(async () => {
        let answer = await API("/settings/get");
        loading = false;

        if (!answer || !answer.success) {
            return;
        }

        settings = answer.data; 

        console.log(settings);
    });

    async function update_settings(data) {
        let answer = await API("/settings/set", data);

        if (!answer || !answer.success) {
            return;
        }

        settings = answer.data;
    }
</script>

{#if loading}
    <PageLoader />
{:else}
    <Container>
        <Heading title={title}/>

        <Form class="mt-5 flex flex-col gap-2" onsubmit={update_settings}>
            <Input control="sale_commission:integer:0/100" label="Soysal Komisyon" value={settings.sale_commission}/>
            <Submit label="Kaydet"/>
        </Form>
        
    </Container>
{/if}
