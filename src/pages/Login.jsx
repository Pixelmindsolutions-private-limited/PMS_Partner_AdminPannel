import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle,
    Loader2,
    Building2,
    CalendarCheck,
    Users,
} from "lucide-react";

import logoSquare from "../assets/logo1.png";
import logoWide from "../assets/logo2.png";

/* ------------------------------------------------------------------ */
/* Static data (outside the component so it's never re-created)        */
/* ------------------------------------------------------------------ */

const PANEL_NAME = "PMS Partner Admin Panel";
const LOGIN_URL = "http://31.97.228.17:4478/api/admin/login";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GRADIENT = "bg-gradient-to-br from-[#075d59] via-[#09877f] to-[#12aaa0]";
const INITIAL_VALUES = { email: "", password: "", remember: false };

const highlights = [
    { icon: Building2, text: "Add and manage your properties" },
    { icon: CalendarCheck, text: "Track bookings and availability" },
    { icon: Users, text: "Keep guest details in one place" },
];

/* ------------------------------------------------------------------ */
/* API                                                                 */
/* Success: { success: true, message: "...", token: "..." }            */
/* ------------------------------------------------------------------ */

async function loginRequest({ email, password }) {
    let res;

    try {
        res = await fetch(LOGIN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
    } catch {
        throw new Error("Unable to reach the server. Check your connection and try again.");
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success || !data.token) {
        throw new Error(data.message || "Invalid email or password.");
    }

    return data.token;
}

/* ------------------------------------------------------------------ */
/* Input field (handles its own show/hide toggle for passwords)        */
/* ------------------------------------------------------------------ */

function Field({ id, label, icon: Icon, error, type = "text", ...props }) {
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";

    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
                {label}
            </label>

            <div className="relative">
                <Icon
                    size={18}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                    id={id}
                    type={isPassword && visible ? "text" : type}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={`w-full rounded-xl border bg-white py-3 pl-10 text-base text-gray-800 outline-none transition placeholder:text-gray-400 focus:ring-4 sm:py-2.5 sm:text-sm ${
                        isPassword ? "pr-12" : "pr-4"
                    } ${
                        error
                            ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                            : "border-gray-200 focus:border-[#09877f] focus:ring-[#e8f7f5]"
                    }`}
                    {...props}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setVisible((v) => !v)}
                        aria-label={visible ? "Hide password" : "Show password"}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-[#075d59] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#09877f]"
                    >
                        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>

            {error && (
                <p id={`${id}-error`} className="mt-1.5 text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Login                                                               */
/* ------------------------------------------------------------------ */

function Login() {
    const navigate = useNavigate();
    const [values, setValues] = useState(INITIAL_VALUES);
    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = ({ target: { name, value, type, checked } }) => {
        setValues((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
        setFormError("");
    };

    const validate = () => {
        const next = {};
        const email = values.email.trim();

        if (!email) next.email = "Enter your email address";
        else if (!EMAIL_REGEX.test(email)) next.email = "Enter a valid email address";

        if (!values.password) next.password = "Enter your password";
        else if (values.password.length < 6)
            next.password = "Password must be at least 6 characters";

        setErrors(next);
        return !Object.keys(next).length;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading || !validate()) return;

        setLoading(true);
        setFormError("");

        const email = values.email.trim();

        try {
            const token = await loginRequest({ email, password: values.password });

            sessionStorage.setItem("adminToken", token);
            sessionStorage.setItem("adminEmail", email);

            navigate("/dashboard", { replace: true });
        } catch (err) {
            setFormError(err.message);
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-[100dvh] flex-col bg-gray-50 lg:flex-row">
            {/* ============================= */}
            {/* Desktop brand panel           */}
            {/* ============================= */}
            <aside
                className={`relative hidden w-1/2 max-w-[560px] flex-col justify-around overflow-hidden p-12 text-white lg:flex xl:max-w-[640px] ${GRADIENT}`}
            >
                <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/5" />

                <div className="relative aspect-video w-52 rounded-2xl bg-white p-3 shadow-lg shadow-black/10">
                    <img src={logoWide} alt="PMS logo" className="h-full w-full object-contain" />
                </div>

                <div className="relative">
                    <h1 className="text-4xl font-bold leading-tight tracking-tight">{PANEL_NAME}</h1>

                    <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
                        Sign in to manage your properties, bookings and guests from one place.
                    </p>

                    <ul className="mt-8 space-y-3">
                        {highlights.map(({ icon: Icon, text }) => (
                            <li key={text} className="flex items-center gap-3 text-sm text-white/90">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                                    <Icon size={16} />
                                </span>
                                {text}
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* ============================= */}
            {/* Mobile / tablet teal header   */}
            {/* ============================= */}
            <header
                className={`rounded-b-[2rem] px-6 pb-20 pt-10 text-center text-white sm:pt-14 lg:hidden ${GRADIENT}`}
            >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-2.5 shadow-lg shadow-black/10">
                    <img src={logoSquare} alt="PMS logo" className="h-full w-full object-contain" />
                </div>

                <h1 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">{PANEL_NAME}</h1>
                <p className="mt-1 text-sm text-white/70">Manage properties, bookings and guests</p>
            </header>

            {/* ============================= */}
            {/* Form                          */}
            {/* ============================= */}
            <section className="flex flex-1 justify-center px-4 pb-8 sm:px-8 lg:items-center lg:py-10">
                <div className="relative -mt-12 w-full max-w-md lg:mt-0">
                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg shadow-[#075d59]/5 sm:p-8 lg:shadow-sm">
                        <h2 className="text-xl font-bold tracking-tight text-gray-800 sm:text-2xl">
                            Welcome back
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">Sign in to your partner account.</p>

                        {formError && (
                            <div
                                role="alert"
                                className="mt-5 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-600"
                            >
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{formError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
                            <Field
                                id="email"
                                name="email"
                                type="email"
                                label="Email"
                                icon={Mail}
                                placeholder="partner@company.com"
                                autoComplete="email"
                                inputMode="email"
                                value={values.email}
                                onChange={handleChange}
                                error={errors.email}
                                disabled={loading}
                            />

                            <Field
                                id="password"
                                name="password"
                                type="password"
                                label="Password"
                                icon={Lock}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                value={values.password}
                                onChange={handleChange}
                                error={errors.password}
                                disabled={loading}
                            />

                            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                                <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={values.remember}
                                        onChange={handleChange}
                                        disabled={loading}
                                        className="h-4 w-4 rounded border-gray-300 accent-[#087f78]"
                                    />
                                    Remember me
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="text-sm font-semibold text-[#07877f] transition hover:text-[#075d59]"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087f78] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#075d59] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#12aaa0]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 sm:py-3"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={17} className="animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign in"
                                )}
                            </button>
                        </form>
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-400">
                        Need access? Contact the platform administrator.
                    </p>
                </div>
            </section>
        </main>
    );
}

export default Login;