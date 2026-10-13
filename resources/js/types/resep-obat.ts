export interface DetailResepObat {
    id?: number;
    resep_id?: number;
    obat_id: string;
    jumlah: string;
    aturan_pakai: string;
    keterangan: string;
    harga_satuan?: number;
    subtotal?: number;
    subtotal_formatted?: string;
    obat?: { id: number; kode_obat: string; nama_obat: string; satuan: string };
}

export interface ResepObat {
    id: number;
    nomor_resep: string;
    pasien_id: number;
    rekam_medis_id: number | null;
    dokter_id: number;
    tanggal_resep: string;
    status: 'menunggu' | 'diproses' | 'selesai' | 'batal';
    status_label: string;
    catatan: string | null;
    total_harga: number;
    total_harga_formatted: string;
    pasien?: { id: number; full_name: string; medical_record_number: string };
    dokter?: { id: number; name: string };
    details?: DetailResepObat[];
}

export interface ResepObatFormData {
    pasien_id: string;
    rekam_medis_id: string | null;
    dokter_id: string;
    tanggal_resep: string;
    status: string;
    catatan: string;
    details: DetailResepObat[];
}

export interface ObatOption {
    id: number;
    kode_obat: string;
    nama_obat: string;
    satuan: string;
    harga_jual: number;
    stok: number;
}