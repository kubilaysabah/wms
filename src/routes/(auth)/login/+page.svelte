<script>
    import Container from "$comp/dashboard/Container.svelte";
    import { AUTH_LOGIN, AUTH_REDIRECT } from "$lib/api.js";
    import PageLoader from "$comp/loader/PageLoader.svelte";
    import { GOTO } from "$src/lib/utils.js";

    let username = "";
    let password = "";

    let loading = false;

    function login() {
        if (!username || !password) {
            Alerter.Error("Lütfen tüm alanları doldurun!");
            return;
        }
        loading = true;
        AUTH_LOGIN(username, password).then((answer) => {
            loading = false;
            if (answer.success) {
                Alerter.Success("Başarılı!", "Başarıyla giriş yaptınız!", () => {
                    AUTH_REDIRECT();
                });
            } else {
                Alerter.Error("Hata!", "Tekrar deneyin");
            }
        });
    }
</script>

{#if loading}
    <PageLoader />
{:else}
    <Container top={false}>
        <div class="fixed inset-0 h-full w-full flex items-center justify-center bg-back p-4 overflow-hidden">
            <div class="w-full max-w-4xl">
                <div class="relative z-10">
                    <div class="bg-float rounded-xl p-6 shadow-lg animate-fade-in max-w-md mx-auto">
                        <h2 class="text-2xl text-fore font-bold mb-6 text-center">Giriş</h2>
                        <div class="space-y-6">
                            <div class="space-y-2 group">
                                <label for="username" class="block text-fore font-medium">Kullanıcı</label>
                                <input type="text" id="username" name="username" bind:value={username} class="w-full px-4 py-3 text-xl rounded-lg bg-float-light text-fore border border-border shine" placeholder="Kullanıcı Adı Giriniz" autocomplete="off" />
                            </div>
                            <div class="space-y-2 group">
                                <label for="password" class="block text-fore font-medium">Şifre</label>
                                <input type="password" id="password" name="password" bind:value={password} class="w-full px-4 py-3 text-xl rounded-lg bg-float-light text-fore border border-border shine" placeholder="Şifre Giriniz" />
                            </div>
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                            <div class="flex justify-center pt-4 group" onclick={login}>
                                <button type="submit" class="btn btn-primary text-2xl px-12 py-3 rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 shine">Giriş</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Container>
{/if}
