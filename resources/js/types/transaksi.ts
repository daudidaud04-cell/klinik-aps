export interface Pembayaran {
    id: number;
    nomor_pembayaran: string;
    pasien_id: number;
    tarif_id: number | null;
    jenis_layanan: string;
    subtotal: number;
    diskon: number;
    pajak: number;
    total: number;
    total_formatted: string;
    dibayar: number;
    kembalian: number;
    metode_bayar: string;
    metode_bayar_label: string;
    status: 'menunggu' | 'lunas' | 'gagal' | 'refund';
    status_label: string;
    catatan: string | null;
    tanggal_bayar: string | null;
    tanggal_bayar_formatted: string | null; // 🔧 tambahan: "11 Juli 2026"
    jam_bayar: string | null;               // 🔧 tambahan: "11:15"
    pasien?: { id: number; full_name: string; medical_record_number: string };
    kasir?: { id: number; name: string } | null;
    invoice?: Invoice | null;
}

export interface Invoice {
    id: number;
    nomor_invoice: string;
    pembayaran_id: number;
    pasien_id: number;
    items: object[];
    subtotal: number;
    diskon: number;
    pajak: number;
    total: number;
    total_formatted: string;
    status: 'draft' | 'terbit' | 'dibayar' | 'batal';
    status_label: string;
    tanggal_invoice: string;
    jatuh_tempo: string | null;
    catatan: string | null;
    pasien?: { id: number; full_name: string; medical_record_number: string; nik?: string; phone?: string; address?: string };
    pembayaran?: Pembayaran;
    dibuat_oleh?: { id: number; name: string } | null;
}

export interface PembayaranFormData {
    pasien_id: string;
    tarif_id: string;
    jenis_layanan: string;
    subtotal: string;
    diskon: string;
    pajak: string;
    total: string;
    dibayar: string;
    metode_bayar: string;
    status: string;
    catatan: string;
    tanggal_bayar: string;
}