import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import authService from '../../services/authService';

const schema = z.object({
  name:                  z.string().min(1, 'Nama wajib diisi').max(255),
  email:                 z.string().email('Email tidak valid').max(255),
  password:              z.string().min(8, 'Password minimal 8 karakter'),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: 'Konfirmasi password tidak cocok',
  path: ['password_confirmation'],
});

const inputStyle = (hasError) => ({
  width: '100%',
  height: '52px',
  paddingLeft: '48px',
  paddingRight: '16px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.04)',
  border: `1px solid ${
    hasError ? '#ef4444' : 'rgba(255,255,255,0.08)'
  }`,
  color: '#fff',
  outline: 'none',
  transition: 'all .3s ease',
});

function PasswordInput({ register: reg, name, placeholder, error }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative', marginBottom: '28px' }}>
      <Lock
        size={18}
        style={{
          position: 'absolute',
          left: '0',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#666',
        }}
      />

      <input
        {...reg(name)}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${error ? '#ef4444' : '#333'}`,
          padding: '12px 40px',
          color: '#fff',
          fontSize: '18px',
          outline: 'none',
        }}
      />

      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: '#666',
          cursor: 'pointer',
        }}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authService.register(data);
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Registrasi berhasil');
      // Register selalu jadi role user → redirect ke customer
      navigate('/customer');
    } catch (err) {
      const errors422 = err.response?.data?.errors;
      if (errors422) {
        Object.entries(errors422).forEach(([field, msgs]) => {
          setError(field, { message: msgs[0] });
        });
      } else {
        toast.error(err.response?.data?.message || 'Registrasi gagal');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      background: '#050505',
    }}
  >
    {/* LEFT SIDE */}
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
      }}
    >
      <h3
        style={{
          color: '#f7b500',
          fontSize: '22px',
          fontWeight: '700',
          letterSpacing: '2px',
          marginBottom: '25px',
        }}
      >
        SIBER MERCH
      </h3>

      <h1
        style={{
          color: '#fff',
          fontSize: '90px',
          fontWeight: '900',
          lineHeight: '0.95',
          margin: 0,
        }}
      >
        SIBER
        <br />
        <span style={{ color: '#f7b500' }}>
          MERCH
        </span>
      </h1>

      <h4
        style={{
          color: '#f7b500',
          marginTop: '30px',
          fontSize: '22px',
          fontWeight: '600',
        }}
      >
        OFFICIAL MERCHANDISE SISTEM INFORMASI
      </h4>

      <p
        style={{
          color: '#9ca3af',
          maxWidth: '520px',
          lineHeight: '1.8',
          marginTop: '20px',
          fontSize: '16px',
        }}
      >
        Merchandise resmi Himpunan Mahasiswa Sistem Informasi
        dengan desain premium, modern, dan eksklusif untuk
        mahasiswa yang ingin tampil lebih percaya diri.
      </p>
    </div>

    {/* RIGHT SIDE */}
    <div
      style={{
        width: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
      }}
    >
      <div
        style={{
          width: '100%',
          background: '#0b0b0d',
          borderRadius: '28px',
          padding: '40px',
          boxShadow: '0 0 30px rgba(245,158,11,.12)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h2
            style={{
              color: '#fff',
              fontSize: '28px',
              fontWeight: '400',
              marginBottom: '12px',
            }}
          >
            REGISTER <span style={{ color: '#f7b500' }}>ACCOUNT</span>
          </h2>

          <div
            style={{
              width: '60px',
              height: '3px',
              background: '#f7b500',
              margin: '0 auto',
              borderRadius: '999px',
            }}
          />
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ position: 'relative', marginBottom: '25px' }}>
            <User
              size={18}
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666',
              }}
            />

            <input
              {...register('name')}
              type="text"
              placeholder="Masukkan Nama Lengkap"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${errors.name ? '#ef4444' : '#333'}`,
                padding: '12px 0 12px 40px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
              }}
            />

            {errors.name && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                {errors.name.message}
              </p>
            )}
          </div>

          <div style={{ position: 'relative', marginBottom: '25px' }}>
            <Mail
              size={18}
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#666',
              }}
            />

            <input
              {...register('email')}
              type="email"
              placeholder="Masukkan Email"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${errors.email ? '#ef4444' : '#333'}`,
                padding: '12px 0 12px 40px',
                color: '#fff',
                fontSize: '16px',
                outline: 'none',
              }}
            />

            {errors.email && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '5px' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <PasswordInput
            register={register}
            name="password"
            placeholder="Masukkan Password"
            error={errors.password}
          />

          {errors.password && (
            <p
              style={{
                color: '#ef4444',
                fontSize: '12px',
                marginTop: '-18px',
                marginBottom: '18px',
              }}
            >
              {errors.password.message}
            </p>
          )}

          <PasswordInput
            register={register}
            name="password_confirmation"
            placeholder="Konfirmasi Password"
            error={errors.password_confirmation}
          />

          {errors.password_confirmation && (
            <p
              style={{
                color: '#ef4444',
                fontSize: '12px',
                marginTop: '-18px',
                marginBottom: '18px',
              }}
            >
              {errors.password_confirmation.message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '56px',
              marginTop: '20px',
              border: 'none',
              borderRadius: '14px',
              background: '#f7b500',
              color: '#000',
              fontSize: '18px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
            }}
          >
            <UserPlus size={20} />
            {loading ? 'LOADING...' : 'REGISTER'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '25px',
            color: '#777',
            fontSize: '14px',
          }}
        >
          Sudah punya akun?
          <Link
            to="/login"
            style={{
              color: '#f7b500',
              fontWeight: '600',
              marginLeft: '5px',
              textDecoration: 'none',
            }}
          >
            Login sekarang
          </Link>
        </p>
      </div>
    </div>
  </div>
);
}
