class CookieManager {
    set({name,value,days}={}) {
        if (!days) days = 1024;

        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));

        document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/;`;
    }

    get(name) {
        const cookies = [...document.cookie.split("; ")];
        for (let c of cookies) {
            c = c.split("=");
            if (c[0] === name)
                return c[1] 
        }

        return undefined;
    }

    delete(name) {
        document.cookie = `${name}=; expires=Wed, Jan 01 1800 00:00:00 UTC; path=/;`;
    }
}

const cookies = new CookieManager();

if (!cookies.get("LAINON_CHANNEL")) {
    cookies.set({
        name: "LAINON_CHANNEL",
        value: "cafe",
    });
}