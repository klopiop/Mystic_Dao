"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ChatPanel from "./ChatPanel";
import MedicalRecordSidebar from "./MedicalRecordSidebar";
import type { Locale } from "@/lib/i18n";
import type { MedicalRecord } from "./MedicalRecordSidebar";
import { getCurrentUser } from "@/lib/api";

type TcmClientProps = {
  locale: Locale;
  dict: any;
};

export default function TcmClient({ locale, dict }: TcmClientProps) {
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
  const [isDiagnosed, setIsDiagnosed] = useState(false);
  const [showMedicalRecord, setShowMedicalRecord] = useState(false);

  const handleMedicalRecordUpdate = (record: MedicalRecord | null, diagnosed: boolean) => {
    setMedicalRecord(record);
    setIsDiagnosed(diagnosed);
    if (diagnosed) {
      setShowMedicalRecord(true);
    }
  };

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      {showMedicalRecord && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:sticky md:top-24 h-fit order-1 md:order-1"
        >
          <MedicalRecordSidebar
            locale={locale}
            record={medicalRecord}
          />
        </motion.div>
      )}

      <div className="flex-1 order-2 md:order-2">
        <ChatPanel
          locale={locale}
          title={dict.tcm.title}
          subtitle={dict.tcm.subtitle}
          placeholder={dict.tcm.placeholder}
          systemHint={dict.tcm.systemHint}
          type="tcm"
          onMedicalRecordUpdate={handleMedicalRecordUpdate}
        />
      </div>
    </div>
  );
}
