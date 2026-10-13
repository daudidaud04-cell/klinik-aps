export interface Diagnosa {
    id?: number;
    rekam_medis_id?: number;
    kode_icd: string;
    nama_diagnosa: string;
    jenis: 'utama' | 'sekunder';
    keterangan: string;
}

export interface TindakanMedis {
    id?: number;
    rekam_medis_id?: number;
    tarif_id: string;
    nama_tindakan: string;
    keterangan: string;
    biaya: string;
    jumlah: string;
    subtotal_formatted?: string;
}

export interface DetailResep {
    id: number;
    resep_id?: number;
    obat_id: number;
    jumlah: number;
    aturan_pakai: string;
    keterangan: string | null;
    harga_satuan: number;
    subtotal: number;
    // 🔧 field ini dijamin ada karena DetailResepObat::$appends = ['subtotal_formatted']
    subtotal_formatted: string;
    obat?: {
        id: number;
        kode_obat: string;
        nama_obat: string;
        satuan: string;
    };
}

export interface ResepObat {
    id: number;
    nomor_resep: string;
    rekam_medis_id?: number;
    pasien_id?: number;
    dokter_id?: number | null;
    status: string;
    // 🔧 field ini dijamin ada karena ResepObat::$appends = ['status_label', 'total_harga_formatted']
    status_label: string;
    catatan: string | null;
    total_harga: number;
    total_harga_formatted: string;
    tanggal_resep: string;
    // 🔧 FIX: nama relasi di model ResepObat adalah details(), bukan detailResep()
    details?: DetailResep[];
}

export interface RekamMedis {
    id: number;
    nomor_rekam_medis: string;
    kunjungan_id: number;
    tarif_id: number | null;
    tekanan_darah: string | null;
    suhu_tubuh: number | null;
    nadi: number | null;
    pernapasan: number | null;
    berat_badan: number | null;
    tinggi_badan: number | null;
    imt: number | null;
    anamnesis: string | null;
    pemeriksaan_fisik: string | null;
    rencana_terapi: string | null;
    catatan_dokter: string | null;
    total_biaya: number;
    total_biaya_formatted: string;
    status_bayar: 'belum_bayar' | 'lunas' | 'cicilan';
    status_bayar_label: string;
    kunjungan?: import('./rawat-jalan').KunjunganRawatJalan;
    diagnosas?: Diagnosa[];
    tindakan_medis?: TindakanMedis[];
    tarif?: { id: number; nama_tarif: string } | null;
    // relasi resepObat() di model -> JSON key resep_obat
    resep_obat?: ResepObat | null;
}

export interface RekamMedisFormData {
    kunjungan_id: string;
    tarif_id: string;
    tekanan_darah: string;
    suhu_tubuh: string;
    nadi: string;
    pernapasan: string;
    berat_badan: string;
    tinggi_badan: string;
    anamnesis: string;
    pemeriksaan_fisik: string;
    rencana_terapi: string;
    catatan_dokter: string;
    total_biaya: string;
    status_bayar: string;
    diagnosas: Diagnosa[];
    tindakan: TindakanMedis[];
}