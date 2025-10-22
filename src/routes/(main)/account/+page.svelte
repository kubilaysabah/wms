<!-- <script>
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
            if (!item.count || !item.cost || !item.rate) {
                continue;
            }
            buy_count += parseInt(item.count);
            buy_sub += parseInt(item.count) * parseFloat(item.cost);
            buy_tax += parseInt(item.count) * parseFloat(item.cost) * (parseInt(item.rate) / 100);
            buy_total += parseInt(item.count) * parseFloat(item.cost) + parseInt(item.count) * parseFloat(item.cost) * (parseInt(item.rate) / 100);
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
                <Input placeholder="Stok Filtrele" class="w-full mt-5" bind:value={search_value}>
                    <button
                        slot="suffix"
                        class="btn"
                        onclick={() => {
                            close_all_items();

                            items.push({
                                open: true,
                                stock: {
                                    code: "",
                                    name: "",
                                    fullname: "",
                                    no: "",
                                },
                                count: 1,
                                cost: "",
                                rate: 1,
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
                                    <LiveSearch class="w-full" control="entries.{entry_index}.stock_no" placeholder="Stok Arayın" source={search_stocks} bind:text={item.stock.fullname} value={item.stock.no} />
                                </div>
                                <div class="flex-1">
                                    <Input control="entries.{entry_index}.rate:integer:1/" placeholder="Vergi Oranı" bind:value={item.rate} suffix="%" />
                                </div>
                                <div class="flex-1">
                                    <Input class="w-full" control="entries.{entry_index}.cost:numeric:1/" bind:value={item.cost} placeholder="Fiyat" suffix="₺" />
                                </div>
                                <div class="flex-1 flex justify-start gap-2">
                                    <Input
                                        class="w-full"
                                        control="entries.{entry_index}.count:integer:1/"
                                        placeholder="Adet"
                                        bind:value={item.count}
                                        onchange={(e) => {
                                            close_all_items();
                                            item.open = true;
                                        }}
                                        suffix="AD" />
                                    <TrashIcon
                                        class="w-10 h-10 pointer bg-float p-2.5 rounded-lg text-reverse"
                                        onclick={() => {
                                            items.splice(entry_index, 1);
                                            items = items;
                                        }} />
                                </div>
                            </div>
                            <div class="flex flex-col gap-2 {item.open ? '' : 'hidden'}">
                                {#each { length: item.count }, serial_index (serial_index)}
                                    <div class="flex flex-col gap-1">
                                        <Input
                                            class="w-full"
                                            control="entries.{entry_index}.assets.{serial_index}.serial:text:1/"
                                            placeholder="Seri"
                                            onwarning={(state) => {
                                                if (state) {
                                                    item.open = true;
                                                }
                                            }}
                                            value={item.assets?.[serial_index]?.serial ?? (CNF.DEBUG ? generate_IMEI() : "")} />
                                        <TextArea
                                            class="w-full"
                                            control="entries.{entry_index}.assets.{serial_index}.reason:text:2/"
                                            placeholder="Açıklama"
                                            onwarning={(state) => {
                                                if (state) {
                                                    item.open = true;
                                                }
                                            }}
                                            value={item.assets?.[serial_index]?.reason ?? (CNF.DEBUG ? "Genel Bakım" : "")} />
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
{/if} -->
