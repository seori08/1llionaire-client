"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { paymentApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, Loader2 } from "lucide-react";

// useSearchParams는 Suspense 경계 안에서만 사용 가능
function SuccessContent({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [paymentInfo, setPaymentInfo] = useState<{
    amount?: number;
    method?: string;
    approved_at?: string;
  }>({});
  const [errorMsg, setErrorMsg] = useState("");
  const hasRequestedConfirm = useRef(false);

  useEffect(() => {
    if (hasRequestedConfirm.current) return;
    hasRequestedConfirm.current = true;
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (!paymentKey || !orderId || !amount) {
      setStatus("error");
      setErrorMsg("결제 정보가 올바르지 않습니다.");
      return;
    }

    // 서버에 최종 승인 요청
    paymentApi
      .confirm({
        payment_key: paymentKey,
        order_id: orderId,
        amount: Number(amount),
      })
      .then((res) => {
        setPaymentInfo(res.data.data);
        setStatus("done");
      })
      .catch((err) => {
        const msg = err?.response?.data?.error?.message ?? "결제 승인에 실패했습니다.";
        setErrorMsg(msg);
        setStatus("error");
      });
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <Loader2 className="h-10 w-10 animate-spin text-navy" />
        <p className="text-muted-foreground">결제 승인 처리 중입니다...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 text-center py-20">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <span className="text-3xl">❌</span>
        </div>
        <h1 className="text-xl font-bold">결제 승인 실패</h1>
        <p className="text-muted-foreground text-sm">{errorMsg}</p>
        <Button
          onClick={() => router.push(`/customer/bookings/${bookingId}/payment`)}
          className="bg-navy text-white hover:bg-navy-light"
        >
          다시 시도하기
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center py-16">
      <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" />
      </div>
      <div>
        <h1 className="text-2xl font-bold mb-2">결제 완료!</h1>
        <p className="text-muted-foreground">결제가 성공적으로 처리되었습니다.</p>
      </div>

      <div className="w-full max-w-sm rounded-xl border bg-card p-5 text-left space-y-3 text-sm">
        {paymentInfo.amount && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">결제 금액</span>
            <span className="font-bold text-navy">{formatPrice(paymentInfo.amount)}</span>
          </div>
        )}
        {paymentInfo.method && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">결제 수단</span>
            <span>{paymentInfo.method}</span>
          </div>
        )}
        {paymentInfo.approved_at && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">결제 일시</span>
            <span>{new Date(paymentInfo.approved_at).toLocaleString("ko-KR")}</span>
          </div>
        )}
      </div>

      <Link href="/customer/bookings">
        <Button className="bg-navy text-white hover:bg-navy-light" size="lg">
          예약 목록으로
        </Button>
      </Link>
    </div>
  );
}

export default function PaymentSuccessPage({
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
      <SuccessContent bookingId={bookingId} />
    </Suspense>
  );
}
