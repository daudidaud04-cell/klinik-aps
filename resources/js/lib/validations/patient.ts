import { z } from 'zod';

const phoneRegex = /^[0-9+\-\s()]+$/;

export const patientSchema = z.object({
    nik: z
        .string()
        .optional()
        .transform((v) => v ?? '')
        .refine((v) => v === '' || /^\d{16}$/.test(v), {
            message: 'NIK harus 16 digit angka',
        }),

    full_name: z
        .string({ error: 'Nama lengkap wajib diisi' })
        .min(2, 'Nama minimal 2 karakter')
        .max(100, 'Nama maksimal 100 karakter'),

    gender: z.enum(['laki_laki', 'perempuan'], {
        error: 'Jenis kelamin wajib dipilih',
    }),

    birth_place: z
        .string({ error: 'Tempat lahir wajib diisi' })
        .min(2, 'Tempat lahir minimal 2 karakter')
        .max(50),

    birth_date: z
        .string({ error: 'Tanggal lahir wajib diisi' })
        .refine((d) => {
            if (!d) return false;
            return new Date(d) < new Date();
        }, 'Tanggal lahir harus sebelum hari ini'),

    blood_type: z.enum(['A', 'B', 'AB', 'O']).optional().or(z.literal('')),

    phone: z
        .string({ error: 'Nomor telepon wajib diisi' })
        .min(8, 'Nomor telepon minimal 8 karakter')
        .max(20)
        .regex(phoneRegex, 'Format nomor telepon tidak valid'),

    email: z.string().email('Format email tidak valid').max(100).optional().or(z.literal('')),

    address: z
        .string({ error: 'Alamat wajib diisi' })
        .min(5, 'Alamat minimal 5 karakter')
        .max(500),

    occupation: z.string().max(100).optional().or(z.literal('')),

    marital_status: z
        .enum(['belum_menikah', 'menikah', 'cerai_hidup', 'cerai_mati'])
        .optional()
        .or(z.literal('')),

    religion: z
        .enum(['islam', 'kristen', 'katolik', 'hindu', 'buddha', 'konghucu', 'lainnya'])
        .optional()
        .or(z.literal('')),

    insurance_type: z.enum(['BPJS', 'Umum', 'Asuransi']).optional().or(z.literal('')),

    insurance_number: z.string().max(50).optional().or(z.literal('')),

    emergency_contact_name: z.string().max(100).optional().or(z.literal('')),

    emergency_contact_phone: z
        .string()
        .max(20)
        .regex(phoneRegex, 'Format nomor tidak valid')
        .optional()
        .or(z.literal('')),

    patient_status: z.enum(['aktif', 'nonaktif']).default('aktif'),
});

export type PatientSchemaType = z.input<typeof patientSchema>;