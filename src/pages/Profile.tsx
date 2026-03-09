import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Header from "@/components/Header";
import { supabase } from "@/lib/supabaseClient";

const Profile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const numberInputRef = useRef<HTMLInputElement>(null);

    const maskPhone = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 11) {
            return numbers
                .replace(/^(\d{2})(\d)/g, "($1) $2")
                .replace(/(\d{5})(\d)/, "$1-$2");
        }
        return value;
    };

    const maskCEP = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 8) {
            return numbers.replace(/(\d{5})(\d)/, "$1-$2");
        }
        return value;
    };

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        cep: "",
        street: "",
        neighborhood: "",
        city: "",
        state: "",
        number: "",
        complement: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                navigate("/login");
                return;
            }

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                toast.error("Erro ao carregar perfil");
                console.error(error);
            }

            if (data) {
                setFormData({
                    fullName: data.full_name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    cep: data.cep || "",
                    street: data.street || "",
                    neighborhood: data.neighborhood || "",
                    city: data.city || "",
                    state: data.state || "",
                    number: data.number || "",
                    complement: data.complement || ""
                });
            } else {
                // Pre-fill with user meta-data if no profile exists yet
                setFormData(prev => ({
                    ...prev,
                    email: user.email || "",
                    phone: user.user_metadata?.phone || ""
                }));
            }
        };

        fetchProfile();
    }, [navigate]);
    const [loadingCep, setLoadingCep] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [loadingPassword, setLoadingPassword] = useState(false);

    const handlePasswordChange = async () => {
        if (!newPassword) {
            toast.error("Informe a nova senha");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            toast.error("As senhas não coincidem");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        setLoadingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            toast.success("Senha atualizada com sucesso!");
            setNewPassword("");
            setConfirmNewPassword("");
            setShowPasswordChange(false);
        } catch (error: any) {
            toast.error(error.message || "Erro ao atualizar senha");
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleCepLookup = async (cepCode: string) => {
        const cep = cepCode.replace(/\D/g, "");
        if (cep.length !== 8) return;

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                toast.error("CEP não encontrado");
            } else {
                setFormData(prev => ({
                    ...prev,
                    street: data.logradouro,
                    neighborhood: data.bairro,
                    city: data.localidade,
                    state: data.uf
                }));
                // Auto-focus to Number field after success
                setTimeout(() => {
                    numberInputRef.current?.focus();
                }, 100);
            }
        } catch (error) {
            toast.error("Erro ao buscar CEP");
        } finally {
            setLoadingCep(false);
        }
    };

    const handleSave = async () => {
        const mandatoryFields = [
            formData.fullName,
            formData.phone,
            formData.cep,
            formData.street,
            formData.neighborhood,
            formData.city,
            formData.state,
            formData.number
        ];

        if (mandatoryFields.some(field => !field.trim())) {
            toast.error("Todos os campos (exceto complemento) são obrigatórios");
            return;
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    cep: formData.cep,
                    street: formData.street,
                    neighborhood: formData.neighborhood,
                    city: formData.city,
                    state: formData.state,
                    number: formData.number,
                    complement: formData.complement,
                    updated_at: new Date().toISOString(),
                });

            if (profileError) throw profileError;

            toast.success("Perfil atualizado com sucesso!");
            window.dispatchEvent(new Event('storage')); // Trigger update in other components like Header
            navigate("/");
        } catch (error: any) {
            toast.error(error.message || "Erro ao salvar perfil");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Header cartCount={0} onCartToggle={() => { }} hideCart={true} />

            <div className="container mx-auto px-4 py-12">
                <Card className="mx-auto w-full max-w-2xl border-border shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-foreground">Perfil do Cliente</CardTitle>
                        <CardDescription>
                            Mantenha seus dados atualizados para facilitar seus agendamentos
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Nome Completo</Label>
                                <Input
                                    id="fullName"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone}
                                    placeholder="(00) 00000-0000"
                                    maxLength={15}
                                    onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
                                    className="border-border"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-mail</Label>
                                <Input
                                    id="email"
                                    value={formData.email}
                                    readOnly
                                    className="bg-secondary/50 border-border cursor-not-allowed"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    variant="outline"
                                    className="w-full border-primary text-primary hover:bg-primary/10"
                                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                                >
                                    Alterar Senha
                                </Button>
                            </div>
                        </div>

                        {showPasswordChange && (
                            <div className="space-y-4 rounded-lg bg-secondary/30 p-4 border border-border">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Nova Senha</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="border-border"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
                                    <Input
                                        id="confirmNewPassword"
                                        type="password"
                                        value={confirmNewPassword}
                                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        className="border-border"
                                    />
                                </div>
                                <Button
                                    className="w-full bg-primary text-primary-foreground h-9"
                                    onClick={handlePasswordChange}
                                    disabled={loadingPassword}
                                >
                                    {loadingPassword ? "Atualizando..." : "Confirmar Alteração"}
                                </Button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="cep">CEP</Label>
                                <Input
                                    id="cep"
                                    value={formData.cep}
                                    onChange={(e) => {
                                        const val = maskCEP(e.target.value);
                                        setFormData({ ...formData, cep: val });
                                        if (val.replace(/\D/g, "").length === 8) {
                                            handleCepLookup(val);
                                        }
                                    }}
                                    onBlur={() => handleCepLookup(formData.cep)}
                                    placeholder="00000-000"
                                    maxLength={9}
                                    className="border-border"
                                />
                                {loadingCep && <p className="text-xs text-primary animate-pulse">Buscando endereço...</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">Estado (UF)</Label>
                                <Input
                                    id="state"
                                    value={formData.state}
                                    readOnly
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="street">Logradouro</Label>
                            <Input
                                id="street"
                                value={formData.street}
                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                className="border-border"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="neighborhood">Bairro</Label>
                                <Input
                                    id="neighborhood"
                                    value={formData.neighborhood}
                                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                                    className="border-border"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Cidade</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    readOnly
                                    className="bg-secondary/50 border-border"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="number">Número</Label>
                                <Input
                                    id="number"
                                    ref={numberInputRef}
                                    value={formData.number}
                                    onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                    className="border-border"
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="complement">Complemento</Label>
                                <Input
                                    id="complement"
                                    value={formData.complement}
                                    onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                                    className="border-border"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4 border-t border-border pt-6">
                        <Button onClick={handleSave} className="bg-primary text-primary-foreground px-8 w-full sm:w-auto">Salvar Perfil</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
