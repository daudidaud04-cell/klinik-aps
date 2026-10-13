export type Gender = 'laki_laki' | 'perempuan';
export type BloodType = 'A' | 'B' | 'AB' | 'O';
export type MaritalStatus = 'belum_menikah' | 'menikah' | 'cerai_hidup' | 'cerai_mati';
export type Religion = 'islam' | 'kristen' | 'katolik' | 'hindu' | 'buddha' | 'konghucu' | 'lainnya';
export type InsuranceType = 'BPJS' | 'Umum' | 'Asuransi';
export type PatientStatus = 'aktif' | 'nonaktif';

export interface Patient {
    id: number;
    medical_record_number: string;
    nik: string | null;
    full_name: string;
    gender: Gender;
    birth_place: string;
    birth_date: string;
    age: number | null;
    blood_type: BloodType | null;
    phone: string;
    email: string | null;
    address: string;
    occupation: string | null;
    marital_status: MaritalStatus | null;
    religion: Religion | null;
    insurance_type: InsuranceType | null;
    insurance_number: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    patient_status: PatientStatus;
    created_by: number;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    creator?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedPatients {
    data: Patient[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
    prev_page_url: string | null;
    next_page_url: string | null;
}

export interface PatientFilters {
    search?: string;
    gender?: Gender | '';
    status?: PatientStatus | '';
    insurance_type?: InsuranceType | '';
    sort_by?: string;
    sort_dir?: 'asc' | 'desc';
    per_page?: number;
}

export const GENDER_LABELS: Record<Gender, string> = {
    laki_laki: 'Laki-laki',
    perempuan: 'Perempuan',
};

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
    belum_menikah: 'Belum Menikah',
    menikah: 'Menikah',
    cerai_hidup: 'Cerai Hidup',
    cerai_mati: 'Cerai Mati',
};

export const RELIGION_LABELS: Record<Religion, string> = {
    islam: 'Islam',
    kristen: 'Kristen',
    katolik: 'Katolik',
    hindu: 'Hindu',
    buddha: 'Buddha',
    konghucu: 'Konghucu',
    lainnya: 'Lainnya',
};

export const INSURANCE_TYPE_LABELS: Record<InsuranceType, string> = {
    BPJS: 'BPJS',
    Umum: 'Umum / Pribadi',
    Asuransi: 'Asuransi Swasta',
};