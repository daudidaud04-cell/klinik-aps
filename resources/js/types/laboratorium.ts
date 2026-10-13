export interface JenisPemeriksaanLab {
    id: number;
    kode_pemeriksaan: string;
    nama_pemeriksaan: string;
    kategori: string;
    harga: number;
    harga_formatted?: string;
    satuan_hasil: string | null;
    nilai_normal_min: string | null;
    nilai_normal_max: string | null;
    nilai_normal_range?: string | null;
    estimasi_durasi_menit: number;
    status: string;
    status_label?: string;
}

export interface HasilLab {
    id?: number;
    pemeriksaan_id?: number;
    parameter: string;
    nilai: string;
    satuan: string;
    nilai_normal: string;
    keterangan: 'normal' | 'rendah' | 'tinggi' | '-';
    catatan: string;
}

export interface PemeriksaanLab {
    id: number;
    nomor_pemeriksaan: string;
    pasien_id: number;
    jenis_id: number;
    rekam_medis_id: number | null;
    petugas_id: number | null;
    tanggal_pemeriksaan: string;
    status: 'menunggu' | 'proses' | 'selesai' | 'batal';
    status_label: string;
    catatan: string | null;
    harga: number;
    harga_formatted: string;
    pasien?: { id: number; full_name: string; medical_record_number: string; nik?: string };
    jenis?: JenisPemeriksaanLab;
    petugas?: { id: number; name: string } | null;
    hasil_labs?: HasilLab[];
}

export interface PemeriksaanLabFormData {
    pasien_id: string;
    jenis_id: string;
    rekam_medis_id: string;
    petugas_id: string;
    tanggal_pemeriksaan: string;
    status: string;
    catatan: string;
    harga: string;
    hasil: HasilLab[];
}