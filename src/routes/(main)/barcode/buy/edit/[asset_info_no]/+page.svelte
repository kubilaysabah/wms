<script>
    import { onMount } from "svelte";
    import { API } from "$lib/api.js";
    import CNF from "$lib/conf.js";
    import { GOTO } from "$src/lib/utils";

    import Container from "$comp/dashboard/Container.svelte";
    import PageLoader from "$comp/loader/PageLoader.svelte";
    import Form from "$comp/form/Form.svelte";
    import LiveSearch from "$comp/form/LiveSearch.svelte";
    import Input from "$comp/form/Input.svelte";
    import Submit from "$comp/form/Submit.svelte";
    import Switch from "$comp/form/Switch.svelte";
    import TextArea from "$comp/form/TextArea.svelte";
    import Select from "$comp/form/Select.svelte";
    import { page } from "$app/stores";

    let loading = true;

    let asset_info = false;
    let asset_info_no = $page.params.asset_info_no;

    async function fetch_info() {
        let answer = await API("/asset/info/one", {
            no: asset_info_no,
            detail: 1,
        });
        if (!answer || !answer.success) {
            return false;
        }
        return answer.data;
    }

    onMount(async () => {
        asset_info = await fetch_info();
        if (!asset_info) {
            Alerter.Error("Bir hata oluştu!", "Bilgi çekilemedi");
            return;
        }

        loading = false;
    });

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
</script>

{#if loading}
    <PageLoader />
{/if}

{#if !loading}
    <Container>
        <div class="block print:hidden">
            <Form
                class="flex flex-col gap-3"
                onsubmit={async (data) => {
                    data.no = asset_info_no;
                    data.type = 0;
                    let answer = await API("/asset/info/edit", data);
                    if (!answer || !answer.success) {
                        Alerter.Error("Bir hata oluştu!", "Kayıt Başarısız!");
                        return;
                    }
                    Alerter.Question(
                        "Kayıt Başarılı!",
                        "Kayıt Başarılı!",
                        "Yazdır",
                        () => {
                            GOTO("/barcode/buy/print/" + answer.data.no);
                        },
                        "İptal",
                    );
                }}>
                <LiveSearch label="Stok" control="stock_no:integer" placeholder="Stok Arayın" source={search_stocks} text={asset_info.stock.code + " - " + asset_info.stock.name} value={asset_info.stock.no} />
                <Input label="Vergi Oranı" control="rate:integer:1/" suffix="%" value={asset_info.rate} />
                <Input label="Fiyat" control="cost:numeric:1/" suffix="₺" value={asset_info.cost} />
                <Input label="Seri No" control="serial:text" value={asset_info.serial} />
                <Select
                    label="Grade"
                    control="grade:text"
                    list={{
                        "0": "A",
                        "1": "B",
                        "2": "C",
                        "3": "D (Outlet)",
                    }}
                    value={asset_info.grade} />
                <Input label="Pil Yüzdesi" control="?battery:integer:1/100" value={asset_info.battery || ""} />
                <TextArea label="Not" control="reason:text" value={asset_info.reason} />
                <div class="flex flex-col mt-4">
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Şarj" control="test.charge:checkbox" checked={asset_info.test.charge} />
                        <Switch horizontal label="Tuş" control="test.key:checkbox" checked={asset_info.test.key} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="IMEI" control="test.imei:checkbox" checked={asset_info.test.imei} />
                        <Switch horizontal label="Hesap" control="test.account:checkbox" checked={asset_info.test.account} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Kamera" control="test.camera:checkbox" checked={asset_info.test.camera} />
                        <Switch horizontal label="Ses Kaydedici" control="test.microphone:checkbox" checked={asset_info.test.microphone} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Konum" control="test.location:checkbox" checked={asset_info.test.location} />
                        <Switch horizontal label="Hoparlör" control="test.speaker:checkbox" checked={asset_info.test.speaker} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Biyometrik" control="test.biometric:checkbox" checked={asset_info.test.biometric} />
                        <Switch horizontal label="Özellikler" control="test.feature:checkbox" checked={asset_info.test.feature} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Bağlantı" control="test.connection:checkbox" checked={asset_info.test.connection} />
                        <Switch horizontal label="Ekran Özellikleri" control="test.screen:checkbox" checked={asset_info.test.screen} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Isı" control="test.temperature:checkbox" checked={asset_info.test.temperature} />
                        <Switch horizontal label="Ekran" control="test.screen:checkbox" checked={asset_info.test.screen} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Kozmetik" control="test.cosmetic:checkbox" checked={asset_info.test.cosmetic} />
                        <Switch horizontal label="Flash" control="test.flash:checkbox" checked={asset_info.test.flash} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Dokunmatik" control="test.touch:checkbox" checked={asset_info.test.touch} />
                        <Switch horizontal label="Batarya" control="test.battery:checkbox" checked={asset_info.test.battery} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="NFC" control="test.nfc:checkbox" checked={asset_info.test.nfc} />
                        <Switch horizontal label="Sim Kızağı" control="test.sim:checkbox" checked={asset_info.test.sim} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Simkart" control="test.simcard:checkbox" checked={asset_info.test.simcard} />
                        <Switch horizontal label="Şebeke" control="test.network:checkbox" checked={asset_info.test.network} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Mikrofon" control="test.microphone:checkbox" checked={asset_info.test.microphone} />
                        <Switch horizontal label="Arama" control="test.call:checkbox" checked={asset_info.test.call} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Görüntülü Görüşme" control="test.video:checkbox" checked={asset_info.test.video} />
                        <Switch horizontal label="Kapak & Ekran" control="test.screen:checkbox" checked={asset_info.test.screen} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Sesli Komut" control="test.voice:checkbox" checked={asset_info.test.voice} />
                        <Switch horizontal label="Dikte" control="test.dictation:checkbox" checked={asset_info.test.dictation} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Kulaklık" control="test.headphone:checkbox" checked={asset_info.test.headphone} />
                        <Switch horizontal label="Batarya %" control="test.battery:checkbox" checked={asset_info.test.battery} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Hız" control="test.speed:checkbox" checked={asset_info.test.speed} />
                        <Switch horizontal label="Reset" control="test.reset:checkbox" checked={asset_info.test.reset} />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Temizlik" control="test.clean:checkbox" checked={asset_info.test.clean} />
                    </div>
                </div>

                <Submit label="KAYDET" />
            </Form>
        </div>
    </Container>
{/if}
