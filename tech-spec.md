Tentu, ini adalah spesifikasi teknis (Tech Spec) untuk aplikasi Budget Tracker yang Anda minta.

## Spesifikasi Teknis Aplikasi Budget Tracker 💰

### 1. Tujuan dan Ruang Lingkup

Aplikasi ini bertujuan untuk membantu pengguna (**Client**) melacak dan mengelola keuangan pribadi atau kelompok mereka (dalam satu **Client**) melalui fitur pencatatan transaksi (pendapatan/pengeluaran) yang dikelompokkan berdasarkan **Account**. Aplikasi akan menyediakan *dashboard* untuk menampilkan saldo dan riwayat transaksi.

| Keterangan | Nilai |
| :--- | :--- |
| **Framework Frontend** | Next.js (dengan React) |
| **Database** | MongoDB Online (misalnya: MongoDB Atlas) |
| **ORM** | Prisma |
| **State Management & Caching** | TanStack Query (React Query) |

***

### 2. Struktur Data (Skema Database - Prisma/MongoDB)

Skema database akan dimodelkan menggunakan Prisma ORM untuk MongoDB.

| Tabel (Model) | Field | Tipe Data (Prisma) | Keterangan | Relasi |
| :--- | :--- | :--- | :--- | :--- |
| **Client** | `id` | `String` (`@id @default(auto()) @map("_id") @db.ObjectId`) | ID unik Client (Root User) |
| | `name` | `String` | Nama Client (Nama perusahaan/grup/pengguna utama) |
| | `created_at` | `DateTime` (`@default(now())`) | Waktu pembuatan |
| **User** | `id` | `String` (`@id @default(auto()) @map("_id") @db.ObjectId`) | ID unik User |
| | `client_id` | `String` (`@db.ObjectId`) | ID Client tempat User terdaftar | Many-to-One ke **Client** |
| | `name` | `String` | Nama lengkap User |
| | `username` | `String` (`@unique`) | Username untuk login |
| | `email` | `String` (`@unique`) | Email User |
| | `password` | `String` | Hash Password User |
| | `created_at` | `DateTime` (`@default(now())`) | Waktu pembuatan |
| **Account** | `id` | `String` (`@id @default(auto()) @map("_id") @db.ObjectId`) | ID unik Account (misalnya: Kas, Bank A, E-Wallet) |
| | `name` | `String` | Nama Account |
| | `client_id` | `String` (`@db.ObjectId`) | ID Client pemilik Account | Many-to-One ke **Client** |
| | `created_at` | `DateTime` (`@default(now())`) | Waktu pembuatan |
| **Category** | `id` | `String` (`@id @default(auto()) @map("_id") @db.ObjectId`) | ID unik Category |
| | `name` | `String` | Nama Kategori (misalnya: Makanan, Gaji, Tagihan) |
| | `account_id` | `String?` (`@db.ObjectId`) | ID Account. **Kategori unik per Client** (bisa diakses oleh semua Account dalam 1 Client, tapi di-scope berdasarkan `client_id` untuk kemudahan, **REVISI:** lebih baik menggunakan `client_id` daripada `account_id` untuk *scope* kategori, agar kategori yang sama bisa dipakai di banyak akun dalam satu client). *Kita akan menggunakan `client_id` dalam implementasi logika, tapi di tabel kita ikuti spek awal dulu.* | Many-to-One ke **Account** (sesuai spek) |
| | `created_at` | `DateTime` (`@default(now())`) | Waktu pembuatan |
| **Trx (Transaction)** | `id` | `String` (`@id @default(auto()) @map("_id") @db.ObjectId`) | ID unik Transaksi |
| | `date_input` | `DateTime` | Tanggal transaksi |
| | `account_id` | `String` (`@db.ObjectId`) | Account yang terpengaruh | Many-to-One ke **Account** |
| | `user_input_id` | `String` (`@db.ObjectId`) | User yang menginput transaksi | Many-to-One ke **User** |
| | `total` | `Float` | Jumlah transaksi |
| | `is_expense` | `Boolean` | `true` jika Pengeluaran (Expense), `false` jika Pendapatan (Income) |
| | `note` | `String?` | Catatan tambahan |
| | `category_id` | `String?` (`@db.ObjectId`) | Category transaksi | Many-to-One ke **Category** |

***

### 3. Fitur Utama

#### 3.1. Autentikasi dan Manajemen User

* **Sign Up:**
    * Input: **Username**, **Password**, **Email**, dan **Nama Client** (yang akan menjadi `name` di tabel `Client`).
    * Logika: Membuat entri baru di tabel `Client` dan entri pertama di tabel `User` (sebagai admin/pengguna utama Client tersebut).
* **Login:**
    * Input: **Username** dan **Password**.
    * Logika: Verifikasi kredensial. Setelah berhasil, *session* atau *token* (misalnya JWT) akan dibuat dan disimpan (via *cookies*) untuk otorisasi API selanjutnya. Data `client_id` dari user akan digunakan untuk *scope* data (Account, Trx, Category).
* **Manajemen User Tambahan:**
    * User yang sudah login dapat menambahkan User lain ke **Client** yang sama (input: **Username**, **Password**, **Email**).

#### 3.2. Manajemen Account

* **Pembuatan Account:** User dapat membuat **Account** baru (misalnya "Dompet Utama", "Rekening BNI").
* **Peringatan Account:** Jika User belum memiliki **Account** (berdasarkan `client_id`), di *dashboard* akan muncul peringatan untuk membuat akun terlebih dahulu.

#### 3.3. Input Transaksi (Trx)

| Field Input | Tipe Input | Validasi/Keterangan |
| :--- | :--- | :--- |
| **Total** | Angka | Wajib diisi (misalnya: $>0$). |
| **Category** | Text Input dengan **Autocomplete** | Mencari dari kategori yang sudah ada dalam `client_id` saat ini. Jika kategori belum ada, kategori baru akan dibuat dan disimpan ke tabel `Category` dengan `client_id` User saat ini (sesuai revisi logika). |
| **Note** | Text | Opsional (Catatan transaksi). |
| **Expense/Income** | Radio Button/Toggle | Memilih tipe transaksi (`is_expense`: `true` atau `false`). |
| **Date Input** | Date Picker | Tanggal transaksi. Default: Hari ini. |
| **Account** | Dropdown (Pilihan) | Memilih dari list **Account** milik `client_id` saat ini. |

#### 3.4. Dashboard

* **Saldo Akumulatif:** Menghitung total saldo saat ini untuk **semua Account** dalam `client_id` User.
    * *Kalkulasi Saldo:* $\sum \text{Total Trx}$ di mana $\text{is\_expense} = \text{false} - \sum \text{Total Trx}$ di mana $\text{is\_expense} = \text{true}$.
* **List Transaksi:** Menampilkan daftar transaksi terbaru yang sudah diinputkan oleh semua User dalam `client_id` saat ini.
    * Tampilan: Tanggal, Account, Kategori, Total, dan Tipe (Income/Expense).

***

### 4. Detail Implementasi Teknis

#### 4.1. Backend (Next.js API Routes & Prisma)

* **Autentikasi:** Implementasi otentikasi menggunakan *session/token* (misalnya dengan NextAuth.js atau implementasi custom dengan JWT) untuk endpoint API yang aman.
* **Data Scoping:** Setiap *query* ke database (misalnya saat mengambil daftar Account, Category, atau Trx) **wajib** menyertakan filter `client_id` yang didapat dari sesi User yang sedang login.
* **Logika Kategori Autocomplete:**
    1.  API *endpoint* untuk mencari Kategori berdasarkan *keyword* dan `client_id`.
    2.  Saat menyimpan transaksi, jika nama Kategori baru, *backend* akan membuat entri baru di tabel `Category` dengan `client_id` yang sesuai, dan menggunakannya untuk `category_id` di tabel `Trx`.

#### 4.2. Frontend (Next.js & TanStack Query)

* **Routing:** Menggunakan *routing* bawaan Next.js (`/login`, `/signup`, `/dashboard`, `/accounts`, `/transactions/new`).
* **State & Caching:** **TanStack Query** akan digunakan untuk:
    * Mengambil data Saldo dan List Transaksi di Dashboard (dengan *caching* dan *stale time* yang sesuai).
    * Mengambil daftar Account dan Kategori untuk *form* input.
    * Mengelola *mutation* (POST/PUT) untuk input transaksi dan pembuatan Account/User.
* **Data Fetching:** Menggunakan *Server Components* (jika memungkinkan) atau *Client Components* dengan TanStack Query untuk fetching data dari Next.js API Routes.

***

### 5. Deployment

* **Database:** MongoDB Atlas
* **Aplikasi:** Vercel (direkomendasikan untuk Next.js)
