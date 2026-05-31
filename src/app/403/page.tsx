import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
        <ShieldOff className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-4xl font-bold mb-3">403</h1>
      <p className="text-lg font-medium mb-2">접근 권한이 없습니다</p>
      <p className="text-muted-foreground mb-8 max-w-sm">
        이 페이지에 접근하려면 적절한 권한이 필요합니다.
      </p>
      <div className="flex gap-3">
        <Link href="/"><Button variant="outline">홈으로</Button></Link>
        <Link href="/login"><Button className="bg-navy text-white hover:bg-navy-light">로그인</Button></Link>
      </div>
    </div>
  );
}
