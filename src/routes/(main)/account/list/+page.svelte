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

    let updating_data = {};

    let title = "Cari Listesi";

    let search = ["name", "phone", "email"];

    let headers = {
        no: "No",
        name: "Firma",
        phone: "Telefon",
        email: "E-Posta",
        address: "Adres",
    };

    let actions = {
        edit: {
            action: async (item) => {
                let data = await fetch_data(item.no);
                if (!data) {
                    return;
                }

                updating_data = data;

                update_modal_open = true;
            },
        },
        delete: {
            action: async (item) => {
                let data = await fetch_data(item.no);
                if (!data) {
                    return;
                }

                Alerter.Question("Uyarı", `${data.name} isimli cariyi silmek istiyor musunuz?`, "Evet", () => delete_data(data.no), "İptal");
            },
        },
    };

    async function fetch_datas(page, limit, query) {
        query.active = 1;
        return await PAGINATION("/account/all", page, limit, query);
    }

    async function fetch_data(no) {
        let result = await API("/account/one", {
            no: no,
        });

        if (!result || !result.success) {
            return false;
        }

        if (!result || !result.success) {
            return false;
        }

        return result.data;
    }

    async function add_data(data) {
        let result = await API("/account/add", data);

        if (!result || !result.success) {
            Alerter.Error("Kayıt Ekleme Hatası", result.message);
            return false;
        }

        insert_modal_open = false;

        Toaster.Info("Kayıt başarıyla eklendi.");
        trigger_table();
    }

    async function update_data(data) {
        let result = await API("/account/update", data);

        if (!result || !result.success) {
            Alerter.Error("Kayıt Güncelleme Hatası", result.message);
            return false;
        }

        update_modal_open = false;

        Toaster.Info("Kayıt başarıyla güncellendi.");
        trigger_table();
    }

    async function delete_data(no) {
        let result = await API("/account/delete", no);

        if (!result || !result.success) {
            Alerter.Error("Kayıt Silme Hatası", result.message);
            return false;
        }

        update_modal_open = false;

        Toaster.Info("Kayıt başarıyla silindi.");
        trigger_table();
    }

    let insert_modal_open = false;
    let update_modal_open = false;

    let trigger_table = () => {};
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<Container>
    <TableOnline {title} {headers} data={fetch_datas} {actions} {search} bind:trigger={trigger_table}>
        <div slot="buttons">
            <button onclick={() => (insert_modal_open = true)} class="btn">Yeni</button>
        </div>
    </TableOnline>

    <Modal title="Yeni" bind:open={insert_modal_open} onclose={() => (insert_modal_open = false)} size="xl">
        <Form onsubmit={(data) => add_data(data)}>
            <div class="flex flex-col gap-2">
                <div class="w-full">
                    <Input control="legal:text" label="Ünvan" type="text" usage="Lütfen resmi firma ünvanınızı girin." />
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Input control="code:text" label="Dia Kodu" type="text" usage="Lütfen dia kodunuzu girin." />
                    </div>
                    <div class="flex-1">
                        <Input control="name:text" label="Firma Adı" type="text" usage="Lütfen firma adınızı girin." />
                    </div>
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Input control="tax_office:text" label="Vergi Dairesi" type="text" description="Vergi Dairesi bilgisi girilmez ise bireysel cari oluşturulur." usage="Lütfen vergi dairesi bilgisi girin." />
                    </div>
                    <div class="flex-1">
                        <Input control="tax_no:taxtckn" label="Vergi No" type="text" description="Vergi Dairesi bilgisi girilmezse bu alana TC Kimlik no girilmelidir." usage="Lütfen vergi no yada tckn bilgisi girin." />
                    </div>
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Input control="phone:phone" label="Telefon" type="text" usage="Lütfen telefon numaranızı +905553332211 formatında girin." />
                    </div>
                    <div class="flex-1">
                        <Input control="email:email" label="E-Posta" type="text" usage="Lütfen e-posta adresinizi girin." />
                    </div>
                </div>
                <div class="w-full">
                    <TextArea control="address:text:50/" label="Adres" type="text" usage="Lütfen minimum 50 karakterlik adres bilginizi girin." />
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <Submit label="Kaydet" />
            </div>
        </Form>
    </Modal>
    <Modal title="Düzenle" bind:open={update_modal_open} onclose={() => (update_modal_open = false)} size="xl">
        <Form onsubmit={(data) => update_data(data)}>
            <Input control="no" label="No" type="text" visible={false} bind:value={updating_data.no} />
            <div class="flex flex-col gap-2">
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Input control="name:text" label="Firma Adı" type="text" usage="Lütfen firma adınızı girin." bind:value={updating_data.name} />
                    </div>
                    <div class="flex-1">
                        <Input control="legal:text" label="Ünvan" type="text" usage="Lütfen resmi firma ünvanınızı girin." bind:value={updating_data.legal} />
                    </div>
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <Submit label="Kaydet" />
            </div>
        </Form>
    </Modal>
</Container>
