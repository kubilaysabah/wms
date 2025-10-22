<script>
    import { API, PAGINATION } from "$lib/api.js";

    import Container from "$comp/dashboard/Container.svelte";
    import Heading from "$comp/dashboard/Heading.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";
    import Modal from "$comp/modal/Modal.svelte";
    import Form from "$comp/form/Form.svelte";
    import Input from "$comp/form/Input.svelte";
    import Submit from "$comp/form/Submit.svelte";
    import Select from "$comp/form/Select.svelte";
    import Switch from "$comp/form/Switch.svelte";

    let title = "Raf Listesi";

    let search = ["label", "location"];

    let filters = {
        warehouse_no: {
            initial: [
                {
                    value: "",
                    name: "Depo Seçiniz",
                },
            ],
            fetch: async () => {
                let result = await API("/warehouse/all", {
                    managed: 1,
                });
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
        "warehouse:name": "Depo",
        location: "Konum",
        processed: "Yenilenmiş",
    };

    let actions = {
        delete: {
            action: async (item) => {
                Alerter.Question("Uyarı", `${item.warehouse.name} deposundaki ${item.label} isimli rafı silmek istiyor musunuz?`, "Evet", () => delete_data(item.no), "İptal");
            },
        },
    };

    let trigger_table = () => {};

    let insert_modal_open = false;

    async function add_data(data) {
        let result = await API("/shelf/add", data);

        if (!result || !result.success) {
            Alerter.Error("Kayıt Ekleme Hatası", result.message);
            return false;
        }

        insert_modal_open = false;

        Toaster.Info("Kayıt başarıyla eklendi.");
        trigger_table();
    }

    async function delete_data(no) {
        let result = await API("/shelf/delete", no);

        if (!result || !result.success) {
            Alerter.Error("Kayıt Silme Hatası", result.message);
            return false;
        }

        Toaster.Info("Kayıt başarıyla silindi.");
        trigger_table();
    }

    async function fetch_datas(page, limit, query) {
        query.detail = 1;
        return await PAGINATION("/shelf/all", page, limit, query);
    }

    let warehouse_list = {};

    (async function () {
        let result = await API("/warehouse/all", {
            managed: 1,
        });
        if (!result || !result.success) {
            return [];
        }

        for (let item of result.data) {
            warehouse_list[item.no] = item.name;
        }
    })();
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<Container>
    <TableOnline {title} {headers} data={fetch_datas} {search} bind:filters {actions} bind:trigger={trigger_table}>
        <div slot="buttons">
            <button onclick={() => (insert_modal_open = true)} class="btn">Yeni</button>
        </div>
    </TableOnline>
    <Modal title="Yeni" bind:open={insert_modal_open} size="xl">
        <Form onsubmit={(data) => add_data(data)}>
            <div class="flex flex-col gap-2">
                <div class="w-full">
                    <Input control="label:/^[A-Z]$/" label="Raf Adı" type="text" usage="Lütfen raf adını A-Z harfleri ile girin." />
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Select control="warehouse_no" label="Depo" list={warehouse_list} text="Depo Seçiniz" />
                    </div>
                </div>
                <div class="flex flex-col md:flex-row gap-4">
                    <div class="flex-1">
                        <Input control="level:integer:1/20" label="Kat Sayısı" usage="Lütfen kat sayısını 1-20 arasında girin." />
                    </div>
                    <div class="flex-1">
                        <Input control="segment:integer:1/29" label="Bölüm Sayısı" usage="Lütfen bölüm sayısını 1-29 arasında girin." />
                    </div>
                    <div class="flex-1">
                        <Input control="slot:integer:10/70" label="Yuva Sayısı" usage="Lütfen yuva sayısını 10-70 arasında girin." />
                    </div>
                </div>
                <div class="w-full">
                    <Switch control="processed:checkbox" label="Yenilenmiş" checked={true} />
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <Submit label="Kaydet" />
            </div>
        </Form>
    </Modal>
</Container>
