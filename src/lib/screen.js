import { writable, get } from 'svelte/store';

function calculate_viewport() {
    if(window.innerWidth < 640){
        return 'xs';
    }
    if(window.innerWidth < 768){
        return 'sm';
    }
    if(window.innerWidth < 1024){
        return 'md';
    }
    if(window.innerWidth < 1280){
        return 'lg';
    }
    if(window.innerWidth < 1536){
        return 'xl';
    }
    return '2xl';
}

function calculate_device() {
    if(window.innerWidth < 640){
        return 'mobile';
    }
    return 'desktop';
}

const screen = writable(window.innerWidth);
const viewport = writable(calculate_viewport());
const device = writable(calculate_device());

window.addEventListener('resize', () => {
    screen.set(window.innerWidth);
    viewport.set(calculate_viewport());
    device.set(calculate_device());
});

export { screen, viewport, device };