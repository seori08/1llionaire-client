import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Star,
  Shield,
  Clock,
  ChevronRight,
  PlayCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "프리마이크 | 전문 진행자 매칭 플랫폼",
  description: "검증된 전문 MC·아나운서·쇼호스트를 행사에 연결합니다.",
};

const features = [
  {
    icon: Shield,
    title: "검증된 전문가",
    desc: "관리자 심사를 통과한 검증된 진행자만 등록됩니다",
  },
  {
    icon: Star,
    title: "평점 기반 매칭",
    desc: "실제 고객 후기와 평점으로 최적의 진행자를 찾아드립니다",
  },
  {
    icon: Clock,
    title: "신속한 후보 추천",
    desc: "전문 매니저가 엄선한 맞춤 후보를 빠르게 제안합니다",
  },
];

const categories = [
  "기업행사 MC",
  "웨딩 사회자",
  "쇼호스트",
  "컨퍼런스 MC",
  "라이브커머스",
  "아나운서",
];

export default function HomePage() {
  return (
    <div className="animate-fade-in bg-clear text-text">
      {/* Hero */}
      <section className="relative min-h-[720px] overflow-hidden bg-clear">
        <Image
          src="/hero-broadcast.webp"
          alt="행사 진행자가 마이크를 들고 무대에서 진행하는 모습"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-clear via-clear/95 to-clear/20 dark:from-[#080913] dark:via-[#080913]/92 dark:to-[#080913]/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(97,92,255,0.13),_transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(46,55,138,0.16),_transparent_42%)]" />

        <div className="container relative mx-auto flex min-h-[720px] max-w-7xl items-center px-4 py-24">
          <div className="max-w-4xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-lavender/20 bg-card/90 px-5 py-2.5 text-[18px] font-bold text-lavender shadow-sm backdrop-blur">
              <Mic className="h-5 w-5" />
              전문 진행자 매칭 플랫폼
            </div>

            <h1 className="mb-8 text-[54px] font-extrabold leading-[1.08] tracking-[-0.04em] text-text md:text-[68px] lg:text-[78px]">
              섭외 고민은 끝,
              <br />
              <span className="bg-gradient-to-r from-navy to-lavender bg-clip-text text-transparent">
                행사에 딱 맞는 전문가를
              </span>
              <br />
              지금 바로 연결합니다
            </h1>

            <p className="mb-12 max-w-4xl text-[25px] font-medium leading-[1.75] text-slate md:text-[27px]">
              기업행사, 웨딩, 라이브커머스, 컨퍼런스에 필요한 전문 MC · 아나운서 · 쇼호스트를 빠르고
              <br />
              <span className="inline-block">
                정확하게 연결해 드립니다.
              </span>
            </p>

            <div className="flex flex-wrap gap-4">
              <Link href="/signup">
                <Button size="lg" variant="primaryCta">
                  진행자 섭외 요청하기
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>

              <Link href="/freelancers">
                <Button size="lg" variant="secondaryCta">
                  <PlayCircle className="h-5 w-5" />
                  진행자 둘러보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-line bg-surface">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-[17px] font-bold text-slate">
              분야별
            </span>

            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/freelancers?category=${encodeURIComponent(cat)}`}
                className="rounded-full border border-line bg-card px-4 py-2 text-[17px] font-bold text-text transition-colors hover:border-lavender hover:text-lavender"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto max-w-7xl px-4 py-24">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-[42px] font-extrabold tracking-[-0.03em] text-text">
            왜 프리마이크인가요?
          </h2>
          <p className="text-[22px] font-medium text-slate">
            전문성과 신뢰를 기반으로 최적의 진행자를 연결합니다
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-line bg-card p-9 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-lavender-light">
                <Icon className="h-7 w-7 text-lavender" />
              </div>

              <h3 className="mb-3 text-[25px] font-bold text-text">
                {title}
              </h3>

              <p className="text-[19px] leading-relaxed text-slate">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface py-24">
        <div className="container mx-auto max-w-7xl px-4">
          <h2 className="mb-16 text-center text-[42px] font-extrabold tracking-[-0.03em] text-text">
            이용 방법
          </h2>

          <div className="grid gap-8 md:grid-cols-4">
            {[
              {
                step: "01",
                title: "요청서 작성",
                desc: "행사 정보와 원하는 진행자 조건을 입력하세요",
              },
              {
                step: "02",
                title: "후보 추천",
                desc: "전문 매니저의 큐레이션으로 딱 맞는 후보를 제안받으세요",
              },
              {
                step: "03",
                title: "상담 & 견적",
                desc: "후보 프로필 확인 후 견적을 요청하세요",
              },
              {
                step: "04",
                title: "예약 확정",
                desc: "견적 수락 후 예약이 확정됩니다",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-navy to-lavender text-[17px] font-bold text-white shadow-sm">
                  {step}
                </div>

                <h3 className="mb-3 text-[23px] font-bold text-text">
                  {title}
                </h3>

                <p className="text-[18px] leading-relaxed text-slate">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-7xl px-4 py-24 text-center">
        <h2 className="mb-5 text-[42px] font-extrabold tracking-[-0.03em] text-text">
          지금 바로 시작하세요
        </h2>

        <p className="mb-10 text-[22px] font-medium text-slate">
          전문 진행자와의 연결, 프리마이크가 도와드립니다
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/signup">
            <Button size="lg" variant="primaryCta">
              고객으로 시작하기
            </Button>
          </Link>

          <Link href="/signup">
            <Button size="lg" variant="tertiary">
              진행자로 등록하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line bg-card py-9">
        <div className="container mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-[17px] text-slate sm:flex-row">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-lavender" />
            <span className="font-bold text-text">프리마이크</span>
          </div>

          <p>© 2026 FreeMic. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}