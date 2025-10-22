<script>
    import { API, PAGINATION } from "$lib/api.js";

    import Container from "$comp/dashboard/Container.svelte";
    import Heading from "$comp/dashboard/Heading.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";
    import Spacer from "$comp/spacer/Spacer.svelte";

    import Modal from "$comp/modal/Modal.svelte";
    import Form from "$comp/form/Form.svelte";
    import Input from "$comp/form/Input.svelte";
    import Submit from "$comp/form/Submit.svelte";
    import TextArea from "$comp/form/TextArea.svelte";
    import Switch from "$comp/form/Switch.svelte";
    import { onMount } from "svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";

    let title = "Kullanıcı Listesi";

    let loading = true;

    let profile = false;

    onMount(async () => {
        let answer = await API("/user/profile");

        if (!answer || !answer.success) {
            return;
        }

        profile = answer.data;

        loading = false;
    });

    async function update_data(data) {
        let answer = await API("/user/update", data);

        if (!answer || !answer.success) {
            return;
        }

        Alerter.Success("Başarı","Kullanıcı bilgileri güncellendi!",()=>{
            location.reload();
        });
    }
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

{#if loading}
    <PageLoader />
{:else}
    <Container>
        <Form onsubmit={(data) => update_data(data)}>
            <Input control="no" label="No" type="text" visible={false} bind:value={profile.no} />
            <div class="flex flex-col gap-2">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Input control="?name:text" label="Ad Soyad" type="text" usage="Lütfen ad soyadınızı girin." bind:value={profile.name} />
                    </div>
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Input control="?username:text" label="Kullanıcı Adı" type="text" usage="Lütfen kullanıcı adınızı girin." bind:value={profile.username} />
                    </div>
                    <div class="flex-1">
                        <Input control="?password:text:6/" label="Parola" type="text" usage="Lütfen parolanızı 6 haneden büyük girin." />
                    </div>
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Input control="?phone:phone" label="Telefon" type="text" usage="Lütfen telefon numaranızı +90 544 444 44 44 formatında girin." bind:value={profile.phone} />
                    </div>
                    <div class="flex-1">
                        <Input control="?email:email" label="E-Posta" type="text" usage="Lütfen e-posta adresinizi girin." bind:value={profile.email} />
                    </div>
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <Submit label="Kaydet" />
            </div>
        </Form>
    </Container>
{/if}
