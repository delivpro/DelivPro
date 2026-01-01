import { supabase } from '../lib/supabase';

function Login() {
    const login = async () => {
        await supabase.auth.signInWithPassword({
            email: 'admin@delivpro.com',
            password: '123456'
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
            <button
                onClick={login}
                className="px-6 py-3 bg-primary text-white rounded-lg"
            >
                Entrar
            </button>
        </div>
    );
}

// Exportação explícita ao final
export default Login;