import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo-manager-clean.png";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";
import Header from "@/components/Header";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if there is a session/token being handled by Supabase
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event !== "PASSWORD_RECOVERY") {
                // If the user accessed this page without a recovery token/context, redirect
                // navigate("/login");
            }
        });
    }, [navigate]);

    const handleUpdatePassword = async () => {
        if (!password || !confirmPassword) {
            toast.error("Preencha todos os campos");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }
        if (password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            toast.success("Senha atualizada com sucesso!");
            setTimeout(() => navigate("/login"), 2000);
        } catch (error: any) {
            toast.error(error.message || "Erro ao atualizar senha");
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
                                Nova Senha
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Digite sua nova senha abaixo para concluir a recuperação.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="border-border pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="border-border"
                            />
                        </div>
                        <Button
                            onClick={handleUpdatePassword}
                            disabled={loading}
                            className="w-full bg-primary py-6 text-lg font-bold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
                        >
                            {loading ? "Atualizando..." : "Salvar Nova Senha"}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
