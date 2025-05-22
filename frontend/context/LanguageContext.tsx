import React, { createContext, useContext, useState, ReactNode } from "react";

export type Language = "en" | "th";

const translations = {
  en: {
    editProfile: "Edit Profile",
    purchaseHistory: "Purchase History",
    salesHistory: "Sales History",
    bids: "Bids",
    asks: "Asks",
    order: "Order",
    verification: "Verification",
    delivery: "Delivery",
    shipment: "Shipment",
    completed: "Completed",
    cancelled: "Cancelled",
    viewAll: "View All",
    language: "Language",
    wallet: "Wallet",
    eng: "ENG",
    th: "TH",
  },
  th: {
    editProfile: "แก้ไขโปรไฟล์",
    purchaseHistory: "ประวัติการซื้อ",
    salesHistory: "ประวัติการขาย",
    bids: "การประมูล",
    asks: "ข้อเสนอ",
    order: "คำสั่งซื้อ",
    verification: "การยืนยัน",
    delivery: "การจัดส่ง",
    shipment: "การขนส่ง",
    completed: "เสร็จสิ้น",
    cancelled: "ยกเลิก",
    viewAll: "ดูทั้งหมด",
    language: "ภาษา",
    wallet: "กระเป๋าเงิน",
    eng: "อังกฤษ",
    th: "ไทย",
  },
};

export type Translations = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const t = translations[language];
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
