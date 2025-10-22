<script>
    import CNF from "$lib/conf.js";
    import Alert from "$comp/alert/Alert.svelte";
    import Container from "$comp/dashboard/Container.svelte";
    import { onMount } from "svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";
    import { API, USER } from "$lib/api.js";

    let loading = true;
    let error = false;

    let report = {};

    onMount(async () => {
        error = false;
        loading = true;
        let answer = await API("/dashboard");
        loading = false;

        if (!answer || !answer.success) {
            error = true;
            return;
        }

        report = answer.data;
    });

</script>

<svelte:head>
    <title>Dashboard</title>
</svelte:head>

<Container>
    {#if error}
        <Alert type="error" message="Bir hata oluştu." positive="Tamam" />
    {:else if loading}
        <PageLoader />
    {:else if $USER.executive || $USER.finance}
        <div class="p-4">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div class="bg-float-light rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div class="flex items-center p-4 bg-blue-900/5">
                        <div class="rounded-full bg-blue-900/10 p-3 mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h18v18H3zM3 9h18M9 21V9" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-reverse">Alımlar</h3>
                            <p class="text-2xl font-bold text-reverse">{price(report.buy.total, "₺")}</p>
                        </div>
                    </div>
                    <div class="px-4 py-3">
                        <p class="text-sm text-reverse">{report.buy.count} işlem</p>
                    </div>
                </div>

                <div class="bg-float-light rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div class="flex items-center p-4 bg-purple-900/5">
                        <div class="rounded-full bg-purple-900/10 p-3 mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-reverse">Transferler</h3>
                            <p class="text-2xl font-bold text-reverse">{report.transfer.count} Cihaz</p>
                        </div>
                    </div>
                    <div class="px-4 py-3">
                        <p class="text-sm text-reverse">{report.transfer.count} işlem</p>
                    </div>
                </div>

                <div class="bg-float-light rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                    <div class="flex items-center p-4 bg-green-900/5">
                        <div class="rounded-full bg-green-900/10 p-3 mr-4">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold text-reverse">Satışlar</h3>
                            <p class="text-2xl font-bold text-reverse">{price(report.sell.total, "₺")}</p>
                        </div>
                    </div>
                    <div class="px-4 py-3">
                        <p class="text-sm text-reverse">{report.sell.count} işlem</p>
                    </div>
                </div>
            </div>

            <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {#if report.buy.data}
                    <div class="bg-float-light rounded-lg shadow-md overflow-hidden flex-1">
                        <div class="bg-blue-900/5 px-4 py-3">
                            <h3 class="text-lg font-semibold text-reverse">Son Alımlar</h3>
                        </div>
                        <div>
                            {#each report.buy.data as buy}
                                <div class="p-4">
                                    <div class="flex justify-between mb-1">
                                        <h4 class="font-medium text-reverse">{buy.doc}</h4>
                                        <span class="text-sm text-blue-600 dark:text-blue-400 font-medium">{price(buy.total, "₺")}</span>
                                    </div>
                                    <div class="flex justify-between text-sm text-reverse">
                                        <span>Satıcı: {buy.account.name}</span>
                                        <span>{time(buy.moment)}</span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {:else}
                    <div class="flex-1"></div>
                {/if}

                {#if report.transfer.data}
                    <div class="bg-float-light rounded-lg shadow-md overflow-hidden flex-1">
                        <div class="bg-purple-900/5 px-4 py-3">
                            <h3 class="text-lg font-semibold text-reverse">Son Transferler</h3>
                        </div>
                        <div>
                            {#each report.transfer.data as transfer}
                                <div class="p-4">
                                    <div class="flex justify-between mb-1">
                                        <h4 class="font-medium text-reverse">{transfer.doc}</h4>
                                        <span class="text-sm text-purple-600 dark:text-purple-400 font-medium">{transfer.count}</span>
                                    </div>
                                    <div class="flex justify-between text-sm text-reverse">
                                        <span>Depo: {transfer.warehouse.name}</span>
                                        <span>{time(transfer.moment)}</span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {:else}
                    <div class="flex-1"></div>
                {/if}

                {#if report.sell.data}
                    <div class="bg-float-light rounded-lg shadow-md overflow-hidden flex-1">
                        <div class="bg-green-900/5 px-4 py-3">
                            <h3 class="text-lg font-semibold text-reverse">Son Satışlar</h3>
                        </div>
                        <div>
                            {#each report.sell.data as sell}
                                <div class="p-4">
                                    <div class="flex justify-between mb-1">
                                        <h4 class="font-medium text-reverse">{sell.doc}</h4>
                                        <span class="text-sm text-green-600 dark:text-green-400 font-medium">{price(sell.total, "₺")}</span>
                                    </div>
                                    <div class="flex justify-between text-sm text-reverse">
                                        <span>Alıcı: {sell.partner.name}</span>
                                        <span>{time(sell.moment)}</span>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {:else}
                    <div class="flex-1"></div>
                {/if}
            </div>
        </div>
    {:else}
        <div class="p-4 w-full h-full flex flex-col items-center justify-center">
            <h1 class="text-2xl font-bold text-reverse">Senatech - Soysal WMS sistemine hoş geldiniz.</h1>
            <p class="text-lg text-reverse">Eğer yetkili biri tarafından hesabınıza yetki verilmediyseniz, lütfen yetkili biri ile iletişime geçin.</p>
        </div>
    {/if}
</Container>
