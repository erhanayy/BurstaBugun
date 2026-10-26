import { db } from "@/lib/db";
import { payments, mokaTokens, funds } from "@/lib/db/schema";
import { getCurrentTenant } from "@/lib/data/tenant";
import { redirect } from "next/navigation";
import { eq, and, asc, desc } from "drizzle-orm";
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Calendar, Landmark, Info, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import PaymentMethodButton from "./payment-method-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ödeme Yöntemini Değiştir | Bursta Bugün",
};

export default async function PaymentMethodPage(props: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const tenantData = await getCurrentTenant();
  if (!tenantData) redirect("/login");

  const isSuccess = searchParams?.success === "true";
  const errorMessage = searchParams?.error;

  // Sıradaki en erken bekleyen taksit
  const nextPendingPayment = await db.query.payments.findFirst({
    where: and(
      eq(payments.userId, tenantData.userId),
      eq(payments.status, "pending"),
      eq(payments.paymentMethod, "subscription")
    ),
    with: {
      fund: true,
    },
    orderBy: (payments, { asc }) => [asc(payments.paymentDate)],
  });

  // Toplam bekleyen taksit sayısı
  const pendingCount = (
    await db.query.payments.findMany({
      where: and(
        eq(payments.userId, tenantData.userId),
        eq(payments.status, "pending"),
        eq(payments.paymentMethod, "subscription")
      ),
      columns: { id: true },
    })
  ).length;

  // Sistemdeki aktif token
  const activeToken = await db.query.mokaTokens.findFirst({
    where: and(
      eq(mokaTokens.userId, tenantData.userId),
      eq(mokaTokens.isActive, true)
    ),
    orderBy: (mokaTokens, { desc }) => [desc(mokaTokens.createdAt)],
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400 flex-shrink-0">
          <CreditCard className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Ödeme Yöntemini Değiştir
          </h1>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mt-1">
            Aylık burs ödemelerinizin tahsil edildiği kayıtlı kredi kartınızı buradan güncelleyebilirsiniz.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-2xl p-5 flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-green-900 dark:text-green-100 text-base">
              Kartınız Başarıyla Güncellendi!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              Yeni kartınız güvenli şekilde kaydedilmiştir ve sıradaki taksitiniz bu karttan tahsil edilmiştir.
              Gelecek aylara ait tüm burs taksitleriniz artık bu yeni kartınız üzerinden otomatik olarak çekilecektir.
            </p>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-5 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-red-900 dark:text-red-100 text-base">
              İşlem Tamamlanamadı
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300">
              {decodeURIComponent(errorMessage)}
            </p>
          </div>
        </div>
      )}

      {/* Info Callout */}
      <div className="bg-blue-50/70 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-5 flex items-start gap-3.5 text-sm text-blue-900 dark:text-blue-200">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Nasıl Çalışır?</span>
          <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
            Bankacılık ve 3D Secure güvenlik kuralları gereği, yeni kartınızın doğrulanması ve güvenle kaydedilebilmesi için sıradaki ilk taksitiniz yeni kartınızdan 3D Secure SMS onayı ile çekilir.
            İşlem tamamlandıktan sonra kalan tüm burs taksitleriniz otomatik olarak bu yeni kartınızdan çekilmeye devam eder.
          </p>
        </div>
      </div>

      {nextPendingPayment ? (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                Sıradaki Çekilecek Taksit
              </span>
              {activeToken && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  Mevcut Kart Kayıtlı
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {nextPendingPayment.fund?.title || "Burs Fonu"}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> Taksit Dönemi
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {nextPendingPayment.paymentDate
                    ? format(new Date(nextPendingPayment.paymentDate), "MMMM yyyy", { locale: tr })
                    : "Sıradaki Dönem"}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Landmark className="w-3.5 h-3.5" /> Çekilecek Tutar
                </div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {nextPendingPayment.amount.toLocaleString("tr-TR")} ₺
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-800">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" /> Kalan Toplam Taksit
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  {pendingCount} Ay
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-bit SSL | Moka Ödeme Kuruluşu 3D Secure Güvencesi</span>
              </div>

              <PaymentMethodButton
                paymentId={nextPendingPayment.id}
                amount={nextPendingPayment.amount}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-8 md:p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Bekleyen Taksitiniz Bulunmuyor
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Sistemde adınıza bekleyen veya vadesi gelmiş bir burs taksiti bulunmamaktadır. Tüm taksitleriniz ödenmiştir veya aktif taksitli bir fon taahhüdünüz yoktur.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/funds"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <span>Fonlarımı ve Ödemelerimi Görüntüle</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
