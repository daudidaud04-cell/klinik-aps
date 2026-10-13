export interface RawatInap {
    id: number;
    nomor_rawat_inap: string;
    pasien_id: number;
    kamar_id: number;
    dokter_id: number;
    rekam_medis_id: number | null;
    tanggal_masuk: string;
    tanggal_keluar: string | null;
    lama_inap: number | null;
    status: 'aktif' | 'pindah_kamar' | 'pulang' | 'meninggal' | 'pulang_paksa';
    status_label: string;
    jenis_pembayaran: 'umum' | 'bpjs' | 'asuransi';
    jenis_pembayaran_label: string;
    nomor_bpjs: string | null;
    diagnosa_masuk: string | null;
    catatan: string | null;
    total_biaya: number;
    total_biaya_formatted: string;
    status_bayar: 'belum_bayar' | 'lunas' | 'cicilan';
    status_bayar_label: string;
    pasien?: {
        id: number;
        full_name: string;
        medical_record_number: string;
        nik?: string;
        phone?: string;
        gender?: string;
        birth_date?: string;
    };
    kamar?: {
        id: number;
        kode_kamar: string;
        nama_kamar: string;
        kelas: string;
        tarif_harian?: number;
    };
    dokter?: {
        id: number;
        name: string;
        specialization?: string | null;
    };
    details?: DetailRawatInap[];
    pemindahan_kamars?: PemindahanKamar[];
}

export interface DetailRawatInap {
    id: number;
    rawat_inap_id: number;
    tanggal: string;
    tekanan_darah: string | null;
    suhu_tubuh: number | null;
    nadi: number | null;
    pernapasan: number | null;
    perkembangan: string | null;
    tindakan_harian: string | null;
    instruksi_dokter: string | null;
    biaya_harian: number;
    biaya_harian_formatted: string;
    dicatat_oleh?: { id: number; name: string } | null;
}

export interface PemindahanKamar {
    id: number;
    rawat_inap_id: number;
    kamar_asal_id: number;
    kamar_tujuan_id: number;
    tanggal_pindah: string;
    alasan: string | null;
    kamar_asal?: { id: number; kode_kamar: string; nama_kamar: string };
    kamar_tujuan?: { id: number; kode_kamar: string; nama_kamar: string };
}

export interface KamarOption {
    id: number;
    kode_kamar: string;
    nama_kamar: string;
    kelas: string;
    kapasitas: number;
    terisi: number;
    tarif_harian: number;
    status: string;
}

export interface RawatInapFormData {
    pasien_id: string;
    kamar_id: string;
    dokter_id: string;
    rekam_medis_id: string;
    tanggal_masuk: string;
    tanggal_keluar: string;
    status: string;
    jenis_pembayaran: string;
    nomor_bpjs: string;
    diagnosa_masuk: string;
    catatan: string;
    total_biaya: string;
    status_bayar: string;
}