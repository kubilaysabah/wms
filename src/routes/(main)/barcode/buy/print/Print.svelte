<script>
    export let data = false;
    export let auto = false;
    import QR from "$lib/qr.js";
    import { onMount } from "svelte";

    const QR_OPTS = {
        mode: "octet",
        ecclevel: "H", // L < M < Q < H
        modulesize: 1, // 1-2 iyidir
        margin: -1, // kenarı da küçült
        // mode: "alphanumeric" // VERİN alfanumerikse ek sıkıştırma için
    };
    let qr = QR.generateSVG(data.serial, QR_OPTS).outerHTML;

    onMount(() => {
        if (auto) {
            window.print();
        }
    });

    let grade_list = {
        "0":"A",
        "1":"B",
        "2":"C",
        "3":"D",
        "4":"E",
        "5":"F",
    }
</script>

{#if data}
    <div class=" w-full h-full hidden print:block items-center justify-center text-black">
        <div class="relative w-[100%] h-[100%] overflow-hidden">
            <div class="flex justify-between items-center p-2 border-b-1 border-black text-sm">
                <span>Ürün Kartı</span>
                <span>{time(data.moment)}</span>
            </div>
            <div class="w-full text-center p-2 border-b-1 text-[10px] border-black">{data.stock.code} - {data.stock.name} / {grade_list[data.grade]}</div>
            <div class="w-full text-center p-2 border-b-1 text-lg border-black">{data.serial}{data.battery ? " - " + data.battery + "%" : ""}</div>
            <div class="w-full text-center p-2 border-b-1 text-xs border-black">
                {data.reason.split("\n").join(", ")}
            </div>
            <div class="absolute w-full left-0 bottom-0 p-2">{@html qr}</div>
        </div>
    </div>
{/if}
