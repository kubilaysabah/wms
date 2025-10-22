<script>
    import { theme_toggle, theme } from "$lib/theme.js";

    import Sun from "$icons/Sun.svelte";
    import Moon from "$icons/Moon.svelte";
    import Refresh from "$icons/Refresh.svelte";
    import HeaderAvatar from "$comp/dashboard/HeaderAvatar.svelte";
    import HeaderDrop from "$comp/dashboard/HeaderDrop.svelte";
    import { USER, AUTH_LOGOUT } from "$lib/api.js";
    import { GOTO } from "$lib/utils.js";

    $: user = $USER;

    let list_pages = {};
    let approve_pages = {};
    let misc_pages = {};

    $: {
        list_pages = {};
        approve_pages = {};
        misc_pages = {};
        if (user) {
            list_pages["/buy/list"] = "Alımlar";
            list_pages["/transfer/list"] = "Transferler";
            list_pages["/sell/list"] = "Satışlar";
            list_pages["/stock/list"] = "Stoklar";
            list_pages["/asset/list"] = "Seriler";

            approve_pages["/approve/transfer/list"] = "Transfer Onay";
            approve_pages["/accept/transfer/list"] = "Transfer Kabul";
            approve_pages["/approve/sell/list"] = "Satış Onay";

            if (user.executive) {
                misc_pages["/account/list"] = "Cari Listesi";
                misc_pages["/user/list"] = "Kullanıcı Listesi";
            }
            misc_pages["/storage/warehouse/list"] = "Depo Listesi";

            if (user.executive) {
                misc_pages["/storage/shelf/list"] = "Raf Listesi";
                misc_pages["/storage/level/list"] = "Seviye Listesi";
                misc_pages["/storage/segment/list"] = "Segment Listesi";
                misc_pages["/storage/slot/list"] = "Yuva Listesi";
            }

            if (user.executive || user.finance) {
                misc_pages["/report"] = "Raporlar";
            }
            if (user.executive) {
                misc_pages["/settings"] = "Ayarlar";
            }


            if (user.senatech) {
                misc_pages["/barcode/buy/add"] = "Barkod Ekle";
                misc_pages["/barcode/buy/edit"] = "Barkod Düzenle";
            }
        }
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="fixed top-0 left-0 z-50 w-full h-15 flex justify-between bg-header py-4 px-10 transition-transform duration-100 print:hidden">
    <div class="flex items-center gap-5 text-lg">
        <button class="cursor-pointer" onclick={() => GOTO("/")}>Analiz</button>
        <HeaderDrop link options={list_pages}>
            <button class="cursor-pointer">Liste</button>
        </HeaderDrop>
        <HeaderDrop link options={approve_pages}>
            <button class="cursor-pointer">Onay</button>
        </HeaderDrop>
        <HeaderDrop link options={misc_pages}>
            <button class="cursor-pointer">Diğer</button>
        </HeaderDrop>
    </div>
    <div class="flex items-center gap-5">
        <button class="cursor-pointer text-xl transition:font duration-100" onclick={() => theme_toggle()}>
            {#if $theme === "dark"}
                <Sun />
            {:else}
                <Moon />
            {/if}
        </button>
        <HeaderAvatar
            avatar={user.name[0]}
            position="right"
            options={{
                profile: "Profil",
                logout: "Çıkış Yap",
            }}
            action={(key, value) => {
                if (key == "logout") {
                    AUTH_LOGOUT();
                }
                if (key == "profile") {
                    GOTO("/user/profile");
                }
            }} />
    </div>
</div>
