"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Download, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { getExcelExportDataAction } from "@/lib/actions/admin";

interface ExcelExportApplicantsProps {
    period: string;
    activeStatus: string;
    searchQuery: string;
}

export function ExcelExportApplicants({ period, activeStatus, searchQuery }: ExcelExportApplicantsProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const XLSX = await import("xlsx");
            const data = await getExcelExportDataAction(period, activeStatus, searchQuery);
            
            if (!data || data.length === 0) {
                alert("Dışa aktarılacak veri bulunamadı.");
                return;
            }

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Bursiyerler");
            
            XLSX.writeFile(workbook, `Bursiyerler_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`);
        } catch (error) {
            console.error("Excel dışa aktarma hatası:", error);
            alert("Dışa aktarma sırasında bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button variant="outline" onClick={handleExport} disabled={isLoading} className="w-full sm:w-auto text-blue-600 border-blue-200 hover:bg-blue-50">
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {isLoading ? "Hazırlanıyor..." : "Excel'e Aktar"}
        </Button>
    );
}
