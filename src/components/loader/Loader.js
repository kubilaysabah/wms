import { writable, get } from 'svelte/store';

const LoaderState = writable(0);

let loader_timeout = null;

const Loader = (state, time = 350) => {
    let current = get(LoaderState);

    clearTimeout(loader_timeout);

    if (state) {

        if (current > 0) {
            LoaderState.set(current + 1);
        } else {
            loader_timeout = setTimeout(() => {
                LoaderState.set(current + 1);
            }, time);
        }

        return;
    }
    current--;
    if (current < 0) {
        current = 0;
    }
    LoaderState.set(current);
}

export { LoaderState };

export default Loader;