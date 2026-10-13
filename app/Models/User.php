<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Role $role
 * @property string|null $phone
 * @property string|null $gender
 * @property string|null $address
 * @property string|null $photo
 * @property string|null $specialization
 * @property string $employee_status
 * @property Carbon|null $last_login_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'role', 'phone', 'gender', 'address', 'photo', 'specialization', 'employee_status'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'last_login_at' => 'datetime',
            'role' => Role::class,
        ];
    }

    // ─── Role Helpers ────────────────────────────────────────────────────
    public function hasRole(Role|string $role): bool
    {
        $value = $role instanceof Role ? $role->value : $role;

        return $this->role?->value === $value;
    }

    // ─── Scopes ──────────────────────────────────────────────────────────
    public function scopeActive($query)
    {
        return $query->where('employee_status', 'aktif');
    }

    public function scopeDokter($query)
    {
        return $query->where('role', Role::Dokter->value);
    }

    public function scopeByRole($query, Role|string $role)
    {
        $value = $role instanceof Role ? $role->value : $role;

        return $query->where('role', $value);
    }

    // ─── Accessors ───────────────────────────────────────────────────────
    public function getPhotoUrlAttribute(): string
    {
        return $this->photo
            ? asset('storage/'.$this->photo)
            : asset('images/default-avatar.png');
    }
}