<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { API, PAGINATION } from "$lib/api.js";
    import CNF from "$lib/conf.js";

    import Container from "$comp/dashboard/Container.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";

    import Form from "$comp/form/Form.svelte";
    import Input from "$comp/form/Input.svelte";
    import Select from "$comp/form/Select.svelte";
    import LiveSearch from "$comp/form/LiveSearch.svelte";

    import PlusIcon from "$icons/Plus.svelte";
    import TrashIcon from "$icons/Trash.svelte";
    import UpIcon from "$icons/Up.svelte";
    import DownIcon from "$icons/Down.svelte";
    import Spacer from "$comp/spacer/Spacer.svelte";
    import Submit from "$comp/form/Submit.svelte";
    import TextArea from "$comp/form/TextArea.svelte";
    import LiveTrigger from "$comp/form/LiveTrigger.svelte";
    import Vision from "$comp/form/Vision.svelte";

    import Modal from "$comp/modal/Modal.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";

    let loading = true;

    let accounts = false;
    async function fetch_accounts() {
        let answer = await API("/account/all");

        if (!answer || !answer.success) {
            return;
        }
        accounts = {};
        for (let item of answer.data) {
            accounts[item.no] = item.name;
        }
    }

    let warehouses = false;
    async function fetch_warehouses() {
        let answer = await API("/warehouse/all", {
            sell: 1,
        });

        if (!answer || !answer.success) {
            return;
        }
        warehouses = {};
        for (let item of answer.data) {
            warehouses[item.no] = item.name;
        }
    }

    async function search_stocks(query) {
        let result = await API("/sell/stock/all", {
            warehouse_no: warehouse_no,
            search: query.split("-").map((s) => "%" + s + "%"),
            blacklist: stock_blacklist,
        });
        if (!result || !result.success) {
            return {};
        }
        let data = {};
        for (let item of result.data) {
            data[item.no] = {
                key: item.no,
                value: item.code + " - " + item.name + " ( " + item.asset_count + " Adet )",
                data: item,
            };
        }
        return data;
    }

    onMount(async () => {
        loading = true;
        await fetch_accounts();
        await fetch_warehouses();

        if (!accounts) {
            Alerter.Error("Bir hata oluştu!", "Cariler çekilemedi", () => {
                goto("/sell/list");
            });
            return;
        }

        if (!warehouses) {
            Alerter.Error("Bir hata oluştu!", "Depolar çekilemedi", () => {
                goto("/sell/list");
            });
            return;
        }

        loading = false;
    });

    let items = {};

    function close_all_items() {
        for (let [key, item] of entries(items)) {
            item.open = false;
        }
    }

    let stock_blacklist = [];

    $: {
        stock_blacklist = [];
        for (let [key, item] of entries(items)) {
            stock_blacklist.push(item.stock.no);
        }
        stock_blacklist = stock_blacklist;
    }

    let warehouse_no = 0;
    let stock_no = 0;

    $: stock_disabled = !warehouse_no;

    let serial_add_modal_data = false;

    let table_blacklist = [];
    let table_selection = [];
    let table_selected = [];

    let table_headers = {
        no: "No",
        serial: "Seri",
        "stock.name": "Stok",
    };

    async function table_data(page, limit, query) {
        query.detail = 1;
        query.stock_no = stock_no;
        query.warehouse_no = warehouse_no;
        query.blacklist = table_blacklist;
        const data = await PAGINATION("/sell/asset/all", page, limit, query);

        return data;
    }

    let table_trigger = () => {};

    async function add_sell(data) {
        if (!keys(items).length) {
            Alerter.Info("Uyarı", "En az bir stok eklemelisiniz");
            return;
        }
        let answer = await API("/sell/add", data);
        if (!answer || !answer.success) {
            Alerter.Error("Satış Ekleme Başarısız!", answer.message);
            return;
        }
        goto("/sell/list");
    }

    let warehouse_selected = false;
</script>

{#if loading}
    <PageLoader />
{/if}

{#if !loading}
    <Container>
        <Form onsubmit={(data) => add_sell(data)}>
            <div class="flex flex-col gap-2">
                <div class="flex gap-2">
                    <div class="w-full">
                        <Select
                            bind:disabled={warehouse_selected}
                            control="warehouse_no:integer:1/"
                            label="Depo"
                            list={warehouses}
                            text="Depo Seçiniz"
                            bind:value={warehouse_no}
                            onstart={async (key, value) => {
                                let result = await API("/sell/warehouse/test", {
                                    warehouse_no: key,
                                });
                                if (!result || !result.success) {
                                    Alerter.Info("Uyarı", value + " isimli depoda satılabilecek bir stok yok");
                                    return false;
                                }
                                return true;
                            }}
                            onchange={(data) => {
                                warehouse_selected = true;
                            }} />
                    </div>
                </div>
                <div class="w-full">
                    <LiveTrigger
                        bind:disabled={stock_disabled}
                        label="Stok"
                        source={search_stocks}
                        text="Stok Seçiniz"
                        onchange={(data) => {
                            if (items[data.no]) {
                                return;
                            }
                            items[data.no] = {
                                open: false,
                                stock: data,
                                assets: [],
                                count: 0,
                            };
                            items = items;
                        }} />
                </div>
                <div class="flex flex-col gap-2">
                    {#each entries(items) as [key, item], entry_index (item.stock.no)}
                        <div class="flex flex-col md:flex-row gap-2 md:items-start">
                            <div class="flex-3 flex items-end justify-start gap-2">
                                {#if item.assets.length}
                                    {#if item.open}
                                        <UpIcon class="w-10 h-10 pointer bg-float p-1 rounded-lg text-reverse" onclick={() => (item.open = false)} />
                                    {:else}
                                        <DownIcon
                                            class="w-10 h-10 pointer bg-float p-1 rounded-lg text-reverse"
                                            onclick={() => {
                                                close_all_items();
                                                item.open = true;
                                            }} />
                                    {/if}
                                {/if}
                                <Vision class="w-full" text="{item.stock.code} - {item.stock.name} ({item.count} Adet)" />
                            </div>
                            <Input alert={true} usage="{item.stock.name} için en az bir adet seri giriniz" control="entries.{item.stock.no}.count:integer:1/" visible={false} bind:value={item.count} />
                            <Input control="entries.{item.stock.no}.stock_no:integer:1/" visible={false} value={item.stock.no} />
                            <div>
                                <button
                                    class="btn"
                                    onclick={() => {
                                        if (!warehouse_no) {
                                            Alerter.Info("Uyarı", "Depo Seçiniz");
                                            return;
                                        }
                                        stock_no = item.stock.no;

                                        table_blacklist = [];
                                        for (let asset of item.assets) {
                                            table_blacklist.push(asset.no);
                                        }
                                        table_blacklist = table_blacklist;

                                        table_selection = [];
                                        serial_add_modal_data = true;
                                    }}>
                                    Ekle
                                </button>
                            </div>
                            <div>
                                <button
                                    class="btn"
                                    onclick={() => {
                                        delete items[key];
                                        items = items;
                                    }}>
                                    Sil
                                </button>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2 {item.open ? '' : 'hidden'}">
                            {#each item.assets as asset, serial_index (serial_index)}
                                <Input control="entries.{item.stock.no}.assets.{serial_index}.no:integer:1/" visible={false} value={asset.no} />
                                <div class="flex gap-2">
                                    <Input
                                        class="w-full"
                                        control="entries.{item.stock.no}.assets.{serial_index}.serial:text:1/"
                                        placeholder="Seri"
                                        onwarning={(state) => {
                                            if (state) {
                                                item.open = true;
                                            }
                                        }}
                                        value={asset.serial} />
                                    <div>
                                        <button
                                            class="btn"
                                            onclick={() => {
                                                item.assets.splice(item.assets.indexOf(asset), 1);
                                                item.assets = item.assets;
                                                item.count = item.assets.length;
                                            }}>
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/each}
                </div>
            </div>
            <Submit class="mt-2" label="Kaydet" />
        </Form>

        <Modal title="Seri Ekle" bind:open={serial_add_modal_data} size="full">
            <Form onsubmit={(data) => update_data(data)}></Form>

            <TableOnline headers={table_headers} data={table_data} search={["serial"]} bind:trigger={table_trigger} select="no" bind:selection={table_selection} bind:selected={table_selected} breakpoint="7xl">
                <div slot="buttons">
                    <button
                        onclick={() => {
                            if (!items[stock_no]) {
                                return;
                            }

                            for (let item of table_selected) {
                                items[stock_no].assets.push(item);
                            }

                            close_all_items();
                            items[stock_no].open = true;

                            items = items;
                            items[stock_no].count = items[stock_no].assets.length;

                            serial_add_modal_data = false;
                        }}
                        class="btn">
                        Ekle
                    </button>
                </div>
            </TableOnline>
        </Modal>
    </Container>
{/if}
