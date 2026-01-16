"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Locale } from "@/lib/i18n";
import { Activity, Pill, Utensils, Calendar, Clock, Heart, Brain, Wind, Droplet, Flame, Leaf, FileText } from "lucide-react";

export type MedicalRecord = {
  patientInfo?: {
    name?: string;
    age?: string;
    gender?: string;
  };
  mainComplaint?: string;
  symptoms?: string[];
  diagnosis?: {
    pattern?: string;
    pathology?: string;
    constitution?: string;
  };
  treatment?: {
    principle?: string;
    recommendations?: string[];
    diet?: string[];
    lifestyle?: string[];
    acupoints?: string[];
  };
  prescription?: {
    herbalTea?: string;
    herbs?: Array<{
      name: string;
      dosage?: string;
      function?: string;
    }>;
  };
  lastUpdated?: string;
};

type MedicalRecordSidebarProps = {
  locale: Locale;
  record: MedicalRecord | null;
  loading?: boolean;
};

export default function MedicalRecordSidebar({ locale, record, loading }: MedicalRecordSidebarProps) {
  const t = {
    zh: {
      title: "病历档案",
      patientInfo: "患者信息",
      mainComplaint: "主诉",
      symptoms: "症状",
      diagnosis: "辨证诊断",
      pattern: "证型",
      pathology: "病机",
      constitution: "体质",
      treatment: "治疗方案",
      principle: "治则",
      recommendations: "建议",
      diet: "饮食调理",
      lifestyle: "生活起居",
      acupoints: "穴位按摩",
      prescription: "处方建议",
      herbalTea: "中药茶饮",
      herbs: "药材",
      lastUpdated: "更新时间",
      noRecord: "暂无病历记录",
      loading: "正在分析...",
    },
    en: {
      title: "Medical Record",
      patientInfo: "Patient Info",
      mainComplaint: "Main Complaint",
      symptoms: "Symptoms",
      diagnosis: "Diagnosis",
      pattern: "Pattern",
      pathology: "Pathology",
      constitution: "Constitution",
      treatment: "Treatment",
      principle: "Principle",
      recommendations: "Recommendations",
      diet: "Diet",
      lifestyle: "Lifestyle",
      acupoints: "Acupoints",
      prescription: "Prescription",
      herbalTea: "Herbal Tea",
      herbs: "Herbs",
      lastUpdated: "Last Updated",
      noRecord: "No medical record yet",
      loading: "Analyzing...",
    },
  }[locale];

  const getConstitutionIcon = (constitution?: string) => {
    if (!constitution) return null;
    const lower = constitution.toLowerCase();
    if (lower.includes("气虚") || lower.includes("qi deficiency")) return <Wind className="w-3.5 h-3.5" />;
    if (lower.includes("血虚") || lower.includes("blood deficiency")) return <Heart className="w-3.5 h-3.5" />;
    if (lower.includes("阴虚") || lower.includes("yin deficiency")) return <Droplet className="w-3.5 h-3.5" />;
    if (lower.includes("阳虚") || lower.includes("yang deficiency")) return <Flame className="w-3.5 h-3.5" />;
    if (lower.includes("湿热") || lower.includes("damp heat")) return <Leaf className="w-3.5 h-3.5" />;
    return <Activity className="w-3.5 h-3.5" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full md:w-72 lg:w-80 space-y-3"
    >
      <div className="rounded-2xl border border-gold-muted/30 bg-black/50 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gold-soft/15 to-gold-muted/5 px-4 py-3 border-b border-gold-muted/20">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gold-strong" />
            <h2 className="text-base font-semibold text-gold-strong">{t.title}</h2>
          </div>
        </div>

        <div className="p-4 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-gold-soft">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-gold-soft rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gold-soft rounded-full animate-bounce delay-100" />
                <div className="w-1.5 h-1.5 bg-gold-soft rounded-full animate-bounce delay-200" />
                <span className="ml-2 text-xs">{t.loading}</span>
              </div>
            </div>
          ) : !record ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-500">
              <FileText className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-xs">{t.noRecord}</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {record.patientInfo && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-semibold text-gold-soft flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {t.patientInfo}
                    </h3>
                    <div className="rounded-lg bg-black/30 border border-gold-muted/15 p-2.5 space-y-1">
                      {record.patientInfo.name && (
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">{locale === "zh" ? "姓名" : "Name"}:</span>
                          <span className="text-zinc-200">{record.patientInfo.name}</span>
                        </div>
                      )}
                      {record.patientInfo.age && (
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">{locale === "zh" ? "年龄" : "Age"}:</span>
                          <span className="text-zinc-200">{record.patientInfo.age}</span>
                        </div>
                      )}
                      {record.patientInfo.gender && (
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500">{locale === "zh" ? "性别" : "Gender"}:</span>
                          <span className="text-zinc-200">{record.patientInfo.gender}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {record.mainComplaint && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-semibold text-gold-soft flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5" />
                      {t.mainComplaint}
                    </h3>
                    <div className="rounded-lg bg-black/30 border border-gold-muted/15 p-2.5">
                      <p className="text-xs text-zinc-200 leading-relaxed">{record.mainComplaint}</p>
                    </div>
                  </div>
                )}

                {record.symptoms && record.symptoms.length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-semibold text-gold-soft flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      {t.symptoms}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {record.symptoms.map((symptom, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 rounded-full bg-gold-soft/10 border border-gold-soft/25 text-xs text-gold-soft"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {record.diagnosis && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-semibold text-gold-soft flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      {t.diagnosis}
                    </h3>
                    <div className="rounded-lg bg-black/30 border border-gold-muted/15 p-2.5 space-y-1.5">
                      {record.diagnosis.pattern && (
                        <div className="flex items-start gap-1.5">
                          <span className="text-zinc-500 text-xs whitespace-nowrap">{t.pattern}:</span>
                          <span className="text-xs text-gold-strong font-medium">{record.diagnosis.pattern}</span>
                        </div>
                      )}
                      {record.diagnosis.pathology && (
                        <div className="flex items-start gap-1.5">
                          <span className="text-zinc-500 text-xs whitespace-nowrap">{t.pathology}:</span>
                          <span className="text-xs text-zinc-200">{record.diagnosis.pathology}</span>
                        </div>
                      )}
                      {record.diagnosis.constitution && (
                        <div className="flex items-start gap-1.5">
                          <span className="text-zinc-500 text-xs whitespace-nowrap">{t.constitution}:</span>
                          <span className="text-xs text-zinc-200 flex items-center gap-1">
                            {getConstitutionIcon(record.diagnosis.constitution)}
                            {record.diagnosis.constitution}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {record.treatment && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-semibold text-gold-soft flex items-center gap-1.5">
                      <Heart className="w-3.5 h-3.5" />
                      {t.treatment}
                    </h3>
                    <div className="rounded-lg bg-black/30 border border-gold-muted/15 p-2.5 space-y-2.5">
                      {record.treatment.principle && (
                        <div>
                          <span className="text-zinc-500 text-xs">{t.principle}:</span>
                          <p className="text-xs text-gold-strong font-medium mt-0.5">{record.treatment.principle}</p>
                        </div>
                      )}
                      {record.treatment.recommendations && record.treatment.recommendations.length > 0 && (
                        <div>
                          <span className="text-zinc-500 text-xs">{t.recommendations}:</span>
                          <ul className="mt-0.5 space-y-0.5">
                            {record.treatment.recommendations.map((rec, index) => (
                              <li key={index} className="text-xs text-zinc-300 flex items-start gap-1.5">
                                <span className="text-gold-soft mt-0.5">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {record.treatment.diet && record.treatment.diet.length > 0 && (
                        <div>
                          <span className="text-zinc-500 text-xs flex items-center gap-1">
                            <Utensils className="w-3 h-3" />
                            {t.diet}:
                          </span>
                          <ul className="mt-0.5 space-y-0.5">
                            {record.treatment.diet.map((item, index) => (
                              <li key={index} className="text-xs text-zinc-300 flex items-start gap-1.5">
                                <span className="text-gold-soft mt-0.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {record.treatment.lifestyle && record.treatment.lifestyle.length > 0 && (
                        <div>
                          <span className="text-zinc-500 text-xs">{t.lifestyle}:</span>
                          <ul className="mt-0.5 space-y-0.5">
                            {record.treatment.lifestyle.map((item, index) => (
                              <li key={index} className="text-xs text-zinc-300 flex items-start gap-1.5">
                                <span className="text-gold-soft mt-0.5">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {record.treatment.acupoints && record.treatment.acupoints.length > 0 && (
                        <div>
                          <span className="text-zinc-500 text-xs">{t.acupoints}:</span>
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {record.treatment.acupoints.map((point, index) => (
                              <span
                                key={index}
                                className="px-2 py-0.5 rounded-md bg-gold-soft/10 border border-gold-soft/20 text-xs text-gold-soft"
                              >
                                {point}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {record.prescription && (
                  <div className="space-y-1.5">
                    <h3 className="text-xs font-semibold text-gold-soft flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5" />
                      {t.prescription}
                    </h3>
                    <div className="rounded-lg bg-black/30 border border-gold-muted/15 p-2.5 space-y-2.5">
                      {record.prescription.herbalTea && (
                        <div>
                          <span className="text-zinc-500 text-xs">{t.herbalTea}:</span>
                          <p className="text-xs text-gold-strong font-medium mt-0.5">{record.prescription.herbalTea}</p>
                        </div>
                      )}
                      {record.prescription.herbs && record.prescription.herbs.length > 0 && (
                        <div>
                          <span className="text-zinc-500 text-xs">{t.herbs}:</span>
                          <div className="mt-1.5 space-y-1.5">
                            {record.prescription.herbs.map((herb, index) => (
                              <div
                                key={index}
                                className="rounded-md bg-black/20 border border-gold-muted/10 p-2"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-zinc-200 font-medium">{herb.name}</span>
                                  {herb.dosage && (
                                    <span className="text-xs text-gold-soft">{herb.dosage}</span>
                                  )}
                                </div>
                                {herb.function && (
                                  <p className="text-xs text-zinc-400 mt-0.5">{herb.function}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {record.lastUpdated && (
                  <div className="pt-2.5 border-t border-gold-muted/15">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock className="w-3 h-3" />
                      <span>{t.lastUpdated}: {new Date(record.lastUpdated).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}
