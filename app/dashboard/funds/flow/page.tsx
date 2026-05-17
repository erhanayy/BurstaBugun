import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { 
    PlusCircle, 
    UserPlus, 
    CheckCircle2, 
    Users, 
    CreditCard, 
    Wallet, 
    ArrowRight,
    ArrowDown,
    ShieldCheck,
    Banknote,
    GraduationCap,
    Info
} from "lucide-react";

export const metadata = {
    title: "Fon İşleyiş Akışı - BurstaBugün",
    description: "Sistemdeki fon ve bursiyer seçim akışının açıklaması",
};

export default async function FundFlowPage() {
    const tenantData = await getCurrentTenant();
    if (!tenantData) redirect("/login");

    const steps = [
        {
            id: 1,
            title: "Fonun Kurulması",
            description: "Bir veya birden fazla bursiyere destek olmak amacıyla bir Eğitim Fonu oluşturulur. Fonun süresi (ay) ve aylık destek tutarı (kota) belirlenir.",
            icon: PlusCircle,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/40",
            border: "border-blue-200 dark:border-blue-800"
        },
        {
            id: 2,
            title: "Bursiyer Havuzundan Öğrenci Seçimi",
            description: "Sistem havuzuna başvuran ve onaylanan öğrenciler listesinden, fon bütçenize uygun sayıdaki öğrenciyi fona seçersiniz. Öğrenciler seçilmeden fona onay verilemez.",
            icon: Users,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-100 dark:bg-purple-900/40",
            border: "border-purple-200 dark:border-purple-800"
        },
        {
            id: 3,
            title: "Destekçilerin Onayı (Davetler)",
            description: "Davetliler, fonun amacını ve havuza eklenmiş öğrencileri görerek fona katılmayı kabul ederler. Katılımcıların kime dokunduğunu görmesi hedeflenir.",
            icon: UserPlus,
            color: "text-indigo-600 dark:text-indigo-400",
            bg: "bg-indigo-100 dark:bg-indigo-900/40",
            border: "border-indigo-200 dark:border-indigo-800"
        },
        {
            id: 4,
            title: "Ödeme ve Tahsilat",
            description: "Fona onay veren kişiler anında ödeme ekranına yönlendirilir. Taksitler ve ödeme planı katılımcının kendi payına düşen oranlarda kredi kartından tahsil edilir.",
            icon: CreditCard,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-100 dark:bg-emerald-900/40",
            border: "border-emerald-200 dark:border-emerald-800"
        },
        {
            id: 5,
            title: "Bursiyere Bildirim Gider",
            description: "Fondaki herkes ödemesini başarıyla tamamladığında, fona seçilen öğrencilere 'Burs kazandınız, ödemeniz yola çıktı' şeklinde bilgilendirme mesajı gider.",
            icon: CheckCircle2,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-100 dark:bg-amber-900/40",
            border: "border-amber-200 dark:border-amber-800"
        },
        {
            id: 6,
            title: "Bursun Öğrenciye Ulaştırılması",
            description: "Havuzda toplanan ve ödemesi başarıyla gerçekleşen fon taksitleri, sistem/vakıf aracılığı ile ilgili bursiyerlerin banka hesaplarına aktarılır.",
            icon: GraduationCap,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-100 dark:bg-green-900/40",
            border: "border-green-200 dark:border-green-800"
        }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Burs Fonu İşleyiş Akışı</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Burs sistemimizde şeffaf, izlenebilir ve eşleştirme odaklı bir mimari kullanılmaktadır. Öğrenci (bursiyer) ile paranın doğrudan doğruya eşleştirilmesi (match) temel prensibimizdir.
                </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-2xl p-6 flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-blue-800/50 p-2 rounded-full text-blue-600 dark:text-blue-300 flex-shrink-0 mt-1">
                    <Info className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-blue-900 dark:text-blue-100 text-lg mb-1">Neden Önce Öğrenci, Sonra Ödeme?</h3>
                    <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                        Platformumuzda "Ödeme / Taksit", doğrudan bir <strong>Bursiyer (Uygulama)</strong> kaydına bağlıdır. Yani ödeyeceğiniz her 1 TL'nin karşılığında hangi öğrencinin fayda gördüğü sistem tarafından takip edilir. Bu yüzden, <strong>"Ödeme Emirleri"</strong> ancak havuzdan öğrenci seçtiğinizde ve o öğrenciyi fonunuza dahil ettiğinizde oluşur. Kime burs verdiğinizi görmeden ödeme alınmaz.
                    </p>
                </div>
            </div>

            <div className="relative mt-12 mb-16">
                {/* Desktop Continuous Line */}
                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gray-200 dark:bg-zinc-800 transform -translate-x-1/2 rounded-full"></div>
                
                <div className="space-y-8 md:space-y-0">
                    {steps.map((step, index) => {
                        const isEven = index % 2 === 0;
                        const Icon = step.icon;

                        return (
                            <div key={step.id} className={`relative flex flex-col md:flex-row items-center ${isEven ? 'md:flex-row-reverse' : ''} gap-4 md:gap-16`}>
                                
                                {/* Timeline Node (Desktop) */}
                                <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-12 h-12 bg-white dark:bg-zinc-950 rounded-full border-4 border-gray-200 dark:border-zinc-800 items-center justify-center z-10">
                                    <span className="text-gray-500 dark:text-gray-400 font-bold">{step.id}</span>
                                </div>

                                {/* Content Box */}
                                <div className={`w-full md:w-1/2 ${isEven ? 'md:pr-12 lg:pr-24' : 'md:pl-12 lg:pl-24'}`}>
                                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                        <div className={`absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover:opacity-10 transition-opacity transform translate-x-8 -translate-y-8 rounded-full ${step.bg}`}></div>
                                        
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className={`${step.bg} ${step.color} p-3 rounded-xl border ${step.border} shadow-sm`}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5 md:hidden">ADIM {step.id}</div>
                                                <h3 className="font-bold text-xl text-gray-900 dark:text-white">{step.title}</h3>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Empty Half (Desktop) */}
                                <div className="hidden md:block w-1/2"></div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            <div className="text-center bg-gray-50 dark:bg-zinc-800/30 p-8 rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700">
                <ShieldCheck className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Tüm Süreç Şeffaf ve Güvende</h4>
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-sm">
                    Bu mimari, her bir kuruşunuzun tam olarak hedeflediğiniz eğitimci adayına gitmesini garanti eder. Süreçle ilgili daha fazla bilgi almak için vakıf yöneticinizle iletişime geçebilirsiniz.
                </p>
            </div>
        </div>
    );
}
