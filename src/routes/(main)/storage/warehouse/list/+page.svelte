<script>
    import { API, PAGINATION } from "$lib/api.js";

    import { goto } from "$app/navigation";
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
    import Select from "$comp/form/Select.svelte";
    import ViewIcon from "$icons/View.svelte";

    let updating_data = {};

    let title = "Depo Listesi";

    let search = ["name"];

    let filters = {
        partner_no: {
            initial: [
                {
                    value: "",
                    name: "Cari Seçiniz",
                },
            ],
            fetch: async () => {
                const result_data = [];
                for (let item of PARTNERS) {
                    result_data.push({
                        value: item.no,
                        name: item.name,
                    });
                }
                return result_data;
            },
        },
        user_no: {
            initial: [
                {
                    value: "",
                    name: "Sorumlu Seçiniz",
                },
            ],
            fetch: async () => {
                let result = await API("/user/all");
                if (!result || !result.success) {
                    return [];
                }

                const result_data = [];
                for (let item of result.data) {
                    result_data.push({
                        value: item.no,
                        name: item.name,
                    });
                }
                return result_data;
            },
        },
    };

    let headers = {
        no: "No",
        name: "İsim",
        "partner:name": "Mülkiyet",
        "user:name": "Sorumlu",
        buy_text: "Alış",
        sell_text: "Satış",
        service_text: "Servis",
        managed_text: "Yönetilebilir",
        capacity_text: "Kapasite",
        count: "Stok",
        sum: "Toplam",
    };

    let actions = {
        view: {
            test: (item) => item.count > 0,
            icon: ViewIcon,
            action: async (item) => {
                goto(`/storage/warehouse/view/${item.no}`);
            },
        },
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

                Alerter.Question("Uyarı", `${data.name} isimli depoyu silmek istiyor musunuz?`, "Evet", () => delete_data(data.no), "İptal");
            },
        },
    };

    async function fetch_datas(page, limit, query) {
        query.detail = 1;

        const data = await PAGINATION("/warehouse/all", page, limit, query);

        if (data) {
            for (let item of data.data) {
                item.service_text = item.service ? "X" : "-";
                item.buy_text = item.buy ? "X" : "-";
                item.sell_text = item.sell ? "X" : "-";
                item.managed_text = item.managed ? "X" : "-";
                item.capacity_text = item.capacity ? item.capacity : "Sınırsız";
                item.sum = price(item.sum," ₺");
            }
        }

        return data;
    }

    async function fetch_data(no) {
        let result = await API("/warehouse/one", {
            no: no,
            detail: 1,
        });

        if (!result || !result.success) {
            return false;
        }

        return result.data;
    }

    async function add_data(data) {
        let result = await API("/warehouse/add", data);

        if (!result || !result.success) {
            Alerter.Error("Kayıt Ekleme Hatası", result.message);
            return false;
        }

        insert_modal_open = false;

        Toaster.Info("Kayıt başarıyla eklendi.");
        trigger_table();
    }

    async function update_data(data) {
        let result = await API("/warehouse/update", data);

        if (!result || !result.success) {
            Alerter.Error("Kayıt Güncelleme Hatası", result.message);
            return false;
        }

        update_modal_open = false;

        Toaster.Info("Kayıt başarıyla güncellendi.");
        trigger_table();
    }

    async function delete_data(no) {
        let result = await API("/warehouse/delete", no);

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

    let partner_list = {};
    for (let item of PARTNERS) {
        partner_list[item.no] = item.name;
    }

    let user_list = {};
    let auth_list = {};

    (async function () {
        let result = await API("/user/all", {
            active: 1,
        });
        if (!result || !result.success) {
            return [];
        }

        for (let item of result.data) {
            user_list[item.no] = item.name;
        }

        auth_list = {
            0: "Yetkili Yok",
            ...user_list,
        };
    })();
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<Container>
    <TableOnline {title} {headers} data={fetch_datas} {actions} {search} bind:trigger={trigger_table} bind:filters>
        <div slot="buttons">
            <button onclick={() => (insert_modal_open = true)} class="btn">Yeni</button>
        </div>
    </TableOnline>

    <Modal title="Yeni" bind:open={insert_modal_open} onclose={() => (insert_modal_open = false)} size="xl">
        <Form onsubmit={(data) => add_data(data)}>
            <div class="flex flex-col gap-2">
                <div class="w-full">
                    <Input control="name:text" label="Depo Adı" type="text" usage="Lütfen depo adını girin." />
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Select control="partner_no" label="Kime Ait" list={partner_list} text="Ortak Seçiniz" />
                    </div>
                    <div class="flex-1">
                        <Select control="user_no" label="Sorumlu" list={user_list} text="Sorumlu Seçiniz" />
                    </div>
                    <div class="flex-1">
                        <Select control="auth_no" label="Yetkili" list={auth_list} value={0} />
                    </div>
                </div>
                <div class="flex justify-between gap-2">
                    <Switch horizontal control="managed:checkbox" label="Yönetilebilir" checked={false} />
                    <Switch horizontal control="buy:checkbox" label="Alış" checked={true} />
                    <Switch horizontal control="sell:checkbox" label="Satış" checked={true} />
                    <Switch horizontal control="service:checkbox" label="Servis" checked={false} />
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
                <div class="w-full">
                    <Input control="name:text" label="Depo Adı" type="text" usage="Lütfen depo adını girin." value={updating_data.name} />
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Select control="partner_no" label="Cari" list={partner_list} text={updating_data.partner.name} value={updating_data.partner.no} />
                    </div>
                    <div class="flex-1">
                        <Select control="user_no" label="Sorumlu" list={user_list} text={updating_data.user.name} value={updating_data.user.no} />
                    </div>
                    <div class="flex-1">
                        <Select control="auth_no" label="Yetkili" list={auth_list} value={updating_data.auth ? updating_data.auth.no : 0} />
                    </div>
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <Submit label="Kaydet" />
            </div>
        </Form>
    </Modal>
</Container>
