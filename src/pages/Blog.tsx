import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    User,
    ChevronRight,
    Search,
    ThumbsUp,
    MessageSquare,
    BookOpen,
    Facebook,
    Youtube,
    Instagram,
    AtSign,
    X,
    Check,
    Send,
    Clock
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import * as Dialog from "@radix-ui/react-dialog";

const ARTICLES = [
    {
        id: 1,
        title: "A importância da higienização profunda para a saúde da sua família",
        excerpt: "Descubra como a limpeza profissional de estofados pode remover mais de 99% dos ácaros e bactérias do seu ambiente.",
        category: "Saúde",
        image: "/hero-image.png", // Reuse existing image for demo
        author: "Equipe Manager Clean",
        date: "05 Mar, 2026",
        readTime: "4 min",
        likes: 124,
        comments: 12
    },
    {
        id: 2,
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
        id: 3,
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
        id: 4,
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

const CATEGORIES = ["Todos", "Saúde", "Cuidados", "Pets", "Dicas", "Automóveis"];

export default function Blog() {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState("Todos");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedArticle, setSelectedArticle] = useState<any>(null);

    // Header cart state mock (since it's a static view for now)
    const [cartCount] = useState(0);
    const [articles, setArticles] = useState<any[]>([]);
    const [isLoadingArticles, setIsLoadingArticles] = useState(true);

    // Comments state
    const [comments, setComments] = useState<any[]>([]);
    const [isCommentsLoading, setIsCommentsLoading] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [commentPage, setCommentPage] = useState(1);
    const COMMENTS_PER_PAGE = 3;
    const [articlePage, setArticlePage] = useState(1);
    const ARTICLES_PER_PAGE = 6;
    const commentsRef = useRef<HTMLDivElement>(null);
    const articlesRef = useRef<HTMLDivElement>(null);

    const scrollToComments = () => {
        if (commentsRef.current) {
            commentsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [userProfile, setUserProfile] = useState<any>(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUser(user);
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (data) setUserProfile(data);
            }
        };
        fetchUserData();
    }, []);

    useEffect(() => {
        if (selectedArticle) {
            fetchComments(selectedArticle.id);
            setCommentPage(1);
        } else {
            setComments([]);
        }
    }, [selectedArticle]);

    const fetchComments = async (articleId: any) => {
        setIsCommentsLoading(true);
        try {
            const { data, error } = await supabase
                .from("blog_comments")
                .select(`
                    *,
                    profiles:user_id (full_name)
                `)
                .eq("article_id", articleId)
                .order("created_at", { ascending: false });

            if (!error && data) {
                const formattedComments = data.map((c: any) => {
                    // Tenta pegar o nome do perfil vinculado. 
                    // Se o usuário mudou o nome no perfil, aqui ele virá atualizado.
                    let currentName = c.user_name;

                    if (c.profiles) {
                        const profileData = Array.isArray(c.profiles) ? c.profiles[0] : c.profiles;
                        if (profileData?.full_name) {
                            currentName = profileData.full_name;
                        }
                    }

                    return {
                        ...c,
                        user_name: currentName
                    };
                });
                setComments(formattedComments);
            }
        } catch (err) {
            console.error("Erro ao buscar comentários:", err);
        } finally {
            setIsCommentsLoading(false);
        }
    };

    const handleSendComment = async () => {
        if (!currentUser || !commentContent.trim()) {
            return;
        }

        const authorName = userProfile?.full_name || currentUser.email || "Cliente";

        setIsSubmittingComment(true);
        try {
            const { error } = await supabase
                .from("blog_comments")
                .insert([
                    {
                        article_id: selectedArticle.id,
                        user_id: currentUser.id,
                        user_name: authorName,
                        content: commentContent.trim()
                    }
                ]);

            if (error) throw error;

            setCommentContent("");
            fetchComments(selectedArticle.id);
            toast.success("Comentário publicado!");
        } catch (err: any) {
            console.error("Erro ao enviar comentário:", err);
            toast.error("Erro ao enviar comentário");
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId: any, hasUserId: boolean) => {
        if (!window.confirm("Deseja realmente excluir esse comentário?")) return;

        try {
            // Se o comentário não tem user_id (legado), deleta só pelo id
            let query = supabase.from("blog_comments").delete().eq("id", commentId);
            if (hasUserId) {
                query = query.eq("user_id", currentUser.id);
            }

            const { error } = await query;

            if (error) throw error;

            toast.success("Comentário removido!");
            fetchComments(selectedArticle.id);
        } catch (err: any) {
            console.error("Erro ao excluir comentário:", err);
            toast.error("Erro ao excluir comentário");
        }
    };

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setIsLoadingArticles(true);
        const { data, error } = await supabase
            .from("blog_posts")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
            setArticles(data);
        } else if (!error) {
            // banco vazio - não mostra mock, deixa vazio
            setArticles([]);
        }
        setIsLoadingArticles(false);
    };

    const filteredArticles = articles.filter(art => {
        const matchesCategory = activeCategory === "Todos" || art.category === activeCategory;
        const matchesSearch = searchQuery.trim() === "" ||
            art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            art.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const featuredArticle = filteredArticles.find(a => a.is_featured) || filteredArticles[0];
    const regularArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            {/* Using the standard Header but wrapped with some extra spacing if needed */}
            <div className="sticky top-0 z-[100] w-full">
                <Header cartCount={0} onCartToggle={() => { }} hideCart={true} />
            </div>

            {/* Blog Hero Container */}
            <div className="bg-primary relative overflow-hidden text-white pt-10 pb-20 mt-[-1px]">
                {/* Decorative Bubbles matching Home */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-10 left-[10%] w-4 h-4 rounded-full bg-white/10 blur-[1px]"></div>
                    <div className="absolute top-20 right-[20%] w-12 h-12 rounded-full bg-white/5 blur-[2px]"></div>
                    <div className="absolute bottom-[20%] right-[10%] w-8 h-8 rounded-full bg-blue-300/10 blur-[1px]"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Dicas do Manager</h1>
                    <p className="text-white/80 text-lg md:text-xl leading-relaxed">
                        Fique por dentro das melhores dicas de limpeza, saúde, cuidados para manter seus estofados e veículos sempre impecáveis e dicas para o sua casa ou empresa.
                    </p>

                    {/* Search Bar */}
                    <div className="mt-10 max-w-lg mx-auto relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar artigos..."
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setArticlePage(1); }}
                            className="w-full pl-12 pr-4 py-4 rounded-full bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-xl transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="container mx-auto px-6 py-16 -mt-8 relative z-20">

                {/* Category Filter */}
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mb-16">
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => { setActiveCategory(category); setArticlePage(1); }}
                            className={`px-5 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${activeCategory === category
                                ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {isLoadingArticles ? (
                    <div className="flex justify-center items-center py-24">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <h3 className="text-2xl font-bold mb-2">Nenhum artigo encontrado</h3>
                        <p>Ainda não temos publicações nesta categoria.</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Article */}
                        {featuredArticle && (
                            <div
                                onClick={() => setSelectedArticle(featuredArticle)}
                                className="bg-white rounded-[32px] overflow-hidden shadow-xl border border-slate-100 flex flex-col md:flex-row mb-16 group cursor-pointer hover:shadow-2xl transition-all duration-500"
                            >
                                <div className="md:w-1/2 relative overflow-hidden bg-slate-100 min-h-[300px]">
                                    <img
                                        src={featuredArticle.image}
                                        alt={featuredArticle.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-black uppercase text-primary tracking-wider shadow-sm">
                                        Destaque
                                    </div>
                                </div>
                                <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-4">
                                        <span className="text-primary uppercase tracking-wider">{featuredArticle.category}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {featuredArticle.date}</span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-6 leading-tight group-hover:text-primary transition-colors">
                                        {featuredArticle.title}
                                    </h2>
                                    <p className="text-slate-500 leading-relaxed mb-8 text-lg">
                                        {featuredArticle.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <div className="text-sm">
                                                <p className="font-bold text-slate-800">{featuredArticle.author}</p>
                                                <p className="text-slate-500">{featuredArticle.readTime} de leitura</p>
                                            </div>
                                        </div>
                                        <Button className="rounded-full w-12 h-12 p-0 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Articles Grid */}
                        {regularArticles.length > 0 && (
                            <>
                                <div ref={articlesRef}>
                                    <h3 className="text-2xl font-extrabold text-slate-800 mb-8 border-b border-slate-200 pb-4">Artigos Recentes</h3>
                                </div>
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {regularArticles
                                        .slice((articlePage - 1) * ARTICLES_PER_PAGE, articlePage * ARTICLES_PER_PAGE)
                                        .map((article) => (
                                            <div
                                                key={article.id}
                                                onClick={() => setSelectedArticle(article)}
                                                className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex flex-col group cursor-pointer hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
                                            >
                                                <div className="relative h-56 overflow-hidden bg-slate-100">
                                                    <img
                                                        src={article.image}
                                                        alt={article.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase text-primary tracking-wider shadow-sm">
                                                        {article.category}
                                                    </div>
                                                </div>
                                                <div className="p-6 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400 mb-3">
                                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {article.date}</span>
                                                        <span>•</span>
                                                        <span>{article.readTime}</span>
                                                    </div>
                                                    <h3 className="text-xl font-extrabold text-slate-800 mb-3 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                                                        {article.title}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-3 flex-1">
                                                        {article.excerpt}
                                                    </p>
                                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-slate-400 text-xs font-semibold">
                                                        <div className="flex items-center gap-1.5">
                                                            <User className="w-4 h-4" /> {article.author.split(' ')[1]}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center gap-1 hover:text-primary transition-colors"><MessageSquare className="w-3.5 h-3.5" /> {article.comments}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                {/* Article Pagination */}
                                {regularArticles.length > ARTICLES_PER_PAGE && (
                                    <div className="flex items-center justify-center gap-4 mt-12">
                                        <button
                                            onClick={() => { setArticlePage(p => Math.max(1, p - 1)); articlesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                                            disabled={articlePage === 1}
                                            className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                            title="Artigos mais recentes"
                                        >
                                            <ChevronRight className="w-5 h-5 rotate-180" />
                                        </button>
                                        <span className="text-sm font-bold text-slate-500 min-w-[60px] text-center">
                                            {articlePage} / {Math.ceil(regularArticles.length / ARTICLES_PER_PAGE)}
                                        </span>
                                        <button
                                            onClick={() => { setArticlePage(p => Math.min(Math.ceil(regularArticles.length / ARTICLES_PER_PAGE), p + 1)); articlesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                                            disabled={articlePage === Math.ceil(regularArticles.length / ARTICLES_PER_PAGE)}
                                            className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                            title="Artigos mais antigos"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {/* Subscribtion / CTA Section */}
                <div className="mt-20 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-[40px] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]"></div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Comece a cuidar melhor do seu estofado hoje.</h2>
                        <p className="text-slate-300 mb-10 text-lg">Acesse nossa loja, e monte seu pedido escolhendo os itens que deseja limpar ou impermeabilizar e tenha o orçamento em tempo real.</p>
                        <Button
                            onClick={() => navigate("/orcamento")}
                            className="bg-primary hover:bg-primary/90 text-white px-10 py-6 rounded-full font-bold tracking-wide text-base shadow-lg shadow-primary/30"
                        >
                            Fazer Orçamento
                        </Button>
                    </div>
                </div>

            </div>

            {/* Modal de Artigo Fullscreen */}
            <Dialog.Root open={!!selectedArticle} onOpenChange={(open) => !open && setSelectedArticle(null)}>
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 z-[1050] bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300" />
                    <Dialog.Content className="fixed inset-0 z-[1050] bg-white overflow-y-auto outline-none animate-in zoom-in-95 duration-300 flex flex-col">
                        {selectedArticle && (
                            <div className="relative flex flex-col min-h-full">
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    className="fixed top-6 right-6 lg:top-10 lg:right-10 z-[110] w-12 h-12 bg-white/30 backdrop-blur-xl hover:bg-white rounded-full flex items-center justify-center text-slate-800 transition-all shadow-xl hover:scale-110"
                                >
                                    <X className="w-6 h-6" />
                                </button>

                                <div className="w-full h-[50vh] md:h-[60vh] relative shrink-0">
                                    <img src={selectedArticle.image} alt={selectedArticle.title} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                                    <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-16 lg:p-24 text-white">
                                        <div className="container mx-auto max-w-5xl">
                                            <div className="flex items-center gap-4 text-sm font-semibold text-white/80 mb-6 relative z-10">
                                                <span className="bg-primary px-4 py-1.5 rounded-full uppercase tracking-wider">{selectedArticle.category}</span>
                                                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {selectedArticle.date}</span>
                                            </div>
                                            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-[1.1] relative z-10 max-w-4xl drop-shadow-lg">
                                                {selectedArticle.title}
                                            </h2>
                                        </div>
                                    </div>
                                </div>

                                <div className="container mx-auto max-w-4xl px-6 py-16 flex-1 bg-white relative z-10">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 border-b border-slate-100 pb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="font-extrabold text-slate-800 text-xl">{selectedArticle.author}</p>
                                                <p className="text-slate-500 font-medium">{selectedArticle.readTime} de leitura</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <Button variant="outline" className="rounded-full gap-2 font-bold text-slate-500 border-slate-200" onClick={scrollToComments}>
                                                <MessageSquare className="w-4 h-4" /> {selectedArticle.comments} Comentários
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="prose prose-lg md:prose-xl max-w-none text-slate-600 leading-relaxed space-y-8">
                                        <p className="text-2xl md:text-3xl text-slate-800 font-medium leading-relaxed italic border-l-4 border-primary pl-8 py-3 mb-12">
                                            "{selectedArticle.excerpt}"
                                        </p>

                                        {selectedArticle.content ? (
                                            <div className="whitespace-pre-wrap">
                                                {selectedArticle.content}
                                            </div>
                                        ) : (
                                            <>
                                                <p>
                                                    É comum acreditarmos que uma limpeza superficial – aquela com aspirador ou um pano úmido – resolve todos os problemas. Contudo, ácaros, poeira e microrganismos invisíveis se infiltram profundamente nas fibras dos estofados, sofás e colchões. Isso não só causa odores desagradáveis com o tempo, mas também pode desencadear ou agravar problemas respiratórios como alergias e asma.
                                                </p>

                                                <p>
                                                    Em nossa metodologia, não utilizamos apenas produtos genéricos. Cada tecido possui uma fibra específica, uma trama diferente. Dependendo do que compõe seu sofá (linho, couro, suede, veludo), o agente químico e as escovas que aplicamos variam enormemente. Essa personalização garante que a higienização preserve as características originais do tecido de fábrica.
                                                </p>
                                            </>
                                        )}

                                        {/* Seções em Ordem Dinâmica */}
                                        {(selectedArticle.sections_order || ['extra', 'quote', 'benefits', 'benefits2', 'benefits3']).map((sectionId: string) => {
                                            if (sectionId.startsWith('image')) {
                                                const is1 = sectionId.endsWith('1');
                                                const is2 = sectionId.endsWith('2');
                                                const show = is1 ? selectedArticle.show_image1 : is2 ? selectedArticle.show_image2 : selectedArticle.show_image3;
                                                const url = is1 ? selectedArticle.image1_url : is2 ? selectedArticle.image2_url : selectedArticle.image3_url;

                                                return show && url && (
                                                    <div key={sectionId} className="my-12 rounded-[32px] overflow-hidden shadow-xl border border-slate-100 animate-in fade-in duration-500">
                                                        <img src={url} alt="Conteúdo multimídia" className="w-full h-auto object-cover" />
                                                    </div>
                                                );
                                            }

                                            if (sectionId.startsWith('video')) {
                                                const is1 = sectionId.endsWith('1');
                                                const is2 = sectionId.endsWith('2');
                                                const show = is1 ? selectedArticle.show_video1 : is2 ? selectedArticle.show_video2 : selectedArticle.show_video3;
                                                const url = is1 ? selectedArticle.video1_url : is2 ? selectedArticle.video2_url : selectedArticle.video3_url;

                                                const getEmbedUrl = (rawUrl: string) => {
                                                    if (!rawUrl) return "";

                                                    // YouTube: watch?v=ID ou youtu.be/ID
                                                    if (rawUrl.includes('youtube.com/watch?v=')) {
                                                        const id = rawUrl.split('v=')[1]?.split('&')[0];
                                                        return `https://www.youtube.com/embed/${id}`;
                                                    }
                                                    if (rawUrl.includes('youtu.be/')) {
                                                        const id = rawUrl.split('youtu.be/')[1]?.split('?')[0];
                                                        return `https://www.youtube.com/embed/${id}`;
                                                    }

                                                    // Vimeo: vimeo.com/ID
                                                    if (rawUrl.includes('vimeo.com/') && !rawUrl.includes('player.vimeo.com')) {
                                                        const id = rawUrl.split('vimeo.com/')[1]?.split('?')[0];
                                                        return `https://player.vimeo.com/video/${id}`;
                                                    }

                                                    return rawUrl;
                                                };

                                                return show && url && (
                                                    <div key={sectionId} className="my-12 aspect-video rounded-[32px] overflow-hidden shadow-xl border border-slate-100 animate-in fade-in duration-500">
                                                        <iframe
                                                            src={getEmbedUrl(url)}
                                                            className="w-full h-full"
                                                            allowFullScreen
                                                            title="Vídeo do artigo"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        />
                                                    </div>
                                                );
                                            }

                                            if (sectionId === 'extra') {
                                                return selectedArticle.show_extra !== false && (
                                                    <div key="extra" className="animate-in fade-in duration-500 not-prose">
                                                        {selectedArticle.extra_sections && selectedArticle.extra_sections.length > 0 ? (
                                                            selectedArticle.extra_sections.map((section: any, idx: number) => (
                                                                <div key={idx} className={`mt-16 mb-12 flex flex-col gap-8 items-center ${section.image ? (section.imageAlignment === 'right' ? 'md:flex-row-reverse' : 'md:flex-row') : ''}`}>
                                                                    <div className="flex-1">
                                                                        <h3 className="text-3xl font-extrabold text-slate-800 mb-8">
                                                                            {section.title}
                                                                        </h3>
                                                                        <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg">
                                                                            {section.content}
                                                                        </p>
                                                                    </div>
                                                                    {section.image && (
                                                                        <div className="w-full md:w-1/2 lg:w-2/5 shrink-0 rounded-[32px] overflow-hidden shadow-2xl border border-slate-100 relative group">
                                                                            <img src={section.image} alt={section.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="mt-16 mb-12">
                                                                <h3 className="text-3xl font-extrabold text-slate-800 mb-8">
                                                                    {selectedArticle.extra_title || "Por que não fazer isso sozinho(a)?"}
                                                                </h3>
                                                                <p className="text-slate-600 leading-relaxed text-lg">
                                                                    {selectedArticle.extra_content || `Métodos caseiros quase sempre envolvem a técnica do "molhar demais para limpar". Isso gera um problema terrível: muita umidade presa dentro da espuma do sofá. Ao longo dos dias, a falta de sol direto ou ventilação adequada faz com que o estofado comece a cheirar a "cachorro molhado" ou mofo. Nossa máquina não só injeta a substância, mas a extrai com força a vácuo, removendo a sujeira e deixando a secagem infinitamente mais rápida, evitando a proliferação bacteriana.`}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            }
                                            if (sectionId.startsWith('quote')) {
                                                const isQ2 = sectionId === 'quote2';
                                                const isQ3 = sectionId === 'quote3';

                                                const showQ = isQ2 ? selectedArticle.show_quote2 : isQ3 ? selectedArticle.show_quote3 : (selectedArticle.show_quote !== false);
                                                const quoteText = isQ2 ? selectedArticle.quote2_text : isQ3 ? selectedArticle.quote3_text : selectedArticle.quote_text;

                                                return showQ && (
                                                    <blockquote key={sectionId} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 my-12 text-center animate-in fade-in duration-500 not-prose">
                                                        <p className="text-xl font-bold text-slate-800 m-0 leading-relaxed italic">
                                                            {quoteText || (sectionId === 'quote' ? `"Sua casa não é apenas onde você dorme, é o seu santuário. Respirar ar puro e sentar em um lugar 100% higienizado muda sua rotina."` : "")}
                                                        </p>
                                                    </blockquote>
                                                );
                                            }
                                            if (sectionId.startsWith('benefits')) {
                                                const isB2 = sectionId === 'benefits2';
                                                const isB3 = sectionId === 'benefits3';

                                                const show = isB2 ? selectedArticle.show_benefits2 : isB3 ? selectedArticle.show_benefits3 : (selectedArticle.show_benefits !== false);
                                                const title = isB2 ? selectedArticle.benefits2_title : isB3 ? selectedArticle.benefits3_title : selectedArticle.benefits_title;
                                                const list = isB2 ? selectedArticle.benefits2_list : isB3 ? selectedArticle.benefits3_list : selectedArticle.benefits_list;
                                                const defaultTitle = isB2 ? "Vantagens Complementares" : isB3 ? "Por que somos a melhor escolha?" : "O Que Você Ganha Com Isso?";

                                                return show && (
                                                    <div key={sectionId} className="animate-in fade-in duration-500 not-prose">
                                                        <h3 className="text-3xl font-extrabold text-slate-800 mt-16 mb-8">
                                                            {title || defaultTitle}
                                                        </h3>

                                                        <div className="grid md:grid-cols-2 gap-6 my-10">
                                                            {(list && list.length > 0) ? (
                                                                list.map((benefit: any, idx: number) => (
                                                                    <div key={idx} className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                                                        <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                                                                            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                                                                                <Check className="w-3.5 h-3.5" />
                                                                            </span>
                                                                            {benefit.title}
                                                                        </h4>
                                                                        <p className="text-sm text-slate-600 m-0">{benefit.description}</p>
                                                                    </div>
                                                                ))
                                                            ) : !isB2 && !isB3 ? (
                                                                <>
                                                                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                                                        <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                                                                            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                                                                                <Check className="w-3.5 h-3.5" />
                                                                            </span>
                                                                            Ambiente Hiper-Saneado
                                                                        </h4>
                                                                        <p className="text-sm text-slate-600 m-0">Eliminação técnica de micro-organismos que aspiradores comuns apenas espalham no ar.</p>
                                                                    </div>
                                                                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                                                                        <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                                                                            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center">
                                                                                <Check className="w-3.5 h-3.5" />
                                                                            </span>
                                                                            Durabilidade
                                                                        </h4>
                                                                        <p className="text-sm text-slate-600 m-0">Aumento em até 3x do tempo de vida útil do estofado ao evitar oxidação do tecido.</p>
                                                                    </div>
                                                                </>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            if (sectionId.startsWith('avoid')) {
                                                const isA2 = sectionId === 'avoid2';
                                                const isA3 = sectionId === 'avoid3';

                                                const show = isA2 ? selectedArticle.show_avoid2 : isA3 ? selectedArticle.show_avoid3 : (selectedArticle.show_avoid !== false);
                                                const title = isA2 ? selectedArticle.avoid2_title : isA3 ? selectedArticle.avoid3_title : selectedArticle.avoid_title;
                                                const list = isA2 ? selectedArticle.avoid2_list : isA3 ? selectedArticle.avoid3_list : selectedArticle.avoid_list;
                                                const defaultTitle = isA2 ? "Riscos Comuns" : isA3 ? "Dicas de Segurança" : "O Que Você Deve Evitar";

                                                return show && (
                                                    <div key={sectionId} className="animate-in fade-in duration-500 not-prose">
                                                        <h3 className="text-3xl font-extrabold text-red-700 mt-16 mb-8">
                                                            {title || defaultTitle}
                                                        </h3>

                                                        <div className="grid md:grid-cols-2 gap-6 my-10">
                                                            {list && list.length > 0 && list.map((item: any, idx: number) => (
                                                                <div key={idx} className="bg-red-50 p-6 rounded-2xl border border-red-100">
                                                                    <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                                                                        <span className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center">
                                                                            <X className="w-3.5 h-3.5" />
                                                                        </span>
                                                                        {item.title}
                                                                    </h4>
                                                                    <p className="text-sm text-slate-600 m-0">{item.description}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <div className="mt-20 flex flex-col items-center bg-slate-50 p-12 rounded-3xl text-center">
                                        <h3 className="text-2xl font-extrabold text-slate-800 mb-4">Gostou desse conteúdo?</h3>
                                        <p className="text-slate-500 mb-8 max-w-lg">Se você gostou deste conteúdo, deixe um comentário abaixo com sua opinião ou dúvida. Sua participação é muito importante para nós!</p>
                                    </div>

                                    {/* Comments Section */}
                                    <div id="comments-section" ref={commentsRef} className="mt-16 pt-16 border-t border-slate-100">
                                        <div className="flex items-center gap-3 mb-10">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                <MessageSquare className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-extrabold text-slate-800">Comentários</h3>
                                                <p className="text-slate-500 text-sm font-medium">{comments.length} pessoa{comments.length !== 1 ? 's' : ''} coment{comments.length !== 1 ? 'aram' : 'ou'}</p>
                                            </div>
                                        </div>

                                        {/* Comments List */}
                                        <div className="space-y-6 mb-12">
                                            {isCommentsLoading ? (
                                                <div className="text-center py-10 text-slate-400 italic">Carregando comentários...</div>
                                            ) : (
                                                comments.length === 0 ? (
                                                    <div className="text-center py-12 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                                                        <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                                                        <p className="text-slate-400 font-medium">Seja o primeiro a comentar!</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {comments
                                                            .slice((commentPage - 1) * COMMENTS_PER_PAGE, commentPage * COMMENTS_PER_PAGE)
                                                            .map((c, idx) => (
                                                                <div key={c.id || idx} className="flex gap-4 group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                                                        <User className="w-6 h-6" />
                                                                    </div>
                                                                    <div className="flex-1 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <div>
                                                                                <h5 className="font-extrabold text-slate-800">{c.user_name}</h5>
                                                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                                                                                    <Clock className="w-3 h-3" />
                                                                                    {new Date(c.created_at).toLocaleDateString('pt-BR')}
                                                                                </span>
                                                                            </div>
                                                                            {currentUser && (c.user_id === currentUser.id || !c.user_id) && (
                                                                                <button
                                                                                    onClick={() => handleDeleteComment(c.id, !!c.user_id)}
                                                                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                                                    title="Excluir comentário"
                                                                                >
                                                                                    <X className="w-4 h-4" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                        <p className="text-slate-600 text-[13px] leading-relaxed m-0">{c.content}</p>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                        {/* Pagination */}
                                                        {comments.length > COMMENTS_PER_PAGE && (
                                                            <div className="flex items-center justify-center gap-4 pt-4">
                                                                <button
                                                                    onClick={() => setCommentPage(p => Math.max(1, p - 1))}
                                                                    disabled={commentPage === 1}
                                                                    className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                                    title="Comentários mais recentes"
                                                                >
                                                                    <ChevronRight className="w-4 h-4 rotate-180" />
                                                                </button>
                                                                <span className="text-sm font-bold text-slate-500">
                                                                    {commentPage} / {Math.ceil(comments.length / COMMENTS_PER_PAGE)}
                                                                </span>
                                                                <button
                                                                    onClick={() => setCommentPage(p => Math.min(Math.ceil(comments.length / COMMENTS_PER_PAGE), p + 1))}
                                                                    disabled={commentPage === Math.ceil(comments.length / COMMENTS_PER_PAGE)}
                                                                    className="w-9 h-9 rounded-full flex items-center justify-center border border-slate-200 text-slate-500 hover:bg-primary hover:text-white hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                                                    title="Comentários mais antigos"
                                                                >
                                                                    <ChevronRight className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )
                                            )}
                                        </div>

                                        {/* New Comment Form */}
                                        {currentUser ? (
                                            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                                                <h4 className="font-bold text-slate-700 mb-6 flex items-center gap-2">Deixe seu comentário</h4>
                                                <div className="space-y-4">
                                                    <div className="grid md:grid-cols-2 gap-4">
                                                        <div className="space-y-1.5 opacity-60">
                                                            <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Seu Nome</label>
                                                            <input
                                                                type="text"
                                                                disabled
                                                                value={userProfile?.full_name || currentUser.email || "Carregando..."}
                                                                className="w-full px-5 py-3 rounded-2xl bg-slate-100 border border-slate-100 text-sm cursor-not-allowed"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold uppercase text-slate-400 ml-1">Sua Mensagem</label>
                                                        <textarea
                                                            placeholder="O que você achou desta dica?"
                                                            value={commentContent}
                                                            onChange={(e) => setCommentContent(e.target.value)}
                                                            className="w-full min-h-[120px] px-5 py-4 rounded-[24px] bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm resize-none"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end pt-2">
                                                        <Button
                                                            onClick={handleSendComment}
                                                            disabled={isSubmittingComment || !commentContent.trim()}
                                                            className="rounded-full px-8 py-6 gap-2 bg-slate-900 hover:bg-slate-800 transition-all shadow-lg"
                                                        >
                                                            {isSubmittingComment ? "Enviando..." : "Publicar Comentário"}
                                                            <Send className="w-4 h-4 ml-1" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 p-10 rounded-[32px] border border-dashed border-slate-200 text-center">
                                                <User className="w-10 h-10 mx-auto mb-4 text-slate-300" />
                                                <h4 className="font-bold text-slate-700 mb-2">Quer participar da conversa?</h4>
                                                <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">Faça login ou crie sua conta para poder comentar e compartilhar suas experiências.</p>
                                                <Button
                                                    onClick={() => navigate('/login')}
                                                    className="rounded-full px-10 py-5 bg-primary hover:bg-primary/90 text-white font-bold"
                                                >
                                                    Fazer Login agora
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root >

            {/* Footer */}
            < footer id="contact" className="bg-white pt-24 pb-12 w-full mt-24" >
                <div className="container mx-auto px-6 flex flex-col lg:flex-row items-center justify-between gap-12 border-b border-slate-100 pb-16">
                    <div className="lg:w-1/2 text-center lg:text-left">

                        <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-800 mb-8">
                            Tem alguma <span className="text-primary italic">dúvida</span> ou pergunta?
                        </h2>
                        <Button onClick={() => window.open('https://wa.me/5511944816323', '_blank')} className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 py-6 text-[13px] font-bold tracking-wider shadow-lg shadow-primary/30">
                            FALE CONOSCO
                        </Button>
                    </div>

                    <div className="lg:w-1/3 text-center lg:text-right space-y-4">
                        <a href="mailto:contato@managerclean.com.br" className="block text-xl md:text-2xl font-bold text-slate-700 hover:text-primary transition-colors">contato@managerclean.com.br</a>
                        <a href="tel:+5511944816323" className="block text-lg font-bold text-primary">+55 11 94481-6323</a>

                        <div className="flex gap-4 justify-center lg:justify-end pt-6">
                            <a href="https://www.facebook.com/managerclean?locale=pt_BR" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm"><Facebook className="w-4 h-4" /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm"><Youtube className="w-4 h-4" /></a>
                            <a href="https://www.instagram.com/managerclean/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm"><Instagram className="w-4 h-4" /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white transition-all shadow-sm"><AtSign className="w-4 h-4" /></a>
                        </div>
                    </div>
                </div>
                <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-[13px] text-slate-400 font-medium">
                    <p>© 2026 Manager Clean. Todos os direitos reservados.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="/404" className="hover:text-primary transition-colors">Termos</a>
                        <a href="/404" className="hover:text-primary transition-colors">Privacidade</a>
                    </div>
                </div>
            </footer >
        </div >
    );
}
