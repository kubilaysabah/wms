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

    let title = "Kullanıcı Listesi";

    let search = ["name"];

    let headers = {
        no: "No",
        name: "Ad Soyad",
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

                Alerter.Question("Uyarı", `${data.name} isimli kullanıcıyı silmek istiyor musunuz?`, "Evet", () => delete_data(data.no), "Hayır", () => {});
            },
        },
    };

    async function fetch_datas(page, limit, query) {
        query.active = 1;
        return await PAGINATION("/user/all", page, limit, query);
    }

    async function fetch_data(no) {
        let result = await API("/user/one", {
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
        let result = await API("/user/add", data);

        if (!result || !result.success) {
            Alerter.Error("Kayıt Ekleme Hatası", result.message);
            return false;
        }

        insert_modal_open = false;

        Toaster.Info("Kayıt başarıyla eklendi.");
        trigger_table();
    }

    async function update_data(data) {
        let result = await API("/user/update", data);

        if (!result || !result.success) {
            Alerter.Error("Kayıt Güncelleme Hatası", result.message);
            return false;
        }

        update_modal_open = false;

        Toaster.Info("Kayıt başarıyla güncellendi.");
        trigger_table();
    }

    let delete_data_no = 0;

    async function delete_data(no) {
        let result = await API("/user/delete", no);

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
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Input control="name:text" label="Ad Soyad" type="text" usage="Lütfen ad soyadınızı girin." />
                    </div>
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Input control="username:text" label="Kullanıcı Adı" type="text" usage="Lütfen kullanıcı adınızı girin." />
                    </div>
                    <div class="flex-1">
                        <Input control="password:text:6/" label="Parola" type="text" usage="Lütfen parolanızı 6 haneden büyük girin." />
                    </div>
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Input control="phone:phone" label="Telefon" type="text" usage="Lütfen telefon numaranızı +90 544 444 44 44 formatında girin." />
                    </div>
                    <div class="flex-1">
                        <Input control="email:email" label="E-Posta" type="text" usage="Lütfen e-posta adresinizi girin." />
                    </div>
                </div>
                <div class="w-full">
                    <Switch control="executive:checkbox" label="Yönetici" checked={false} />
                </div>
                <div class="w-full">
                    <Switch control="senatech:checkbox" label="Senatech" checked={false} />
                </div>
                <div class="w-full">
                    <Switch control="finance:checkbox" label="Finans" checked={false} />
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
                        <Input control="*name:text" label="Ad Soyad" type="text" usage="Lütfen ad soyadınızı girin." bind:value={updating_data.name} />
                    </div>
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Input control="*username:text" label="Kullanıcı Adı" type="text" usage="Lütfen kullanıcı adınızı girin." bind:value={updating_data.username} />
                    </div>
                    <div class="flex-1">
                        <Input control="*password:text:6/" label="Parola" type="text" usage="Lütfen parolanızı 6 haneden büyük girin." bind:value={updating_data.password} />
                    </div>
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Input control="*phone:phone" label="Telefon" type="text" usage="Lütfen telefon numaranızı +90 544 444 44 44 formatında girin." bind:value={updating_data.phone} />
                    </div>
                    <div class="flex-1">
                        <Input control="*email:email" label="E-Posta" type="text" usage="Lütfen e-posta adresinizi girin." bind:value={updating_data.email} />
                    </div>
                </div>
                <div class="w-full">
                    <Switch control="executive:checkbox" label="Yönetici" bind:checked={updating_data.executive} />
                </div>
                <div class="w-full">
                    <Switch control="senatech:checkbox" label="Senatech" bind:checked={updating_data.senatech} />
                </div>
                <div class="w-full">
                    <Switch control="finance:checkbox" label="Finans" bind:checked={updating_data.finance} />
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <Submit label="Kaydet" />
            </div>
        </Form>
    </Modal>
</Container>
