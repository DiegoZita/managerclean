import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  ChevronUp,
  Edit,
  Grip,
  Home,
  ImageIcon,
  Plus,
  Trash2,
  UploadCloud,
  Wrench,
  X,
  Package,
  ArrowUp,
  ArrowDown,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  User,
  BookOpen,
  AlignLeft,
  AlignRight,
  Layout,
  Check,
  Search,
  Printer,
  Download,
  Settings,
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Filter,
  MoreHorizontal,
  Ticket
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ServiceItem } from "@/data/services";
import * as Dialog from "@radix-ui/react-dialog";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AdminView = "dashboard" | "services" | "orders" | "clients" | "blog" | "orcamento_pdf" | "management";

interface TypeItem { name: string; price: number }
interface AddonItem { name: string; price: number }
interface SeatPrice { seats: number; price: number }
interface SeatPrice { seats: number; price: number }
interface FreqDiscounts { semestral: number; anual: number }

const MOCK_ARTICLES = [
  {
    id: "1",
    title: "A importância da higienização profunda para a saúde da sua família",
    excerpt: "Descubra como a limpeza profissional de estofados pode remover mais de 99% dos ácaros e bactérias do seu ambiente.",
    category: "Saúde",
    image: "/hero-image.png",
    author: "Equipe Manager Clean",
    date: "05 Mar, 2026",
    readTime: "4 min",
    likes: 124,
    comments: 12
  },
  {
    id: "2",
    title: "Impermeabilização de sofá: Por que fazer e quais os benefícios?",
    excerpt: "Um guia completo sobre como a impermeabilização salva seu sofá de acidentes diários e aumenta a vida útil do tecido.",
    category: "Cuidados",
    image: "/imageService/AD-sofa.png",
    author: "Equipe Manager Clean",
    date: "28 Fev, 2026",
    readTime: "5 min",
    likes: 89,
    comments: 5
  },
  {
    id: "3",
    title: "Odor Control: Como nos livramos dos cheiros de pets?",
    excerpt: "Seu pet fez xixi no sofá? Não se desespere. Entenda a tecnologia por trás da nossa eliminação completa de odores.",
    category: "Pets",
    image: "/imageService/AD-img10.png",
    author: "Equipe Manager Clean",
    date: "14 Fev, 2026",
    readTime: "3 min",
    likes: 210,
    comments: 28
  },
  {
    id: "4",
    title: "Ar-condicionado: O perigo invisível do verão",
    excerpt: "O que se acumula no seu sistema de refrigeração e por que a manutenção preventiva é essencial para a saúde respiratória.",
    category: "Dicas",
    image: "/imageService/AD-img3.png",
    author: "Equipe Manager Clean",
    date: "02 Fev, 2026",
    readTime: "6 min",
    likes: 56,
    comments: 3
  }
];

// --- Reusable Reorderable List for {name, price} items ---
function NamePriceListEditor({
  label,
  items,
  onChange,
  namePlaceholder,
  pricePlaceholder,
  accentColor,
  valuePrefix = "R$",
  helpText,
}: {
  label: string;
  items: TypeItem[];
  onChange: (items: TypeItem[]) => void;
  namePlaceholder: string;
  pricePlaceholder: string;
  accentColor?: string;
  valuePrefix?: string;
  helpText?: string;
}) {
  const [draftName, setDraftName] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const move = (i: number, dir: -1 | 1) => {
    const arr = [...items];
    const target = i + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[i], arr[target]] = [arr[target], arr[i]];
    onChange(arr);
  };

  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: "name" | "price", value: string) => {
    const arr = items.map((item, idx) =>
      idx === i
        ? { ...item, [field]: field === "price" ? parseFloat(value) || 0 : value }
        : item
    );
    onChange(arr);
  };

  const add = () => {
    const name = draftName.trim();
    const price = parseFloat(draftPrice.replace(",", "."));
    if (!name || isNaN(price)) {
      toast.error("Preencha o nome e o preço corretamente");
      return;
    }
    onChange([...items, { name, price }]);
    setDraftName("");
    setDraftPrice("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
      <div className="rounded-lg border border-border bg-muted/20 divide-y divide-border overflow-hidden">
        {items.length === 0 && (
          <p className="px-4 py-3 text-xs text-muted-foreground italic">
            Nenhum item ainda.
          </p>
        )}
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-2 bg-background group"
          >
            <Grip className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            {/* Inline-editable name */}
            <input
              value={item.name}
              onChange={(e) => updateItem(i, "name", e.target.value)}
              className="flex-1 bg-transparent text-sm border-b border-transparent hover:border-border focus:border-primary outline-none transition-colors min-w-0"
            />
            {/* Price badge - inline editable */}
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${accentColor ?? "bg-primary/10 text-primary"}`}>
              <span>{valuePrefix}</span>
              <input
                type="number"
                step="0.01"
                value={item.price}
                onChange={(e) => updateItem(i, "price", e.target.value)}
                className="w-16 bg-transparent outline-none text-right"
              />
            </div>
            {/* Order controls */}
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="p-0 leading-none rounded hover:bg-muted disabled:opacity-30"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="p-0 leading-none rounded hover:bg-muted disabled:opacity-30"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setItemToDelete(i)}
              className="p-0.5 rounded hover:bg-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Add new row */}
        <div className="flex gap-2 p-2 bg-background/50 items-center">
          <Input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
            placeholder={namePlaceholder}
            className="h-8 text-sm flex-1"
          />
          <div className="flex items-center gap-1 border border-input rounded-md h-8 px-2 shrink-0">
            <span className="text-xs text-muted-foreground">{valuePrefix}</span>
            <input
              type="number"
              step="0.01"
              value={draftPrice}
              onChange={(e) => setDraftPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
              placeholder={pricePlaceholder}
              className="w-16 bg-transparent outline-none text-sm"
            />
          </div>
          <Button type="button" size="sm" variant="outline" onClick={add} className="h-8 shrink-0">
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
          </Button>
        </div>
      </div>

      <AlertDialog open={itemToDelete !== null} onOpenChange={(open) => { if (!open) setItemToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você quer excluir esse item?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação removerá o item da lista de serviços.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>NÃO</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (itemToDelete !== null) {
                  remove(itemToDelete);
                  toast.info("Item removido da lista temporária");
                }
              }}
            >
              SIM
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// --- Seat Price Grid Editor ---
function SeatPriceEditor({
  items,
  onChange,
}: {
  items: SeatPrice[];
  onChange: (items: SeatPrice[]) => void;
}) {
  const knownSeats = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const getPrice = (s: number) =>
    items.find((sp) => sp.seats === s)?.price ?? 0;

  const setPrice = (s: number, value: string) => {
    const price = parseFloat(value) || 0;
    const filtered = items.filter((sp) => sp.seats !== s);
    const next = price > 0
      ? [...filtered, { seats: s, price }].sort((a, b) => a.seats - b.seats)
      : filtered;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <Label>🪑 Preço Base por Número de Lugares</Label>
      <p className="text-xs text-muted-foreground">
        Esta é a base do cálculo. Deixe R$ 0 para ocultar aquela opção de lugares.
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {knownSeats.map((s) => (
          <div
            key={s}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition-colors ${getPrice(s) > 0
              ? "border-primary/50 bg-primary/5"
              : "border-border bg-background"
              }`}
          >
            <span className="text-xs font-semibold text-muted-foreground shrink-0 w-10">
              {s} lug.
            </span>
            <div className="flex items-center gap-0.5 flex-1 min-w-0">
              <span className="text-xs text-muted-foreground">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={getPrice(s) || ""}
                onChange={(e) => setPrice(s, e.target.value)}
                placeholder="0"
                className="w-full bg-transparent outline-none text-sm font-medium"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
const Admin = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pdfOrcamentoMode, setPdfOrcamentoMode] = useState<"lista" | "gerador">("lista");
  const [pdfItems, setPdfItems] = useState<any[]>([]);

  // Finance states
  const [finances, setFinances] = useState<any[]>([]);
  const [loadingFinances, setLoadingFinances] = useState(false);
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
  const [financeCategory, setFinanceCategory] = useState("Marketing");
  const [financeType, setFinanceType] = useState<"entrada" | "saida">("entrada");
  const [financeAmount, setFinanceAmount] = useState("");
  const [financeDescription, setFinanceDescription] = useState("");
  const [financeDate, setFinanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingFinanceId, setEditingFinanceId] = useState<string | null>(null);

  const fetchFinances = async () => {
    try {
      setLoadingFinances(true);
      const { data, error } = await supabase
        .from("financial_records")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "financial_records" does not exist')) {
          // If table doesn't exist, use empty or dummy for now
          setFinances([]);
          return;
        }
        throw error;
      }
      setFinances(data || []);
    } catch (error: any) {
      console.error("Erro ao buscar financeiro:", error.message);
    } finally {
      setLoadingFinances(false);
    }
  };

  const handleSaveFinance = async () => {
    if (!financeAmount || !financeDescription) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const payload = {
      description: financeDescription,
      amount: parseFloat(financeAmount.replace(",", ".")),
      type: financeType,
      category: financeCategory,
      date: financeDate,
    };

    try {
      if (editingFinanceId) {
        const { error } = await supabase
          .from("financial_records")
          .update(payload)
          .eq("id", editingFinanceId);
        if (error) throw error;
        toast.success("Registro atualizado!");
      } else {
        const { error } = await supabase
          .from("financial_records")
          .insert([payload]);
        if (error) throw error;
        toast.success("Registro adicionado!");
      }
      setIsFinanceModalOpen(false);
      resetFinanceForm();
      fetchFinances();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    }
  };

  const resetFinanceForm = () => {
    setFinanceDescription("");
    setFinanceAmount("");
    setFinanceType("saida");
    setFinanceCategory("Outros");
    setFinanceDate(new Date().toISOString().split('T')[0]);
    setEditingFinanceId(null);
  };

  const handleDeleteFinance = async (id: string) => {
    try {
      const { error } = await supabase
        .from("financial_records")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Excluído com sucesso");
      fetchFinances();
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };

  const viewQuery = searchParams.get("view");
  const view: AdminView = (viewQuery === "orders" || viewQuery === "services" || viewQuery === "clients" || viewQuery === "blog" || viewQuery === "orcamento_pdf" || viewQuery === "management") ? viewQuery as AdminView : "dashboard";

  useEffect(() => {
    if (isAdmin) {
      if (view === "management" || view === "dashboard") {
        fetchFinances();
        fetchAdminOrders();
      }
    }
  }, [isAdmin, view]);

  const changeView = (newView: AdminView) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("view", newView);
    if (newView !== "orders") {
      newParams.delete("filter");
    }
    setSearchParams(newParams);
  };

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [adminClients, setAdminClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const filterQuery = searchParams.get("filter");
  const orderFilter: "todos" | "agendado" | "concluido" | "cancelado" | "excluido" | "pendente" = (filterQuery === "agendado" || filterQuery === "concluido" || filterQuery === "cancelado" || filterQuery === "excluido" || filterQuery === "pendente")
    ? filterQuery as any
    : "todos";

  const changeOrderFilter = (newFilter: "todos" | "agendado" | "concluido" | "cancelado" | "excluido" | "pendente") => {
    const newParams = new URLSearchParams(searchParams);
    if (newFilter === "todos") {
      newParams.delete("filter");
    } else {
      newParams.set("filter", newFilter);
    }
    setSearchParams(newParams);
  };
  // Dashboard Metrics
  const [orderMetrics, setOrderMetrics] = useState({ total: "--", pendentes: "--", agendados: "--", concluidos: "--", cancelados: "--", excluidos: "--" });
  const [totalClients, setTotalClients] = useState<number | string>("--");

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceItem | null>(null);

  // ----- Form state -----
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"casa" | "empresa" | "outros">("casa");
  const [seatPrices, setSeatPrices] = useState<SeatPrice[]>([]);
  const [models, setModels] = useState<{ name: string; price: number }[]>([]);
  const [adicionais, setAdicionais] = useState<{ name: string; price: number }[]>([]);
  const [materials, setMaterials] = useState<TypeItem[]>([]);
  const [types, setTypes] = useState<TypeItem[]>([]);
  const [addons, setAddons] = useState<AddonItem[]>([]);
  const [freqDiscounts, setFreqDiscounts] = useState<FreqDiscounts>({ semestral: 15, anual: 20 });
  const [m2Prices, setM2Prices] = useState<{ name: string; price: number }[]>([]);
  const [visibility, setVisibility] = useState({
    seats: false,
    m2: false,
    models: false,
    models_is_multiplier: false,
    adicionais: false,
    adicionais_is_multiplier: false,
    materials: false,
    types: false,
    addons: false,
    frequency: false,
  });

  // Image upload
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string>("");
  const [currentIconUrl, setCurrentIconUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Blog states
  const [articles, setArticles] = useState<any[]>(MOCK_ARTICLES);
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState("");
  const [articleExcerpt, setArticleExcerpt] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [articleCategory, setArticleCategory] = useState("Saúde");
  const [isFeatured, setIsFeatured] = useState(false);
  const [adminBlogActiveCategory, setAdminBlogActiveCategory] = useState("Todos");
  const [adminExtraCategories, setAdminExtraCategories] = useState<string[]>([]);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [clientPage, setClientPage] = useState(1);
  const CLIENTS_PER_PAGE = 9;

  // Dynamic Benefits states
  const [showBenefits, setShowBenefits] = useState(true);
  const [benefitsTitle, setBenefitsTitle] = useState("O Que Você Ganha Com Isso?");
  const [benefitsList, setBenefitsList] = useState<{ title: string, description: string }[]>([]);

  const [showBenefits2, setShowBenefits2] = useState(false);
  const [benefits2Title, setBenefits2Title] = useState("Vantagens Complementares");
  const [benefits2List, setBenefits2List] = useState<{ title: string, description: string }[]>([]);

  const [showBenefits3, setShowBenefits3] = useState(false);
  const [benefits3Title, setBenefits3Title] = useState("Por que somos a melhor escolha?");
  const [benefits3List, setBenefits3List] = useState<{ title: string, description: string }[]>([]);

  // Dynamic Quote states
  const [showQuote, setShowQuote] = useState(true);
  const [articleQuote, setArticleQuote] = useState("\"Sua casa não é apenas onde você dorme, é o seu santuário. Respirar ar puro e sentar em um lugar 100% higienizado muda sua rotina.\"");

  const [showQuote2, setShowQuote2] = useState(false);
  const [articleQuote2, setArticleQuote2] = useState("");

  const [showQuote3, setShowQuote3] = useState(false);
  const [articleQuote3, setArticleQuote3] = useState("");

  // Dynamic Avoid states
  const [showAvoid, setShowAvoid] = useState(false);
  const [avoidTitle, setAvoidTitle] = useState("O Que Você Deve Evitar");
  const [avoidList, setAvoidList] = useState<{ title: string, description: string }[]>([]);

  const [showAvoid2, setShowAvoid2] = useState(false);
  const [avoid2Title, setAvoid2Title] = useState("Riscos Comuns");
  const [avoid2List, setAvoid2List] = useState<{ title: string, description: string }[]>([]);

  const [showAvoid3, setShowAvoid3] = useState(false);
  const [avoid3Title, setAvoid3Title] = useState("Dicas de Segurança");
  const [avoid3List, setAvoid3List] = useState<{ title: string, description: string }[]>([]);

  // Coupons states
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscountType, setCouponDiscountType] = useState<"fixed" | "percentage" | "fixed_increase" | "percentage_increase">("fixed");
  const [couponDiscountValue, setCouponDiscountValue] = useState("");
  const [couponMinValue, setCouponMinValue] = useState("");
  const [couponIsActive, setCouponIsActive] = useState(true);

  const [showExtraSection, setShowExtraSection] = useState(true);
  const [extraSectionsList, setExtraSectionsList] = useState<{ title: string, content: string, image?: string, imageAlignment?: 'left' | 'right' }[]>([]);

  // Dynamic Image sections
  const [showImage1, setShowImage1] = useState(false);
  const [image1Url, setImage1Url] = useState("");
  const [showImage2, setShowImage2] = useState(false);
  const [image2Url, setImage2Url] = useState("");
  const [showImage3, setShowImage3] = useState(false);
  const [image3Url, setImage3Url] = useState("");

  // Dynamic Video sections
  const [showVideo1, setShowVideo1] = useState(false);
  const [video1Url, setVideo1Url] = useState("");
  const [showVideo2, setShowVideo2] = useState(false);
  const [video2Url, setVideo2Url] = useState("");
  const [showVideo3, setShowVideo3] = useState(false);
  const [video3Url, setVideo3Url] = useState("");

  // Section Order state
  const [sectionsOrder, setSectionsOrder] = useState<string[]>(['extra', 'quote', 'quote2', 'quote3', 'benefits', 'benefits2', 'benefits3', 'avoid', 'avoid2', 'avoid3', 'image1', 'image2', 'image3', 'video1', 'video2', 'video3']);

  // Helper for reordering
  const moveItemInArray = (list: any[], setList: (newList: any[]) => void, index: number, direction: 'up' | 'down') => {
    const newList = [...list];
    if (direction === 'up' && index > 0) {
      [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
    } else if (direction === 'down' && index < list.length - 1) {
      [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
    }
    setList(newList);
  };

  const handleDuplicateSection = (sectionId: string, index: number) => {
    if (sectionId.startsWith('benefits')) {
      const nextSlot = !sectionsOrder.includes('benefits') ? 'benefits' :
        !sectionsOrder.includes('benefits2') ? 'benefits2' :
          !sectionsOrder.includes('benefits3') ? 'benefits3' : null;

      if (nextSlot) {
        const sourceIsB1 = sectionId === 'benefits';
        const sourceIsB2 = sectionId === 'benefits2';
        const sourceTitle = sourceIsB1 ? benefitsTitle : sourceIsB2 ? benefits2Title : benefits3Title;
        const sourceList = JSON.parse(JSON.stringify(sourceIsB1 ? benefitsList : sourceIsB2 ? benefits2List : benefits3List));

        if (nextSlot === 'benefits') { setBenefitsTitle(sourceTitle); setBenefitsList(sourceList); setShowBenefits(true); }
        else if (nextSlot === 'benefits2') { setBenefits2Title(sourceTitle); setBenefits2List(sourceList); setShowBenefits2(true); }
        else if (nextSlot === 'benefits3') { setBenefits3Title(sourceTitle); setBenefits3List(sourceList); setShowBenefits3(true); }

        const newOrder = [...sectionsOrder];
        newOrder.splice(index + 1, 0, nextSlot);
        setSectionsOrder(newOrder);
        toast.success("Seção de Benefícios duplicada!");
      } else {
        toast.error("Capacidade máxima de 3 seções de benefícios atingida.");
      }
    } else if (sectionId.startsWith('quote')) {
      const nextSlot = !sectionsOrder.includes('quote') ? 'quote' :
        !sectionsOrder.includes('quote2') ? 'quote2' :
          !sectionsOrder.includes('quote3') ? 'quote3' : null;

      if (nextSlot) {
        const sourceId = sectionId === 'quote' ? '' : sectionId === 'quote2' ? '2' : '3';
        const sourceValue = sectionId === 'quote' ? articleQuote : sectionId === 'quote2' ? articleQuote2 : articleQuote3;

        if (nextSlot === 'quote') { setArticleQuote(sourceValue); setShowQuote(true); }
        else if (nextSlot === 'quote2') { setArticleQuote2(sourceValue); setShowQuote2(true); }
        else if (nextSlot === 'quote3') { setArticleQuote3(sourceValue); setShowQuote3(true); }

        const newOrder = [...sectionsOrder];
        newOrder.splice(index + 1, 0, nextSlot);
        setSectionsOrder(newOrder);
        toast.success("Seção de Frase duplicada!");
      } else {
        toast.error("Capacidade máxima de 3 seções de frase atingida.");
      }
    } else if (sectionId.startsWith('avoid')) {
      const nextSlot = !sectionsOrder.includes('avoid') ? 'avoid' :
        !sectionsOrder.includes('avoid2') ? 'avoid2' :
          !sectionsOrder.includes('avoid3') ? 'avoid3' : null;

      if (nextSlot) {
        const sourceIsA1 = sectionId === 'avoid';
        const sourceIsA2 = sectionId === 'avoid2';
        const sourceTitle = sourceIsA1 ? avoidTitle : sourceIsA2 ? avoid2Title : avoid3Title;
        const sourceList = JSON.parse(JSON.stringify(sourceIsA1 ? avoidList : sourceIsA2 ? avoid2List : avoid3List));

        if (nextSlot === 'avoid') { setAvoidTitle(sourceTitle); setAvoidList(sourceList); setShowAvoid(true); }
        else if (nextSlot === 'avoid2') { setAvoid2Title(sourceTitle); setAvoid2List(sourceList); setShowAvoid2(true); }
        else if (nextSlot === 'avoid3') { setAvoid3Title(sourceTitle); setAvoid3List(sourceList); setShowAvoid3(true); }

        const newOrder = [...sectionsOrder];
        newOrder.splice(index + 1, 0, nextSlot);
        setSectionsOrder(newOrder);
        toast.success("Seção Evitar duplicada!");
      } else {
        toast.error("Capacidade máxima de 3 seções 'Evitar' atingida.");
      }
    } else if (sectionId.startsWith('image')) {
      const nextSlot = !sectionsOrder.includes('image1') ? 'image1' :
        !sectionsOrder.includes('image2') ? 'image2' :
          !sectionsOrder.includes('image3') ? 'image3' : null;

      if (nextSlot) {
        const sourceUrl = sectionId === 'image1' ? image1Url : sectionId === 'image2' ? image2Url : image3Url;
        if (nextSlot === 'image1') { setImage1Url(sourceUrl); setShowImage1(true); }
        else if (nextSlot === 'image2') { setImage2Url(sourceUrl); setShowImage2(true); }
        else if (nextSlot === 'image3') { setImage3Url(sourceUrl); setShowImage3(true); }

        const newOrder = [...sectionsOrder];
        newOrder.splice(index + 1, 0, nextSlot);
        setSectionsOrder(newOrder);
        toast.success("Seção de Imagem duplicada!");
      } else {
        toast.error("Capacidade máxima de 3 seções de imagem atingida.");
      }
    } else if (sectionId.startsWith('video')) {
      const nextSlot = !sectionsOrder.includes('video1') ? 'video1' :
        !sectionsOrder.includes('video2') ? 'video2' :
          !sectionsOrder.includes('video3') ? 'video3' : null;

      if (nextSlot) {
        const sourceUrl = sectionId === 'video1' ? video1Url : sectionId === 'video2' ? video2Url : video3Url;
        if (nextSlot === 'video1') { setVideo1Url(sourceUrl); setShowVideo1(true); }
        else if (nextSlot === 'video2') { setVideo2Url(sourceUrl); setShowVideo2(true); }
        else if (nextSlot === 'video3') { setVideo3Url(sourceUrl); setShowVideo3(true); }

        const newOrder = [...sectionsOrder];
        newOrder.splice(index + 1, 0, nextSlot);
        setSectionsOrder(newOrder);
        toast.success("Seção de Vídeo duplicada!");
      } else {
        toast.error("Capacidade máxima de 3 seções de vídeo atingida.");
      }
    } else if (sectionId === 'extra') {
      setExtraSectionsList([...extraSectionsList, ...JSON.parse(JSON.stringify(extraSectionsList))]);
      toast.success("Blocos de conteúdo extra duplicados!");
    }
  };

  // ============================================================
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || user.email !== "admin@managerloja.com") {
          navigate("/");
          return;
        }
        setIsAdmin(true);
        fetchServices();
        fetchMetrics();
        fetchArticles();
        fetchCoupons();
      } catch {
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    checkAdminAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Fetch orders whenever view changes to "orders"
  useEffect(() => {
    if (isAdmin && view === "orders") {
      fetchAdminOrders();
    }
  }, [isAdmin, view]);

  // Fetch clients whenever view changes to "clients"
  useEffect(() => {
    if (isAdmin && view === "clients") {
      fetchAdminClients();
    }
  }, [isAdmin, view]);

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("order_index", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      if (data) setServices(data as ServiceItem[]);
    } catch {
      toast.error("Erro ao carregar serviços");
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('relation "coupons" does not exist')) {
          setCoupons([]);
          return;
        }
        throw error;
      }
      if (data) setCoupons(data);
    } catch {
      toast.error("Erro ao carregar cupons");
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleSaveCoupon = async () => {
    if (!couponCode || !couponDiscountValue) {
      toast.error("Código e valor do desconto são obrigatórios");
      return;
    }

    const payload = {
      code: couponCode.trim().toUpperCase(),
      discount_type: couponDiscountType,
      discount_value: parseFloat(couponDiscountValue.replace(",", ".")),
      min_value: parseFloat(couponMinValue.replace(",", ".")) || 0,
      is_active: couponIsActive,
    };

    try {
      if (editingCouponId) {
        const { error } = await supabase
          .from("coupons")
          .update(payload)
          .eq("id", editingCouponId);
        if (error) throw error;
        toast.success("Cupom atualizado!");
      } else {
        const { error } = await supabase.from("coupons").insert([payload]);
        if (error) throw error;
        toast.success("Cupom criado!");
      }
      resetCouponForm();
      fetchCoupons();
      setIsCouponModalOpen(false);
    } catch (error: any) {
      toast.error("Erro ao salvar cupom: " + error.message);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir este cupom?")) return;
    try {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
      toast.success("Cupom removido!");
      fetchCoupons();
    } catch (error: any) {
      toast.error("Erro ao excluir cupom: " + error.message);
    }
  };

  const openEditCoupon = (coupon: any) => {
    setEditingCouponId(coupon.id);
    setCouponCode(coupon.code);
    setCouponDiscountType(coupon.discount_type);
    setCouponDiscountValue(String(coupon.discount_value));
    setCouponMinValue(String(coupon.min_value));
    setCouponIsActive(coupon.is_active);
    setIsCouponModalOpen(true);
  };

  const resetCouponForm = () => {
    setEditingCouponId(null);
    setCouponCode("");
    setCouponDiscountType("fixed");
    setCouponDiscountValue("");
    setCouponMinValue("");
    setCouponIsActive(true);
  };

  const fetchMetrics = async () => {
    try {
      const { count: ordersCount } = await supabase.from("orders").select("*", { count: "exact", head: true }).neq("status", "excluido");
      const { count: pendentesCount } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq('status', 'pendente');
      const { count: agendadosCount } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq('status', 'agendado');
      const { count: concluidosCount } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq('status', 'concluido');
      const { count: canceladosCount } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq('status', 'cancelado');
      const { count: excluidosCount } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq('status', 'excluido');

      setOrderMetrics({
        total: ordersCount !== null ? String(ordersCount) : "--",
        pendentes: pendentesCount !== null ? String(pendentesCount) : "--",
        agendados: agendadosCount !== null ? String(agendadosCount) : "--",
        concluidos: concluidosCount !== null ? String(concluidosCount) : "--",
        cancelados: canceladosCount !== null ? String(canceladosCount) : "--",
        excluidos: excluidosCount !== null ? String(excluidosCount) : "--"
      });

      const { count: clientsCount, error: clientsError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      if (!clientsError && clientsCount !== null) setTotalClients(clientsCount);
    } catch (error) {
      console.error("Erro ao carregar métricas:", error);
    }
  };

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        // Se a tabela não existir ainda ou der erro de permissão, usamos o mock
        console.warn("Usando artigos mockados (tabela pode não existir)");
        setArticles(MOCK_ARTICLES);
        return;
      }

      if (data && data.length > 0) {
        // Se temos artigos no banco, mostramos apenas eles
        setArticles(data);
      } else {
        // Se o banco estiver vazio, mostramos os mocks como fallback
        setArticles(MOCK_ARTICLES);
      }
    } catch (err: any) {
      console.error("Erro ao carregar artigos:", err);
      setArticles(MOCK_ARTICLES);
    }
  };

  const fetchAdminOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data) setAdminOrders(data);
    } catch (err: any) {
      toast.error("Erro ao carregar pedidos: " + err.message);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAdminClients = async () => {
    setLoadingClients(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("updated_at", { ascending: false });

      console.log("[Admin] fetchAdminClients → data:", data, "error:", error);

      if (error) {
        console.error("[Admin] Erro RLS ou query:", error);
        toast.error("Erro ao carregar clientes: " + error.message);
        return;
      }

      if (!data || data.length === 0) {
        console.warn("[Admin] Nenhum cliente retornado. Verifique a política RLS na tabela 'profiles' no Supabase. O admin precisa de permissão SELECT em todos os perfis.");
        toast.info("Nenhum cliente encontrado. Verifique as permissões RLS no Supabase.");
      }

      setAdminClients(data ?? []);
    } catch (err: any) {
      console.error("[Admin] Erro catastrófico:", err);
      toast.error("Erro ao carregar clientes: " + err.message);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm("CUIDADO: Você quer excluir este cliente PERMANENTEMENTE? O cadastro será APAGADO DEFINITIVAMENTE. Esta ação não tem volta.")) {
      return;
    }

    try {
      // 1. Apagar do banco de dados (tabela profiles para tirar da tela)
      const { data, error } = await supabase.from("profiles").delete().eq("id", clientId).select();

      if (error) {
        toast.error("Erro ao excluir cliente: " + error.message);
        return;
      }

      if (!data || data.length === 0) {
        toast.error("Erro: O banco de dados não permitiu a exclusão! Permissão de DELETE pendente na tabela 'profiles' no Supabase (RLS).");
        return;
      }

      // 2. Chamar a Function protegida do Supabase (Edge Function/RPC)
      const { error: rpcError } = await supabase.rpc('delete_user', { user_id: clientId });

      if (rpcError) {
        console.error("Erro interno ao deletar login:", rpcError);
        toast.warning("Perfil deletado, mas a conta de sistema pode precisar ser excluída manualmente.");
      } else {
        toast.success("Cliente e Conta de Login excluídos permanentemente!");
      }

      setAdminClients(prev => prev.filter(c => c.id !== clientId));
      setTotalClients(prev => typeof prev === "number" ? prev - 1 : prev);
    } catch (err: any) {
      toast.error("Erro catastrófico: " + err.message);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error("Erro: O banco de dados não permitiu a atualização! Você precisa dar permissão de UPDATE no Supabase (RLS).");
        return; // Sai antes de mudar na tela
      }

      toast.success("Status atualizado com sucesso!");

      // Update local state to reflect UI change
      setAdminOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      toast.error("Erro ao atualizar status: " + err.message);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("Você tem certeza que deseja CANCELAR este pedido? Ele ficará marcado como Cancelado para o cliente e irá para a aba de Cancelados.")) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: "cancelado" })
        .eq("id", orderId)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error("Erro: O banco de dados não permitiu o cancelamento! Você precisa dar permissão de UPDATE no Supabase (RLS).");
        return;
      }

      toast.success("Pedido cancelado logicamente!");

      // Atualiza o estado local para "cancelado"
      setAdminOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: "cancelado" } : order));
    } catch (err: any) {
      console.error("Erro ao cancelar pedido:", err);
      toast.error("Erro ao cancelar: " + err.message);
    }
  };

  const handleTrashOrder = async (orderId: string, currentStatus: string) => {
    if (currentStatus === "excluido") {
      if (!window.confirm("CUIDADO: Você quer excluir este pedido PERMANENTEMENTE? Ele será APAGADO DEFINITIVAMENTE do banco de dados. Esta ação não tem volta.")) {
        return;
      }
      try {
        const { data, error } = await supabase.from("orders").delete().eq("id", orderId).select();
        if (error) throw error;

        if (!data || data.length === 0) {
          toast.error("Erro: O banco de dados não permitiu a exclusão definitiva! Permissão de DELETE pendente no Supabase (RLS).");
          return;
        }

        toast.success("Pedido excluído permanentemente!");
        setAdminOrders(prev => prev.filter(order => order.id !== orderId));
      } catch (err: any) {
        toast.error("Erro de exclusão: " + err.message);
      }
      return;
    }

    if (!window.confirm("Mover pedido para a LIXEIRA? Ele não será mais visível para o cliente no histórico de pedidos, e virá para sua aba de Excluídos.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "excluido" })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Pedido movido para a lixeira (excluído)!");

      // Update do estado local
      setAdminOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: "excluido" } : order));
    } catch (err: any) {
      console.error("Erro ao excluir pedido:", err);
      toast.error("Erro ao excluir pedido: " + err.message);
    }
  };




  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
  };

  const uploadIcon = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const fileName = `icon-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from("service-icons")
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage
      .from("service-icons")
      .getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const handleSaveService = async () => {
    if (!name || !category) {
      toast.error("Nome e categoria são obrigatórios");
      return;
    }

    setUploading(true);
    try {
      let iconUrl = currentIconUrl;

      if (iconFile) {
        iconUrl = await uploadIcon(iconFile);
      }

      // Descobrir qual o próximo order_index caso seja um NOVO registro
      let nextOrderIndex = 0;
      if (!editingId) {
        const categoryServices = services.filter(s => s.category === category);
        if (categoryServices.length > 0) {
          nextOrderIndex = Math.max(...categoryServices.map(s => s.order_index ?? 0)) + 1;
        }
      }

      const payload = {
        name: name.trim(),
        icon: iconUrl,
        category,
        seat_prices: seatPrices,
        m2_prices: m2Prices,
        models,
        adicionais,
        materials,
        types,
        addons,
        freq_discounts: freqDiscounts,
        visibility,
        ...(editingId ? {} : { order_index: nextOrderIndex })
      };

      if (editingId) {
        const { error } = await supabase
          .from("services")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast.success("Serviço atualizado!");
      } else {
        const { error } = await supabase.from("services").insert([payload]);
        if (error) throw error;
        toast.success("Serviço criado!");
      }
      resetForm();
      fetchServices();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Save error details:", error);
      toast.error("Erro ao salvar serviço: " + (error.message || "Verifique o console"));
    } finally {
      setUploading(false);
    }
  };

  const moveService = async (service: ServiceItem, direction: "up" | "down") => {
    // 1. Pegar todos da MESMA CATEGORIA e ordená-los pelo order_index ou id caso default zero
    const sameCategory = services
      .filter((s) => s.category === service.category)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

    const currentIndex = sameCategory.findIndex((s) => s.id === service.id);
    if (currentIndex === -1) return;

    // Se estiver tentando subir o primeiro ou descer o último, interromper
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === sameCategory.length - 1) return;

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const neighbor = sameCategory[swapIndex];

    const currentOrder = service.order_index ?? currentIndex;
    const neighborOrder = neighbor.order_index ?? swapIndex;

    // Se eles possuem exactly the same order index somehow (DB reset), force array index
    const newCurrentOrder = currentOrder === neighborOrder ? swapIndex : neighborOrder;
    const newNeighborOrder = currentOrder === neighborOrder ? currentIndex : currentOrder;

    // Atualização otimista local
    setServices(prev => prev.map(s => {
      if (s.id === service.id) return { ...s, order_index: newCurrentOrder };
      if (s.id === neighbor.id) return { ...s, order_index: newNeighborOrder };
      return s;
    }).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)));

    try {
      // Background request duplo (sem await obstrutivo para n travar a UI)
      await Promise.all([
        supabase.from("services").update({ order_index: newCurrentOrder }).eq("id", service.id),
        supabase.from("services").update({ order_index: newNeighborOrder }).eq("id", neighbor.id)
      ]);
    } catch {
      toast.error("Erro ao sincronizar ordem no banco.");
      fetchServices(); // Volta estado anterior em caso de erro
    }
  };

  const handleDelete = async (id: string) => {
    // Salva estado anterior para rollback em caso de erro
    const previousServices = [...services];

    try {
      // 1. Atualização otimista: remove da tela na hora
      setServices(prev => prev.filter(s => String(s.id) !== String(id)));
      toast.info("Removendo serviço...");

      // 2. Tenta deletar no Supabase
      const { data, error } = await supabase
        .from("services")
        .delete()
        .eq("id", id)
        .select();

      if (error) {
        // Se der erro no banco, volta o estado anterior
        setServices(previousServices);
        console.error("Erro Supabase:", error);
        toast.error("Erro ao excluir do banco de dados: " + error.message);
        return;
      }

      if (!data || data.length === 0) {
        setServices(previousServices);
        toast.error("Acesso Negado: O serviço não pôde ser apagado. Verifique as regras de DELETE (RLS) no banco de dados.");
        return;
      }

      toast.success("Serviço removido com sucesso!");
    } catch (err: any) {
      setServices(previousServices);
      console.error("Erro catastrófico:", err);
      toast.error("Erro inesperado ao excluir.");
    }
  };

  const openEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setName(service.name);
    setCategory(service.category as any);
    setSeatPrices((service.seat_prices as any) ?? []);
    setModels((service.models as any) ?? []);
    setAdicionais((service.adicionais as any) ?? []);
    setMaterials(service.materials ?? []);
    setTypes(service.types ?? []);
    setAddons(service.addons ?? []);
    setFreqDiscounts(service.freq_discounts ?? { semestral: 15, anual: 20 });
    setM2Prices(service.m2_prices ?? []);
    setVisibility({
      seats: service.visibility?.seats ?? false,
      m2: service.visibility?.m2 ?? false,
      models: service.visibility?.models ?? false,
      models_is_multiplier: service.visibility?.models_is_multiplier ?? false,
      adicionais: service.visibility?.adicionais ?? false,
      adicionais_is_multiplier: service.visibility?.adicionais_is_multiplier ?? false,
      materials: service.visibility?.materials ?? false,
      types: service.visibility?.types ?? false,
      addons: service.visibility?.addons ?? false,
      frequency: service.visibility?.frequency ?? false,
    });
    setCurrentIconUrl(service.icon || "");
    setIconPreview(service.icon?.startsWith("http") ? service.icon : "");
    setIconFile(null);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setCategory("casa");
    setSeatPrices([]);
    setModels([]);
    setAdicionais([]);
    setMaterials([]);
    setTypes([]);
    setAddons([]);
    setFreqDiscounts({ semestral: 15, anual: 20 });
    setM2Prices([]);
    setVisibility({
      seats: false,
      m2: false,
      models: false,
      models_is_multiplier: false,
      adicionais: false,
      adicionais_is_multiplier: false,
      materials: false,
      types: false,
      addons: false,
      frequency: false,
    });
    setIconFile(null);
    setIconPreview("");
    setCurrentIconUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsModalOpen(false);
  };

  const openEditArticle = (article: any) => {
    setEditingArticleId(article.id);
    setArticleTitle(article.title);
    setArticleExcerpt(article.excerpt || "");
    setArticleContent(article.content || "");
    setArticleCategory(article.category);
    setIsFeatured(article.is_featured || false);
    setShowBenefits(article.show_benefits !== false);
    setBenefitsTitle(article.benefits_title || "O Que Você Ganha Com Isso?");
    setBenefitsList(article.benefits_list || []);
    setShowBenefits2(article.show_benefits2 || false);
    setBenefits2Title(article.benefits2_title || "Vantagens Complementares");
    setBenefits2List(article.benefits2_list || []);
    setShowBenefits3(article.show_benefits3 || false);
    setBenefits3Title(article.benefits3_title || "Por que somos a melhor escolha?");
    setBenefits3List(article.benefits3_list || []);
    setShowQuote(article.show_quote !== false);
    setArticleQuote(article.quote_text || "\"Sua casa não é apenas onde você dorme, é o seu santuário. Respirar ar puro e sentar em um lugar 100% higienizado muda sua rotina.\"");

    setShowQuote2(article.show_quote2 || false);
    setArticleQuote2(article.quote2_text || "");

    setShowQuote3(article.show_quote3 || false);
    setArticleQuote3(article.quote3_text || "");

    setShowAvoid(article.show_avoid || false);
    setAvoidTitle(article.avoid_title || "O Que Você Deve Evitar");
    setAvoidList(article.avoid_list || []);

    setShowAvoid2(article.show_avoid2 || false);
    setAvoid2Title(article.avoid2_title || "Riscos Comuns");
    setAvoid2List(article.avoid2_list || []);

    setShowAvoid3(article.show_avoid3 || false);
    setAvoid3Title(article.avoid3_title || "Dicas de Segurança");
    setAvoid3List(article.avoid3_list || []);

    setShowImage1(article.show_image1 || false);
    setImage1Url(article.image1_url || "");
    setShowImage2(article.show_image2 || false);
    setImage2Url(article.image2_url || "");
    setShowImage3(article.show_image3 || false);
    setImage3Url(article.image3_url || "");

    setShowVideo1(article.show_video1 || false);
    setVideo1Url(article.video1_url || "");
    setShowVideo2(article.show_video2 || false);
    setVideo2Url(article.video2_url || "");
    setShowVideo3(article.show_video3 || false);
    setVideo3Url(article.video3_url || "");

    setShowExtraSection(article.show_extra !== false);
    setExtraSectionsList(article.extra_sections || (article.extra_title ? [{ title: article.extra_title, content: article.extra_content || "" }] : []));
    setSectionsOrder(article.sections_order || ['extra', 'quote', 'quote2', 'quote3', 'benefits', 'benefits2', 'benefits3', 'avoid', 'avoid2', 'avoid3', 'image1', 'image2', 'image3', 'video1', 'video2', 'video3']);
    setCurrentIconUrl(article.image || "");
    setIconPreview(article.image || "");
    setIconFile(null);
    setIsBlogModalOpen(true);
  };

  const resetBlogForm = () => {
    setEditingArticleId(null);
    setArticleTitle("");
    setArticleExcerpt("");
    setArticleContent("");
    setArticleCategory("Saúde");
    setIsFeatured(false);
    setShowBenefits(true);
    setBenefitsTitle("O Que Você Ganha Com Isso?");
    setBenefitsList([]);
    setShowBenefits2(false);
    setBenefits2Title("Vantagens Complementares");
    setBenefits2List([]);
    setShowBenefits3(false);
    setBenefits3Title("Por que somos a melhor escolha?");
    setBenefits3List([]);
    setShowQuote(true);
    setArticleQuote("\"Sua casa não é apenas onde você dorme, é o seu santuário. Respirar ar puro e sentar em um lugar 100% higienizado muda sua rotina.\"");
    setShowQuote2(false);
    setArticleQuote2("");
    setShowQuote3(false);
    setArticleQuote3("");
    setShowAvoid(false);
    setAvoidTitle("O Que Você Deve Evitar");
    setAvoidList([]);
    setShowAvoid2(false);
    setAvoid2Title("Riscos Comuns");
    setAvoid2List([]);
    setShowAvoid3(false);
    setAvoid3Title("Dicas de Segurança");
    setAvoid3List([]);
    setShowImage1(false);
    setImage1Url("");
    setShowImage2(false);
    setImage2Url("");
    setShowImage3(false);
    setImage3Url("");
    setShowVideo1(false);
    setVideo1Url("");
    setShowVideo2(false);
    setVideo2Url("");
    setShowVideo3(false);
    setVideo3Url("");
    setShowExtraSection(true);
    setExtraSectionsList([]);
    setSectionsOrder(['extra', 'quote', 'quote2', 'quote3', 'benefits', 'benefits2', 'benefits3', 'avoid', 'avoid2', 'avoid3', 'image1', 'image2', 'image3', 'video1', 'video2', 'video3']);
    setIconFile(null);
    setIconPreview("");
    setCurrentIconUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsBlogModalOpen(false);
  };

  const handleSaveArticle = async () => {
    if (!articleTitle || !articleCategory) {
      toast.error("Título e categoria são obrigatórios");
      return;
    }

    setUploading(true);
    try {
      let imageUrl = currentIconUrl;

      if (iconFile) {
        imageUrl = await uploadIcon(iconFile);
      }

      const payload = {
        title: articleTitle.trim(),
        excerpt: articleExcerpt.trim(),
        content: articleContent.trim(),
        category: articleCategory,
        image: imageUrl,
        author: "Equipe Manager Clean",
        date: (editingArticleId && !["1", "2", "3", "4"].includes(editingArticleId))
          ? undefined
          : format(new Date(), "dd MMM, yyyy", { locale: ptBR }),
        readTime: "5 min",
        is_featured: isFeatured,
        show_benefits: showBenefits,
        benefits_title: benefitsTitle,
        benefits_list: benefitsList,
        show_benefits2: showBenefits2,
        benefits2_title: benefits2Title,
        benefits2_list: benefits2List,
        show_benefits3: showBenefits3,
        benefits3_title: benefits3Title,
        benefits3_list: benefits3List,
        show_quote: showQuote,
        quote_text: articleQuote,
        show_quote2: showQuote2,
        quote2_text: articleQuote2,
        show_quote3: showQuote3,
        quote3_text: articleQuote3,
        show_avoid: showAvoid,
        avoid_title: avoidTitle,
        avoid_list: avoidList,
        show_avoid2: showAvoid2,
        avoid2_title: avoid2Title,
        avoid2_list: avoid2List,
        show_avoid3: showAvoid3,
        avoid3_title: avoid3Title,
        avoid3_list: avoid3List,
        show_image1: showImage1,
        image1_url: image1Url,
        show_image2: showImage2,
        image2_url: image2Url,
        show_image3: showImage3,
        image3_url: image3Url,
        show_video1: showVideo1,
        video1_url: video1Url,
        show_video2: showVideo2,
        video2_url: video2Url,
        show_video3: showVideo3,
        video3_url: video3Url,
        show_extra: showExtraSection,
        extra_sections: extraSectionsList,
        sections_order: sectionsOrder,
        // Mantendo compatibilidade com campos antigos se necessário, mas focando na lista
        extra_title: extraSectionsList.length > 0 ? extraSectionsList[0].title : "",
        extra_content: extraSectionsList.length > 0 ? extraSectionsList[0].content : "",
      };

      if (isFeatured) {
        // Desmarcar qualquer outro artigo que esteja como destaque antes de prosseguir
        await supabase
          .from("blog_posts")
          .update({ is_featured: false })
          .eq("is_featured", true);
      }

      if (editingArticleId && !["1", "2", "3", "4"].includes(editingArticleId)) {
        const { error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", editingArticleId);
        if (error) throw error;
        toast.success("Artigo atualizado!");
      } else {
        const { error } = await supabase.from("blog_posts").insert([payload]);
        if (error) throw error;
        toast.success("Artigo publicado!");
      }
      resetBlogForm();
      fetchArticles();
    } catch (error: any) {
      console.error("Erro ao salvar artigo:", error);
      const detail = error.message || error.details || (typeof error === 'object' ? JSON.stringify(error) : String(error));
      toast.error("Erro ao salvar: " + detail);
    } finally {
      setUploading(false);
    }
  };

  const handleExtraSectionImageUpload = async (file: File, index: number) => {
    try {
      const url = await uploadIcon(file);
      setExtraSectionsList(prev => prev.map((item, i) =>
        i === index ? { ...item, image: url, imageAlignment: item.imageAlignment || 'left' } : item
      ));
      toast.success("Imagem do bloco carregada!");
    } catch (error: any) {
      console.error("Erro no upload da imagem da seção:", error);
      toast.error("Erro no upload: " + (error.message || JSON.stringify(error)));
    }
  };

  const handleBlogSectionImageUpload = async (file: File, sectionId: string) => {
    try {
      const url = await uploadIcon(file);
      if (sectionId === 'image1') setImage1Url(url);
      else if (sectionId === 'image2') setImage2Url(url);
      else if (sectionId === 'image3') setImage3Url(url);
      toast.success("Imagem carregada para o artigo!");
    } catch (error: any) {
      console.error("Erro no upload da imagem da seção:", error);
      toast.error("Erro no upload: " + (error.message || JSON.stringify(error)));
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Você tem certeza que deseja excluir este artigo?")) return;

    // Salva estado anterior para rollback em caso de erro
    const previousArticles = [...articles];

    try {
      // 1. Atualização otimista: remove da tela na hora
      setArticles(prev => prev.filter(a => String(a.id) !== String(id)));
      toast.info("Removendo artigo...");

      // Se for um dos mocks (ID 1, 2, 3 ou 4) e não estiver no banco, a exclusão no Supabase não fará nada.
      // Mas o fetchArticles agora só trará mocks se o banco estiver VAZIO.

      const { data, error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id)
        .select();

      if (error) {
        setArticles(previousArticles);
        console.error("Erro Supabase:", error);
        toast.error("Erro ao excluir do banco: " + error.message);
        return;
      }

      // Se é um ID de mock e o banco retornou vazio, apenas confirmamos o sucesso local (pois ele não existe no DB)
      if (["1", "2", "3", "4"].includes(id) && (!data || data.length === 0)) {
        toast.success("Artigo fixo removido da visualização!");
        return;
      }

      if (!data || data.length === 0) {
        // Se não deletou nada e não era mock, pode ser RLS
        setArticles(previousArticles);
        toast.error("Acesso Negado: O artigo não pôde ser apagado (RLS).");
        return;
      }

      toast.success("Artigo removido com sucesso!");
      fetchArticles(); // Sincroniza estado final
    } catch (err: any) {
      setArticles(previousArticles);
      console.error("Erro ao excluir artigo:", err);
      toast.error("Erro inesperado ao excluir.");
    }
  };

  const handleDuplicateArticle = (article: any) => {
    setEditingArticleId(null); // Define como null para ser um novo registro (INSERT)
    setArticleTitle(`${article.title} (Cópia)`);
    setArticleExcerpt(article.excerpt || "");
    setArticleContent(article.content || "");
    setArticleCategory(article.category);
    setIsFeatured(false);

    setShowBenefits(article.show_benefits !== false);
    setBenefitsTitle(article.benefits_title || "O Que Você Ganha Com Isso?");
    setBenefitsList(article.benefits_list || []);

    setShowBenefits2(article.show_benefits2 || false);
    setBenefits2Title(article.benefits2_title || "Vantagens Complementares");
    setBenefits2List(article.benefits2_list || []);

    setShowBenefits3(article.show_benefits3 || false);
    setBenefits3Title(article.benefits3_title || "Por que somos a melhor escolha?");
    setBenefits3List(article.benefits3_list || []);

    setShowQuote(article.show_quote !== false);
    setArticleQuote(article.quote_text || "");

    setShowExtraSection(article.show_extra !== false);
    setExtraSectionsList(article.extra_sections || []);

    setSectionsOrder(article.sections_order || ['extra', 'quote', 'benefits', 'benefits2', 'benefits3']);

    setCurrentIconUrl(article.image || "");
    setIconPreview(article.image || "");
    setIconFile(null);

    setIsBlogModalOpen(true);
    toast.info("Artigo duplicado! Edite e salve como um novo post.");
  };

  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Verificando acesso...</p>
      </div>
    );
  }
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartCount={0} onCartToggle={() => { }} hideCart={true} />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* ── DASHBOARD ─────────────────────────────────── */}
        {view === "dashboard" && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Painel de Controle
              </h1>
              <p className="text-muted-foreground mt-2">
                Bem-vindo ao painel administrativo.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card
                className="hover:border-primary transition-colors cursor-pointer"
                onClick={() => changeView("services")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Gerenciar Serviços</CardTitle>
                  <CardDescription>Adicione, edite ou remova serviços</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {loadingServices ? "..." : services.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Serviços ativos no site</p>
                </CardContent>
              </Card>

              <Card
                className="hover:border-primary transition-colors cursor-pointer"
                onClick={() => {
                  fetchAdminOrders();
                  changeView("orders");
                }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pedidos e Status</CardTitle>
                  <CardDescription>Visualização dos pedidos na plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between sm:justify-start gap-4 flex-wrap">
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-foreground">{orderMetrics.total}</span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total</span>
                    </div>
                    <div className="flex flex-col border-l pl-4 border-amber-200">
                      <span className="text-xl font-bold text-amber-600">{orderMetrics.pendentes}</span>
                      <span className="text-[10px] text-amber-600/70 font-bold uppercase tracking-wider">Pend</span>
                    </div>
                    <div className="flex flex-col border-l pl-4 border-blue-200">
                      <span className="text-xl font-bold text-blue-600">{orderMetrics.agendados}</span>
                      <span className="text-[10px] text-blue-600/70 font-bold uppercase tracking-wider">Agend</span>
                    </div>
                    <div className="flex flex-col border-l pl-4 border-green-200">
                      <span className="text-xl font-bold text-green-600">{orderMetrics.concluidos}</span>
                      <span className="text-[10px] text-green-600/70 font-bold uppercase tracking-wider">Concl</span>
                    </div>
                    <div className="flex flex-col border-l pl-4 border-red-200">
                      <span className="text-xl font-bold text-red-600">{orderMetrics.cancelados}</span>
                      <span className="text-[10px] text-red-600/70 font-bold uppercase tracking-wider">Canc</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => changeView("management")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Gestão</CardTitle>
                  <CardDescription>Configurações e controle geral</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${((adminOrders.filter(o => o.status === "concluido").reduce((acc, o) => acc + (parseFloat(o.total_price) || 0), 0) + finances.filter(f => f.type === "entrada").reduce((acc, f) => acc + (f.amount || 0), 0)) - finances.filter(f => f.type === "saida").reduce((acc, f) => acc + (f.amount || 0), 0)) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    R$ {((adminOrders.filter(o => o.status === "concluido").reduce((acc, o) => acc + (parseFloat(o.total_price) || 0), 0) + finances.filter(f => f.type === "entrada").reduce((acc, f) => acc + (f.amount || 0), 0)) - finances.filter(f => f.type === "saida").reduce((acc, f) => acc + (f.amount || 0), 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <PieChart className="w-3 h-3" /> Lucro Líquido Real
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => changeView("blog")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Artigos do Blog</CardTitle>
                  <CardDescription>Gerencie as postagens do blog</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{articles.length} <span className="text-base font-medium text-muted-foreground">artigo{articles.length !== 1 ? 's' : ''}</span></div>
                </CardContent>
              </Card>

              <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => changeView("orcamento_pdf")}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Orçamento em PDF</CardTitle>
                  <CardDescription>Gerencie itens exclusivos para PDF</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {services.filter(s => s.category === "orcamento_pdf").length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Serviços exclusivos para PDF</p>
                </CardContent>
              </Card>

              <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => { fetchAdminClients(); changeView("clients"); }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Clientes Cadastrados</CardTitle>
                  <CardDescription>Usuários registrados na plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{totalClients}</div>
                </CardContent>
              </Card>
            </div>

          </>
        )}

        {/* ── SERVICES ──────────────────────────────────── */}
        {view === "services" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="icon" onClick={() => changeView("dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Gerenciar Serviços
                </h1>
                <p className="text-muted-foreground text-sm">
                  Controle o catálogo exibido na página inicial
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button onClick={() => { resetCouponForm(); setIsCouponModalOpen(true); }} variant="outline">
                  <Ticket className="mr-2 h-4 w-4" /> Adicionar Cupom
                </Button>
                <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" /> Adicionar Serviço
                </Button>
              </div>
            </div>

            <Dialog.Root open={isModalOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-4xl max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] bg-background p-6 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 outline-none">

                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title className="text-xl font-bold">
                      {editingId ? "Editando Serviço" : "Novo Serviço"}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* LEFT: Basic info + image */}
                    <Card className="border-primary/40 shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          Dados Gerais
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Image upload */}
                        <div className="space-y-2">
                          <Label>Ícone / Imagem</Label>
                          <div className="flex items-center gap-4">
                            <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 shrink-0 overflow-hidden">
                              {iconPreview ? (
                                <img
                                  src={iconPreview}
                                  alt="Preview"
                                  className="h-full w-full object-contain p-1"
                                />
                              ) : (
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <div className="space-y-1">
                              <label
                                htmlFor="icon-upload"
                                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
                              >
                                <UploadCloud className="h-4 w-4" />
                                Escolher imagem
                                <input
                                  id="icon-upload"
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={handleFileChange}
                                />
                              </label>
                              <p className="text-xs text-muted-foreground">PNG, JPG ou SVG</p>
                            </div>
                          </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                          <Label>Nome do Serviço</Label>
                          <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Limpeza de Sofá"
                          />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as any)}
                          >
                            <option value="casa">Preferidos</option>
                            <option value="outros">Catálogo Completo</option>
                            <option value="empresa">Empresarial</option>
                          </select>
                        </div>
                      </CardContent>
                    </Card>

                    {/* RIGHT: Configurator sections */}
                    <div className="flex flex-col gap-4 pb-12">
                      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary w-fit">
                        <span>⚙️</span> Opções que o cliente verá no configurador
                      </div>
                      <p className="text-xs text-muted-foreground -mt-2">
                        Ative no botão à direita caso o serviço possua este tipo de variação.
                      </p>

                      {/* Seat Prices — base do cálculo */}
                      <div className={`p-4 rounded-xl border transition-colors ${visibility.seats ? 'bg-primary/5 border-primary/20' : 'bg-muted/10 opacity-70 border-border'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-semibold flex items-center gap-2">🛋️ Quantidade de Lugares (Base)</Label>
                          <Switch
                            checked={visibility.seats}
                            onCheckedChange={(checked) => setVisibility(v => ({ ...v, seats: checked }))}
                          />
                        </div>
                        {visibility.seats && <SeatPriceEditor items={seatPrices} onChange={setSeatPrices} />}
                      </div>

                      {/* M2 Prices */}
                      <div className={`p-4 rounded-xl border transition-colors ${visibility.m2 ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-muted/10 opacity-70 border-border'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-semibold flex items-center gap-2">📏 Cobrança por m² (Base alternativa)</Label>
                          <Switch
                            checked={visibility.m2}
                            onCheckedChange={(checked) => setVisibility(v => ({ ...v, m2: checked }))}
                          />
                        </div>
                        {visibility.m2 && (
                          <NamePriceListEditor
                            label=""
                            items={m2Prices}
                            onChange={setM2Prices}
                            namePlaceholder="Ex: Preço Padrão (Por Metro)"
                            pricePlaceholder="30.00"
                            accentColor="bg-indigo-500/10 text-indigo-700"
                          />
                        )}
                      </div>

                      {/* Models */}
                      <div className={`p-4 rounded-xl border transition-colors ${visibility.models ? 'bg-green-500/5 border-green-500/20' : 'bg-muted/10 opacity-70 border-border'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-semibold flex items-center gap-2">🛋️ Modelos (adicional)</Label>
                          <Switch
                            checked={visibility.models}
                            onCheckedChange={(checked) => setVisibility(v => ({ ...v, models: checked }))}
                          />
                        </div>
                        {visibility.models && (
                          <>
                            <div className="flex items-center gap-4 mb-4 mt-2 p-3 bg-background rounded-lg border">
                              <Label className="text-sm font-medium">Tipo de Cobrança:</Label>
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                  <input
                                    type="radio"
                                    name="model_type"
                                    checked={!visibility.models_is_multiplier}
                                    onChange={() => setVisibility(v => ({ ...v, models_is_multiplier: false }))}
                                  />
                                  Valor Fixo (+R$)
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer ml-4">
                                  <input
                                    type="radio"
                                    name="model_type"
                                    checked={!!visibility.models_is_multiplier}
                                    onChange={() => setVisibility(v => ({ ...v, models_is_multiplier: true }))}
                                  />
                                  Multiplicador (x)
                                </label>
                              </div>
                            </div>
                            <NamePriceListEditor
                              label=""
                              items={models}
                              onChange={setModels}
                              namePlaceholder="Ex: Sofá Retrátil"
                              pricePlaceholder={visibility.models_is_multiplier ? "1.5" : "50.00"}
                              accentColor="bg-green-500/10 text-green-700"
                              valuePrefix={visibility.models_is_multiplier ? "x" : "R$"}
                              helpText={
                                visibility.models_is_multiplier
                                  ? "Digite o multiplicador. Ex: 1.0 (mesmo valor), 1.5 (+50% do valor), 2.0 (dobro do valor)."
                                  : "Digite o valor fixo a ser somado no total. Ex: 50.00."
                              }
                            />
                          </>
                        )}
                      </div>

                      {/* Adicionais */}
                      <div className={`p-4 rounded-xl border transition-colors ${visibility.adicionais ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-muted/10 opacity-70 border-border'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-semibold flex items-center gap-2">➕ Adicional (opcional)</Label>
                          <Switch
                            checked={visibility.adicionais}
                            onCheckedChange={(checked) => setVisibility(v => ({ ...v, adicionais: checked }))}
                          />
                        </div>
                        {visibility.adicionais && (
                          <>
                            <div className="flex items-center gap-4 mb-4 mt-2 p-3 bg-background rounded-lg border">
                              <Label className="text-sm font-medium">Tipo de Cobrança:</Label>
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                                  <input
                                    type="radio"
                                    name="adicional_type"
                                    checked={!visibility.adicionais_is_multiplier}
                                    onChange={() => setVisibility(v => ({ ...v, adicionais_is_multiplier: false }))}
                                  />
                                  Valor Fixo (+R$)
                                </label>
                                <label className="flex items-center gap-1.5 text-sm cursor-pointer ml-4">
                                  <input
                                    type="radio"
                                    name="adicional_type"
                                    checked={!!visibility.adicionais_is_multiplier}
                                    onChange={() => setVisibility(v => ({ ...v, adicionais_is_multiplier: true }))}
                                  />
                                  Multiplicador (x)
                                </label>
                              </div>
                            </div>
                            <NamePriceListEditor
                              label=""
                              items={adicionais}
                              onChange={setAdicionais}
                              namePlaceholder="Ex: Almofada Solta"
                              pricePlaceholder={visibility.adicionais_is_multiplier ? "1.2" : "30.00"}
                              accentColor="bg-cyan-500/10 text-cyan-700"
                              valuePrefix={visibility.adicionais_is_multiplier ? "x" : "R$"}
                              helpText={
                                visibility.adicionais_is_multiplier
                                  ? "Digite o multiplicador. Ex: 1.2 (+20% do valor)."
                                  : "Digite o valor fixo a ser somado no total."
                              }
                            />
                          </>
                        )}
                      </div>

                      {/* Materials */}
                      <div className={`p-4 rounded-xl border transition-colors ${visibility.materials ? 'bg-amber-500/5 border-amber-500/20' : 'bg-muted/10 opacity-70 border-border'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-semibold flex items-center gap-2">🧵 Tipos de Tecido (adicional)</Label>
                          <Switch
                            checked={visibility.materials}
                            onCheckedChange={(checked) => setVisibility(v => ({ ...v, materials: checked }))}
                          />
                        </div>
                        {visibility.materials && (
                          <NamePriceListEditor
                            label=""
                            items={materials}
                            onChange={setMaterials}
                            namePlaceholder="Ex: Couro"
                            pricePlaceholder="80.00"
                            accentColor="bg-amber-500/10 text-amber-700"
                          />
                        )}
                      </div>

                      {/* Types */}
                      <div className={`p-4 rounded-xl border transition-colors ${visibility.types ? 'bg-primary/5 border-primary/20' : 'bg-muted/10 opacity-70 border-border'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-semibold flex items-center gap-2">🧹 Tipos de Limpeza (adicional)</Label>
                          <Switch
                            checked={visibility.types}
                            onCheckedChange={(checked) => setVisibility(v => ({ ...v, types: checked }))}
                          />
                        </div>
                        {visibility.types && (
                          <NamePriceListEditor
                            label=""
                            items={types}
                            onChange={setTypes}
                            namePlaceholder="Ex: Impermeabilização"
                            pricePlaceholder="1.0"
                            accentColor="bg-primary/10 text-primary"
                            valuePrefix="x"
                            helpText="Digite o multiplicador. Ex: 1.2 (+20% sobre a base)."
                          />
                        )}
                      </div>

                      {/* Addons */}
                      <div className={`p-4 rounded-xl border transition-colors ${visibility.addons ? 'bg-orange-500/5 border-orange-500/20' : 'bg-muted/10 opacity-70 border-border'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-semibold flex items-center gap-2">✨ Serviços Extras</Label>
                          <Switch
                            checked={visibility.addons}
                            onCheckedChange={(checked) => setVisibility(v => ({ ...v, addons: checked }))}
                          />
                        </div>
                        {visibility.addons && (
                          <NamePriceListEditor
                            label=""
                            items={addons}
                            onChange={setAddons}
                            namePlaceholder="Ex: Limpeza Pet"
                            pricePlaceholder="73.00"
                            accentColor="bg-orange-500/10 text-orange-600"
                          />
                        )}
                      </div>

                      {/* Frequency discounts */}
                      <div className={`p-4 rounded-xl border transition-colors ${visibility.frequency ? 'bg-sky-500/5 border-sky-500/20' : 'bg-muted/10 opacity-70 border-border'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="font-semibold flex items-center gap-2">🏷️ Frequência (Desconto recorrente)</Label>
                          <Switch
                            checked={visibility.frequency}
                            onCheckedChange={(checked) => setVisibility(v => ({ ...v, frequency: checked }))}
                          />
                        </div>
                        {visibility.frequency && (
                          <div className="space-y-2 pt-2">
                            <p className="text-xs text-muted-foreground">
                              Percentuais aplicados sobre o subtotal quando o cliente escolhe recorrência.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                                <span className="text-xs text-muted-foreground shrink-0">Semestral</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.5"
                                  value={freqDiscounts.semestral}
                                  onChange={(e) =>
                                    setFreqDiscounts((prev) => ({
                                      ...prev,
                                      semestral: parseFloat(e.target.value) || 0,
                                    }))
                                  }
                                  className="w-full bg-transparent outline-none text-sm font-semibold text-right"
                                />
                                <span className="text-xs text-muted-foreground">%</span>
                              </div>
                              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                                <span className="text-xs text-muted-foreground shrink-0">Anual</span>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.5"
                                  value={freqDiscounts.anual}
                                  onChange={(e) =>
                                    setFreqDiscounts((prev) => ({
                                      ...prev,
                                      anual: parseFloat(e.target.value) || 0,
                                    }))
                                  }
                                  className="w-full bg-transparent outline-none text-sm font-semibold text-right"
                                />
                                <span className="text-xs text-muted-foreground">%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 justify-end pt-6 mt-6 border-t">
                    <Button variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveService} disabled={uploading} className="min-w-32">
                      {uploading ? (
                        <span className="animate-pulse">Salvando...</span>
                      ) : editingId ? (
                        "Salvar Alterações"
                      ) : (
                        "Adicionar Serviço"
                      )}
                    </Button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            <Dialog.Root open={isCouponModalOpen} onOpenChange={(open) => { if (!open) resetCouponForm(); }}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] bg-background p-6 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 outline-none">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title className="text-xl font-bold">
                      {editingCouponId ? "Editando Cupom" : "Novo Cupom"}
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Código do Cupom</Label>
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="EX: BEMVINDO10"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo de Desconto</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={couponDiscountType}
                          onChange={(e) => setCouponDiscountType(e.target.value as any)}
                        >
                          <option value="fixed">Desconto Fixo (R$)</option>
                          <option value="percentage">Desconto Percentual (%)</option>
                          <option value="fixed_increase">Acréscimo Fixo (R$)</option>
                          <option value="percentage_increase">Acréscimo Percentual (%)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Valor</Label>
                        <Input
                          type="number"
                          value={couponDiscountValue}
                          onChange={(e) => setCouponDiscountValue(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Valor Mínimo do Pedido</Label>
                      <Input
                        type="number"
                        value={couponMinValue}
                        onChange={(e) => setCouponMinValue(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <Label className="cursor-pointer" htmlFor="coupon-active">Status: {couponIsActive ? 'Ativo' : 'Inativo'}</Label>
                      <Switch
                        id="coupon-active"
                        checked={couponIsActive}
                        onCheckedChange={setCouponIsActive}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-6 mt-6 border-t">
                    <Button variant="outline" onClick={() => setIsCouponModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveCoupon}>
                      {editingCouponId ? "Salvar Alterações" : "Criar Cupom"}
                    </Button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

            {/* ── SERVICES TABLE ── */}
            <div className="rounded-xl border bg-card overflow-hidden">
              {loadingServices ? (
                <div className="p-8 text-center text-muted-foreground animate-pulse">
                  Carregando lista...
                </div>
              ) : services.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Nenhum serviço cadastrado.
                </div>
              ) : (
                <div className="flex flex-col">
                  {/* Função helper para renderizar a tabela separada */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Domiciliar e Cupons lado a lado */}
                    <div className="space-y-4">
                      <div className="bg-muted py-2 px-4 shadow-sm border-y text-xs uppercase tracking-widest font-bold text-foreground/70 flex justify-between items-center">
                        <span>Domiciliar ({services.filter(s => s.category === "casa").length})</span>
                      </div>
                      <div className="divide-y">
                        {services.filter(s => s.category === "casa").map((service, index, arr) => (
                          <div
                            key={service.id}
                            className="flex items-center gap-3 p-3 text-sm hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex flex-col items-center opacity-50 hover:opacity-100">
                              <button onClick={() => moveService(service, "up")} disabled={index === 0} className="disabled:invisible">
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button onClick={() => moveService(service, "down")} disabled={index === arr.length - 1} className="disabled:invisible">
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="h-10 w-10 shrink-0 border rounded-lg bg-muted flex items-center justify-center p-1">
                              {service.icon ? <img src={service.icon} className="h-full w-full object-contain" /> : <ImageIcon className="h-4 h-4" />}
                            </div>
                            <div className="flex-1 font-semibold truncate">{service.name}</div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(service)}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { setServiceToDelete(service); setIsDeleteModalOpen(true); }}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 border-l pl-0 lg:pl-6">
                      <div className="bg-blue-50 py-2 px-4 shadow-sm border-y text-xs uppercase tracking-widest font-bold text-blue-700 flex justify-between items-center">
                        <span>Cupons ({coupons.length})</span>
                      </div>
                      <div className="divide-y">
                        {loadingCoupons ? <div className="p-4 text-center text-xs animate-pulse">Carregando...</div> :
                          coupons.length === 0 ? <div className="p-4 text-center text-xs text-muted-foreground italic">Nenhum cupom ativo.</div> :
                            coupons.map((coupon) => (
                              <div
                                key={coupon.id}
                                className="flex items-center gap-3 p-3 text-sm hover:bg-muted/30 transition-colors"
                              >
                                <div className="h-10 w-10 shrink-0 border rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                  <Ticket className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-bold flex items-center gap-2">
                                    {coupon.code}
                                    {!coupon.is_active && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Inativo</span>}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` :
                                      coupon.discount_type === 'fixed' ? `R$ ${coupon.discount_value} OFF` :
                                        coupon.discount_type === 'percentage_increase' ? `${coupon.discount_value}% EXTRA` :
                                          `R$ ${coupon.discount_value} EXTRA`}
                                    {coupon.min_value > 0 && ` • Min R$ ${coupon.min_value}`}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditCoupon(coupon)}>
                                    <Edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteCoupon(coupon.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                      </div>
                    </div>
                  </div>

                  {/* Outras Categorias */}
                  {[
                    { cat: "empresa", title: "Empresarial" },
                    { cat: "outros", title: "Catálogo Completo" }
                  ].map((group) => {
                    const groupItems = services.filter(s => s.category === group.cat);
                    if (groupItems.length === 0) return null;

                    return (
                      <div key={group.cat} className="mt-8">
                        <div className="bg-muted py-2 px-4 shadow-sm border-y text-xs uppercase tracking-widest font-bold text-foreground/70">
                          {group.title} ({groupItems.length})
                        </div>
                        <div className="divide-y">
                          {groupItems.map((service, index) => (
                            <div
                              key={service.id}
                              className="flex items-center gap-3 p-3 text-sm hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex flex-col items-center opacity-50 hover:opacity-100">
                                <button onClick={() => moveService(service, "up")} disabled={index === 0} className="disabled:invisible">
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button onClick={() => moveService(service, "down")} disabled={index === groupItems.length - 1} className="disabled:invisible">
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="h-10 w-10 shrink-0 border rounded-lg bg-muted flex items-center justify-center p-1">
                                {service.icon ? <img src={service.icon} className="h-full w-full object-contain" /> : <ImageIcon className="h-4 h-4" />}
                              </div>
                              <div className="flex-1 font-semibold truncate">{service.name}</div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(service)}>
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { setServiceToDelete(service); setIsDeleteModalOpen(true); }}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Delete Confirmation Modal */}
        <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você quer excluir esse serviço?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O serviço será removido permanentemente do catálogo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDeleteModalOpen(false);
                setServiceToDelete(null);
              }}>
                Não
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (serviceToDelete) {
                    handleDelete(serviceToDelete.id);
                    setServiceToDelete(null);
                  }
                  setIsDeleteModalOpen(false);
                }}
              >
                Sim
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* ── ORDERS VIEW ──────────────────────────────────── */}
        {view === "orders" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
              <Button variant="outline" size="icon" onClick={() => changeView("dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" />
                Histórico de Pedidos
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between border-b pb-4">
              <div className="flex gap-2 overflow-x-auto pb-2 flex-grow">
                <Button
                  variant={orderFilter === "todos" ? "default" : "outline"}
                  onClick={() => changeOrderFilter("todos")}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={orderFilter === "pendente" ? "default" : "outline"}
                  onClick={() => changeOrderFilter("pendente")}
                  size="sm"
                  className={orderFilter !== "pendente" ? "text-amber-600 border-amber-200 hover:bg-amber-50" : "bg-amber-600 hover:bg-amber-700 text-white"}
                >
                  Pendentes
                </Button>
                <Button
                  variant={orderFilter === "agendado" ? "default" : "outline"}
                  onClick={() => changeOrderFilter("agendado")}
                  size="sm"
                  className={orderFilter !== "agendado" ? "text-blue-600 border-blue-200 hover:bg-blue-50" : "bg-blue-600 hover:bg-blue-700"}
                >
                  Agendados
                </Button>
                <Button
                  variant={orderFilter === "concluido" ? "default" : "outline"}
                  onClick={() => changeOrderFilter("concluido")}
                  size="sm"
                  className={orderFilter !== "concluido" ? "text-green-600 border-green-200 hover:bg-green-50" : "bg-green-600 hover:bg-green-700"}
                >
                  Concluídos
                </Button>
                <Button
                  variant={orderFilter === "cancelado" ? "default" : "outline"}
                  onClick={() => changeOrderFilter("cancelado")}
                  size="sm"
                  className={orderFilter !== "cancelado" ? "text-red-600 border-red-200 hover:bg-red-50" : "bg-red-600 hover:bg-red-700"}
                >
                  Cancelados
                </Button>
              </div>
              <div className="shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-t-border mt-2 sm:mt-0 flex items-center justify-end">
                <Button
                  variant={orderFilter === "excluido" ? "default" : "outline"}
                  onClick={() => changeOrderFilter("excluido")}
                  size="sm"
                  className={orderFilter !== "excluido"
                    ? "text-black border-black hover:bg-gray-800 hover:text-white"
                    : "bg-black text-white hover:bg-gray-800 border-black"}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Lixeira
                </Button>
              </div>
            </div>

            {loadingOrders ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : adminOrders.filter(o => orderFilter === "todos" ? o.status !== "excluido" : o.status === orderFilter).length === 0 ? (
              <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
                <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado.</h3>
                <p className="text-muted-foreground">Não há pedidos para o filtro selecionado.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {adminOrders.filter(o => orderFilter === "todos" ? o.status !== "excluido" : o.status === orderFilter).map((order) => {
                  const date = new Date(order.created_at);
                  const scheduling = order.scheduling_data;
                  const customer = order.customer_data;
                  const statusColors: Record<string, string> = {
                    pendente: "bg-amber-100 text-amber-800 border-amber-200",
                    agendado: "bg-blue-100 text-blue-800 border-blue-200",
                    concluido: "bg-green-100 text-green-800 border-green-200",
                    cancelado: "bg-red-100 text-red-800 border-red-200"
                  };

                  return (
                    <div key={order.id} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                      <div className="bg-muted/30 px-6 py-4 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">ID Pedido: <span className="text-foreground">{(order.id || "").toString().slice(0, 8)}...</span></p>
                          <p className="text-sm font-semibold text-foreground mt-1">
                            {format(date, "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                          <h4 className="font-bold text-lg text-primary">R$ {parseFloat(order.total_price || "0").toFixed(2)}</h4>
                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase border cursor-pointer outline-none transition-colors ${statusColors[order.status] || "bg-gray-100 text-gray-800 border-gray-200"}`}
                            >
                              <option value="pendente">PENDENTE</option>
                              <option value="agendado">AGENDADO</option>
                              <option value="concluido">CONCLUÍDO</option>
                              <option value="cancelado">CANCELADO</option>
                            </select>

                            {/* Option 2: Completely Delete / Soft Delete to Lixeira */}
                            <button
                              onClick={() => handleTrashOrder(order.id, order.status)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-bold uppercase border transition-colors flex items-center gap-1 ${order.status === 'excluido' ? 'text-white bg-red-600 hover:bg-red-700 border-red-700' : 'text-red-600 bg-red-50 hover:bg-red-100 border-red-200'}`}
                              title="Mover para a lixeira ou apagar permanentemente"
                            >
                              <Trash2 className="h-4 w-4" /> {order.status === 'excluido' ? "Apagar Definitivo" : "Excluir"}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <h3 className="font-bold border-b pb-2 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Itens do Pedido
                          </h3>
                          <div className="space-y-3">
                            {Array.isArray(order.cart_items) ? order.cart_items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-start text-sm">
                                <div>
                                  <span className="font-semibold">{item?.quantity || 1}x</span> {item?.service?.name || "Serviço Desconhecido"}
                                  {item?.details && typeof item.details === 'string' && <p className="text-xs text-muted-foreground mt-1 ml-4">{item.details}</p>}
                                </div>
                                <span className="font-medium whitespace-nowrap ml-4">
                                  R$ {((Number(item?.price) || 0) * (Number(item?.quantity) || 1)).toFixed(2)}
                                </span>
                              </div>
                            )) : <p className="text-xs text-muted-foreground">Itens no formato incorreto.</p>}

                            {customer?.applied_coupon && (
                              <div className="pt-3 border-t mt-3 space-y-1">
                                <div className="flex justify-between items-center text-xs font-bold text-blue-600">
                                  <span>CUPOM APLICADO:</span>
                                  <span>{customer.applied_coupon}</span>
                                </div>
                                <div className={`flex justify-between items-center text-xs font-bold ${customer.coupon_discount < 0 ? 'text-green-600' : 'text-amber-600'}`}>
                                  <span>{customer.coupon_discount < 0 ? 'DESCONTO:' : 'ACRÉSCIMO:'}</span>
                                  <span>{customer.coupon_discount < 0 ? '-' : '+'} R$ {Math.abs(customer.coupon_discount).toFixed(2)}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-bold border-b pb-2 flex items-center gap-2">
                            <User className="w-4 h-4" /> Cliente / Endereço
                          </h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="font-semibold text-foreground">{customer?.name || "Sem Nome"}</p>
                            <p>{customer?.phone || "Sem Telefone"} | {customer?.email || "Sem e-mail"}</p>
                            {customer?.cpf && <p>CPF: {customer.cpf}</p>}
                            <div className="pt-2 border-t mt-2">
                              <p className="flex items-start gap-2">
                                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                <span>
                                  {customer?.address}, {customer?.number}<br />
                                  {customer?.neighborhood}, {customer?.city}/{customer?.state} - {customer?.zipCode}<br />
                                  {customer?.complement && <span className="italic">Ref: {customer.complement}</span>}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="font-bold border-b pb-2 flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" /> Agendamento
                          </h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="flex items-center gap-2 font-medium text-foreground"><CalendarIcon className="w-4 h-4 shrink-0 text-primary" /> Data: {scheduling?.date}</p>
                            <p className="flex items-center gap-2 font-medium text-foreground"><Clock className="w-4 h-4 shrink-0 text-primary" /> Período: {scheduling?.timeSlot}</p>
                            <p className="flex items-center gap-2 mt-2"><b>Voltagem:</b> {scheduling?.voltage}</p>
                            {scheduling?.observations && (
                              <p className="mt-2 text-xs italic bg-muted/50 p-2 rounded-md border border-border">
                                " {scheduling.observations} "
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── CLIENTS VIEW ──────────────────────────────────── */}
        {view === "clients" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="icon" onClick={() => changeView("dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <User className="h-6 w-6 text-primary" />
                Clientes Cadastrados ({adminClients.length})
              </h2>
            </div>

            <div className="relative max-w-md mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>

            {loadingClients ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : adminClients.length === 0 ? (
              <div className="bg-card rounded-xl shadow-sm border border-border p-12 text-center">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhum cliente cadastrado.</h3>
                <p className="text-muted-foreground">Não há perfis de clientes salvos na base de dados.</p>
              </div>
            ) : (() => {
              const filtered = adminClients.filter(client => {
                const searchTerm = clientSearchQuery.toLowerCase();
                return (client.full_name?.toLowerCase().includes(searchTerm) ||
                  client.name?.toLowerCase().includes(searchTerm) ||
                  client.email?.toLowerCase().includes(searchTerm));
              });
              const totalPages = Math.ceil(filtered.length / CLIENTS_PER_PAGE);
              const paginated = filtered.slice((clientPage - 1) * CLIENTS_PER_PAGE, clientPage * CLIENTS_PER_PAGE);
              return (
                <>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {paginated.map((client) => {
                      const recordDate = client.created_at || client.updated_at;
                      const date = recordDate ? new Date(recordDate) : new Date();
                      return (
                        <div key={client.id} className="bg-card rounded-xl shadow-sm border border-border p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4 border-b border-border pb-4 relative">
                            <button
                              onClick={() => handleDeleteClient(client.id)}
                              className="absolute -top-2 -right-2 p-1.5 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground rounded-full transition-colors opacity-60 hover:opacity-100"
                              title="Excluir Cliente Permanentemente"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                              {(client.full_name || client.name || "U")[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-lg text-foreground truncate">{client.full_name || client.name || "Cliente sem Nome"}</h4>
                              <p className="text-sm text-muted-foreground truncate">{client.email || "Sem e-mail"}</p>
                            </div>
                          </div>

                          <div className="space-y-3 text-sm text-foreground">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary/50 flex flex-col items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-muted-foreground" />
                              </div>
                              {client.phone || <i className="text-muted-foreground">Telefone não informado</i>}
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary/50 flex flex-col items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                              </div>
                              <span className="line-clamp-3 leading-snug pt-1">
                                {client.street ? (
                                  <>
                                    {client.street}, {client.number || "S/N"}<br />
                                    {client.neighborhood && <>{client.neighborhood} - </>}{client.city}/{client.state}
                                  </>
                                ) : (
                                  <i className="text-muted-foreground">Endereço não informado</i>
                                )}
                              </span>
                            </div>
                          </div>

                          <div className="mt-auto pt-4 flex gap-2 justify-between items-center text-xs text-muted-foreground border-t border-border">
                            <span className="flex items-center gap-1 font-medium bg-muted px-2 py-1 rounded-md">
                              <CalendarIcon className="w-3.5 h-3.5" /> ID: {client.id.slice(0, 8).toUpperCase()}...
                            </span>
                            <span>Registrado em {format(date, "dd/MM/yyyy")}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Paginação */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                      <button
                        onClick={() => setClientPage(p => Math.max(1, p - 1))}
                        disabled={clientPage === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-card hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-semibold text-muted-foreground">
                        Página {clientPage} de {totalPages}
                      </span>
                      <button
                        onClick={() => setClientPage(p => Math.min(totalPages, p + 1))}
                        disabled={clientPage === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-full border border-border bg-card hover:bg-primary hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              );
            })()}

          </div>
        )}

        {/* ── BLOG VIEW ──────────────────────────────────── */}
        {view === "blog" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="icon" onClick={() => changeView("dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-primary" />
                  Artigos do Blog
                </h2>
                <p className="text-muted-foreground text-sm">
                  Gerencie as publicações que aparecem na aba "Blog" do site.
                </p>
              </div>
              <div className="ml-auto">
                <Button onClick={() => { resetBlogForm(); setIsBlogModalOpen(true); }}>
                  <Plus className="mr-2 h-4 w-4" /> Escrever Artigo
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6 items-center">
              {(() => {
                const uniqueCategories = Array.from(new Set(articles.map(a => a.category).filter(Boolean)));
                const cats = ["Todos", ...Array.from(new Set([...uniqueCategories, ...adminExtraCategories]))];
                return cats.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAdminBlogActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${adminBlogActiveCategory === cat
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary"
                      }`}
                  >
                    {cat}
                  </button>
                ));
              })()}

              {/* Add Category */}
              {isAddingCategory ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    type="text"
                    value={newCategoryInput}
                    onChange={e => setNewCategoryInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newCategoryInput.trim()) {
                        setAdminExtraCategories(prev => [...prev, newCategoryInput.trim()]);
                        setNewCategoryInput("");
                        setIsAddingCategory(false);
                      }
                      if (e.key === 'Escape') { setIsAddingCategory(false); setNewCategoryInput(""); }
                    }}
                    placeholder="Nova categoria..."
                    className="px-3 py-1.5 rounded-full border border-primary text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary w-40"
                  />
                  <button
                    onClick={() => {
                      if (newCategoryInput.trim()) {
                        setAdminExtraCategories(prev => [...prev, newCategoryInput.trim()]);
                      }
                      setNewCategoryInput("");
                      setIsAddingCategory(false);
                    }}
                    className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors text-lg font-bold leading-none"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => { setIsAddingCategory(false); setNewCategoryInput(""); }}
                    className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors text-sm font-bold"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingCategory(true)}
                  className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 text-slate-400 hover:border-primary hover:text-primary flex items-center justify-center transition-all text-lg font-bold"
                  title="Adicionar nova categoria"
                >
                  +
                </button>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles
                .filter(a => adminBlogActiveCategory === "Todos" ? true : a.category === adminBlogActiveCategory)
                .map((article) => (
                  <div key={article.id} className="bg-card rounded-xl shadow-sm border border-border p-4 flex flex-col group transition-all hover:shadow-md">
                    <div className="relative h-40 rounded-lg overflow-hidden bg-muted mb-4">
                      <img src={article.image} alt={article.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 left-2 bg-background/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-primary">
                        {article.category}
                      </div>
                      {article.is_featured && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-950 text-[10px] font-black px-2 py-1 rounded-md shadow-sm border border-yellow-500 flex items-center gap-1">
                          ⭐ DESTAQUE
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2" title={article.title}>
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                      <span className="text-xs text-muted-foreground">{article.date}</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditArticle(article)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Editar Artigo">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteArticle(article.id)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" title="Excluir Artigo">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {/* Modal de Editar/Criar Artigo do Blog */}
            <Dialog.Root open={isBlogModalOpen} onOpenChange={(open) => { if (!open) resetBlogForm(); }}>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" />
                <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] bg-background p-6 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 outline-none flex flex-col">

                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <Dialog.Title className="text-xl font-bold flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" />
                      {editingArticleId ? "Editar Artigo" : "Novo Artigo"}
                    </Dialog.Title>
                    <button onClick={resetBlogForm} className="text-muted-foreground hover:text-foreground p-2 rounded-full hover:bg-muted">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 space-y-4">
                      <Label className="font-semibold text-sm">Capa do Artigo</Label>
                      <div className="relative aspect-square w-full rounded-xl border-2 border-dashed border-border bg-muted/30 overflow-hidden flex items-center justify-center group flex-col gap-2">
                        {iconPreview ? (
                          <img src={iconPreview} alt="Capa Preview" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                        )}

                        <label
                          htmlFor="blog-image-upload"
                          className="relative z-10 cursor-pointer rounded-lg bg-background/80 backdrop-blur px-4 py-2 text-sm font-semibold shadow-sm hover:bg-background transition-colors border border-border"
                        >
                          {iconPreview ? 'Trocar Imagem' : 'Fazer Upload'}
                          <input
                            id="blog-image-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleFileChange}
                          />
                        </label>
                      </div>
                    </div>

                    <div className="md:col-span-2 space-y-4">
                      <div className="space-y-2">
                        <Label className="font-semibold text-sm">Título do Artigo</Label>
                        <Input
                          value={articleTitle}
                          onChange={(e) => setArticleTitle(e.target.value)}
                          placeholder="Digite um título atrativo"
                          className="font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold text-sm">Categoria</Label>
                        <Input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={articleCategory}
                          onChange={(e) => setArticleCategory(e.target.value)}
                          placeholder="Ex: Saúde, Cuidados, Dicas..."
                          list="category-suggestions"
                        />
                        <datalist id="category-suggestions">
                          {Array.from(new Set([...articles.map(a => a.category).filter(Boolean), ...adminExtraCategories])).map(c => (
                            <option key={c} value={c} />
                          ))}
                        </datalist>
                      </div>

                      <div className="flex items-center gap-2 pt-2 pb-4">
                        <Switch
                          id="is-featured"
                          checked={isFeatured}
                          onCheckedChange={setIsFeatured}
                        />
                        <Label htmlFor="is-featured" className="text-sm font-bold text-slate-700 cursor-pointer">
                          ⭐ Marcar como Destaque do Blog
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-semibold text-sm">Resumo do Artigo (Aparece na listagem)</Label>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Breve descrição que convida à leitura..."
                          value={articleExcerpt}
                          onChange={(e) => setArticleExcerpt(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2 flex-1">
                        <Label className="font-semibold text-sm">Conteúdo Completo (Página Interna)</Label>
                        <textarea
                          className="flex min-h-[220px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                          placeholder="Escreva o texto completo do artigo aqui..."
                          value={articleContent}
                          onChange={(e) => setArticleContent(e.target.value)}
                        />
                        <p className="text-[11px] text-muted-foreground italic">Dica: Use parágrafos simples para facilitar a leitura.</p>
                      </div>

                      {/* Seções em Ordem Dinâmica no Editor */}
                      <div className="space-y-8 mt-6">
                        {sectionsOrder.map((sectionId, index) => {
                          const sectionLabels: Record<string, string> = {
                            benefits: "Seção de Benefícios 1",
                            benefits2: "Seção de Benefícios 2",
                            benefits3: "Seção de Benefícios 3",
                            quote: "Frase em Destaque (Balão) 1",
                            quote2: "Frase em Destaque (Balão) 2",
                            quote3: "Frase em Destaque (Balão) 3",
                            avoid: "Seção Evitar 1",
                            avoid2: "Seção Evitar 2",
                            avoid3: "Seção Evitar 3",
                            image1: "Seção de Imagem 1",
                            image2: "Seção de Imagem 2",
                            image3: "Seção de Imagem 3",
                            video1: "Seção de Vídeo 1",
                            video2: "Seção de Vídeo 2",
                            video3: "Seção de Vídeo 3",
                            extra: "Seção Extra (Título e Conteúdo)"
                          };

                          const renderSectionContent = () => {
                            if (sectionId.startsWith('benefits')) {
                              const isB1 = sectionId === 'benefits';
                              const isB2 = sectionId === 'benefits2';

                              const show = isB1 ? showBenefits : isB2 ? showBenefits2 : showBenefits3;
                              const setShow = isB1 ? setShowBenefits : isB2 ? setShowBenefits2 : setShowBenefits3;
                              const title = isB1 ? benefitsTitle : isB2 ? benefits2Title : benefits3Title;
                              const setTitle = isB1 ? setBenefitsTitle : isB2 ? setBenefits2Title : setBenefits3Title;
                              const list = isB1 ? benefitsList : isB2 ? benefits2List : benefits3List;
                              const setList = isB1 ? setBenefitsList : isB2 ? setBenefits2List : setBenefits3List;

                              return (
                                <div key={sectionId} className="border-t border-slate-100 pt-6 space-y-6 bg-white/50 p-4 rounded-xl border border-dashed border-slate-200">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                                        {index + 1}º
                                      </span>
                                      <Label className="font-bold text-base flex items-center gap-2">
                                        {sectionLabels[sectionId]}
                                      </Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItemInArray(sectionsOrder, setSectionsOrder, index, 'up')}>
                                          <ArrowUp className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItemInArray(sectionsOrder, setSectionsOrder, index, 'down')}>
                                          <ArrowDown className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600 hover:bg-green-50" onClick={() => handleDuplicateSection(sectionId, index)}>
                                          <Plus className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => setSectionsOrder(sectionsOrder.filter((_, i) => i !== index))} title="Remover da Ordem">
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{show ? "Ativada" : "Desativada"}</span>
                                        <Switch checked={show} onCheckedChange={setShow} />
                                      </div>
                                    </div>
                                  </div>

                                  {show && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                      <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase text-slate-500">Título da Seção</Label>
                                        <Input
                                          value={title}
                                          onChange={(e) => setTitle(e.target.value)}
                                          placeholder="Ex: O Que Você Ganha Com Isso?"
                                        />
                                      </div>

                                      <div className="space-y-3">
                                        <Label className="text-xs font-semibold uppercase text-slate-500">Blocos de Benefícios ({list.length})</Label>
                                        <div className="space-y-3">
                                          {list.map((benefit, idx) => (
                                            <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative group">
                                              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                  onClick={() => moveItemInArray(list, setList, idx, 'up')}
                                                  className="w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary"
                                                >
                                                  <ArrowUp className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => moveItemInArray(list, setList, idx, 'down')}
                                                  className="w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary"
                                                >
                                                  <ArrowDown className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => setList([...list.slice(0, idx + 1), JSON.parse(JSON.stringify(list[idx])), ...list.slice(idx + 1)])}
                                                  className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600"
                                                >
                                                  <Plus className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => setList(list.filter((_, i) => i !== idx))}
                                                  className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                                >
                                                  <X className="w-3 h-3" />
                                                </button>
                                              </div>
                                              <Input
                                                className="font-bold text-sm mb-1 h-8 bg-transparent border-none focus-visible:ring-0 p-0"
                                                value={benefit.title}
                                                onChange={(e) => {
                                                  const newList = [...list];
                                                  newList[idx].title = e.target.value;
                                                  setList(newList);
                                                }}
                                                placeholder="Título do benefício"
                                              />
                                              <textarea
                                                className="w-full text-xs text-slate-600 bg-transparent border-none focus-visible:ring-0 p-0 resize-none h-12"
                                                value={benefit.description}
                                                onChange={(e) => {
                                                  const newList = [...list];
                                                  newList[idx].description = e.target.value;
                                                  setList(newList);
                                                }}
                                                placeholder="Descrição curta..."
                                              />
                                            </div>
                                          ))}
                                          <Button
                                            variant="outline"
                                            className="w-full border-dashed border-2 h-12 hover:border-primary hover:text-primary transition-all bg-white"
                                            onClick={() => setList([...list, { title: "Novo Benefício", description: "Descrição do benefício aqui..." }])}
                                          >
                                            <Plus className="w-4 h-4 mr-2" /> Adicionar Bloco
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            if (sectionId.startsWith('avoid')) {
                              const isA1 = sectionId === 'avoid';
                              const isA2 = sectionId === 'avoid2';

                              const show = isA1 ? showAvoid : isA2 ? showAvoid2 : showAvoid3;
                              const setShow = isA1 ? setShowAvoid : isA2 ? setShowAvoid2 : setShowAvoid3;
                              const title = isA1 ? avoidTitle : isA2 ? avoid2Title : avoid3Title;
                              const setTitle = isA1 ? setAvoidTitle : isA2 ? setAvoid2Title : setAvoid3Title;
                              const list = isA1 ? avoidList : isA2 ? avoid2List : avoid3List;
                              const setList = isA1 ? setAvoidList : isA2 ? setAvoid2List : setAvoid3List;

                              return (
                                <div key={sectionId} className="border-t border-slate-100 pt-6 space-y-6 bg-red-50/30 p-4 rounded-xl border border-dashed border-red-200">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-600 text-[10px] font-bold border border-red-200">
                                        {index + 1}º
                                      </span>
                                      <Label className="font-bold text-base flex items-center gap-2 text-red-700">
                                        {sectionLabels[sectionId]}
                                      </Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1 bg-white p-1 rounded-md border border-red-100 shadow-sm">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItemInArray(sectionsOrder, setSectionsOrder, index, 'up')}>
                                          <ArrowUp className="w-3 h-3 text-red-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItemInArray(sectionsOrder, setSectionsOrder, index, 'down')}>
                                          <ArrowDown className="w-3 h-3 text-red-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600 hover:bg-green-50" onClick={() => handleDuplicateSection(sectionId, index)}>
                                          <Plus className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => setSectionsOrder(sectionsOrder.filter((_, i) => i !== index))} title="Remover da Ordem">
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-red-600/70 font-medium">{show ? "Ativada" : "Desativada"}</span>
                                        <Switch checked={show} onCheckedChange={setShow} className="data-[state=checked]:bg-red-500" />
                                      </div>
                                    </div>
                                  </div>

                                  {show && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                      <div className="space-y-2">
                                        <Label className="text-xs font-semibold uppercase text-red-400">Título da Seção</Label>
                                        <Input
                                          value={title}
                                          onChange={(e) => setTitle(e.target.value)}
                                          placeholder="Ex: O Que Você Deve Evitar"
                                          className="border-red-100 focus-visible:ring-red-200"
                                        />
                                      </div>

                                      <div className="space-y-3">
                                        <Label className="text-xs font-semibold uppercase text-red-400">Blocos de Alerta ({list.length})</Label>
                                        <div className="space-y-3">
                                          {list.map((item, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded-lg border border-red-100 relative group shadow-sm">
                                              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                  onClick={() => moveItemInArray(list, setList, idx, 'up')}
                                                  className="w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-500"
                                                >
                                                  <ArrowUp className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => moveItemInArray(list, setList, idx, 'down')}
                                                  className="w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-500"
                                                >
                                                  <ArrowDown className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => setList([...list.slice(0, idx + 1), JSON.parse(JSON.stringify(list[idx])), ...list.slice(idx + 1)])}
                                                  className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600"
                                                >
                                                  <Plus className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => setList(list.filter((_, i) => i !== idx))}
                                                  className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                                >
                                                  <X className="w-3 h-3" />
                                                </button>
                                              </div>
                                              <Input
                                                className="font-bold text-sm mb-1 h-8 bg-transparent border-none focus-visible:ring-0 p-0 text-red-700"
                                                value={item.title}
                                                onChange={(e) => {
                                                  const newList = [...list];
                                                  newList[idx].title = e.target.value;
                                                  setList(newList);
                                                }}
                                                placeholder="Título do alerta"
                                              />
                                              <textarea
                                                className="w-full text-xs text-slate-600 bg-transparent border-none focus-visible:ring-0 p-0 resize-none h-12"
                                                value={item.description}
                                                onChange={(e) => {
                                                  const newList = [...list];
                                                  newList[idx].description = e.target.value;
                                                  setList(newList);
                                                }}
                                                placeholder="Por que evitar isso?..."
                                              />
                                            </div>
                                          ))}
                                          <Button
                                            variant="outline"
                                            className="w-full border-dashed border-2 h-12 border-red-100 hover:border-red-400 hover:text-red-600 transition-all bg-white text-red-400"
                                            onClick={() => setList([...list, { title: "Novo Alerta", description: "Descrição do risco ou erro comum aqui..." }])}
                                          >
                                            <Plus className="w-4 h-4 mr-2" /> Adicionar Bloco
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            if (sectionId.startsWith('quote')) {
                              const isQ1 = sectionId === 'quote';
                              const isQ2 = sectionId === 'quote2';

                              const showQ = isQ1 ? showQuote : isQ2 ? showQuote2 : showQuote3;
                              const setShowQ = isQ1 ? setShowQuote : isQ2 ? setShowQuote2 : setShowQuote3;
                              const quoteValue = isQ1 ? articleQuote : isQ2 ? articleQuote2 : articleQuote3;
                              const setQuoteValue = isQ1 ? setArticleQuote : isQ2 ? setArticleQuote2 : setArticleQuote3;

                              return (
                                <div key={sectionId} className="border-t border-slate-100 pt-6 space-y-4 bg-white/50 p-4 rounded-xl border border-dashed border-slate-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                                        {index + 1}º
                                      </span>
                                      <Label className="font-bold text-base flex items-center gap-2">
                                        {sectionLabels[sectionId]}
                                      </Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItemInArray(sectionsOrder, setSectionsOrder, index, 'up')}>
                                          <ArrowUp className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItemInArray(sectionsOrder, setSectionsOrder, index, 'down')}>
                                          <ArrowDown className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600 hover:bg-green-50" onClick={() => handleDuplicateSection(sectionId, index)}>
                                          <Plus className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => setSectionsOrder(sectionsOrder.filter((_, i) => i !== index))} title="Remover da Ordem">
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{showQ ? "Ativado" : "Desativado"}</span>
                                        <Switch checked={showQ} onCheckedChange={setShowQ} />
                                      </div>
                                    </div>
                                  </div>

                                  {showQ && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                      <Label className="text-xs font-semibold uppercase text-slate-500">Texto do Balão</Label>
                                      <textarea
                                        className="w-full min-h-[100px] p-4 rounded-xl border border-slate-200 text-sm italic text-slate-700 bg-slate-50 focus-visible:outline-none focus:ring-2 focus:ring-primary/20"
                                        placeholder="Digite a frase impactante aqui..."
                                        value={quoteValue}
                                        onChange={(e) => setQuoteValue(e.target.value)}
                                      />
                                      <p className="text-[10px] text-muted-foreground italic text-center">"O texto aparecerá centralizado como uma citação especial no artigo"</p>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            if (sectionId.startsWith('image') || sectionId.startsWith('video')) {
                              const isImg = sectionId.startsWith('image');
                              const is1 = sectionId.endsWith('1');
                              const is2 = sectionId.endsWith('2');

                              const show = isImg ? (is1 ? showImage1 : is2 ? showImage2 : showImage3) : (is1 ? showVideo1 : is2 ? showVideo2 : showVideo3);
                              const setShow = isImg ? (is1 ? setShowImage1 : is2 ? setShowImage2 : setShowImage3) : (is1 ? setShowVideo1 : is2 ? setShowVideo2 : setShowVideo3);
                              const value = isImg ? (is1 ? image1Url : is2 ? image2Url : image3Url) : (is1 ? video1Url : is2 ? video2Url : video3Url);
                              const setValue = isImg ? (is1 ? setImage1Url : is2 ? setImage2Url : setImage3Url) : (is1 ? setVideo1Url : is2 ? setVideo2Url : setVideo3Url);

                              return (
                                <div key={sectionId} className="border-t border-slate-100 pt-6 space-y-4 bg-white/50 p-4 rounded-xl border border-dashed border-slate-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                                        {index + 1}º
                                      </span>
                                      <Label className="font-bold text-base flex items-center gap-2">
                                        {sectionLabels[sectionId]}
                                      </Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItemInArray(sectionsOrder, setSectionsOrder, index, 'up')}>
                                          <ArrowUp className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItemInArray(sectionsOrder, setSectionsOrder, index, 'down')}>
                                          <ArrowDown className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600 hover:bg-green-50" onClick={() => handleDuplicateSection(sectionId, index)}>
                                          <Plus className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => setSectionsOrder(sectionsOrder.filter((_, i) => i !== index))} title="Remover da Ordem">
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{show ? "Ativado" : "Desativado"}</span>
                                        <Switch checked={show} onCheckedChange={setShow} />
                                      </div>
                                    </div>
                                  </div>

                                  {show && (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                      {isImg ? (
                                        <div className="space-y-3">
                                          <Label className="text-xs font-semibold uppercase text-slate-500">Imagem da Seção</Label>
                                          <div className="flex items-start gap-4">
                                            <div className="flex-1 aspect-video bg-white rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group/img">
                                              {value ? (
                                                <>
                                                  <img src={value} alt="Preview" className="w-full h-full object-cover" />
                                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white" onClick={() => document.getElementById(`section-img-${sectionId}`)?.click()}>
                                                      <ImageIcon className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-red-500" onClick={() => setValue("")}>
                                                      <X className="w-4 h-4" />
                                                    </Button>
                                                  </div>
                                                </>
                                              ) : (
                                                <Button variant="ghost" className="w-full h-full flex flex-col gap-1 text-slate-400" onClick={() => document.getElementById(`section-img-${sectionId}`)?.click()}>
                                                  <Plus className="w-6 h-6" />
                                                  <span className="text-[10px] uppercase font-bold">Adicionar Foto</span>
                                                </Button>
                                              )}
                                              <input
                                                id={`section-img-${sectionId}`}
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) handleBlogSectionImageUpload(file, sectionId);
                                                }}
                                              />
                                            </div>
                                            <div className="w-full md:w-64 space-y-2">
                                              <Label className="text-[10px] font-bold uppercase text-slate-400">Ou cole uma URL</Label>
                                              <Input
                                                value={value}
                                                onChange={(e) => setValue(e.target.value)}
                                                placeholder="https://..."
                                                className="h-8 text-[11px]"
                                              />
                                              <p className="text-[9px] text-muted-foreground italic">Recomendado usar upload para garantir permanência.</p>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-3">
                                          <Label className="text-xs font-semibold uppercase text-slate-500">URL do Vídeo (YouTube/Vimeo)</Label>
                                          <Input
                                            value={value}
                                            onChange={(e) => setValue(e.target.value)}
                                            placeholder="https://youtube.com/watch?v=..."
                                          />
                                          {value && <div className="mt-2 text-[10px] text-muted-foreground italic flex items-center gap-1"><Check className="w-3 h-3" /> Vídeo configurado</div>}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            if (sectionId === 'extra') {
                              return (
                                <div key="extra" className="border-t border-slate-100 pt-6 space-y-4 bg-white/50 p-4 rounded-xl border border-dashed border-slate-200">
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                                        {index + 1}º
                                      </span>
                                      <Label className="font-bold text-base flex items-center gap-2">
                                        {sectionLabels.extra}
                                      </Label>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md">
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItemInArray(sectionsOrder, setSectionsOrder, index, 'up')}>
                                          <ArrowUp className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => moveItemInArray(sectionsOrder, setSectionsOrder, index, 'down')}>
                                          <ArrowDown className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-green-600 hover:bg-green-50" onClick={() => handleDuplicateSection(sectionId, index)}>
                                          <Plus className="w-3 h-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => setSectionsOrder(sectionsOrder.filter((_, i) => i !== index))} title="Remover da Ordem">
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">{showExtraSection ? "Ativada" : "Desativada"}</span>
                                        <Switch checked={showExtraSection} onCheckedChange={setShowExtraSection} />
                                      </div>
                                    </div>
                                  </div>

                                  {showExtraSection && (
                                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                      {extraSectionsList.map((section, idx) => (
                                        <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 relative group">
                                          <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                              onClick={() => moveItemInArray(extraSectionsList, setExtraSectionsList, idx, 'up')}
                                              className="w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary"
                                            >
                                              <ArrowUp className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => moveItemInArray(extraSectionsList, setExtraSectionsList, idx, 'down')}
                                              className="w-6 h-6 bg-slate-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary"
                                            >
                                              <ArrowDown className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => setExtraSectionsList([...extraSectionsList.slice(0, idx + 1), JSON.parse(JSON.stringify(extraSectionsList[idx])), ...extraSectionsList.slice(idx + 1)])}
                                              className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600"
                                            >
                                              <Plus className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => setExtraSectionsList(extraSectionsList.filter((_, i) => i !== idx))}
                                              className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                          <div className="space-y-4">
                                            <div className="flex flex-col md:flex-row gap-4">
                                              <div className="flex-1 space-y-4">
                                                <div className="space-y-1.5">
                                                  <Label className="text-[10px] font-bold uppercase text-slate-400">Título do Bloco #{idx + 1}</Label>
                                                  <Input
                                                    value={section.title}
                                                    onChange={(e) => {
                                                      const newList = [...extraSectionsList];
                                                      newList[idx].title = e.target.value;
                                                      setExtraSectionsList(newList);
                                                    }}
                                                    placeholder="Ex: Por que contratar um profissional?"
                                                    className="bg-white"
                                                  />
                                                </div>
                                                <div className="space-y-1.5">
                                                  <Label className="text-[10px] font-bold uppercase text-slate-400">Conteúdo do Bloco</Label>
                                                  <textarea
                                                    className="w-full min-h-[120px] p-3 rounded-lg border border-slate-200 text-sm text-slate-700 bg-white focus-visible:outline-none focus:ring-2 focus:ring-primary/20"
                                                    placeholder="Desenvolva o texto aqui..."
                                                    value={section.content}
                                                    onChange={(e) => {
                                                      const newList = [...extraSectionsList];
                                                      newList[idx].content = e.target.value;
                                                      setExtraSectionsList(newList);
                                                    }}
                                                  />
                                                </div>
                                              </div>

                                              <div className="w-full md:w-48 space-y-3">
                                                <Label className="text-[10px] font-bold uppercase text-slate-400">Imagem do Bloco</Label>
                                                <div className="aspect-video bg-white rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group/img">
                                                  {section.image ? (
                                                    <>
                                                      <img src={section.image} alt="Preview" className="w-full h-full object-cover" />
                                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white" onClick={() => {
                                                          const input = document.getElementById(`extra-img-${idx}`) as HTMLInputElement;
                                                          input?.click();
                                                        }}>
                                                          <ImageIcon className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-red-500" onClick={() => {
                                                          const newList = [...extraSectionsList];
                                                          newList[idx].image = undefined;
                                                          setExtraSectionsList(newList);
                                                        }}>
                                                          <X className="w-4 h-4" />
                                                        </Button>
                                                      </div>
                                                    </>
                                                  ) : (
                                                    <Button variant="ghost" className="w-full h-full flex flex-col gap-1 text-slate-400" onClick={() => {
                                                      const input = document.getElementById(`extra-img-${idx}`) as HTMLInputElement;
                                                      input?.click();
                                                    }}>
                                                      <Plus className="w-6 h-6" />
                                                      <span className="text-[10px] uppercase font-bold text-center">Add Imagem</span>
                                                    </Button>
                                                  )}
                                                  <input
                                                    id={`extra-img-${idx}`}
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                      const file = e.target.files?.[0];
                                                      if (file) handleExtraSectionImageUpload(file, idx);
                                                    }}
                                                  />
                                                </div>

                                                {section.image && (
                                                  <div className="space-y-1.5">
                                                    <Label className="text-[10px] font-bold uppercase text-slate-400">Alinhamento</Label>
                                                    <div className="flex gap-1 p-1 bg-white border border-slate-200 rounded-md">
                                                      <Button
                                                        variant={section.imageAlignment === 'left' ? 'default' : 'ghost'}
                                                        className="flex-1 h-7 text-[10px] px-1 gap-1"
                                                        onClick={() => {
                                                          const newList = [...extraSectionsList];
                                                          newList[idx].imageAlignment = 'left';
                                                          setExtraSectionsList(newList);
                                                        }}
                                                      >
                                                        <AlignLeft className="w-3 h-3" /> Esq.
                                                      </Button>
                                                      <Button
                                                        variant={section.imageAlignment === 'right' ? 'default' : 'ghost'}
                                                        className="flex-1 h-7 text-[10px] px-1 gap-1"
                                                        onClick={() => {
                                                          const newList = [...extraSectionsList];
                                                          newList[idx].imageAlignment = 'right';
                                                          setExtraSectionsList(newList);
                                                        }}
                                                      >
                                                        <AlignRight className="w-3 h-3" /> Dir.
                                                      </Button>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}

                                      <Button
                                        variant="outline"
                                        className="w-full border-dashed border-2 h-12 hover:border-primary hover:text-primary transition-all bg-white"
                                        onClick={() => setExtraSectionsList([...extraSectionsList, { title: "Novo Título", content: "Novo conteúdo de texto aqui...", imageAlignment: 'left' }])}
                                      >
                                        <Plus className="w-4 h-4 mr-2" /> Adicionar Bloco de Texto
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          };

                          return renderSectionContent();
                        })}

                        {/* Barra de Adição de Seções Dinâmicas */}
                        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                          <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                              <Plus className="w-4 h-4" /> Configurar Ordem do Artigo
                            </div>
                            <div className="flex flex-wrap justify-center gap-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white border-primary/20 hover:bg-primary/5 text-primary gap-2 font-bold text-xs h-9"
                                onClick={() => {
                                  const next = !sectionsOrder.includes('benefits') ? 'benefits' : !sectionsOrder.includes('benefits2') ? 'benefits2' : !sectionsOrder.includes('benefits3') ? 'benefits3' : null;
                                  if (next) { setSectionsOrder([...sectionsOrder, next]); if (next === 'benefits') setShowBenefits(true); else if (next === 'benefits2') setShowBenefits2(true); else setShowBenefits3(true); }
                                  else toast.error("Limite de seções de benefícios atingido.");
                                }}
                              >
                                <Plus className="w-3 h-3" /> Benefícios
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white border-primary/20 hover:bg-primary/5 text-primary gap-2 font-bold text-xs h-9"
                                onClick={() => {
                                  const nextQ = !sectionsOrder.includes('quote') ? 'quote' : !sectionsOrder.includes('quote2') ? 'quote2' : !sectionsOrder.includes('quote3') ? 'quote3' : null;
                                  if (nextQ) { setSectionsOrder([...sectionsOrder, nextQ]); if (nextQ === 'quote') setShowQuote(true); else if (nextQ === 'quote2') setShowQuote2(true); else setShowQuote3(true); }
                                  else toast.error("Limite de seções de frase atingido.");
                                }}
                              >
                                <Plus className="w-3 h-3" /> Frase (Balão)
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white border-primary/20 hover:bg-primary/5 text-primary gap-2 font-bold text-xs h-9"
                                onClick={() => { if (!sectionsOrder.includes('extra')) { setSectionsOrder([...sectionsOrder, 'extra']); setShowExtraSection(true); } else toast.info("A seção Extra já está na ordem."); }}
                              >
                                <Plus className="w-3 h-3" /> Conteúdo Extra
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white border-red-200 hover:bg-red-50 text-red-600 gap-2 font-bold text-xs h-9"
                                onClick={() => {
                                  const nextA = !sectionsOrder.includes('avoid') ? 'avoid' : !sectionsOrder.includes('avoid2') ? 'avoid2' : !sectionsOrder.includes('avoid3') ? 'avoid3' : null;
                                  if (nextA) { setSectionsOrder([...sectionsOrder, nextA]); if (nextA === 'avoid') setShowAvoid(true); else if (nextA === 'avoid2') setShowAvoid2(true); else setShowAvoid3(true); }
                                  else toast.error("Limite de seções 'Evitar' atingido.");
                                }}
                              >
                                <Plus className="w-3 h-3" /> Evitar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white border-blue-200 hover:bg-blue-50 text-blue-600 gap-2 font-bold text-xs h-9"
                                onClick={() => {
                                  const next = !sectionsOrder.includes('image1') ? 'image1' : !sectionsOrder.includes('image2') ? 'image2' : !sectionsOrder.includes('image3') ? 'image3' : null;
                                  if (next) { setSectionsOrder([...sectionsOrder, next]); if (next === 'image1') setShowImage1(true); else if (next === 'image2') setShowImage2(true); else setShowImage3(true); }
                                  else toast.error("Limite de seções de imagem atingido.");
                                }}
                              >
                                <Plus className="w-3 h-3" /> Imagem
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-white border-purple-200 hover:bg-purple-50 text-purple-600 gap-2 font-bold text-xs h-9"
                                onClick={() => {
                                  const next = !sectionsOrder.includes('video1') ? 'video1' : !sectionsOrder.includes('video2') ? 'video2' : !sectionsOrder.includes('video3') ? 'video3' : null;
                                  if (next) { setSectionsOrder([...sectionsOrder, next]); if (next === 'video1') setShowVideo1(true); else if (next === 'video2') setShowVideo2(true); else setShowVideo3(true); }
                                  else toast.error("Limite de seções de vídeo atingido.");
                                }}
                              >
                                <Plus className="w-3 h-3" /> Vídeo
                              </Button>
                            </div>
                            <p className="text-[10px] text-muted-foreground italic text-center">Use as setas em cada seção para reordenar a sequência no blog</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-border">
                    <Button variant="outline" onClick={resetBlogForm}>Cancelar</Button>
                    <Button onClick={handleSaveArticle} disabled={uploading}>
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-4 h-4 mr-2" /> Salvar Publicação
                        </>
                      )}
                    </Button>
                  </div>

                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>

          </div>
        )}

        {view === "orcamento_pdf" && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="outline" size="icon" onClick={() => changeView("dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Package className="h-6 w-6 text-primary" />
                  Orçamento em PDF
                </h2>
                <p className="text-muted-foreground text-sm">
                  Gerencie itens e gere orçamentos profissionais em PDF.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <Card className="border-primary/20 shadow-sm border-2">
                  <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="text-xl">Configurar Orçamento</CardTitle>
                      <CardDescription>Adicione serviços do catálogo ou itens manuais</CardDescription>
                    </div>
                    <Dialog.Root>
                      <Dialog.Trigger asChild>
                        <Button size="sm" className="gap-2 shadow-sm">
                          <Plus className="w-4 h-4" /> Catálogo
                        </Button>
                      </Dialog.Trigger>
                      <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
                        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-md bg-white rounded-2xl shadow-2xl p-6">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold">Adicionar do Catálogo</h3>
                            <Dialog.Close className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                              <X className="w-5 h-5" />
                            </Dialog.Close>
                          </div>
                          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {services.length === 0 ? (
                              <p className="text-center py-8 text-slate-400">Nenhum serviço encontrado.</p>
                            ) : (
                              services.map((s) => (
                                <button
                                  key={s.id}
                                  className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-between group"
                                  onClick={() => {
                                    setPdfItems([...pdfItems, { name: s.name, qty: 1, unitPrice: s.price || 0, desc: "" }]);
                                    toast.success(`${s.name} adicionado!`);
                                  }}
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                      {s.icon ? <img src={s.icon} className="w-6 h-6 object-contain" /> : <Package className="w-5 h-5 text-slate-400" />}
                                    </div>
                                    <div>
                                      <p className="font-bold text-sm group-hover:text-primary transition-colors">{s.name}</p>
                                      <p className="text-xs text-muted-foreground">Preço base: R$ {s.price?.toFixed(2)}</p>
                                    </div>
                                  </div>
                                  <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              ))
                            )}
                          </div>
                        </Dialog.Content>
                      </Dialog.Portal>
                    </Dialog.Root>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pdfItems.map((item, idx) => (
                      <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 relative group">
                        <button
                          className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 transition-colors"
                          onClick={() => setPdfItems(pdfItems.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase text-slate-500">Título</Label>
                            <Input
                              value={item.name}
                              onChange={(e) => {
                                const newItems = [...pdfItems];
                                newItems[idx].name = e.target.value;
                                setPdfItems(newItems);
                              }}
                              className="h-8 font-bold text-blue-600 bg-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase text-slate-500">Descrição/Obs</Label>
                            <Input
                              value={item.desc}
                              onChange={(e) => {
                                const newItems = [...pdfItems];
                                newItems[idx].desc = e.target.value;
                                setPdfItems(newItems);
                              }}
                              className="h-8 text-xs text-blue-400 bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase text-slate-500">Quantidade</Label>
                            <Input
                              type="number"
                              value={item.qty}
                              onChange={(e) => {
                                const newItems = [...pdfItems];
                                newItems[idx].qty = parseInt(e.target.value) || 0;
                                setPdfItems(newItems);
                              }}
                              className="h-8 text-center font-bold bg-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase text-slate-500">Valor Unitário</Label>
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => {
                                  const newItems = [...pdfItems];
                                  newItems[idx].unitPrice = parseFloat(e.target.value) || 0;
                                  setPdfItems(newItems);
                                }}
                                className="h-8 pl-8 font-bold bg-white"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase text-slate-500">Subtotal</Label>
                            <div className="h-8 flex items-center justify-end px-2 font-black text-green-600">
                              R$ {(item.qty * item.unitPrice).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" className="w-full gap-2 border-dashed" onClick={() => setPdfItems([...pdfItems, { name: "Novo Item", qty: 1, unitPrice: 0, desc: "" }])}>
                      <Plus className="w-4 h-4" /> Item Avulso
                    </Button>

                    {pdfItems.length > 0 && (
                      <div className="pt-2">
                        <Button variant="outline" className="w-full gap-2 border-red-100 text-red-500 hover:bg-red-50" onClick={() => setPdfItems([])}>
                          <Trash2 className="w-4 h-4" /> Limpar Tudo
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button className="flex-1 h-14 text-lg font-bold gap-2 shadow-lg shadow-primary/20" onClick={() => window.print()}>
                    <Printer className="w-5 h-5" /> Imprimir Proposta
                  </Button>
                </div>
              </div>

              {/* PDF Preview Area */}
              <div className="hidden lg:block">
                <div className="sticky top-8 bg-slate-800 rounded-3xl p-8 shadow-2xl min-h-[700px] flex flex-col items-center justify-center text-slate-400 border border-slate-700">
                  <Printer className="w-16 h-16 mb-6 opacity-10" />
                  <p className="text-sm font-medium">Pré-visualização do PDF</p>
                  <p className="text-[10px] uppercase tracking-widest mt-2 opacity-40">Clique em imprimir proposta</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "management" && (() => {
          // Automatic Revenue from Concluído Orders
          const orderRevenue = adminOrders
            .filter(o => o.status === "concluido")
            .reduce((acc, o) => acc + (parseFloat(o.total_price) || 0), 0);

          const manualRevenue = finances
            .filter(f => f.type === "entrada")
            .reduce((acc, f) => acc + (f.amount || 0), 0);

          const totalExpenses = finances
            .filter(f => f.type === "saida")
            .reduce((acc, f) => acc + (f.amount || 0), 0);

          const totalRevenue = orderRevenue + manualRevenue;
          const netProfit = totalRevenue - totalExpenses;

          return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={() => changeView("dashboard")} className="rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                      <DollarSign className="w-6 h-6 text-primary" /> Gestão Financeira
                    </h1>
                    <p className="text-muted-foreground text-sm">Controle de lucros, faturamento e despesas</p>
                  </div>
                </div>
                <Button onClick={() => { resetFinanceForm(); setIsFinanceModalOpen(true); }} className="rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  <Plus className="w-4 h-4 mr-2" /> Novo Registro
                </Button>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign className="w-16 h-16" /></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">Faturam. de Vendas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {orderRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <p className="text-[10px] mt-1 opacity-70 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Pedidos concluídos
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="w-16 h-16" /></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">Receita Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <p className="text-[10px] mt-1 opacity-70 flex items-center gap-1">
                      <ArrowUpRight className="w-3 h-3" /> Vendas + Entradas manuais
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-rose-500 to-rose-600 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingDown className="w-16 h-16" /></div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">Total Despesas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <p className="text-[10px] mt-1 opacity-70 flex items-center gap-1">
                      <ArrowDownRight className="w-3 h-3" /> Gastos operacionais
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-white border border-slate-100 overflow-hidden relative">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Resultado (Lucro)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ${netProfit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${Math.min(100, Math.max(0, (totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0)))}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Transactions Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="border-slate-200/60 shadow-sm rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 py-4">
                      <CardTitle className="text-lg font-bold">Fluxo de Caixa</CardTitle>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Filter className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Download className="w-4 h-4" /></Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {loadingFinances ? (
                        <div className="p-12 text-center animate-pulse text-slate-400">Carregando dados...</div>
                      ) : finances.length === 0 ? (
                        <div className="p-16 text-center text-slate-400">
                          <PieChart className="w-12 h-12 mx-auto mb-4 opacity-10" />
                          <p>Nenhum registro financeiro manual ainda.</p>
                          <p className="text-xs">As vendas concluídas aparecem automaticamente nas métricas acima.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                                <th className="px-6 py-4 text-left">Data</th>
                                <th className="px-6 py-4 text-left">Descrição</th>
                                <th className="px-6 py-4 text-left">Categoria</th>
                                <th className="px-6 py-4 text-right">Valor</th>
                                <th className="px-6 py-4 text-center">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {finances.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                  <td className="px-6 py-4 text-slate-500 font-medium">
                                    {format(new Date(item.date), "dd/MM/yyyy", { locale: ptBR })}
                                  </td>
                                  <td className="px-6 py-4 font-bold text-slate-700">{item.description}</td>
                                  <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-500">
                                      {item.category}
                                    </span>
                                  </td>
                                  <td className={`px-6 py-4 text-right font-black ${item.type === 'entrada' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {item.type === 'entrada' ? '+' : '-'} R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50" onClick={() => {
                                        setEditingFinanceId(item.id);
                                        setFinanceDescription(item.description);
                                        setFinanceAmount(item.amount.toString());
                                        setFinanceType(item.type);
                                        setFinanceCategory(item.category);
                                        setFinanceDate(item.date);
                                        setIsFinanceModalOpen(true);
                                      }}>
                                        <Edit className="w-3.5 h-3.5" />
                                      </Button>
                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleDeleteFinance(item.id)}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <Card className="border-none shadow-sm bg-slate-50 rounded-2xl p-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-primary" /> Distribuição Financeira
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-slate-500">Vendas (Produtos)</span>
                          <span className="text-sm font-black text-emerald-600">
                            {totalRevenue > 0 ? Math.round((orderRevenue / totalRevenue) * 100) : 0}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${totalRevenue > 0 ? (orderRevenue / totalRevenue) * 100 : 0}%` }} />
                        </div>
                      </div>
                      <div className="p-4 bg-white rounded-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-slate-500">Custos / Despesas</span>
                          <span className="text-sm font-black text-rose-600">
                            {totalRevenue > 0 ? Math.round((totalExpenses / totalRevenue) * 100) : 0}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500" style={{ width: `${totalRevenue > 0 ? Math.min(100, (totalExpenses / totalRevenue) * 100) : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><AlertCircle className="w-24 h-24" /></div>
                    <h4 className="font-bold text-primary mb-2">Resumo Automático</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Este painel consolida automaticamente as receitas de todas as suas vendas com status <b>concluído</b>. As despesas e outras entradas devem ser lançadas manualmente no botão <b>Novo Registro</b>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Finance Modal */}
              <Dialog.Root open={isFinanceModalOpen} onOpenChange={setIsFinanceModalOpen}>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-lg bg-white rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between mb-8">
                      <Dialog.Title className="text-2xl font-bold">
                        {editingFinanceId ? 'Editar Lançamento' : 'Novo Lançamento'}
                      </Dialog.Title>
                      <Dialog.Close asChild>
                        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                      </Dialog.Close>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          className={`flex items-center justify-center gap-2 h-14 rounded-2xl border-2 transition-all font-bold ${financeType === 'entrada' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-transparent text-slate-400'}`}
                          onClick={() => setFinanceType("entrada")}
                        >
                          <TrendingUp className="w-5 h-5" /> Receita
                        </button>
                        <button
                          className={`flex items-center justify-center gap-2 h-14 rounded-2xl border-2 transition-all font-bold ${financeType === 'saida' ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-slate-50 border-transparent text-slate-400'}`}
                          onClick={() => setFinanceType("saida")}
                        >
                          <TrendingDown className="w-5 h-5" /> Despesa
                        </button>
                      </div>

                      <div className="space-y-2">
                        <Label>Valor do Lançamento</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                          <Input
                            value={financeAmount}
                            onChange={(e) => setFinanceAmount(e.target.value)}
                            placeholder="0,00"
                            className="h-14 pl-12 text-xl font-bold rounded-2xl border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Descrição / Nome</Label>
                        <Input
                          value={financeDescription}
                          onChange={(e) => setFinanceDescription(e.target.value)}
                          placeholder="Ex: Aluguel, Compra de material, etc."
                          className="h-12 rounded-xl border-slate-200"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Categoria</Label>
                          <select
                            value={financeCategory}
                            onChange={(e) => setFinanceCategory(e.target.value)}
                            className="w-full h-12 rounded-xl border-slate-200 border bg-white px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                          >
                            <option>Marketing</option>
                            <option>Infraestrutura</option>
                            <option>Produtos / Insumos</option>
                            <option>Mão de Obra</option>
                            <option>Impostos</option>
                            <option>Logística</option>
                            <option>Outros</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>Data</Label>
                          <Input
                            type="date"
                            value={financeDate}
                            onChange={(e) => setFinanceDate(e.target.value)}
                            className="h-12 rounded-xl border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="pt-6 flex gap-3">
                        <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={() => setIsFinanceModalOpen(false)}>Cancelar</Button>
                        <Button className="flex-1 h-12 rounded-xl font-bold shadow-lg shadow-primary/20" onClick={handleSaveFinance}>
                          Salvar Lançamento
                        </Button>
                      </div>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          );
        })()}
      </main>
    </div>
  );
};

export default Admin;
