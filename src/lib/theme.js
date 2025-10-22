import { writable } from 'svelte/store';

export const theme = writable("light");

theme.subscribe(value => {
    document.documentElement.classList.add('no-transition');
    setTimeout(() => {
        document.documentElement.classList.toggle("dark", value === "dark");
        setTimeout(() => {
            document.documentElement.classList.remove('no-transition');
        }, 10);
    },10);
});

if (localStorage.getItem("theme") === "dark") {
    theme.set("dark");
}

export function theme_toggle() {
    theme.update((value)=>{
        localStorage.setItem("theme", value === "dark" ? "light" : "dark");
        return value === "dark" ? "light" : "dark";
    });
}
