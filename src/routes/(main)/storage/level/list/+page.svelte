<script>
    import { API, PAGINATION } from "$lib/api.js";

    import Container from "$comp/dashboard/Container.svelte";
    import Heading from "$comp/dashboard/Heading.svelte";
    import TableOnline from "$comp/table/TableOnline.svelte";

    let title = "Seviye Listesi";

    let search = ["label","location"];

    let filters = {
        warehouse_no: {
            initial: [
                {
                    value: "",
                    name: "Depo Seçiniz",
                },
            ],
            fetch: async () => {
                let result = await API("/warehouse/all",{
                    managed:1
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
        }
    };

    let headers = {
        no: "No",
        "shelf:label": "Raf",
        "warehouse:name": "Depo",
        location: "Konum",
    };

    async function fetch_datas(page, limit, query) {
        query.detail = 1;
        return await PAGINATION("/level/all", page, limit, query);
    }
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<Container>
    <TableOnline {title} {headers} data={fetch_datas} {search} bind:filters/>
</Container>
