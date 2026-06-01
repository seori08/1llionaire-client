"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { ApiError } from "@/lib/api";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("유효한 이메일을 입력해 주세요."),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [serverError, setServerError] = useState("");
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError("");
    setDone(false);

    try {
      await authApi.requestPasswordReset(values);
      setDone(true);
    } catch (err) {
      const apiErr = err as ApiError<{ error: { message: string } }>;
      setServerError(
        apiErr.response?.data?.error?.message ||
          "비밀번호 재설정 요청에 실패했습니다."
      );
    }
  };

  return (
    <Card className="w-full max-w-[440px] rounded-2xl border-line bg-card shadow-sm">
      <CardHeader className="space-y-2 px-8 pb-4 pt-8 text-center">
        <CardTitle className="text-[30px] font-extrabold tracking-[-0.03em] text-text">
          비밀번호 재설정
        </CardTitle>
        <CardDescription className="text-[15px] text-slate">
          가입한 이메일을 입력하면 재설정 안내를 보내드립니다
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-5 px-8">
          {serverError && (
            <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          {done && (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              계정이 존재한다면 비밀번호 재설정 안내가 발송됩니다.
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-[15px] font-bold text-text">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="hello@example.com"
              autoComplete="email"
              className="h-12 rounded-xl text-[16px]"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 px-8 pb-8 pt-2">
          <Button
            type="submit"
            variant="primaryCta"
            className="h-12 w-full text-[17px]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "요청 중..." : "재설정 안내 받기"}
          </Button>
          <Link href="/login" className="text-center text-[15px] font-bold text-text hover:underline">
            로그인으로 돌아가기
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
