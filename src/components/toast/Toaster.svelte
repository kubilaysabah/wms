<script>
    import { setContext } from "svelte";
    import Close from "$icons/Close.svelte";

    // info,success,warning,error,question

    const toast_closable = `<svg  xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" class="absolute -top-3 -right-3 cursor-pointer w-10 h-10 rounded-full text-fore"><!-- Icon from Material Symbols Light by Google - https://github.com/google/material-design-icons/blob/master/LICENSE --><path fill="currentColor" d="m11.292 12l-2.246 2.246q-.14.14-.15.344t.15.364t.354.16t.354-.16L12 12.708l2.246 2.246q.14.14.344.15t.364-.15t.16-.354t-.16-.354L12.708 12l2.246-2.246q.14-.14.15-.344t-.15-.364t-.354-.16t-.354.16L12 11.292L9.754 9.046q-.14-.14-.344-.15t-.364.15t-.16.354t.16.354zm-6.676 7q-.691 0-1.153-.462T3 17.384V6.616q0-.691.463-1.153T4.615 5h14.77q.69 0 1.152.463T21 6.616v10.769q0 .69-.463 1.153T19.385 19z"/></svg>`;

    let toaster = null;

    globalThis.Toaster = {
        Success: (message, closable = false) => {
            if(toaster.textContent.includes(message)){
                return;
            }


            let container = document.createElement("div");
            container.className = "relative bg-success border border-border-mid text-white rounded-lg shadow-lg p-6";
            container.innerHTML = message;

            if (closable) {
                let close_button = document.createElement("div");
                close_button.innerHTML = toast_closable;
                close_button.onclick = () => {
                    container.remove();
                };
                container.appendChild(close_button);
            }

            toaster.appendChild(container);
            if (!closable) {
                setTimeout(() => {
                    container.remove();
                }, 4000);
            }
        },
        Error: (message, closable = false) => {
            if(toaster.textContent.includes(message)){
                return;
            }

            let container = document.createElement("div");
            container.className = "relative bg-error border border-border-mid text-white rounded-lg shadow-lg p-6";
            container.innerHTML = message;

            if (closable) {
                let close_button = document.createElement("div");
                close_button.innerHTML = toast_closable;
                close_button.onclick = () => {
                    container.remove();
                };
                container.appendChild(close_button);
            }

            toaster.appendChild(container);
            if (!closable) {
                setTimeout(() => {
                    container.remove();
                }, 7000);
            }
        },
        Warning: (message, closable = false) => {
            if(toaster.textContent.includes(message)){
                return;
            }

            let container = document.createElement("div");
            container.className = "relative bg-warning border border-border-mid text-black rounded-lg shadow-lg p-6";
            container.innerHTML = message;

            if (closable) {
                let close_button = document.createElement("div");
                close_button.innerHTML = toast_closable;
                close_button.onclick = () => {
                    container.remove();
                };
                container.appendChild(close_button);
            }

            toaster.appendChild(container);
            if (!closable) {
                setTimeout(() => {
                    container.remove();
                }, 5000);
            }
        },
        Info: (message, closable = false) => {
            if(toaster.textContent.includes(message)){
                return;
            }

            let container = document.createElement("div");
            container.className = "relative bg-primary border border-border-mid text-white rounded-lg shadow-lg p-6";
            container.innerHTML = message;

            if (closable) {
                let close_button = document.createElement("div");
                close_button.innerHTML = toast_closable;
                close_button.onclick = () => {
                    container.remove();
                };
                container.appendChild(close_button);
            }

            toaster.appendChild(container);
            if (!closable) {
                setTimeout(() => {
                    container.remove();
                }, 5000);
            }
        },
    };
</script>

<div class="fixed w-full max-w-md bottom-5 right-5 z-999 flex flex-col-reverse gap-2 items-end" bind:this={toaster}></div>
