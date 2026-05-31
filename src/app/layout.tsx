import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: { default: "프리마이크 | 전문 진행자 매칭 플랫폼", template: "%s | 프리마이크" },
  description:
    "행사, 기업 콘텐츠, 웨딩, 라이브커머스, 컨퍼런스에 필요한 전문 아나운서·MC·쇼호스트를 연결하는 매칭 플랫폼",
  keywords: ["MC", "아나운서", "쇼호스트", "진행자", "행사진행", "이벤트"],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "프리마이크",
    title: "프리마이크 | 전문 진행자 매칭 플랫폼",
    description: "검증된 전문 MC·아나운서를 행사에 연결합니다.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <Header />
          <main id="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
