---
inclusion: always
---

# Life Dashboard – Project Steering

## Deskripsi Proyek
Website **To-Do List Life Dashboard** yang dibangun dengan HTML, CSS murni, dan Vanilla JavaScript. Tidak ada framework, tidak ada backend, dan tidak ada database.

## Struktur Proyek
```
ToDoLifeDashboard/
├── index.html          ← Entry point utama
├── css/
│   └── style.css       ← Satu-satunya file CSS (light/dark mode, responsif)
├── js/
│   └── script.js       ← Satu-satunya file JS (semua logika)
├── .kiro/
│   └── steering/
│       └── project.md  ← File ini
└── README.md
```

## Fitur Utama
1. **Jam Digital & Tanggal** – diperbarui setiap detik via `setInterval`.
2. **Sapaan Otomatis** – Selamat Pagi/Siang/Sore/Malam sesuai jam lokal.
3. **Focus Timer Pomodoro** – 25 menit, tombol Start/Stop/Reset.
4. **To-Do List** – add/edit/complete/delete, disimpan di LocalStorage.
5. **Quick Links** – tambah/hapus tautan favorit, disimpan di LocalStorage.

## Tantangan (Challenges)
1. **Light/Dark Mode** – toggle dengan persist di LocalStorage + respek `prefers-color-scheme`.
2. **Custom Name in Greeting** – nama tersimpan di LocalStorage, muncul di sapaan.
3. **Prevent Duplicate Tasks** – cek case-insensitive sebelum menambahkan tugas.

## Aturan Pengembangan
- **Hanya satu file CSS** di folder `css/`.
- **Hanya satu file JS** di folder `js/`.
- Tidak boleh ada framework (React, Vue, Angular, dll.).
- Tidak boleh ada backend atau database.
- Gunakan `localStorage` untuk semua persistensi data.
- Kode harus bersih, berkomenmtar, dan aman (escape HTML untuk XSS prevention).

## LocalStorage Keys
| Key                  | Isi                          |
|----------------------|------------------------------|
| `dashboard_name`     | Nama pengguna (string)       |
| `dashboard_theme`    | `"light"` atau `"dark"`      |
| `dashboard_todos`    | Array JSON objek tugas       |
| `dashboard_links`    | Array JSON objek quick links |

## Deployment
Siap dipublikasikan via **GitHub Pages** langsung dari root repository.
