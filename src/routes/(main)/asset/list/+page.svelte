<script>
    import { API, PAGINATION } from "$lib/api.js";
    import { goto } from "$app/navigation";

    import Container from "$comp/dashboard/Container.svelte";
    import Table from "$comp/table/Table.svelte";
    import AssetHistory from "$custom/AssetHistory.svelte";
    import Modal from "$comp/modal/Modal.svelte";
    import Dropdown from "$comp/dropdown/Dropdown.svelte";

    import Form from "$comp/form/Form.svelte";
    import Input from "$comp/form/Input.svelte";
    import Submit from "$comp/form/Submit.svelte";
    import Vision from "$comp/form/Vision.svelte";
    import TextArea from "$comp/form/TextArea.svelte";
    import Select from "$comp/form/Select.svelte";
    import LiveSearch from "$comp/form/LiveSearch.svelte";
    import Switch from "$comp/form/Switch.svelte";

    import ViewIcon from "$icons/View.svelte";
    import CompleteIcon from "$icons/Complete.svelte";
    import HistoryIcon from "$icons/History.svelte";
    import ServiceIcon from "$icons/Service.svelte";
    import ServiceOutIcon from "$icons/ServiceOut.svelte";
    import TransferIcon from "$icons/Transfer.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";

    let title = "Seri Listesi";

    let search = ["serial", "stock_code", "stock_name", "transfer_doc"];

    let headers = {
        no: "No",
        serial: "Seri",
        "stock:name": "Stok",
        service_state: "Servis",
        "partner:name": "Mülkiyet",
        warehouse_text: "Depo",
        buy_cost: "Maliyet",
        buy_tax: "Vergi",
        buy_total: "Toplam",
        moment: "Tarih",
    };

    let filters = {
        sold: {
            initial: [
                {
                    value: "",
                    short: "Satıldı mı?",
                    name: "Hepsi",
                },
            ],
            fetch: async () => {
                const result_data = [];

                result_data.push({
                    value: 0,
                    name: "Satılmamış",
                });
                result_data.push({
                    value: 1,
                    name: "Satıldı",
                });
                return result_data;
            },
        },
        processed: {
            initial: [
                {
                    value: "",
                    short: "İşlendi mi?",
                    name: "Hepsi",
                },
            ],
            fetch: async () => {
                const result_data = [];

                result_data.push({
                    value: 0,
                    name: "Ham",
                });
                result_data.push({
                    value: 1,
                    name: "İşlendi",
                });
                return result_data;
            },
        },
        ready: {
            initial: [
                {
                    value: "",
                    short: "Satış Durumu",
                    name: "Hepsi",
                },
            ],
            fetch: async () => {
                const result_data = [];

                result_data.push({
                    value: 0,
                    name: "Değil",
                });
                result_data.push({
                    value: 1,
                    name: "Hazır",
                });
                return result_data;
            },
        },
        service: {
            initial: [
                {
                    value: "",
                    short: "Servis",
                    name: "Servis Seçin",
                },
            ],
            fetch: async () => {
                const result_data = [];

                result_data.push({
                    value: ["EQ", 0],
                    name: "Serviste Değil",
                });
                result_data.push({
                    value: ["NEQ", 0],
                    name: "Serviste",
                });
                for (let [key, value] of Object.entries(SERVICE_STATE)) {
                    if (key < 1) {
                        continue;
                    }
                    result_data.push({
                        value: key,
                        name: value,
                    });
                }
                return result_data;
            },
        },
        warehouse_no: {
            initial: [
                {
                    value: "",
                    short: "Depo",
                    name: "Depo Seçiniz",
                },
            ],
            fetch: async () => {
                let result = await API("/warehouse/all");
                if (!result || !result.success) {
                    return [];
                }

                const result_data = [];
                result_data.push({
                    value: 0,
                    name: "Dışarıda",
                });
                for (let item of result.data) {
                    result_data.push({
                        value: item.no,
                        name: item.name,
                    });
                }
                return result_data;
            },
        },
        partner_no: {
            initial: [
                {
                    value: "",
                    short: "Mülkiyet",
                    name: "Ortak Seçiniz",
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
    };

    let actions = {
        unservice: {
            tooltip: "Servisten Çıkar",
            icon: ServiceOutIcon,
            test: (item) => item.unservicable === 1,
            action: async (item) => {
                unservice_modal_data = item;
            },
        },
        service: {
            tooltip: "Servise Al",
            icon: ServiceIcon,
            test: (item) => item.servicable === 1,
            action: async (item) => {
                service_modal_data = item;
            },
        },
        transfer: {
            tooltip: "Transfer",
            icon: TransferIcon,
            test: (item) => item.transferable === 1,
            action: async (item) => {
                let alert = Alerter.Alert("Transfer", "Lütfen transfer tipini seçiniz.");
                alert.type("question");
                alert.positive("Yeni Transfer", async () => {
                    let transfer_data = {};
                    transfer_data.warehouse_list = {};
                    let result = await API("/warehouse/all", {
                        no: ["NEQ", item.warehouse_no],
                    });
                    if (!result || !result.success) {
                        Alerter.Error("Uyarı", "Uygun depo bulunamadı");
                        return;
                    }
                    for (let item of result.data) {
                        transfer_data.warehouse_list[item.no] = item.name;
                    }
                    transfer_data.asset = item;

                    new_transfer_modal_data = transfer_data;
                });
                alert.negative("Eski Transfer", async () => {
                    let transfer_data = {};
                    transfer_data.old_transfer_list = {};
                    let result = await API("/transfer/all", {
                        complete: 0,
                    });
                    if (!result || !result.success) {
                        Alerter.Error("Uyarı", "Eski transfer bulunamadı");
                        return;
                    }
                    for (let item of result.data) {
                        transfer_data.old_transfer_list[item.no] = item.doc;
                    }
                    transfer_data.asset = item;

                    old_transfer_modal_data = transfer_data;
                });
                alert.neutral("İptal");
                alert.show();
            },
        },
        history: {
            tooltip: "Geçmişi Gör",
            icon: HistoryIcon,
            action: async (item) => {
                history_modal_data = await fetch_history(item.no);
            },
        },
    };

    async function table_data(page, limit, query) {
        query.detail = 1;
        query.ORDER = ["no", "DESC"];

        const data = await PAGINATION("/asset/all", page, limit, query);

        if (data) {
            for (let item of data.data) {
                item.buy_tax = price(item.buy_tax, "₺");
                item.buy_cost = price(item.buy_cost, "₺");
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

                item.service_state = SERVICE_STATE[item.service];
            }
        }

        return data;
    }

    let trigger_table = () => {};
    let clear_table = () => {};

    let history_modal_data = false;

    let fetch_history = async (no) => {
        let result = await API("/asset/history", {
            no: no,
        });

        if (!result || !result.success) {
            return [];
        }

        return result.data;
    };

    let service_modal_data = false;
    let unservice_modal_data = false;
    let service_change_modal_data = false;
    let new_transfer_modal_data = false;
    let old_transfer_modal_data = false;

    async function asset_service(form_data) {
        let data = {};

        data.no = form_data.no;
        data.reason = form_data.reason;

        let result = await API("/asset/service/in", data);

        if (!result || !result.success) {
            Alerter.Error("Servis Hatası", result.message);
            return false;
        }

        service_modal_data = false;

        Alerter.Success("Servis başarıyla gerçekleştirildi.", () => {
            trigger_table();
        });
    }

    async function asset_service_out(data) {
        let result = await API("/asset/service/out", data);

        if (!result || !result.success) {
            Alerter.Error(result.message);
            return;
        }

        unservice_modal_data = false;

        Alerter.Success("Servisten çıkarıldı.", () => {
            trigger_table();
        });
    }

    async function asset_transfer_one(form_data) {
        let data = {};

        data.warehouse_no = form_data.warehouse_no || 0;
        data.asset_no = form_data.asset_no || 0;
        data.old_transfer_no = form_data.old_transfer_no || 0;

        let result = await API("/asset/transfer/one", data);

        if (!result || !result.success) {
            Alerter.Error("Transfer Hatası", result.message);
            return false;
        }

        new_transfer_modal_data = false;
        old_transfer_modal_data = false;

        Alerter.Success("Transfer başarıyla gerçekleştirildi.", () => {
            trigger_table();
        });
    }

    async function asset_transfer_selection(form_data) {
        let data = {};

        data.warehouse_no = form_data.warehouse_no || 0;
        data.old_transfer_no = form_data.old_transfer_no || 0;
        data.assets = selection;

        let result = await API("/asset/transfer/selected", data);

        if (!result || !result.success) {
            Alerter.Error("Transfer Hatası", result.message);
            return false;
        }

        new_transfer_modal_data = false;
        old_transfer_modal_data = false;

        Alerter.Success("Transfer başarıyla gerçekleştirildi.", () => {
            trigger_table();
        });
    }

    let service_types = {};
    for (let [key, value] of Object.entries(SERVICE_STATE)) {
        if (key > 0) {
            service_types[key] = value;
        }
    }

    async function search_stocks(query) {
        let result = await API("/stock/all", {
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

    let selection = [];
    let selection_items = [];

    let select_mode = "transfer";

    let select_modes = {
        transfer: "Transfer",
        ready: "Hazır",
    };

    let loading = false;

    const transfer_alert_open = () => {
        if (selection.length < 1) {
            Alerter.Info("Uyarı", "Lütfen transfer edilecek serileri seçin.");
            return false;
        }
        let alert = Alerter.Alert("Transfer", "Lütfen transfer tipini seçiniz.");
        alert.type("question");
        alert.positive("Yeni Transfer", async () => {
            let transfer_data = {};
            transfer_data.warehouse_list = {};

            let warehouses = [];

            for (let item of selection_items) {
                if (!warehouses.includes(item.warehouse_no)) {
                    warehouses.push(item.warehouse_no);
                }
            }

            let query = [];

            for (let warehouse_no of warehouses) {
                query.push({
                    NEQ: ["no", warehouse_no],
                });
            }

            let result = await API("/warehouse/all", {
                query: query,
            });
            if (!result || !result.success) {
                Alerter.Error("Uyarı", "Uygun depo bulunamadı");
                return;
            }
            for (let item of result.data) {
                transfer_data.warehouse_list[item.no] = item.name;
            }

            new_transfer_modal_data = transfer_data;
        });
        alert.negative("Eski Transfer", async () => {
            let transfer_data = {};
            transfer_data.old_transfer_list = {};
            let result = await API("/transfer/all", {
                complete: 0,
            });
            if (!result || !result.success) {
                Alerter.Error("Uyarı", "Eski transfer bulunamadı");
                return;
            }
            for (let item of result.data) {
                transfer_data.old_transfer_list[item.no] = item.doc;
            }
            transfer_data.asset = item;

            old_transfer_modal_data = transfer_data;
        });
        alert.neutral("İptal");
        alert.show();
    };

    const ready_alert_open = () => {
        if (selection.length < 1) {
            Alerter.Info("Uyarı", "Lütfen hazır serileri seçin.");
            return false;
        }
        let alert = Alerter.Alert("Soru", "Serileri hazır olarak işaretleyecek misin ?");
        alert.type("question");
        alert.positive("Evet", async () => {
            let data = {};
            data.assets = selection;

            let result = await API("/asset/ready/selected", data);

            if (!result || !result.success) {
                Alerter.Error("Hazır Hatası", result.message);
                return false;
            }

            Alerter.Success("Seriler hazır olarak işaretlendi.", () => {
                trigger_table();
            });
        });
        alert.negative("Hayır", async () => {});
        alert.show();
    };
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

{#if loading}
    <PageLoader sudden />
{/if}

<Container>
    <AssetHistory bind:open={history_modal_data} data={history_modal_data} />
    <Table
        {title}
        {headers}
        data={table_data}
        {actions}
        {search}
        bind:trigger={trigger_table}
        bind:clear={clear_table}
        bind:filters
        select="no"
        bind:selection
        bind:selection_items
        show_selection={true}
        onselect={(item, all, state) => {
            if (select_mode == "transfer") {
                if (!item.transferable) {
                    return false;
                }
                if (!state) {
                    return true;
                }
                if (selection_items.length) {
                    if (item.warehouse_no != selection_items[0].warehouse_no) {
                        return false;
                    }
                }
                return true;
            }

            if (select_mode == "ready") {
                if (item.ready) {
                    return false;
                }
                if (item.insell) {
                    return false;
                }
                if (item.intransfer) {
                    return false;
                }
                if (item.sold) {
                    return false;
                }
                if (item.sold) {
                    return false;
                }
                if (!state) {
                    return true;
                }
                return true;
            }

            return false;
        }}>
        <div slot="buttons">
            <Dropdown
                options={select_modes}
                bind:selected={select_mode}
                action={(key, value) => {
                    clear_table();
                }} />
            <button
                onclick={() => {
                    if (select_mode == "transfer") {
                        transfer_alert_open();
                    }
                    if (select_mode == "ready") {
                        ready_alert_open();
                    }
                }}
                class="btn">
                >
            </button>
        </div>
    </Table>
    <Modal title="Servise Al" bind:open={service_modal_data} size="xl">
        <Form onsubmit={(data) => asset_service(data)}>
            <Input control="no" label="No" type="text" visible={false} bind:value={service_modal_data.no} />
            <div class="flex flex-col gap-2">
                <div class="w-full">
                    <Vision label="Seri" type="text" text={service_modal_data.serial} />
                </div>
                <div class="w-full">
                    <TextArea control="reason" label="Servis" value={service_modal_data.reason} />
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <Submit label="Servise Al" />
            </div>
        </Form>
    </Modal>
    <Modal title="Servis Çıkış" bind:open={unservice_modal_data} size="xl">
        <Form
            onsubmit={async (data) => {
                if (loading) {
                    return;
                }
                loading = true;
                await asset_service_out(data);
                loading = false;
            }}>
            <Input control="no" label="No" type="text" visible={false} bind:value={unservice_modal_data.no} />
            <div class="flex flex-col gap-2">
                <div class="w-full">
                    <Vision label="Şimdiki Stok" type="text" text="{unservice_modal_data.stock.code} - {unservice_modal_data.stock.name}" />
                </div>
                {#if !unservice_modal_data.same}
                    <div class="w-full">
                        <LiveSearch control="stock_no:numeric" label="Yeni Stok" source={search_stocks} placeholder="Stok Seçiniz" />
                    </div>
                {:else}
                    <Input control="stock_no" visible={false} value="0" />
                {/if}
                <div class="w-full flex items-center justify-between gap-2">
                    <div>
                        <Switch control="ready:checkbox" label="Satışa Hazır" checked={true} />
                    </div>
                    <div>
                        <Switch
                            label="Aynı Stok"
                            checked={false}
                            onchange={(val) => {
                                if (val) {
                                    unservice_modal_data.same = true;
                                } else {
                                    unservice_modal_data.same = false;
                                }
                            }} />
                    </div>
                </div>
            </div>
            <div class="flex flex-col md:flex-row justify-center mt-6 gap-2">
                <Submit label="Servisten Çıkar" />
            </div>
        </Form>
    </Modal>
    <Modal title="Transfer" bind:open={new_transfer_modal_data} size="xl">
        <Form
            onsubmit={(data) => {
                if (selection.length) {
                    asset_transfer_selection(data);
                    return;
                }
                asset_transfer_one(data);
            }}>
            {#if !selection.length}
                <Input control="asset_no" label="No" type="text" visible={false} bind:value={new_transfer_modal_data.asset.no} />
            {/if}
            <div class="flex flex-col gap-2">
                <div class="w-full">
                    <Select control="warehouse_no" label="Depo" list={new_transfer_modal_data.warehouse_list} text="Depo Seçiniz" />
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <Submit label="Transfer Et" />
            </div>
        </Form>
    </Modal>
    <Modal title="Transfer" bind:open={old_transfer_modal_data} size="xl">
        <Form
            onsubmit={(data) => {
                if (selection.length) {
                    asset_transfer_selection(data);
                    return;
                }
                asset_transfer_one(data);
            }}>
            {#if !selection.length}
                <Input control="asset_no" label="No" type="text" visible={false} bind:value={old_transfer_modal_data.asset.no} />
            {/if}
            <div class="flex flex-col gap-2">
                <div class="w-full">
                    <Select control="old_transfer_no" label="Eski Transfer" list={old_transfer_modal_data.old_transfer_list} text="Eski Transfer Seçiniz" />
                </div>
            </div>
            <div class="flex justify-center mt-6">
                <Submit label="Transfer Et" />
            </div>
        </Form>
    </Modal>
</Container>
