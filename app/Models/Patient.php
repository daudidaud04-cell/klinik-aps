<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Patient extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'medical_record_number',
        'nik',
        'full_name',
        'gender',
        'birth_place',
        'birth_date',
        'age',
        'blood_type',
        'phone',
        'email',
        'address',
        'occupation',
        'marital_status',
        'religion',
        'insurance_type',
        'insurance_number',
        'emergency_contact_name',
        'emergency_contact_phone',
        'patient_status',
        'created_by',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    // ─── Boot — Auto generate Nomor RM & hitung umur ────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (Patient $patient): void {
            if (empty($patient->medical_record_number)) {
                $patient->medical_record_number = self::generateMedicalRecordNumber();
            }
            if ($patient->birth_date) {
                $patient->age = Carbon::parse($patient->birth_date)->age;
            }
        });

        static::updating(function (Patient $patient): void {
            if ($patient->isDirty('birth_date') && $patient->birth_date) {
                $patient->age = Carbon::parse($patient->birth_date)->age;
            }
        });
    }

    public static function generateMedicalRecordNumber(): string
    {
        $latest = self::withTrashed()
            ->where('medical_record_number', 'like', 'RM%')
            ->orderByDesc('id')
            ->lockForUpdate()
            ->value('medical_record_number');

        $nextNumber = $latest ? (int) substr($latest, 2) + 1 : 1;

        return 'RM' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    // ─── Relationships ──────────────────────────────────────────────────────────

    public function creator(): BelongsTo
    {
        return $this->belongsTo(SystemUser::class, 'created_by');
    }

    public function histories(): HasMany
    {
        return $this->hasMany(PatientHistory::class);
    }

    // ─── Scopes ─────────────────────────────────────────────────────────────────

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) return $query;

        return $query->where(function (Builder $q) use ($search) {
            $q->where('full_name', 'like', "%{$search}%")
              ->orWhere('medical_record_number', 'like', "%{$search}%")
              ->orWhere('nik', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%");
        });
    }

    public function scopeFilterGender(Builder $query, ?string $gender): Builder
    {
        if (!$gender || !in_array($gender, ['laki_laki', 'perempuan'])) return $query;
        return $query->where('gender', $gender);
    }

    public function scopeFilterStatus(Builder $query, ?string $status): Builder
    {
        if (!$status || !in_array($status, ['aktif', 'nonaktif'])) return $query;
        return $query->where('patient_status', $status);
    }

    public function scopeFilterInsuranceType(Builder $query, ?string $type): Builder
    {
        if (!$type) return $query;
        return $query->where('insurance_type', $type);
    }

    public function scopeSorted(Builder $query, string $sortBy = 'created_at', string $sortDir = 'desc'): Builder
    {
        $allowed = ['full_name', 'medical_record_number', 'created_at', 'birth_date', 'patient_status'];
        $sortBy  = in_array($sortBy, $allowed) ? $sortBy : 'created_at';
        $sortDir = in_array(strtolower($sortDir), ['asc', 'desc']) ? $sortDir : 'desc';

        return $query->orderBy($sortBy, $sortDir);
    }

    // ─── Accessors ──────────────────────────────────────────────────────────────

    public function getGenderLabelAttribute(): string
    {
        return match ($this->gender) {
            'laki_laki' => 'Laki-laki',
            'perempuan' => 'Perempuan',
            default     => '-',
        };
    }

    public function getMaritalStatusLabelAttribute(): string
    {
        return match ($this->marital_status) {
            'belum_menikah' => 'Belum Menikah',
            'menikah'       => 'Menikah',
            'cerai_hidup'   => 'Cerai Hidup',
            'cerai_mati'    => 'Cerai Mati',
            default         => '-',
        };
    }

    public function getReligionLabelAttribute(): string
    {
        return match ($this->religion) {
            'islam'    => 'Islam',
            'kristen'  => 'Kristen',
            'katolik'  => 'Katolik',
            'hindu'    => 'Hindu',
            'buddha'   => 'Buddha',
            'konghucu' => 'Konghucu',
            'lainnya'  => 'Lainnya',
            default    => '-',
        };
    }

    // ─── Activity Log ────────────────────────────────────────────────────

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'full_name',
                'nik',
                'phone',
                'patient_status',
                'insurance_type',
            ])
            ->logOnlyDirty()
            ->useLogName('patient');
    }
}