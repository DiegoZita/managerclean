import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import logo from "@/assets/logo-manager-clean.png";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import { ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleResetPassword = async () => {
        if (!email) {
            toast.error("Por favor, informe seu e-mail");
            return;
        }

        setLoading(true);
        const cleanEmail = email.trim();

        try {
            // First, check if the email exists in our profiles table (case-insensitive)
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('email')
                .ilike('email', cleanEmail)
                .maybeSingle();

            if (profileError) {
                console.error("Erro ao verificar perfil:", profileError);
                throw profileError;
            }

            if (!profile) {
                setErrorMsg("Este e-mail não possui cadastro no sistema.");
                setLoading(false);
                return;
            }

            setErrorMsg("");

            const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            setSubmitted(true);
            toast.success("E-mail de recuperação enviado com sucesso!");
        } catch (error: any) {
            toast.error(error.message || "Erro ao enviar e-mail de recuperação");
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
                                Recuperar Senha
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                {submitted
                                    ? "Verifique sua caixa de entrada para redefinir sua senha."
                                    : "Informe seu e-mail para receber as instruções de recuperação."}
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {!submitted ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errorMsg) setErrorMsg("");
                                        }}
                                        className={`border-border ${errorMsg ? 'border-red-500 ring-red-500' : ''}`}
                                    />
                                    {errorMsg && (
                                        <p className="text-[12px] font-medium text-red-500 mt-1 animate-in fade-in slide-in-from-top-1">
                                            {errorMsg}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    onClick={handleResetPassword}
                                    disabled={loading}
                                    className="w-full bg-primary py-6 text-lg font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
                                >
                                    {loading ? "Enviando..." : "Enviar instruções"}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-slate-500 mb-6">
                                    Não recebeu o e-mail? Verifique sua pasta de spam ou tente novamente em alguns minutos.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => setSubmitted(false)}
                                    className="w-full"
                                >
                                    Tentar outro e-mail
                                </Button>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link
                            to="/login"
                            className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Voltar para o login
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default ForgotPassword;
