# AI Assistant Sendiri — Panduan Lengkap

Semua kode sudah jadi. Sisa 3 langkah ini saja: **Upload ke GitHub → Sambungkan ke Vercel → Isi key**.

---

## LANGKAH 1: Upload ke GitHub

1. Buka https://github.com/new
2. Kasih nama repo, misal `ai-assistant-sendiri`
3. Pilih **Public** atau **Private** (bebas)
4. **JANGAN** centang "Add README" (biar tidak bentrok)
5. Klik **Create repository**
6. Di halaman berikutnya, klik **"uploading an existing file"**
7. Drag semua isi folder ini (kecuali folder `node_modules` kalau ada) ke kotak upload
8. Klik **Commit changes**

---

## LANGKAH 2: Sambungkan ke Vercel

1. Buka https://vercel.com → daftar/login pakai akun **GitHub** kamu
2. Klik **Add New → Project**
3. Pilih repo `ai-assistant-sendiri` yang tadi kamu upload → klik **Import**
4. **Jangan langsung klik Deploy dulu** — scroll ke bagian **Environment Variables**

---

## LANGKAH 3: Isi Environment Variables

Di bagian Environment Variables Vercel, tambahkan 4 baris ini satu-satu (Name di kiri, Value di kanan):

| Name | Value |
|---|---|
| `OPENROUTER_API_KEY` | key dari openrouter.ai (`sk-or-v1-...`) |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ihymoclcdsxpfxnjylvx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publishable key dari Supabase (`sb_publishable_...`) |
| `NEXT_PUBLIC_SUPABASE_BUCKET` | `Uploads` |

Setelah semua terisi, klik **Deploy**.

Tunggu 1-2 menit, nanti Vercel kasih link website kamu (contoh: `ai-assistant-sendiri.vercel.app`). Itu link web app AI kamu yang sudah online dan bisa diakses siapa saja! 🎉

---

## Kalau mau uji coba dulu di laptop sebelum upload (opsional)

Kalau kamu punya Node.js terinstall di laptop:

```
npm install
```

Lalu copy file `.env.local.example` jadi `.env.local`, isi 4 key di atas ke situ, lalu jalankan:

```
npm run dev
```

Buka `http://localhost:3000` di browser.

---

## Catatan penting

- Model AI yang dipakai: `google/gemini-flash-1.5:free` (gratis, support foto)
- Kalau mau ganti model, edit file `app/api/chat/route.js`, baris `model:`
- File upload disimpan di Supabase Storage bucket `Uploads`
- Jangan pernah upload file `.env.local` ke GitHub (sudah otomatis dicegah lewat `.gitignore`)
