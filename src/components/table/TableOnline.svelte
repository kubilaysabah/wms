<script>
    //TAILWIND COMPILER
    // "min-w-12"
    // "min-w-24"
    // "min-w-36"
    // "min-w-48"
    // "min-w-60"
    // "min-w-72"
    // "min-w-84"
    // const xs_classes = "@xs:table-header-group @xs:table-cell @xs:w-auto @xs:text-left @xs:static @xs:pl-3 @xs:hidden before:@xs:hidden";
    // const sm_classes = "@sm:table-header-group @sm:table-cell @sm:w-auto @sm:text-left @sm:static @sm:pl-3 @sm:hidden before:@sm:hidden";
    // const md_classes = "@md:table-header-group @md:table-cell @md:w-auto @md:text-left @md:static @md:pl-3 @md:hidden before:@md:hidden";
    // const lg_classes = "@lg:table-header-group @lg:table-cell @lg:w-auto @lg:text-left @lg:static @lg:pl-3 @lg:hidden before:@lg:hidden";
    // const xl_classes = "@xl:table-header-group @xl:table-cell @xl:w-auto @xl:text-left @xl:static @xl:pl-3 @xl:hidden before:@xl:hidden";
    // const _2xl_classes = "@2xl:table-header-group @2xl:table-cell @2xl:w-auto @2xl:text-left @2xl:static @2xl:pl-3 @2xl:hidden before:@2xl:hidden";
    // const _3xl_classes = "@3xl:table-header-group @3xl:table-cell @3xl:w-auto @3xl:text-left @3xl:static @3xl:pl-3 @3xl:hidden before:@3xl:hidden";
    // const _4xl_classes = "@4xl:table-header-group @4xl:table-cell @4xl:w-auto @4xl:text-left @4xl:static @4xl:pl-3 @4xl:hidden before:@4xl:hidden";
    // const _5xl_classes = "@5xl:table-header-group @5xl:table-cell @5xl:w-auto @5xl:text-left @5xl:static @5xl:pl-3 @5xl:hidden before:@5xl:hidden";
    // const _6xl_classes = "@6xl:table-header-group @6xl:table-cell @6xl:w-auto @6xl:text-left @6xl:static @6xl:pl-3 @6xl:hidden before:@6xl:hidden";
    // const _7xl_classes = "@7xl:table-header-group @7xl:table-cell @7xl:w-auto @7xl:text-left @7xl:static @7xl:pl-3 @7xl:hidden before:@7xl:hidden";

    // let headers = {
    //     no: "No",
    //     name: "Depo",
    //     account: "Hesap:name",
    // };

    // let filters = {
    //     account_no: {
    //         initial: [
    //             {
    //                 value: "",
    //                 name: "Cari Seçiniz",
    //             },
    //         ],
    //         fetch: async () => {
    //             let result = await API("/account/all", {
    //                 partner: 1,
    //             });
    //             if (!result || !result.success) {
    //                 return [];
    //             }

    //             const result_data = [];
    //             for (let item of result.data) {
    //                 result_data.push({
    //                     value: item.no,
    //                     name: item.name,
    //                 });
    //             }
    //             return result_data;
    //         },
    //     },
    //     user_no: {
    //         initial: [
    //             {
    //                 value: "",
    //                 name: "Sorumlu Seçiniz",
    //             },
    //         ],
    //         fetch: async () => {
    //             let result = await API("/users/all");
    //             if (!result || !result.success) {
    //                 return [];
    //             }

    //             const result_data = [];
    //             for (let item of result.data) {
    //                 result_data.push({
    //                     value: item.no,
    //                     name: item.name,
    //                 });
    //             }
    //             return result_data;
    //         },
    //     },
    // };

    // let actions = {
    //     edit: {
    //         action: async (item) => {
    //             let data = await fetch_data(item.no);
    //             if (!data) {
    //                 return;
    //             }

    //             updating_data = data;

    //             update_modal_open = true;
    //         },
    //     },
    //     delete: {
    //         action: async (item) => {
    //             let data = await fetch_data(item.no);
    //             if (!data) {
    //                 return;
    //             }

    //             delete_data_no = data.no;

    //             delete_alert_open = true;
    //             delete_alert_message = `${data.name} isimli kullanıcıyı silmek istiyor musunuz?`;
    //         },
    //     },
    // };

    import { onMount } from "svelte";
    import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-svelte'
    import Add from "$comp/table/icons/Add.svelte";
    import Edit from "$comp/table/icons/Edit.svelte";
    import Delete from "$comp/table/icons/Delete.svelte";
    import View from "$comp/table/icons/View.svelte";
    import Down from "$comp/table/icons/Down.svelte";
    import Up from "$comp/table/icons/Up.svelte";
    import { screen, viewport, device } from "$lib/screen.js";

    export let title = "";
    export let subtitle = "";
    export let description = "";
    export let breakpoint = "6xl";

    if (breakpoint != "xs" && breakpoint != "sm" && breakpoint != "md" && breakpoint != "lg" && breakpoint != "xl" && breakpoint != "2xl" && breakpoint != "3xl" && breakpoint != "4xl" && breakpoint != "5xl" && breakpoint != "6xl" && breakpoint != "7xl") {
        breakpoint = "6xl";
    }

    export let page = 1;
    export let limit = 50;

    export let headers = {};

    export let actions = {}; // add,edit,delete,view

    export let search = []; // ["name","code"]

    export let search_value = "";

    export let search_changed = false;

    export let search_outer = false;

    export let filters = {};

    export let selection = [];

    export let selected = [];

    export let select = false;

    export let empty_message = "Veri Bulunamadı";

    export let onselect = (item, all, state) => {
        return true;
    };

    export let data = async (page, limit, query) => {
        return {
            total: 0,
            page: 0,
            pages: 0,
            limit: 0,
            data: [],
        };
    };

    var actual_headers = {};
    for (const [key, value] of Object.entries(headers)) {
        actual_headers[key] = {
            name: value,
            access: key.includes(":") ? key.split(":") : key.split("."),
        };
    }

    let pages = 0;

    let total = 0;
    let range = [];

    let actual_data = [];

    let is_fetching = false;
    let is_loading = false;
    let is_loading_timeout = null;

    async function load_data(p, l) {
        if (is_fetching) {
            return;
        }
        is_fetching = true;
        let query_data = {};

        if (search.length) {
            if (search_value) {
                query_data["LIKE"] = [search, search_value.split("-").map((s) => "%" + s + "%")];
            }
        }

        for (const [key, filter] of Object.entries(filters)) {
            if (!filter.list || !filter.list.length) {
                continue;
            }
            let item = filter.list[filter.selected];

            if (item.value !== "") {
                if (item.column) {
                    query_data[item.column] = item.value;
                } else {
                    query_data[key] = item.value;
                }
            }
        }

        is_loading_timeout = setTimeout(() => {
            is_loading = true;
        }, 500);

        let result = await data(p, l, query_data);

        clearTimeout(is_loading_timeout);
        is_loading = false;

        range = [];
        if (result) {
            actual_data = result.data;
            total = result.total;
            page = result.page;
            limit = result.limit;
            pages = result.pages;

            let start = page - 3 < 1 ? 1 : page - 3;
            let end = start + 6 > pages ? pages : start + 6;

            for (let i = start; i <= end; i++) {
                range.push(i);
            }
        } else {
            actual_data = [];
        }
        is_fetching = false;

        actual_actions = [];
        for (const [index, value] of actual_data.entries()) {
            for (const [action_key, action_value] of Object.entries(actions)) {
                if (!action_value.test || (await action_value.test(value))) {
                    if (actual_actions[index] === undefined) {
                        actual_actions[index] = {};
                        actual_actions[index].size = 0;
                        actual_actions[index].list = {};
                    }
                    let icon = action_value.icon;
                    if (!icon) {
                        if (action_key === "add") {
                            icon = Add;
                        } else if (action_key === "edit") {
                            icon = Edit;
                        } else if (action_key === "delete") {
                            icon = Delete;
                        } else if (action_key === "view") {
                            icon = View;
                        }
                    }
                    actual_actions[index].list[action_key] = {
                        tooltip_open: false,
                        tooltip_timeout: null,
                        tooltip: action_value.tooltip ? action_value.tooltip : "",
                        icon: icon,
                        class: action_value.class ? action_value.class : "",
                        action: action_value.action,
                    };
                    actual_actions[index].size += 12;
                }
            }
        }
    }

    export const trigger = () => {
        selection = [];
        actual_selection = [];
        load_data(page, limit);
    };

    let search_timeout = null;
    $: if (search.length && search_changed) {
        clearTimeout(search_timeout);
        search_timeout = setTimeout(() => {
            page = 1;
            load_data(page, limit);
        }, 0);
        search_changed = false;
    }

    $: is_empty = !actual_data || actual_data.length === 0 || !actual_headers || Object.keys(actual_headers).length === 0;

    var actual_actions = [];

    function change_page(p) {
        if (is_fetching) {
            return;
        }
        if (p < 1) p = 1;
        if (p > pages) p = pages;

        if (p == page) {
            return;
        }

        page = p;
        load_data(page, limit);
    }

    let filter_change = (filter_data, incoming) => {
        if (is_fetching) {
            return;
        }
        if (filter_data.selected === incoming) {
            return;
        }
        filter_data.selected = incoming;

        page = 1;
        load_data(page, limit);
    };

    let resolve = (item, access) => {
        let resolved = item;
        for (let i = 0; i < access.length; i++) {
            if (resolved[access[i]] === undefined) {
                return "?";
            }
            resolved = resolved[access[i]];
        }
        return resolved;
    };

    onMount(async () => {
        for (const [key, value] of Object.entries(filters)) {
            if (!filters[key].selected) {
                filters[key].selected = 0;
            }
            filters[key].key = key;
            filters[key].open = false;
            if (filters[key].initial) {
                filters[key].list = [...filters[key].initial, ...(await filters[key].fetch())];
            } else {
                filters[key].list = await filters[key].fetch();
            }
        }

        await load_data(page, limit);
    });

    let actual_selection = {};

    if (select) {
        for (let i = 0; i < selection.length; i++) {
            actual_selection[selection[i]] = selection[i];
        }
    }

    $: all_selected = (() => {
        if (!select) {
            return false;
        }
        for (let i = 0; i < actual_data.length; i++) {
            if (!(actual_data[i][select] in actual_selection)) {
                return false;
            }
        }
        return true;
    })();
    $: any_selected = (() => {
        if (!select) {
            return false;
        }
        for (let i = 0; i < actual_data.length; i++) {
            if (actual_data[i][select] in actual_selection) {
                return true;
            }
        }
        return false;
    })();
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->

<div class="flex flex-col md:flex-row md:items-center md:justify-between mb-2 gap-2 animate-fade-in">
    <div class="flex items-center justify-between">
        <div class="flex md:flex-1 flex-col items-start justify-between">
            {#if title}
                <h1 class="text-2xl text-reverse font-bold">{title}</h1>
            {/if}
            {#if subtitle}
                <h2 class="text-md text-reverse font-bold">{subtitle}</h2>
            {/if}
            {#if description}
                <p class="text-sm text-ghost">{description}</p>
            {/if}
        </div>
        <div class="inline-flex md:hidden">
            <slot name="buttons" />
        </div>
    </div>
    <div class="flex flex-col md:flex-row md:flex-2 md:items-center justify-end gap-2">
        {#each entries(filters) as [filter_name, filter_data] (filter_name)}
            {#if filter_data.list && filter_data.list.length}
                <div class="relative inline-block">
                    <button
                        class="flex w-full md:w-auto items-center justify-between pl-4 pr-1 py-1.5 text-reverse rounded-md bg-float border border-border transition cursor-pointer"
                        onclick={() => {
                            for (const [key, value] of Object.entries(filters)) {
                                if (key !== filter_name) {
                                    value.open = false;
                                }
                            }

                            filter_data.open = !filter_data.open;
                        }}>
                        <span>{filter_data.list[filter_data.selected].short || filter_data.list[filter_data.selected].name || ""}</span>
                        {#if filter_data.open}
                            <Up class="ml-1 w-7 h-7" />
                        {:else}
                            <Down class="ml-1 w-7 h-7" />
                        {/if}
                    </button>
                    {#if filter_data.open}
                        <div class="absolute w-full md:w-max left-0 mt-2 bg-back border border-border rounded-lg shadow-lg z-50 animate-fade-in p-2" tabindex="-1">
                            {#each filter_data.list as item, index (index)}
                                <button
                                    class="block w-full text-left px-5 py-2 text-reverse hover:bg-middle transition cursor-pointer rounded-md"
                                    onclick={() => {
                                        filter_change(filter_data, index);
                                        filter_data.open = false;
                                    }}>
                                    {item.name}
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/if}
        {/each}
        {#if search.length && !search_outer}
            <input type="text" class="w-full rounded-lg bg-float text-reverse border-border focus:ring-2 focus:ring-reverse md:max-w-2xs" placeholder="Ara" bind:value={search_value} oninput={() => (search_changed = true)} />
        {/if}
        <div class="hidden md:inline-flex">
            <slot name="buttons" />
        </div>
    </div>
</div>

{#if is_loading}
    <div class="w-full h-30 bg-float rounded-md relative @container overflow-x-auto animate-fade-in flex items-center justify-center">Yükleniyor...</div>
{:else if is_empty}
    <div class="w-full h-30 bg-float rounded-md relative @container overflow-x-auto animate-fade-in flex items-center justify-center">{empty_message}</div>
{:else}
    <div class="w-full relative @container overflow-x-auto animate-fade-in">
        <table class="w-full table-auto border-collapse rounded-md overflow-hidden whitespace-normal">
            <thead class="@{breakpoint}:table-header-group hidden">
                <tr class="bg-float">
                    {#if select}
                        <th class="p-3 text-left font-medium text-sm border-b border-border-mid">
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                            <div
                                class="flex items-center cursor-pointer w-6 h-6 justify-center border border-border-mid rounded bg-back transition-all duration-200"
                                onclick={() => {
                                    for (let item of actual_data) {
                                        if (any_selected) {
                                            if (!onselect(item, true, false)) {
                                                continue;
                                            }
                                            delete actual_selection[item[select]];
                                        } else {
                                            if (!onselect(item, true, true)) {
                                                continue;
                                            }
                                            actual_selection[item[select]] = item[select];
                                        }
                                    }
                                    actual_selection = { ...actual_selection };
                                    selection = Object.keys(actual_selection);
                                    selected = [];
                                    for (let item of actual_data) {
                                        if (actual_selection[item[select]]) {
                                            selected.push(item);
                                        }
                                    }
                                    selected = selected;
                                }}>
                                <div class="w-3 h-0.5 bg-fore rounded {!all_selected && any_selected ? 'block' : 'hidden'}"></div>
                                <svg class="w-5 h-5 text-brand {all_selected ? 'block' : 'hidden'} pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                    <path d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </th>
                    {/if}
                    {#each values(actual_headers) as value}
                        <th class="p-3 text-left font-medium text-sm border-b border-border-mid">
                            {value.name}
                        </th>
                    {/each}
                    {#if keys(actions).length}
                        <th class="p-3 text-left font-medium text-sm border-b border-border-mid">...</th>
                    {/if}
                </tr>
            </thead>
            <tbody>
                {#each actual_data as item, item_index}
                    <tr class="border-b last:border-b-0 border-border-mid">
                        {#if select}
                            <td class="bg-float-light @{breakpoint}:table-cell block @{breakpoint}:w-auto w-full @{breakpoint}:text-left text-right p-3 @{breakpoint}:static relative @{breakpoint}:pl-3 before:@{breakpoint}:hidden before:content-[attr(data-header)] before:absolute before:left-3 before:top-3 before:font-bold break-words" data-header="">
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <div
                                    class="flex items-center cursor-pointer w-6 h-6 justify-center border border-border-mid rounded bg-back transition-all duration-200"
                                    onclick={() => {
                                        if (actual_selection[item[select]] !== undefined) {
                                            if (!onselect(item, false, false)) {
                                                return;
                                            }
                                            delete actual_selection[item[select]];
                                        } else {
                                            if (!onselect(item, false, true)) {
                                                return;
                                            }
                                            actual_selection[item[select]] = item[select];
                                        }
                                        actual_selection = { ...actual_selection };
                                        selection = Object.keys(actual_selection);
                                        selected = [];
                                        for (let item of actual_data) {
                                            if (actual_selection[item[select]]) {
                                                selected.push(item);
                                            }
                                        }
                                        selected = selected;
                                    }}>
                                    <svg class="w-5 h-5 text-brand {actual_selection[item[select]] !== undefined ? 'block' : 'hidden'} pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                        <path d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </td>
                        {/if}
                        {#each values(actual_headers) as value}
                            <td class="bg-float-light @{breakpoint}:table-cell block @{breakpoint}:w-auto w-full @{breakpoint}:text-left text-right p-3 @{breakpoint}:static relative @{breakpoint}:pl-3 before:@{breakpoint}:hidden before:content-[attr(data-header)] before:absolute before:left-3 before:top-3 before:font-bold break-words" data-header={value.name}>
                                {resolve(item, value.access)}
                            </td>
                        {/each}
                        {#if keys(actions).length}
                            {#if actual_actions[item_index]}
                                <td class="select-none bg-float-light @{breakpoint}:table-cell block @{breakpoint}:w-auto w-full text-right p-3 @{breakpoint}:static relative @{breakpoint}:pl-3 before:@{breakpoint}:hidden before:content-[attr(data-header)] before:absolute before:left-3 before:top-3 before:font-bold min-w-{actual_actions[item_index].size}" data-header="...">
                                    {#each entries(actual_actions[item_index].list) as [key, action] (key)}
                                        <!-- svelte-ignore a11y_no_static_element_interactions -->
                                        <span
                                            class="relative"
                                            onmouseenter={() => {
                                                if (action.tooltip) {
                                                    clearTimeout(action.tooltip_timeout);
                                                    action.tooltip_timeout = setTimeout(() => {
                                                        action.tooltip_open = true;
                                                    }, 600);
                                                }
                                            }}
                                            onmouseleave={() => {
                                                clearTimeout(action.tooltip_timeout);
                                                action.tooltip_open = false;
                                            }}>
                                            <action.icon class="w-5 h-5 cursor-pointer inline-block ml-3 text-reverse/90 text-shadow-lg {action.class ? action.class : ''}" onclick={() => action.action(item)} />
                                            {#if action.tooltip_open}
                                                <span class="absolute w-max h-max -top-2 right-2 bg-back rounded-lg p-2 z-10 text-xs -translate-y-1/1 shadow-lg">
                                                    {action.tooltip}
                                                </span>
                                            {/if}
                                        </span>
                                    {/each}
                                </td>
                            {:else}
                                <td class="select-none bg-float-light @{breakpoint}:table-cell text-right p-3 @{breakpoint}:static relative @{breakpoint}:pl-3 before:@{breakpoint}:hidden before:content-[attr(data-header)] before:absolute before:left-3 before:top-3 before:font-bold" data-header="..."></td>
                            {/if}
                        {/if}
                    </tr>
                {/each}
            </tbody>
        </table>
        <div class="flex items-center justify-between gap-4 mt-4 select-none">
            <div class="flex">
                <span class="px-2 py-1 rounded bg-float">{total} Kayıt</span>
            </div>
            <div class="flex items-center gap-1">
                <button
                    class="px-2 py-1 rounded bg-float text-sm font-medium cursor-pointer"
                    onclick={() => {
                        change_page(1);
                    }}>
                    <ChevronsLeftIcon />
                </button>
                <button
                    class="px-2 py-1 rounded bg-float text-sm font-medium cursor-pointer"
                    onclick={() => {
                        change_page(page - 1);
                    }}>
                    <ChevronLeftIcon />
                </button>
                {#each range as page_index}
                    <button
                        class="px-2 py-1 rounded bg-float text-sm font-medium cursor-pointer {page_index === page ? 'bg-fore text-back' : ''}"
                        onclick={() => {
                            change_page(page_index);
                        }}>
                        {page_index}
                    </button>
                {/each}
                <button
                    class="px-2 py-1 rounded bg-float text-sm font-medium cursor-pointer"
                    onclick={() => {
                        change_page(page + 1);
                    }}>
                    <ChevronRightIcon />
                </button>
                <button
                    class="px-2 py-1 rounded bg-float text-sm font-medium cursor-pointer"
                    onclick={() => {
                        change_page(pages);
                    }}>
                    <ChevronsRightIcon />
                </button>
            </div>
        </div>
        <slot name="bottom" />
    </div>
{/if}

<style>
    table th:last-child,
    table td:last-child {
        text-align: right !important;
    }
</style>
