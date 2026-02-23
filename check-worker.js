export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // Hanya izinkan POST ke /validate
    if (url.pathname !== "/validate" || request.method !== "POST") {
      return new Response("Not Found", { status: 404 })
    }

    try {
      const data = await request.json()

      let { signature, timestamp, nonce, hmac } = data

      if (!signature || !timestamp || !nonce || !hmac) {
        return Response.json({ repo: "" })
      }

      // Normalisasi signature
      signature = signature.replace(/:/g, "").toUpperCase()

      // 1️⃣ Cek signature APK
      if (signature !== env.VALID_SIGNATURE) {
        return Response.json({ repo: "" })
      }

      // 2️⃣ Anti replay (maks 30 detik beda waktu)
      const now = Math.floor(Date.now() / 1000)
      if (Math.abs(now - timestamp) > 30) {
        return Response.json({ repo: "" })
      }

      // 3️⃣ Generate ulang HMAC
      const payload = `${signature}|${timestamp}|${nonce}`

      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(env.SECRET_KEY),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      )

      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(payload)
      )

      const expectedHmac = Array.from(new Uint8Array(signatureBuffer))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")

      if (expectedHmac !== hmac) {
        return Response.json({ repo: "" })
      }

      // ✅ Semua valid → kirim repo
      return Response.json({
        repo: "https://raw.githubusercontent.com/HXznxinhanba10fa9v-coDekxz/Csnwy7XzmNb/main/repo.json"
      })

    } catch (e) {
      return Response.json({ repo: "" })
    }
  }
}
