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

    let loading = true;
    onMount(async () => {
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

    let stock = null;
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
                    data.type = 0;
                    let answer = await API("/asset/info/add", data);
                    if (!answer || !answer.success) {
                        Alerter.Error("Bir hata oluştu!", "Kayıt Başarısız!");
                        return;
                    }
                    Alerter.Success("Kayıt Başarılı!", "Kayıt Başarılı!", () => {
                        GOTO("/barcode/buy/print/" + answer.data.no);
                    });
                }}>
                <LiveSearch
                    label="Stok"
                    control="stock_no"
                    placeholder="Stok Arayın"
                    source={search_stocks}
                    onchange={(item) => {
                        stock = item;
                    }} />
                <Input label="Vergi Oranı" control="rate:integer:1/" suffix="%" value={CNF.DEBUG ? 1 : ""} />
                <Input label="Fiyat" control="cost:numeric:1/" suffix="₺" value={CNF.DEBUG ? 15000 : ""} />
                <Input label="Seri No" control="serial:text" value={CNF.DEBUG ? generate_IMEI() : ""} />
                <Select
                    label="Grade"
                    control="grade:text"
                    list={{
                        "0": "A",
                        "1": "B",
                        "2": "C",
                        "3": "D (Outlet)",
                    }}
                    text={CNF.DEBUG ? "Grade Seçiniz" : "A"}
                    value={"0"} />
                <Input label="Pil Yüzdesi" control="?battery:integer:1/100" value="" />
                <TextArea label="Not" control="reason:text" value={CNF.DEBUG ? "Kasa Değişecek\nArka Kamera Gölgeli\nEkran Çizik" : ""} />
                <div class="flex flex-col mt-4">
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Şarj" control="test.charge:checkbox" />
                        <Switch horizontal label="Tuş" control="test.key:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="IMEI" control="test.imei:checkbox" />
                        <Switch horizontal label="Hesap" control="test.account:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Kamera" control="test.camera:checkbox" />
                        <Switch horizontal label="Ses Kaydedici" control="test.microphone:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Konum" control="test.location:checkbox" />
                        <Switch horizontal label="Hoparlör" control="test.speaker:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Biyometrik" control="test.biometric:checkbox" />
                        <Switch horizontal label="Özellikler" control="test.feature:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Bağlantı" control="test.connection:checkbox" />
                        <Switch horizontal label="Ekran Özellikleri" control="test.screen:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Isı" control="test.temperature:checkbox" />
                        <Switch horizontal label="Ekran" control="test.screen:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Kozmetik" control="test.cosmetic:checkbox" />
                        <Switch horizontal label="Flash" control="test.flash:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Dokunmatik" control="test.touch:checkbox" />
                        <Switch horizontal label="Batarya" control="test.battery:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="NFC" control="test.nfc:checkbox" />
                        <Switch horizontal label="Sim Kızağı" control="test.sim:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Simkart" control="test.simcard:checkbox" />
                        <Switch horizontal label="Şebeke" control="test.network:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Mikrofon" control="test.microphone:checkbox" />
                        <Switch horizontal label="Arama" control="test.call:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Görüntülü Görüşme" control="test.video:checkbox" />
                        <Switch horizontal label="Kapak & Ekran" control="test.screen:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Sesli Komut" control="test.voice:checkbox" />
                        <Switch horizontal label="Dikte" control="test.dictation:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Kulaklık" control="test.headphone:checkbox" />
                        <Switch horizontal label="Batarya %" control="test.battery:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Hız" control="test.speed:checkbox" />
                        <Switch horizontal label="Reset" control="test.reset:checkbox" />
                    </div>
                    <div class="flex items-center justify-between">
                        <Switch reverse horizontal label="Temizlik" control="test.clean:checkbox" />
                    </div>
                </div>

                <Submit label="KAYDET" />
            </Form>
        </div>
    </Container>
{/if}
