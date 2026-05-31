import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { publicApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { FreelancerProfile } from "@/types";

export const metadata: Metadata = {
  title: "진행자 찾기",
  description: "검증된 전문 MC·아나운서·쇼호스트 목록을 확인하세요.",
};

async function getFreelancers(searchParams: Record<string, string | string[] | undefined>) {
  try {
    const res = await publicApi.getFreelancers(searchParams);
    return res.data?.data ?? { items: [], pagination: null };
  } catch {
    return { items: [], pagination: null };
  }
}

export default async function FreelancersPage({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const { items } = await getFreelancers(searchParams);
  const freelancers: FreelancerProfile[] = items;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">진행자 찾기</h1>
        <p className="text-muted-foreground mt-2">검증된 전문 MC·아나운서·쇼호스트를 만나보세요</p>
      </div>

      {freelancers.length === 0 ? (
        <p className="text-muted-foreground text-center py-20">등록된 진행자가 없습니다.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {freelancers.map((f) => (
            <Link key={f.id} href={`/freelancers/${f.id}`}>
              <article className="rounded-xl border bg-card hover:shadow-lg transition-all duration-200 overflow-hidden group">
                {/* 프로필 이미지 */}
                <div className="relative h-48 bg-muted overflow-hidden">
                  {f.profile_image_url ? (
                    <Image
                      src={f.profile_image_url}
                      alt={f.display_name || "진행자 프로필"}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-navy/10 to-navy/5">
                      <span className="text-5xl font-bold text-navy/20">
                        {(f.display_name || "?")[0]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="font-semibold truncate">{f.display_name}</h2>
                    {f.avg_rating && (
                      <span className="flex items-center gap-0.5 text-sm font-medium shrink-0">
                        <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                        {f.avg_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{f.headline}</p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {f.categories.slice(0, 2).map((c) => (
                      <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{f.region}
                    </span>
                    {f.base_price_min && (
                      <span className="font-medium text-foreground">
                        {formatPrice(f.base_price_min)}~
                      </span>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
