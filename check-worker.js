addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const url = new URL(request.url)

    if (url.pathname !== "/secure-check" || request.method !== "POST") {
        return new Response("Not Found", { status: 404 })
    }

    try {
        const data = await request.json()
        const signature = data.signature?.replace(/:/g, "").toUpperCase()
        const VALID_SIGNATURE = SECRET_VALID_SIGNATURE

        if (signature === VALID_SIGNATURE) {
            return Response.json({
                repo: "https://raw.githubusercontent.com/HXznxinhanba10fa9v-coDekxz/Csnwy7XzmNb/main/repo.json"
            })
        } else {
            return Response.json({ repo: "" })
        }
    } catch {
        return Response.json({ repo: "" })
    }
}
