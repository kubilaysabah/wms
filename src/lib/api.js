import CNF from '$lib/conf.js';
import LOCAL from './local.js';
import COOKIE from './cookie.js';
import { writable } from 'svelte/store';
import { GOTO } from './utils';

export let BASE_URL = CNF.API_URL;
export let PREFIX_URL = '/api';

export let TIMEOUT = 10000;

let TOKEN = LOCAL.GET("token");

export let USER = writable({});

// USER.subscribe((value) => {
//     console.log("USER", value);
// });

export const API = async (url, data, headers = {}) => {
    if (!url.startsWith(BASE_URL)) {
        if (!url.startsWith("/")) {
            url = `/${url}`;
        }
        url = `${BASE_URL}${PREFIX_URL}${url}`;
    }

    if (!data) {
        data = {};
    }

    headers.GENOMEAPI = "GENOMEAPI";

    if (TOKEN) {
        headers.token = TOKEN;
    }

    // if (CNF.DEBUG) {
    //     console.log('API CALL [', url, ']:\n', data);
    // }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT);

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: JSON.stringify(data),
        signal: controller.signal
    };

    try {
        let cost = performance.now();
        const response = await fetch(url, options);

        if (!response.ok) {
            if (CNF.DEBUG) {
                console.error('API ERROR [', url, ']:', data, response, await response.text());
            }
            return false;
        }
        let initial = await response.text();

        if(response.headers.get("token")){
            TOKEN = response.headers.get("token");
            LOCAL.SET("token", TOKEN);
        }
        if(response.headers.get("user")){
            USER.set(JSON.parse(response.headers.get("user")));
        }
        
        cost = performance.now() - cost;
        let answer = "";

        try {
            answer = JSON.parse(initial);
        } catch (error) {
            answer = {
                success: false,
                message: initial
            };
        }

        if (answer.success === undefined) {
            if (CNF.DEBUG) {
                console.error('API UNSUCCESSFUL [', url, ']:', data, answer);
            }
            return false;
        }

        if (CNF.DEBUG) {
            console.log('API ANSWER [', url, '] ', cost, 'MS:\n', answer);
        }

        return answer;
    } catch (error) {
        if (CNF.DEBUG) {
            console.error('API ERROR [', url, ']:', data, error);
        }
        return false;
    }
};

export const PAGINATION = async (url, page, limit, query = {}) => {
    let result = await API(url, {
        pagination: {
            page: page,
            limit: limit,
        },
        ...query,
    });

    if (!result || !result.success) {
        return false;
    }

    return {
        extra: result.extra,
        data: result.data,
        total: result.extra.pagination.total,
        page: result.extra.pagination.page,
        limit: result.extra.pagination.limit,
        pages: result.extra.pagination.pages,
    };
}

let REDIRECT_URL = LOCAL.GET("auth.redirect_url") || "/";

export async function AUTH_CHECK() {
    let answer = await API(BASE_URL + "/SESSION/CHECK");
    if (answer.success) {
        if (answer.data != "SESSION") {
            return false;
        }
        return answer;
    }
    if (answer.data == "SESSION") {
        return false;
    }
    return false;
}

export async function AUTH_LOGIN(username, password) {
    let answer = await API(BASE_URL + "/SESSION/LOGIN", {
        username,
        password 
    });
    if (answer.success) {
        return answer;
    }
    if (answer.data == "SESSION") {
        return false;
    }
    return false;
}

export async function AUTH_REDIRECT_URL(hash) {
    if(hash){
        REDIRECT_URL = hash;
    }else{
        REDIRECT_URL = "/";
    }
    LOCAL.SET("auth.redirect_url", REDIRECT_URL);
}

export async function AUTH_REDIRECT() {
    GOTO(REDIRECT_URL, true);
}

export async function AUTH_LOGOUT() {
    TOKEN = null;
    LOCAL.REMOVE("token");
    COOKIE.REMOVE("token");
    GOTO("/", true);
}
