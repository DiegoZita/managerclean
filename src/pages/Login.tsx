import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo-manager-clean.png";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";
import Header from "@/components/Header";

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from || "/";

    const maskPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 11) {
            return numbers
                .replace(/^(\d{2})(\d)/g, "($1) $2")
                .replace(/(\d{5})(\d)/, "$1-$2");
        }
        return value;
    };

    const handleAction = async () => {
        setLoading(true);
        try {
            if (isRegistering) {
                if (!formData.email || !formData.password || !formData.confirmPassword) {
                    toast.error("Por favor, preencha todos os campos");
                    return;
                }
                if (formData.password !== formData.confirmPassword) {
                    toast.error("As senhas não coincidem");
                    return;
                }

                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                });

                if (authError) throw authError;

                if (authData.user) {
                    // Create basic profile entry with just email
                    const { error: profileError } = await supabase
                        .from('profiles')
                        .insert([
                            {
                                id: authData.user.id,
                                email: formData.email,
                                created_at: new Date().toISOString()
                            }
                        ]);

                    if (profileError) {
                        console.error("Profile creation error:", profileError);
                        // Even if profile fails, user is created. We'll handle it in Profile page.
                    }
                }

                toast.success("Conta criada! Por favor, complete seu perfil.");
                navigate("/profile");
            } else {
                if (!formData.email || !formData.password) {
                    toast.error("Por favor, preencha email e senha");
                    return;
                }

                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });

                if (error) throw error;

                toast.success("Login realizado com sucesso!");
                navigate(from, { replace: true });
            }
        } catch (error: any) {
            toast.error(error.message || "Ocorreu um erro na autenticação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header cartCount={0} onCartToggle={() => { }} hideCart={true} />
            <div className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md border-border shadow-lg">
                    <CardHeader className="space-y-4 text-center">
                        <div className="mx-auto flex w-fit items-center justify-center">
                            <img src={logo} alt="Manager Clean" className="h-16 object-contain" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold text-foreground">
                                {isRegistering ? "Criar Conta" : "Login"}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                {isRegistering ? "Preencha os dados abaixo" : "Entre com sua conta para continuar"}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleAction();
                            }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    {/* Hidden input to trick autofill mechanisms on iOS */}
                                    <input type="text" style={{ display: 'none' }} aria-hidden="true" />
                                    <Input
                                        id="email"
                                        type="text"
                                        name="user_email_no_suggest"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        autoComplete="new-password"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                        spellCheck="false"
                                        className="border-border"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="user_password_no_suggest"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        autoComplete="new-password"
                                        autoCorrect="off"
                                        autoCapitalize="none"
                                        className="border-border pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            {isRegistering && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formData.confirmPassword}
                                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                            className="border-border pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            tabIndex={-1}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary py-6 text-lg font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
                            >
                                {loading ? "Processando..." : (isRegistering ? "Criar conta" : "Entrar")}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 text-center">
                        {!isRegistering && (
                            <Link
                                to="/forgot-password"
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Esqueceu sua senha?
                            </Link>
                        )}
                        <p className="text-sm text-muted-foreground">
                            {isRegistering ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
                            <button
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="font-bold text-primary hover:underline"
                            >
                                {isRegistering ? "Fazer Login" : "Criar conta"}
                            </button>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Login;
