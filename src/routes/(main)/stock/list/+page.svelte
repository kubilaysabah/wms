<script>
    import { API, PAGINATION } from "$lib/api.js";
    import { goto } from "$app/navigation";

    import Container from "$comp/dashboard/Container.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";
    import Modal from "$comp/modal/Modal.svelte";
    import Form from "$comp/form/Form.svelte";
    import Input from "$comp/form/Input.svelte";
    import Submit from "$comp/form/Submit.svelte";
    import Switch from "$comp/form/Switch.svelte";

    import ViewIcon from "$icons/View.svelte";
    import CompleteIcon from "$icons/Complete.svelte";
    import TransferIcon from "$icons/Transfer.svelte";
    import ServiceIcon from "$icons/Service.svelte";
    import Select from "$comp/form/Select.svelte";

    let title = "Stok Listesi";

    let search = ["code", "name"];

    let headers = {
        no: "No",
        code: "Kodu",
        name: "Adı",
        count: "Adet",
    };

    let actions = {
        transfer: {
            tooltip: "Transfer",
            icon: TransferIcon,
            test: (item) => item.transferable === 1,
            action: async (item) => {
                goto(`/stock/transfer/${item.no}`);
            },
        },
        service: {
            tooltip: "Servis",
            icon: ServiceIcon,
            test: (item) => item.servicable === 1,
            action: async (item) => {
                goto(`/stock/service/${item.no}`);
            },
        },
        view: {
            tooltip: "Görüntüle",
            icon: ViewIcon,
            test: (item) => item.count > 0,
            action: async (item) => {
                goto(`/stock/view/${item.no}`);
            },
        },
    };

    async function table_data(page, limit, query) {
        query.detail = 1;
        query.count = ["G", 0];

        const data = await PAGINATION("/stock/all", page, limit, query);

        return data;
    }

    let trigger_table = () => {};

    let insert_modal_open = false;

    

    async function add_data(data) {
        let result = await API("/stock/add", data);

        if (!result || !result.success) {
            Alerter.Error("Kayıt Ekleme Hatası", result.message);
            return false;
        }

        insert_modal_open = false;

        Toaster.Info("Kayıt başarıyla eklendi.");
        trigger_table();
    }
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<Container>
    <TableOnline {title} {headers} data={table_data} {actions} {search} bind:trigger={trigger_table}>
        <div slot="buttons">
            <button onclick={() => (insert_modal_open = true)} class="btn">Yeni</button>
        </div>
    </TableOnline>

    <Modal title="Yeni" bind:open={insert_modal_open} onclose={() => (insert_modal_open = false)} size="xl">
        <Form onsubmit={(data) => add_data(data)}>
            <div class="flex flex-col gap-2">
                <div>
                    <Input control="code:text" label="Kod" type="text" usage="Lütfen stok dia kodunu girin." />
                </div>
                <div>
                    <Input control="name:text" label="Stok Adı" type="text" usage="Lütfen stok adını girin." />
                </div>
                <div>
                    <Select control="grade_no" label="Grade" type="text" value="0" list={{
                        "0": "A",
                        "1": "B",
                        "2": "C",
                        "3": "D",
                        "4": "Outlet"
                    }} usage="Lütfen stok grade bilgisini girin." />
                </div>
                <div class="w-full">
                    <Switch control="processed:checkbox" label="İşlenmiş" checked={false} />
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <Submit label="Kaydet" />
            </div>
        </Form>
    </Modal>
</Container>
