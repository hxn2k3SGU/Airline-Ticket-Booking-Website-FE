import React from "react";
import { useTranslation } from 'react-i18next'
import { useNavigate } from "react-router-dom";
import { DangNhapClientServices } from "../../services/DangNhapClientServices";
import { getClientAccessToken, setClientAuthToken, setClientUserEmail } from "../../utils/cookieUtils";
import { apiUrl } from "../../config/api";

function DangNhap() {
  const { t } = useTranslation()
  const [showPass, setShowPass] = React.useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [matKhau, setMatKhau] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  // Kiểm tra nếu đã đăng nhập thì chuyển về trang chủ
  React.useEffect(() => {
    const accessToken = getClientAccessToken();
    if (accessToken) {
      navigate("/", { replace: true });
    } else {
      setIsCheckingAuth(false);
    }
  }, [navigate]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email.trim()) {
      setError("Email không được để trống!");
      return;
    }
    if (!validateEmail(email)) {
      setError("Định dạng email không hợp lệ!");
      return;
    }
    if (!matKhau.trim()) {
      setError("Mật khẩu không được để trống!");
      return;
    }

    setIsLoading(true);
    try {
      const userData = { email, matKhau };
      const { accessToken, refreshToken, message } = await DangNhapClientServices(userData);
      
      // Lưu tokens vào cookies sử dụng cookieUtils
      setClientAuthToken(accessToken, refreshToken);
      setClientUserEmail(email);
      
      setMessage(message || "🎉 Đăng nhập thành công!");
      setEmail("");
      setMatKhau("");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      setError(`❌ ${err.message || "Đã có lỗi xảy ra. Vui lòng thử lại."}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = apiUrl("/oauth2/authorization/google");
  };

  // Hiển thị loading khi đang kiểm tra authentication
  if (isCheckingAuth) {
    return (
      <>
        <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-gradient-to-br from-pink-50 via-yellow-50 to-white">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Đang kiểm tra...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div 
        className="min-h-[calc(100vh-70px)] flex items-center justify-center py-8 px-4 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: 'url(/background/auth/bg_footer.2f611c1f.webp)' }}
      >
        {/* Overlay để làm nổi bật form */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-50/80 via-yellow-50/80 to-white/80"></div>
        
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl grid md:grid-cols-2 overflow-hidden relative z-10">
          {/* Left Side - Form */}
          <div className="p-8 md:p-10">
            <div className="max-w-sm mx-auto">
              {/* Tiêu đề căn giữa và to hơn */}
              <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">{t('common.login')}</h1>
              <p className="text-sm text-gray-600 mb-6 text-center">{t('auth.welcome_back')} ✈️</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-1.5">
                    {t('auth.email_phone')}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-base pointer-events-none">📧</span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      id="email"
                      type="email"
                      className="w-full py-2.5 pr-10 pl-10 border-2 border-gray-200 rounded-lg text-sm transition-all bg-gray-50 focus:outline-none focus:border-red-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(227,6,19,0.1)]"
                      placeholder={t('auth.email_phone')}
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-800 mb-1.5">
                    {t('auth.password')}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-base pointer-events-none">🔒</span>
                    <input
                      value={matKhau}
                      onChange={(e) => setMatKhau(e.target.value)}
                      id="password"
                      type={showPass ? "text" : "password"}
                      className="w-full py-2.5 pr-10 pl-10 border-2 border-gray-200 rounded-lg text-sm transition-all bg-gray-50 focus:outline-none focus:border-red-600 focus:bg-white focus:shadow-[0_0_0_3px_rgba(227,6,19,0.1)]"
                      placeholder={t('auth.password')}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 bg-none border-none cursor-pointer text-base p-1"
                    >
                      {showPass ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4 text-xs">
                  <label className="flex items-center gap-1.5 text-gray-700 cursor-pointer">
                    <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer accent-red-600" />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <a href="/quen-mat-khau" className="text-red-600 no-underline font-medium hover:underline">
                    {t('auth.forgot_password')}
                  </a>
                </div>

                {error && (
                  <div className="py-2.5 px-3 rounded-lg text-xs mb-4 font-medium bg-red-50 text-red-700 border border-red-200">
                    {error}
                  </div>
                )}
                {message && (
                  <div className="py-2.5 px-3 rounded-lg text-xs mb-4 font-medium bg-green-50 text-green-800 border border-green-300">
                    {message}
                  </div>
                )}

                <button 
                  type="submit" 
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all shadow-[0_4px_15px_rgba(227,6,19,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(227,6,19,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  {isLoading ? t('common.processing') : t('common.login')}
                </button>

                <div className="flex items-center text-center my-5">
                  <div className="flex-1 border-b border-gray-200"></div>
                  <span className="px-3 text-gray-400 text-xs font-medium">{t('common.or')}</span>
                  <div className="flex-1 border-b border-gray-200"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-2.5 bg-white border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-800 cursor-pointer flex items-center justify-center gap-2 transition-all hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C44.438,36.338,48,30.638,48,24c0-2.659-0.238-5.35-0.689-7.917H43.611z" />
                  </svg>
                  <span>{t('auth.login_google')}</span>
                </button>

                <p className="text-center mt-5 text-xs text-gray-600">
                  {t('auth.no_account')} {" "}
                  <a href="/dang-ky-client" className="text-red-600 no-underline font-semibold hover:underline">
                    {t('auth.register_now')}
                  </a>
                </p>
              </form>
            </div>
          </div>

          {/* Right Side - Banner */}
          <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 md:p-10 flex items-center justify-center relative overflow-hidden">
            <div className="absolute -top-1/2 -right-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,213,0,0.15)_0%,transparent_70%)] animate-pulse-slow"></div>
            
            <div className="relative z-10 text-white">
              <h2 className="text-2xl font-bold mb-4 text-yellow-400 drop-shadow-md">
                Chào mừng bạn quay lại!
              </h2>
              <p className="text-sm leading-relaxed mb-6 opacity-95">
                Đăng nhập để trải nghiệm dịch vụ hàng không tốt nhất với giá vé ưu đãi
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-yellow-400/20 text-yellow-400 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">✓</span>
                  <span>Nhận ngay ưu đãi độc quyền</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-yellow-400/20 text-yellow-400 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">✓</span>
                  <span>Tích lũy điểm thưởng</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="bg-yellow-400/20 text-yellow-400 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs">✓</span>
                  <span>Hỗ trợ 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DangNhap;
