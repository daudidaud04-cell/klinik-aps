<?php

namespace App\Models;

use App\Support\Rbac;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class SystemUser extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'system_users';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'gender',
        'address',
        'photo',
        'specialization',
        'employee_status',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at'     => 'datetime',
            'password'          => 'hashed',
        ];
    }

    // ─── Role Helpers ───────────────────────────────────────────────────────────

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    public function hasPermission(string $permission): bool
    {
        return Rbac::allows($this, $permission);
    }

    public function hasAnyPermission(array $permissions): bool
    {
        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    public function isSuperAdmin(): bool { return $this->role === 'super_admin'; }
    public function isAdminKasir(): bool { return $this->role === 'admin_kasir'; }
    public function isDokter(): bool     { return $this->role === 'dokter'; }
    public function isApoteker(): bool   { return $this->role === 'apoteker'; }
    public function isLaboran(): bool    { return $this->role === 'laboran'; }

    // ─── Relationships ──────────────────────────────────────────────────────────

    public function createdPatients(): HasMany
    {
        return $this->hasMany(Patient::class, 'created_by');
    }

    // 🔧 FIX: relasi lama HasMany (lewat kolom doctor_id di tabel polis)
    // diganti jadi BelongsToMany lewat tabel pivot poli_dokter, konsisten
    // dengan relasi doctors() di model Poli. Dokter sekarang bisa terkait
    // ke banyak poli, bukan cuma satu.
    public function polis(): BelongsToMany
    {
        return $this->belongsToMany(Poli::class, 'poli_dokter', 'doctor_id', 'poli_id')
            ->withTimestamps();
    }

    public function patientHistories(): HasMany
    {
        return $this->hasMany(PatientHistory::class, 'doctor_id');
    }

    // ─── Scopes ─────────────────────────────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('employee_status', 'aktif');
    }

    public function scopeByRole(Builder $query, string $role): Builder
    {
        return $query->where('role', $role);
    }

    public function scopeDokter(Builder $query): Builder
    {
        return $query->where('role', 'dokter');
    }

    public function scopeSearch(Builder $query, ?string $search): Builder
    {
        if (!$search) return $query;

        return $query->where(function (Builder $q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%");
        });
    }

    // ─── Accessors ──────────────────────────────────────────────────────────────

    public function getRoleLabelAttribute(): string
    {
        return match ($this->role) {
            'super_admin' => 'Super Admin',
            'admin_kasir' => 'Admin / Kasir',
            'dokter'      => 'Dokter',
            'apoteker'    => 'Apoteker',
            'laboran'     => 'Laboran',
            default       => ucfirst($this->role),
        };
    }

    public function getPhotoUrlAttribute(): string
    {
        return $this->photo
            ? asset('storage/' . $this->photo)
            : asset('images/default-avatar.png');
    }
}