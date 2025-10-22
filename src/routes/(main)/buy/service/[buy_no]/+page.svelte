<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { API, PAGINATION } from "$lib/api.js";
    import CNF from "$lib/conf.js";
    import { page } from "$app/stores";

    import Container from "$comp/dashboard/Container.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";
    import DropClick from "$comp/dropdown/DropClick.svelte";
    import Modal from "$comp/modal/Modal.svelte";

    import Form from "$comp/form/Form.svelte";
    import Select from "$comp/form/Select.svelte";
    import Switch from "$comp/form/Switch.svelte";

    import PlusIcon from "$icons/Plus.svelte";
    import TrashIcon from "$icons/Trash.svelte";
    import UpIcon from "$icons/Up.svelte";
    import DownIcon from "$icons/Down.svelte";
    import Spacer from "$comp/spacer/Spacer.svelte";
    import Submit from "$comp/form/Submit.svelte";
    import TextArea from "$comp/form/TextArea.svelte";

    let loading = true;

    let buy_no = $page.params.buy_no;

    let buy = false;
    async function fetch_buy() {
        let answer = await API("/buy/info", {
            no: buy_no,
            detail: 1,
        });

        if (!answer || !answer.success) {
            return;
        }

        buy = answer.data;
    }

    let title = "Alım Servis";

    let search = ["serial", "stock_code", "stock_name"];

    let headers = {
        no: "No",
        serial: "Seri",
        warehouse_text: "Depo",
        buy_cost: "Maliyet",
        buy_tax: "Vergi",
        buy_total: "Toplam",
    };

    async function table_data(page, limit, query) {
        query.detail = 1;
        query.buy_no = buy_no;
        query.transfer_no = 0;
        query.service = 0;

        const data = await PAGINATION("/asset/all", page, limit, query);

        if (data) {
            for (let item of data.data) {
                item.buy_cost = price(item.buy_cost, "₺");
                item.buy_tax = price(item.buy_tax, "₺");
                item.buy_total = price(item.buy_total, "₺");
                item.moment = time(item.moment);

                if (item.warehouse_no) {
                    let warehouse_indicators = [];

                    if (item.warehouse.service) {
                        warehouse_indicators.push("SR");
                    }

                    if (item.warehouse.buy) {
                        warehouse_indicators.push("AL");
                    }

                    if (item.warehouse.sell) {
                        warehouse_indicators.push("SA");
                    }

                    item.warehouse_text = item.warehouse.name;
                    if (warehouse_indicators.length > 0) {
                        item.warehouse_text += " (" + warehouse_indicators.join(",") + ")";
                    }
                } else {
                    item.warehouse_text = "Dışarıda";
                }
            }
        }

        return data;
    }

    let selection = [];

    let service_modal_open = false;

    async function service_assets(form_data) {
        let data = {};

        if (form_data.apply !== undefined) {
            if (!form_data.apply) {
                Alerter.Error("Tüm serileri servise sokmak için lütfen onaylayın.");
                return false;
            }

            delete form_data.apply;
        } else {
            data.assets = selection;
        }
        data.warehouse_no = form_data.warehouse_no;
        data.buy_no = buy_no;

        let result = await API("/buy/service", data);

        if (!result || !result.success) {
            Alerter.Error("Servis Hatası", result.message);
            return false;
        }

        Alerter.Success("Servis başarıyla gerçekleştirildi.", () => {
            goto("/buy/list");
        });
    }

    let warehouse_list = {};
    async function fetch_warehouse_list() {
        let result = await API("/warehouse/all", {
            no: ["NEQ", buy_no],
            service: 0,
        });
        if (!result || !result.success) {
            return [];
        }

        for (let item of result.data) {
            warehouse_list[item.no] = item.name;
        }
    }

    onMount(async () => {
        loading = true;
        await fetch_buy();
        await fetch_warehouse_list();

        if (!buy) {
            Alerter.Error("Bir hata oluştu!", "Alım çekilemedi", () => {
                goto("/buy/list");
            });
            return;
        }

        if (!buy.complete) {
            Alerter.Error("Bir hata oluştu!", "Alım tamamlanmamış!", () => {
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
        <!-- <div class="flex flex-col border border-border-mid rounded-2xl mb-4">
            <div class="flex items-center justify-between p-4 border-b border-border-mid">
                <h2 class="text-lg font-semibold">{buy.doc}</h2>
                <div>
                    <span class="text-sm bg-fore text-back p-2 rounded-xl">{time(buy.moment)}</span>
                </div>
            </div>
            <div class="flex items-center justify-between p-4 border-b border-border-mid">
                <div>
                    <span class="text-sm bg-fore text-back p-2 rounded-xl">{buy.account.name} > {buy.partner.name}</span>
                </div>
                <div>{buy.warehouse.name}</div>
            </div>
            <div class="flex md:flex-row flex-col items-end md:items-center justify-between p-4">
                <div>Mal Sayısı : {buy.count}</div>
                <div>Ara Toplam : {globalThis.price(buy.sub, "₺")}</div>
                <div>Vergi : {globalThis.price(buy.tax, "₺")}</div>
                <div>Toplam : {globalThis.price(buy.total, "₺")}</div>
            </div>
        </div> -->
        <TableOnline {title} {headers} data={table_data} {search} select="no" bind:selection>
            <div slot="buttons">
                <button
                    onclick={() => {
                        if (keys(warehouse_list).length > 0) {
                            service_modal_open = true;
                        } else {
                            Alerter.Error("Bir hata oluştu!", "Transfer depoları bulunamadı!");
                        }
                    }}
                    class="btn">
                    Servis
                </button>
            </div>
        </TableOnline>
        <Modal title="Servis" bind:open={service_modal_open} onclose={() => (service_modal_open = false)} size="xl">
            <Form onsubmit={(data) => service_assets(data)}>
                <div class="flex flex-col gap-2">
                    <div class="w-full">
                        <Select control="warehouse_no" label="Depo" list={warehouse_list} text="Depo Seçiniz" />
                    </div>
                    {#if selection.length == 0}
                        <div class="w-full">
                            <Switch control="apply:checkbox" label="Tüm cihazları servise sok" checked={false} />
                        </div>
                    {/if}
                </div>
                <div class="flex justify-center mt-6">
                    <Submit label="Kaydet" />
                </div>
            </Form>
        </Modal>
    </Container>
{/if}
