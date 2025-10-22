<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { API } from "$lib/api.js";
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

    async function fetch_info(serial) {
        let answer = await API("/asset/info/one", {
            serial: serial,
            detail: 1,
        });
        if (!answer || !answer.success) {
            return false;
        }
        return answer.data;
    }

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
            buy: 1,
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
        let result = await API("/stock/all", {
            processed: 0,
            LIKE: [["name", "code"], query.split("-").map((s) => "%" + s + "%")],
            LIMIT: 10,
        });
        if (!result || !result.success) {
            return {};
        }
        let data = {};
        for (let item of result.data) {
            data[item.no] = {
                key: item.no,
                value: item.code + " - " + item.name,
                data: item,
            };
        }
        return data;
    }

    let items = [];

    let buy_count = 0;
    let buy_sub = 0;
    let buy_tax = 0;
    let buy_total = 0;

    $: {
        buy_count = 0;
        buy_sub = 0;
        buy_tax = 0;
        buy_total = 0;
        for (let item of items) {
            if (!item.assets.length || !item.cost || !item.rate) {
                continue;
            }
            buy_count += parseInt(item.assets.length);
            buy_sub += parseInt(item.assets.length) * parseFloat(item.cost);
            buy_tax += parseInt(item.assets.length) * parseFloat(item.cost) * (parseInt(item.rate) / 100);
            buy_total += parseInt(item.assets.length) * parseFloat(item.cost) + parseInt(item.assets.length) * parseFloat(item.cost) * (parseInt(item.rate) / 100);
        }
    }

    let search_value = "";

    function close_all_items() {
        for (let item of items) {
            item.open = false;
        }
    }

    let items_visible = false;

    $: {
        items_visible = false;
        for (let item of items) {
            if (item.stock.fullname.toLowerCase().includes(search_value.toLowerCase())) {
                items_visible = true;
                break;
            }
        }
    }

    async function submit(data) {
        if (!data.doc) {
            Alerter.Error("Belge No", "Belge No boş olamaz!");
            return;
        }

        if (!data.account_no) {
            Alerter.Error("Satıcı", "Satıcı boş olamaz!");
            return;
        }

        if (!data.warehouse_no) {
            Alerter.Error("Depo", "Depo boş olamaz!");
            return;
        }

        if (!data.entries) {
            Alerter.Info("Satırlar Boş", "Lütfen en az bir satır girin!");
            return;
        }

        let answer = await API("/buy/add", data);
        if (!answer || !answer.success) {
            Alerter.Error("Bir hata oluştu!", answer.message);
            return;
        }
        goto("/buy/list");
    }

    onMount(async () => {
        loading = true;
        await fetch_accounts();
        await fetch_warehouses();

        if (!accounts) {
            Alerter.Error("Bir hata oluştu!", "Cariler çekilemedi", () => {
                goto("/buy/list");
            });
            return;
        }

        if (!warehouses) {
            Alerter.Error("Bir hata oluştu!", "Depolar çekilemedi", () => {
                goto("/buy/list");
            });
            return;
        }

        loading = false;
    });
</script>

{#if loading}
    <PageLoader />
{/if}

{#if !loading}
    <Container>
        <Form
            onsubmit={(data) => {
                if (search_value) {
                    Alerter.Info("Uyarı", "Önce filtreyi silin");
                    return;
                }
                submit(data);
            }}>
            <div class="flex flex-col gap-2">
                <div class="flex gap-2">
                    <div class="flex-1">
                        <Input control="doc:text" label="Belge No" value={CNF.DEBUG ? "DOC." + random_number(5) : ""} />
                    </div>
                    <div class="flex-1">
                        <Select control="account_no" label="Satıcı" list={accounts} text="Cari Seçiniz" />
                    </div>
                    <div class="flex-1">
                        <Select control="warehouse_no" label="Depo" list={warehouses} text="Depo Seçiniz" />
                    </div>
                </div>

                <div class="flex md:flex-row flex-col items-end md:items-center justify-between p-4 bg-float rounded-lg mt-5">
                    <div>Mal Sayısı : {buy_count}</div>
                    <div>Ara Toplam : {globalThis.price(buy_sub, "₺")}</div>
                    <div>Vergi : {globalThis.price(buy_tax, "₺")}</div>
                    <div>Toplam : {globalThis.price(buy_total, "₺")}</div>
                </div>
                <Input
                    placeholder="Stok Filtrele"
                    class="w-full mt-5"
                    bind:value={search_value}
                    onkeydown={async (e) => {
                        if (e.key === "Enter") {
                            let asset_info = await fetch_info(search_value);
                            search_value = "";

                            if (!asset_info) {
                                Toaster.Error("Bilgi çekilemedi");
                                return;
                            }

                            let old_item = null;
                            for (let item of items) {
                                if (item.assets.length > 0 && item.assets.some((asset) => asset.serial === asset_info.serial)) {
                                    Toaster.Info("Bu seri zaten var!");
                                    return;
                                }
                                if (item.stock.no === asset_info.stock.no && item.rate === asset_info.rate && item.cost === asset_info.cost) {
                                    old_item = item;
                                    break;
                                }
                            }

                            if (old_item) {
                                old_item.assets.push({
                                    serial: asset_info.serial,
                                    reason: asset_info.reason,
                                });
                                items = items;
                                return;
                            }

                            items.push({
                                open: true,
                                disabled: true,
                                stock: {
                                    code: asset_info.stock.code,
                                    name: asset_info.stock.name,
                                    fullname: asset_info.stock.code + " - " + asset_info.stock.name,
                                    no: asset_info.stock.no,
                                },
                                cost: asset_info.cost,
                                rate: asset_info.rate,
                                assets: [
                                    {
                                        serial: asset_info.serial,
                                        reason: asset_info.reason,
                                    },
                                ],
                            });
                            items = items;

                            return;
                        }
                    }}>
                    <button
                        slot="suffix"
                        class="btn"
                        onclick={() => {
                            close_all_items();

                            items.push({
                                open: true,
                                disabled: false,
                                stock: {
                                    code: "",
                                    name: "",
                                    fullname: "",
                                    no: "",
                                },
                                cost: "",
                                rate: 1,
                                assets: [],
                            });
                            items = items;
                        }}>
                        Ekle
                    </button>
                </Input>
                <div class="flex flex-col bg-middle rounded-lg gap-2 p-2 {items_visible ? '' : 'hidden'}">
                    {#each items as item, entry_index (entry_index)}
                        <div class="flex flex-col gap-2 {item.stock.fullname.toLowerCase().includes(search_value.toLowerCase()) ? '' : 'hidden'}">
                            <div class="flex gap-2">
                                <div class="flex-2 flex justify-start gap-2">
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
                                    <LiveSearch class="w-full" control="entries.{entry_index}.stock_no" placeholder="Stok Arayın" source={search_stocks} bind:text={item.stock.fullname} value={item.stock.no} disabled={item.disabled} disability={false} />
                                </div>
                                <div class="flex-1">
                                    <Input control="entries.{entry_index}.rate:integer:1/" placeholder="Vergi Oranı" bind:value={item.rate} suffix="%" disabled={item.disabled} disability={false} />
                                </div>
                                <div class="flex-1 flex justify-start gap-2">
                                    <Input class="w-full" control="entries.{entry_index}.cost:numeric:1/" bind:value={item.cost} placeholder="Fiyat" suffix="₺" disabled={item.disabled} disability={false} />
                                    <PlusIcon
                                        class="w-10 h-10 pointer bg-float p-1 rounded-lg text-reverse"
                                        onclick={() => {
                                            item.assets.push({
                                                serial: CNF.DEBUG ? generate_IMEI() : "",
                                                reason: "Genel Bakım",
                                            });
                                            item.assets = item.assets;

                                            close_all_items();
                                            item.open = true;
                                        }} />
                                    <TrashIcon
                                        class="w-10 h-10 pointer bg-float p-1 rounded-lg text-reverse"
                                        onclick={() => {
                                            items.splice(entry_index, 1);
                                            items = items;
                                        }} />
                                </div>
                            </div>
                            <div class="flex flex-col gap-2 {item.open && item.assets.length > 0 ? '' : 'hidden'}">
                                {#each item.assets as asset, serial_index (asset)}
                                    <div class="flex flex-col gap-1">
                                        <div class="flex-1 flex justify-start gap-2">
                                            <Input
                                                class="w-full"
                                                control="entries.{entry_index}.assets.{serial_index}.serial:text:1/"
                                                placeholder="Seri"
                                                onwarning={(state) => {
                                                    if (state) {
                                                        item.open = true;
                                                    }
                                                }}
                                                value={item.assets[serial_index].serial}
                                                disabled={item.disabled} disability={false} />
                                            <TrashIcon
                                                class="w-10 h-10 pointer bg-float p-2 rounded-lg text-reverse"
                                                onclick={() => {
                                                    item.assets.splice(serial_index, 1);
                                                    item.assets = item.assets;
                                                }} />
                                        </div>
                                        <TextArea
                                            class="w-full"
                                            control="entries.{entry_index}.assets.{serial_index}.reason:text:2/"
                                            placeholder="Açıklama"
                                            onwarning={(state) => {
                                                if (state) {
                                                    item.open = true;
                                                }
                                            }}
                                            value={item.assets[serial_index].reason}
                                            disabled={item.disabled} disability={false} />
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
            <Submit class="mt-2" label="Kaydet" />
        </Form>
    </Container>
{/if}
