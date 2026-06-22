import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock, LogIn, Eye, EyeOff, ShoppingBag, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import authService from '../../services/authService';
import Button from '../common/Button';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

export default function LoginForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
  setLoading(true);

  try {
    const res = await authService.login(
  data.email,
  data.password
);

console.log(res);

localStorage.setItem(
  'token',
  res.data.access_token
);

localStorage.setItem(
  'user',
  JSON.stringify(res.data.user)
);

const roles = res.data.user?.roles || [];

    navigate(
      roles.includes('admin')
        ? '/admin/dashboard'
        : '/customer'
    );

  } catch (err) {

  console.log(err.response);

  const msg =
    err.response?.data?.message ||
    'Login gagal';

  const errors422 =
    err.response?.data?.errors;

  if (errors422?.email) {
    setError('email', {
      message: errors422.email[0],
    });
  } else {
    toast.error(msg);
  }

  } finally {
    setLoading(false);
  }
};

return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *{
          margin:0;
          padding:0;
          box-sizing:border-box;
        }

        body{
          background:#050505;
        }

        .slm-page{
          min-height:100vh;
          display:flex;
          background:#050505;
          font-family:'DM Sans',sans-serif;
          position:relative;
          overflow:hidden;
        }

        .slm-circle{
          position:absolute;
          border-radius:50%;
          filter:blur(10px);
          z-index:0;
        }

        .slm-circle-1{
          width:700px;
          height:700px;
          background:#ffb000;
          top:-220px;
          right:-120px;
          opacity:.12;
        }

        .slm-circle-2{
          width:500px;
          height:500px;
          background:#ff8800;
          top:-120px;
          right:50px;
          opacity:.10;
        }

        .slm-circle-3{
          width:320px;
          height:320px;
          background:#ffd000;
          bottom:-120px;
          left:28%;
          opacity:.06;
        }

        .slm-nav{
          position:absolute;
          top:0;
          left:0;
          right:0;
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:28px 60px;
          z-index:10;
        }

        .slm-nav-logo{
          display:flex;
          align-items:center;
          gap:10px;
          color:#fff;
          font-family:'Syne',sans-serif;
          font-weight:800;
          font-size:1.1rem;
        }

        .slm-nav-logo span{
          color:#ffb000;
        }

        .slm-left{
          flex:1;
          display:flex;
          flex-direction:column;
          justify-content:center;
          padding:120px 60px;
          position:relative;
          z-index:2;
        }

        .slm-headline{
          font-size:6rem;
          font-family:'Syne',sans-serif;
          font-weight:800;
          color:#fff;
          line-height:.9;
          margin-bottom:18px;
          text-shadow:0 0 40px rgba(255,176,0,.18);
        }

        .slm-headline span{
          color:#ffb000;
        }

        .slm-subheadline{
          font-size:1.1rem;
          color:#ffb000;
          margin-bottom:20px;
          font-weight:700;
          letter-spacing:.05em;
        }

        .slm-desc{
          max-width:430px;
          color:rgba(255,255,255,.6);
          line-height:1.9;
          margin-bottom:40px;
          font-size:.92rem;
        }

        .slm-btn-shop{
          width:fit-content;
          padding:14px 28px;
          border-radius:999px;
          background:#ffb000;
          color:#000;
          text-decoration:none;
          font-weight:700;
          display:flex;
          align-items:center;
          gap:10px;
          transition:.25s;
          box-shadow:0 0 25px rgba(255,176,0,.15);
        }

        .slm-btn-shop:hover{
          transform:translateY(-2px);
          background:#ffc933;
        }

        .slm-right{
          width:480px;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:40px;
          position:relative;
          z-index:2;
        }

        .slm-card{
          width:100%;
          background:#101010;
          border:1px solid rgba(255,176,0,.15);
          border-radius:24px;
          padding:45px 38px;
          box-shadow:
            0 0 40px rgba(255,176,0,.08),
            0 30px 80px rgba(0,0,0,.6);
          backdrop-filter:blur(8px);
        }

        .slm-card-brand{
          text-align:center;
          margin-bottom:34px;
        }

        .slm-card-brand h2{
          color:#fff;
          font-family:'Syne',sans-serif;
          font-size:2rem;
          margin-bottom:8px;
        }

        .slm-card-brand span{
          color:#ffb000;
        }

        .slm-divider{
          width:50px;
          height:3px;
          background:#ffb000;
          margin:auto;
          border-radius:999px;
        }

        .slm-field{
          margin-bottom:24px;
        }

        .slm-input-wrap{
          display:flex;
          align-items:center;
          border-bottom:1.5px solid #2d2d2d;
          transition:.25s;
        }

        .slm-input-wrap:focus-within{
          border-color:#ffb000;
        }

        .slm-input-icon{
          color:#777;
          margin-right:10px;
        }

        .slm-input{
          flex:1;
          background:transparent;
          border:none;
          padding:14px 0;
          color:#fff;
          outline:none;
          font-size:.95rem;
        }

        .slm-input::placeholder{
          color:#555;
        }

        .slm-toggle{
          background:none;
          border:none;
          color:#777;
          cursor:pointer;
        }

        .slm-toggle:hover{
          color:#ffb000;
        }

        .slm-error{
          color:#ff5f5f;
          font-size:.75rem;
          margin-top:6px;
        }

        .slm-login-btn{
          width:100%;
          height:54px;
          border:none;
          border-radius:12px;
          background:#ffb000;
          color:#000;
          font-family:'Syne',sans-serif;
          font-weight:800;
          font-size:1rem;
          letter-spacing:.08em;
          cursor:pointer;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:10px;
          transition:.25s;
          margin-top:10px;
          box-shadow:0 0 30px rgba(255,176,0,.18);
        }

        .slm-login-btn:hover{
          background:#ffc933;
          transform:translateY(-2px);
        }

        .slm-login-btn:disabled{
          opacity:.7;
          cursor:not-allowed;
        }

        .slm-bottom{
          text-align:center;
          margin-top:22px;
          color:#777;
          font-size:.88rem;
        }

        .slm-bottom a{
          color:#ffb000;
          text-decoration:none;
          font-weight:700;
        }

        .slm-bottom a:hover{
          color:#ffd54a;
        }

        .slm-loading{
          display:flex;
          gap:4px;
        }

        .slm-loading span{
          width:5px;
          height:5px;
          background:#000;
          border-radius:50%;
          animation:bounce 1s infinite;
        }

        .slm-loading span:nth-child(2){
          animation-delay:.2s;
        }

        .slm-loading span:nth-child(3){
          animation-delay:.4s;
        }

        @keyframes bounce{
          0%,80%,100%{
            transform:translateY(0);
            opacity:.4;
          }
          40%{
            transform:translateY(-5px);
            opacity:1;
          }
        }

        @media(max-width:960px){

          .slm-page{
            flex-direction:column;
          }

          .slm-left{
            padding:120px 30px 50px;
          }

          .slm-headline{
            font-size:4rem;
          }

          .slm-right{
            width:100%;
            padding:20px;
          }

          .slm-nav{
            padding:24px;
          }
        }
      `}</style>

      <div className="slm-page">

        <div className="slm-circle slm-circle-1"></div>
        <div className="slm-circle slm-circle-2"></div>
        <div className="slm-circle slm-circle-3"></div>

        <nav className="slm-nav">
          <div className="slm-nav-logo">
            <ShoppingBag size={20} />
            SIBER <span>MERCH</span>
          </div>
        </nav>

        <div className="slm-left">
          <h1 className="slm-headline">
            SIBER <span>MERCH</span>
          </h1>

          <div className="slm-subheadline">
            OFFICIAL MERCHANDISE SISTEM INFORMASI
          </div>

          <p className="slm-desc">
            Merchandise resmi Mahasiswa Sistem Informasi
            dengan desain modern, premium, dan eksklusif
            untuk menunjang style mahasiswa masa kini.
          </p>

          <a href="/" className="slm-btn-shop">
            <ShoppingBag size={18} />
            Lihat Koleksi
          </a>
        </div>

        <div className="slm-right">

          <div className="slm-card">

            <div className="slm-card-brand">
              <h2>
                LOGIN <span>ACCOUNT</span>
              </h2>
              <div className="slm-divider"></div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>

              <div className="slm-field">
                <div className="slm-input-wrap">

                  <div className="slm-input-icon">
                    <Mail size={17} />
                  </div>

                  <input
                    {...register('email')}
                    type="email"
                    placeholder="Masukkan Email"
                    className="slm-input"
                  />

                </div>

                {errors.email && (
                  <p className="slm-error">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="slm-field">

                <div className="slm-input-wrap">

                  <div className="slm-input-icon">
                    <Lock size={17} />
                  </div>

                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan Password"
                    className="slm-input"
                  />

                  <button
                    type="button"
                    className="slm-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    {showPassword
                      ? <EyeOff size={17} />
                      : <Eye size={17} />
                    }
                  </button>

                </div>

                {errors.password && (
                  <p className="slm-error">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="slm-login-btn"
                disabled={loading}
              >

                {loading ? (
                  <div className="slm-loading">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <>
                    <ArrowRight size={18} />
                    LOGIN
                  </>
                )}

              </button>

            </form>

            <div className="slm-bottom">
              Belum punya akun?{' '}
              <Link to="/register">
                Daftar sekarang
              </Link>
            </div>

          </div>

        </div>
      </div>
    </>
  );
}