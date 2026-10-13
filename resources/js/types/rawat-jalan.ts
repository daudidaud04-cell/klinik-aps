export interface KunjunganRawatJalan {
    id: number;
    nomor_kunjungan: string;
    pasien_id: number;
    poli_id: number;
    dokter_id: number;
    tanggal_kunjungan: string;
    jam_masuk: string | null;
    jam_keluar: string | null;
    status: 'menunggu' | 'dalam_pemeriksaan' | 'selesai' | 'batal';
    status_label: string;
    jenis_pembayaran: 'umum' | 'bpjs' | 'asuransi';
    jenis_pembayaran_label: string;
    nomor_bpjs: string | null;
    keluhan_utama: string | null;
    catatan: string | null;
    pasien?: {
        id: number;
        full_name: string;
        medical_record_number: string;
        nik?: string;
        gender?: string;
        birth_date?: string;
        phone?: string;
    };
    poli?: { id: number; nama_poli: string };
    dokter?: { id: number; name: string; specialization?: string | null };
    rekam_medis?: RekamMedisRelasi | null;
}

export interface RekamMedisRelasi {
    id: number;
    nomor_rekam_medis: string;
    status_bayar: string;
}

export interface KunjunganFormData {
    pasien_id: string;
    poli_id: string;
    dokter_id: string;
    tanggal_kunjungan: string;
    jam_masuk: string;
    status: string;
    jenis_pembayaran: string;
    nomor_bpjs: string;
    keluhan_utama: string;
    catatan: string;
}

export interface DropdownOption {
    id: number;
    [key: string]: string | number;
}
// ─── Tambahan untuk form Daftar Kunjungan ──────────────────────────────────

export interface Pasien {
    id: number;
    full_name: string;
    medical_record_number: string;
}

export interface DoctorOption {
    id: number;
    name: string;
    specialization?: string | null;
}

export interface PoliWithDoctors {
    id: number;
    nama_poli: string;
    doctors: DoctorOption[];
}