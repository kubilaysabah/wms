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

    let loading = true;

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
        await fetch_warehouses();

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
        <Form onsubmit={submit}>


        </Form>
    </Container>
{/if}
