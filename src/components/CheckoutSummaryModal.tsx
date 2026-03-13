import { MapPin, User, ArrowLeft } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface CheckoutSummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBack: () => void;
    onAdvance: () => void;
    customerData: {
        address: string;
        number: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
        name: string;
        phone: string;
        cpf: string;
        email: string;
    } | null;
}

const CheckoutSummaryContent = ({ onBack, onAdvance, customerData, onProfileUpdate }: { onBack: () => void; onAdvance: () => void; customerData: any, onProfileUpdate?: (id: string) => void }) => {
    const navigate = useNavigate();
    const numberInputRef = useRef<HTMLInputElement>(null);
    const [cep, setCep] = useState("");
    const [editNumber, setEditNumber] = useState(customerData?.number || "");
    const [loadingCep, setLoadingCep] = useState(false);
    const [fetchedAddress, setFetchedAddress] = useState<any>(null);
    const [isAlteringAddress, setIsAlteringAddress] = useState(false);
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [editName, setEditName] = useState(customerData?.name || "");
    const [editPhone, setEditPhone] = useState(customerData?.phone || "");

    useEffect(() => {
        if (customerData?.name) setEditName(customerData.name);
        if (customerData?.phone) setEditPhone(customerData.phone);
        if (customerData?.number) setEditNumber(customerData.number);
    }, [customerData?.name, customerData?.phone, customerData?.number]);

    const handleCepLookup = async (cepCode: string) => {
        const cleanedCep = cepCode.replace(/\D/g, "");
        if (cleanedCep.length !== 8) return;

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
            const data = await response.json();
            if (data.erro) {
                toast.error("CEP não encontrado");
            } else {
                setFetchedAddress(data);
                // Auto focus on number input after CEP lookup
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

    const handleSaveAddress = async () => {
        if (!fetchedAddress && !cep) {
            setIsAlteringAddress(false);
            return;
        }

        const targetCep = cep.replace(/\D/g, "") || customerData?.zipCode;
        const targetAddress = fetchedAddress?.logradouro || customerData?.address;
        const targetBairro = fetchedAddress?.bairro || customerData?.neighborhood;
        const targetCity = fetchedAddress?.localidade || customerData?.city;
        const targetState = fetchedAddress?.uf || customerData?.state;

        if (customerData?.id) {
            try {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        street: targetAddress,
                        neighborhood: targetBairro,
                        city: targetCity,
                        state: targetState,
                        cep: targetCep,
                        number: editNumber
                    })
                    .eq('id', customerData.id);

                if (updateError) throw updateError;

                toast.success("Endereço atualizado!");
                if (onProfileUpdate) onProfileUpdate(customerData.id);
                setIsAlteringAddress(false);
            } catch (err) {
                console.error("Erro ao salvar endereço:", err);
                toast.error("Erro ao salvar endereço");
            }
        } else {
            // Se não tiver ID (guest), apenas fecha e deixa o estado local guiar (embora o ideal seria persistir)
            setIsAlteringAddress(false);
        }
    };
    const handleSaveProfile = async () => {
        if (!customerData?.id) return;

        if (!editName.trim() || !editPhone.trim()) {
            toast.error("Nome e telefone são obrigatórios");
            return;
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: editName,
                    phone: editPhone
                })
                .eq('id', customerData.id);

            if (error) throw error;

            toast.success("Dados atualizados com sucesso!");
            setIsEditingProfile(false);

            if (onProfileUpdate) onProfileUpdate(customerData.id);
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            toast.error("Erro ao atualizar dados");
        }
    };

    return (
        <div className="w-full max-w-[480px] mx-auto pt-6 pb-[68px] min-h-full">
            <div className="space-y-6">
                {/* Header with Back Arrow */}
                <div className="px-4 sm:px-6 flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-secondary rounded-full transition-colors group">
                        <ArrowLeft className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Address Section */}
                <div className="px-4 sm:px-6 space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Endereço do serviço</h2>
                    {(customerData?.address || fetchedAddress) && !isAlteringAddress ? (
                        <div className="p-4 rounded-xl border border-muted-foreground/20 bg-card relative">
                            <div className="flex gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <div className="space-y-1">
                                    <p className="font-medium text-foreground">
                                        {fetchedAddress?.logradouro || customerData?.address}
                                        {(editNumber || customerData?.number) ? `, ${editNumber || customerData.number}` : ''}
                                        {(fetchedAddress?.complemento || customerData?.complement) ? `, ${fetchedAddress?.complemento || customerData?.complement}` : ''}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {fetchedAddress?.bairro || customerData?.neighborhood}, {fetchedAddress?.localidade || customerData?.city}, {fetchedAddress?.uf || customerData?.state} {cep || customerData?.zipCode}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-5 rounded-xl border border-dashed border-primary/30 bg-primary/5 space-y-3">
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium text-foreground">CEP:</p>
                                    <Input
                                        placeholder="00000-000"
                                        value={cep}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                                            setCep(val);
                                            if (val.length === 8) handleCepLookup(val);
                                        }}
                                        className="border-primary/20 focus:border-primary"
                                        maxLength={8}
                                    />
                                </div>
                                <div className="w-[100px] space-y-1">
                                    <p className="text-sm font-medium text-foreground">Número:</p>
                                    <Input
                                        ref={numberInputRef}
                                        placeholder="Ex: 123"
                                        value={editNumber}
                                        onChange={(e) => setEditNumber(e.target.value)}
                                        className="border-primary/20 focus:border-primary"
                                    />
                                </div>
                                {loadingCep && <div className="flex items-end pb-2"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>}
                            </div>
                            {(fetchedAddress || customerData?.address) && (
                                <p className="text-xs text-muted-foreground animate-in fade-in duration-300">
                                    {fetchedAddress?.logradouro || customerData?.address}, {fetchedAddress?.bairro || customerData?.neighborhood}
                                </p>
                            )}
                        </div>
                    )}
                    <button
                        onClick={() => {
                            if (isAlteringAddress) {
                                handleSaveAddress();
                            } else if (customerData?.address) {
                                setIsAlteringAddress(true);
                                setFetchedAddress(null);
                                setCep(customerData?.zipCode || "");
                            } else {
                                setIsAlteringAddress(true);
                            }
                        }}
                        className="text-primary font-bold text-sm hover:underline uppercase tracking-tight"
                    >
                        {isAlteringAddress ? "Salvar" : (customerData?.address ? "ALTERAR ENDEREÇO" : "CADASTRAR ENDEREÇO")}
                    </button>
                </div>

                <div className="px-4 sm:px-6">
                    <hr className="border-muted-foreground/10" />
                </div>

                {/* Client Data Section */}
                <div className="px-4 sm:px-6 space-y-4">
                    <h2 className="text-xl font-bold text-foreground">Dados do Cliente</h2>
                    <div className="p-4 rounded-xl border border-muted-foreground/20 bg-card">
                        <div className="flex gap-3">
                            <User className="w-5 h-5 text-primary shrink-0" />
                            <div className="space-y-4 flex-1">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-foreground">Nome completo</p>
                                    {isEditingProfile ? (
                                        <Input
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="h-8 text-sm mt-1"
                                            placeholder="Seu nome"
                                        />
                                    ) : (
                                        <p className="text-muted-foreground">{customerData?.name || "Não informado"}</p>
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-foreground">Telefone</p>
                                    {isEditingProfile ? (
                                        <Input
                                            value={editPhone}
                                            onChange={(e) => {
                                                let val = e.target.value.replace(/\D/g, "");
                                                if (val.length > 11) val = val.slice(0, 11);

                                                let formatted = "";
                                                if (val.length > 0) {
                                                    formatted = "(" + val.slice(0, 2);
                                                    if (val.length > 2) {
                                                        formatted += ") " + val.slice(2, 7);
                                                        if (val.length > 7) {
                                                            formatted += "-" + val.slice(7, 11);
                                                        }
                                                    }
                                                }

                                                setEditPhone(formatted);

                                                // Se completou os 11 dígitos no formato (11) 99999-9999, o length será 15
                                                if (formatted.length === 15) {
                                                    e.target.blur();
                                                }
                                            }}
                                            className="h-8 text-sm mt-1"
                                            placeholder="(00) 00000-0000"
                                            maxLength={15}
                                        />
                                    ) : (
                                        <p className="text-muted-foreground">{customerData?.phone || "Não informado"}</p>
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-foreground">E-mail</p>
                                    <p className="text-muted-foreground">{customerData?.email || "Não informado"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (isEditingProfile) {
                                handleSaveProfile();
                            } else {
                                setEditName(customerData?.name || "");
                                setEditPhone(customerData?.phone || "");
                                setIsEditingProfile(true);
                            }
                        }}
                        className="text-primary font-bold text-sm hover:underline uppercase tracking-tight"
                    >
                        {isEditingProfile ? "Salvar" : "EDITAR INFORMAÇÕES"}
                    </button>
                </div>

                {/* Action Button */}
                <div className="px-4 sm:px-6 flex justify-end pt-8">
                    <Button
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-6 px-12 rounded-xl text-lg uppercase transition-transform active:scale-95"
                        onClick={() => {
                            if (!customerData?.address && !fetchedAddress) {
                                toast.error("Por favor, informe seu endereço ou CEP para prosseguir.");
                                return;
                            }
                            if (!customerData?.name) {
                                toast.error("Por favor, preencha seu nome no perfil para prosseguir.");
                                return;
                            }
                            if (!customerData?.phone) {
                                toast.error("Por favor, preencha seu telefone no perfil para prosseguir.");
                                return;
                            }
                            onAdvance();
                        }}
                    >
                        AVANÇAR
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSummaryContent;
