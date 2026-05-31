import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-bold text-muted/60 mb-6">404</p>
      <h1 className="text-2xl font-bold mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-muted-foreground mb-8">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link href="/"><Button className="bg-navy text-white hover:bg-navy-light">홈으로 돌아가기</Button></Link>
    </div>
  );
}
