import React from "react";
import { isSmsAuthEnabled } from "@/lib/sms";
import SmsForgotPasswordForm from "./sms-forgot-password-form";
import LegacyForgotPasswordForm from "./legacy-forgot-password-form";

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
    const smsEnabled = isSmsAuthEnabled();

    if (smsEnabled) {
        return <SmsForgotPasswordForm />;
    }

    return <LegacyForgotPasswordForm />;
}
