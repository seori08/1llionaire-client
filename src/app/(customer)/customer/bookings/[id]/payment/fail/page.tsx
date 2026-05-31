"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle, Loader2 } from "lucide-react";

const TOSS_ERROR_MESSAGES: Record<string, string> = {
  PAY_PROCESS_CANCELED: "결제를 취소하셨습니다.",
  PAY_PROCESS_ABORTED: "결제가 중단되었습니다.",
  REJECT_CARD_COMPANY: "카드사에서 결제를 거절했습니다. 카드 정보를 확인해 주세요.",
  EXCEED_MAX_DAILY_PAYMENT_COUNT: "하루 결제 가능 횟수를 초과했습니다.",
  EXCEED_MAX_PAYMENT_AMOUNT: "결제 한도를 초과했습니다.",
  INVALID_CARD_NUMBER: "카드 번호가 올바르지 않습니다.",
  CARD_PROCESSING_ERROR: "카드 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
};

function FailContent({ bookingId }: { bookingId: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get("code") ?? "";
  const message =
    searchParams.get("message") ||
    TOSS_ERROR_MESSAGES[code] ||
    "결제 중 오류가 발생했습니다.";

  return (
    <div className="flex flex-col items-center gap-6 text-center py-16">
      <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
        <XCircle className="h-10 w-10 text-destructive" />
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-2">결제 실패</h1>
        <p className="text-muted-foreground text-sm max-w-sm">{message}</p>
      </div>

      {code && (
        <p className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          오류 코드: {code}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => router.push(`/customer/bookings/${bookingId}/payment`)}
          className="bg-navy text-white hover:bg-navy-light"
        >
          다시 시도하기
        </Button>
        <Link href="/customer/bookings">
          <Button variant="outline">예약 목록으로</Button>
        </Link>
      </div>
    </div>
  );
}

export default function PaymentFailPage({
  params,
}: {
  params: { id: string };
}) {
  const bookingId = params.id;

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <FailContent bookingId={bookingId} />
    </Suspense>
  );
}
