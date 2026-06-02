"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import type { ApiError } from "@/lib/api";
import { aiApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, Target, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { ConfirmModal } from "@/components/common/ConfirmModal";

type Confidence = "high" | "medium" | "low";

type PricingAnalysisResult = {
  analysis: {
    recommended_center: number;
    recommended_min: number;
    recommended_max: number;
    confidence: Confidence;
    rationale: string;
    market_context: string;
    factors: string[];
    risk_notes: string[];
  };
  market_data: {
    sample_count: number;
    market_min: number;
    avg_price_min: number;
    market_max: number;
  };
};

type ApplyRecommendationPayload = {
  booking_id: string;
  recommended_price: number;
  bookingId: string;
  price: number;
};

const CONFIDENCE_LABEL: Record<Confidence, { label: string; color: string }> = {
  high: { label: "높음", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  medium: { label: "보통", color: "text-amber-600 bg-amber-50 border-amber-200" },
  low: { label: "낮음", color: "text-red-600 bg-red-50 border-red-200" },
};

const CATEGORIES = ["기업행사 MC", "웨딩 사회자", "쇼호스트", "컨퍼런스 MC", "라이브커머스", "아나운서"];

const schema = z.object({
  event_type: z.string().min(1, "행사 유형을 입력해 주세요."),
  region: z.string().min(1, "지역을 입력해 주세요."),
  categories: z.array(z.string()).min(1, "분야를 하나 이상 선택해 주세요."),
  budget_min: z.number().int().min(0).optional(),
  budget_max: z.number().int().min(0).optional(),
  duration_hours: z.number().min(0.5).max(24).optional(),
  career_years_min: z.number().int().min(0).optional(),
  booking_id: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const toRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
};

const getNumber = (record: Record<string, unknown>, keys: string[], fallback: number): number => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return fallback;
};

const getString = (record: Record<string, unknown>, keys: string[], fallback: string): string => {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return fallback;
};

const getStringArray = (record: Record<string, unknown>, keys: string[], fallback: string[]): string[] => {
  for (const key of keys) {
    const value = record[key];

    if (Array.isArray(value)) {
      const strings = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      if (strings.length > 0) {
        return strings;
      }
    }
  }

  return fallback;
};

const normalizeConfidence = (value: string): Confidence => {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  return "medium";
};

const normalizePricingAnalysis = (value: unknown): PricingAnalysisResult => {
  const root = toRecord(value);
  const analysis = toRecord(root.analysis);
  const marketData = toRecord(root.market_data ?? root.marketData);

  const recommendedCenter = getNumber(
    analysis,
    ["recommended_center", "recommendedCenter", "recommended_price", "recommendedPrice", "center_price", "price"],
    getNumber(root, ["recommended_center", "recommendedCenter", "recommended_price", "recommendedPrice", "center_price", "price"], 0),
  );

  const recommendedMin = getNumber(
    analysis,
    ["recommended_min", "recommendedMin", "min_price", "minPrice", "price_min"],
    getNumber(root, ["recommended_min", "recommendedMin", "min_price", "minPrice", "price_min"], Math.max(0, Math.round(recommendedCenter * 0.8))),
  );

  const recommendedMax = getNumber(
    analysis,
    ["recommended_max", "recommendedMax", "max_price", "maxPrice", "price_max"],
    getNumber(root, ["recommended_max", "recommendedMax", "max_price", "maxPrice", "price_max"], Math.round(recommendedCenter * 1.2)),
  );

  const confidence = normalizeConfidence(
    getString(analysis, ["confidence"], getString(root, ["confidence"], "medium")),
  );

  const rationale = getString(
    analysis,
    ["rationale", "reasoning", "reason", "summary"],
    getString(root, ["rationale", "reasoning", "reason", "summary"], "분석 근거가 제공되지 않았습니다."),
  );

  const marketContext = getString(
    analysis,
    ["market_context", "marketContext", "market_summary", "marketSummary"],
    getString(root, ["market_context", "marketContext", "market_summary", "marketSummary"], "시장 현황 데이터가 제공되지 않았습니다."),
  );

  const factors = getStringArray(
    analysis,
    ["factors", "price_factors", "priceFactors"],
    getStringArray(root, ["factors", "price_factors", "priceFactors"], []),
  );

  const riskNotes = getStringArray(
    analysis,
    ["risk_notes", "riskNotes", "risks", "warnings"],
    getStringArray(root, ["risk_notes", "riskNotes", "risks", "warnings"], []),
  );

  const marketMin = getNumber(
    marketData,
    ["market_min", "marketMin", "min_price", "minPrice"],
    getNumber(root, ["market_min", "marketMin", "min_price", "minPrice"], recommendedMin),
  );

  const avgPriceMin = getNumber(
    marketData,
    ["avg_price_min", "avgPriceMin", "average_price", "averagePrice", "avg_price", "avgPrice"],
    getNumber(root, ["avg_price_min", "avgPriceMin", "average_price", "averagePrice", "avg_price", "avgPrice"], recommendedCenter),
  );

  const marketMax = getNumber(
    marketData,
    ["market_max", "marketMax", "max_price", "maxPrice"],
    getNumber(root, ["market_max", "marketMax", "max_price", "maxPrice"], recommendedMax),
  );

  const sampleCount = getNumber(
    marketData,
    ["sample_count", "sampleCount", "data_count", "dataCount"],
    getNumber(root, ["sample_count", "sampleCount", "data_count", "dataCount"], 0),
  );

  return {
    analysis: {
      recommended_center: recommendedCenter,
      recommended_min: recommendedMin,
      recommended_max: recommendedMax,
      confidence,
      rationale,
      market_context: marketContext,
      factors,
      risk_notes: riskNotes,
    },
    market_data: {
      sample_count: sampleCount,
      market_min: marketMin,
      avg_price_min: avgPriceMin,
      market_max: marketMax,
    },
  };
};

export default function AdminAiPage() {
  const [result, setResult] = useState<PricingAnalysisResult | null>(null);
  const [applyConfirm, setApplyConfirm] = useState(false);
  const [bookingIdForApply, setBookingIdForApply] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { region: "서울", categories: [] },
  });

  const analysisMutation = useMutation({
    mutationFn: (data: FormValues) => aiApi.analyzePricing(data),
    onSuccess: (res) => setResult(normalizePricingAnalysis(res.data.data)),
  });

  const applyMutation = useMutation({
    mutationFn: ({ bookingId, price }: { bookingId: string; price: number }) => {
      const applyRecommendation = aiApi.applyRecommendation as unknown as (
        payload: ApplyRecommendationPayload,
      ) => Promise<unknown>;

      return applyRecommendation({
        booking_id: bookingId,
        recommended_price: price,
        bookingId,
        price,
      });
    },
    onSuccess: () => {
      setApplyConfirm(false);
      setBookingIdForApply("");
    },
  });

  const toggleCategory = (cat: string) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((category) => category !== cat)
      : [...selectedCategories, cat];

    setSelectedCategories(next);
    setValue("categories", next, { shouldValidate: true });
  };

  const handleApply = () => {
    if (!bookingIdForApply || !result) return;

    applyMutation.mutate({
      bookingId: bookingIdForApply,
      price: result.analysis.recommended_center,
    });
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI 단가 분석</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          행사 조건을 입력하면 Claude AI가 플랫폼 실제 데이터 기반으로 적정 단가를 분석합니다.
        </p>
      </div>

      {/* 분석 폼 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">분석 조건 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((values) => analysisMutation.mutate({ ...values, categories: selectedCategories }))}
            noValidate
            className="space-y-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>행사 유형 *</Label>
                <Input placeholder="기업 시상식" {...register("event_type")} />
                {errors.event_type && <p className="text-xs text-destructive">{errors.event_type.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>지역 *</Label>
                <Input placeholder="서울" {...register("region")} />
                {errors.region && <p className="text-xs text-destructive">{errors.region.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>분야 * (복수 선택 가능)</Label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                      selectedCategories.includes(cat)
                        ? "border-navy bg-navy text-white"
                        : "border-border text-muted-foreground hover:border-navy/50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.categories && <p className="text-xs text-destructive">{errors.categories.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>예산 최소 (원)</Label>
                <Input type="number" placeholder="300000" {...register("budget_min", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>예산 최대 (원)</Label>
                <Input type="number" placeholder="1000000" {...register("budget_max", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>진행 시간 (h)</Label>
                <Input type="number" step="0.5" placeholder="2" {...register("duration_hours", { valueAsNumber: true })} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>최소 경력 (년)</Label>
              <Input type="number" placeholder="0" className="max-w-[120px]" {...register("career_years_min", { valueAsNumber: true })} />
            </div>

            {analysisMutation.isError && (
              <p role="alert" className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {(analysisMutation.error as ApiError<{ error: { message: string } }>)?.response?.data?.error?.message || "분석 중 오류가 발생했습니다."}
              </p>
            )}

            <Button type="submit" className="w-full bg-navy text-white hover:bg-navy-light" disabled={analysisMutation.isPending}>
              {analysisMutation.isPending ? (
                <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />AI 분석 중...</span>
              ) : "단가 분석 시작"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 분석 결과 */}
      {result && (
        <div className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base">분석 결과</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    시장 데이터 {result.market_data.sample_count}개 기반
                  </CardDescription>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${CONFIDENCE_LABEL[result.analysis.confidence].color}`}>
                  신뢰도 {CONFIDENCE_LABEL[result.analysis.confidence].label}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* 추천 단가 */}
              <div className="rounded-xl bg-muted/50 p-5 text-center">
                <p className="text-sm text-muted-foreground mb-1">추천 단가</p>
                <p className="text-3xl font-bold text-navy">{formatPrice(result.analysis.recommended_center)}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  범위: {formatPrice(result.analysis.recommended_min)} ~ {formatPrice(result.analysis.recommended_max)}
                </p>
              </div>

              <Separator />

              {/* 근거 */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Target className="h-4 w-4 text-navy" />
                  분석 근거
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.analysis.rationale}</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4 text-navy" />
                  시장 현황
                </div>
                <p className="text-sm text-muted-foreground">{result.analysis.market_context}</p>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { label: "시장 최저", value: result.market_data.market_min },
                    { label: "평균 단가", value: result.market_data.avg_price_min },
                    { label: "시장 최고", value: result.market_data.market_max },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-semibold mt-0.5">{formatPrice(value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {result.analysis.factors.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    가격 영향 요인
                  </div>
                  <ul className="space-y-1">
                    {result.analysis.factors.map((factor, index) => (
                      <li key={`${factor}-${index}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.analysis.risk_notes.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    주의사항
                  </div>
                  <ul className="space-y-1">
                    {result.analysis.risk_notes.map((riskNote, index) => (
                      <li key={`${riskNote}-${index}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        {riskNote}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Separator />

              {/* 예약에 반영 */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">예약에 단가 반영</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="예약 ID 입력"
                    value={bookingIdForApply}
                    onChange={(event) => setBookingIdForApply(event.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setApplyConfirm(true)}
                    disabled={!bookingIdForApply || applyMutation.isPending}
                  >
                    반영
                  </Button>
                </div>
                {applyMutation.isSuccess && (
                  <p className="text-sm text-emerald-600">✅ 예약에 단가가 반영되었습니다.</p>
                )}
                {applyMutation.isError && (
                  <p className="text-sm text-destructive">
                    {(applyMutation.error as ApiError<{ error: { message: string } }>)?.response?.data?.error?.message || "반영에 실패했습니다."}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <ConfirmModal
        open={applyConfirm}
        onOpenChange={(open) => !open && setApplyConfirm(false)}
        title="AI 추천 단가 반영"
        description={`예약에 ${result ? formatPrice(result.analysis.recommended_center) : ""}을 적용하시겠습니까? 양측에 알림이 발송됩니다.`}
        confirmLabel="반영"
        onConfirm={handleApply}
        isLoading={applyMutation.isPending}
      />
    </div>
  );
}
