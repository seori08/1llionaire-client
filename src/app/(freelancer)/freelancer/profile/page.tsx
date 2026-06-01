"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { freelancerApi } from "@/lib/api";
import { optionalTrimmedString } from "@/lib/validation";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FreelancerStatusBadge } from "@/components/common/StatusBadge";
import { LoadingState, ErrorState } from "@/components/common/States";
import { FreelancerProfile } from "@/types";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png"];

const schema = z
  .object({
    display_name: z
      .string()
      .trim()
      .min(1, "활동명을 입력해 주세요.")
      .max(80, "활동명은 80자 이하로 입력해 주세요."),
    headline: z
      .string()
      .trim()
      .min(1, "한 줄 소개를 입력해 주세요.")
      .max(150, "한 줄 소개는 150자 이하로 입력해 주세요."),
    bio: z
      .string()
      .trim()
      .min(1, "자기소개를 입력해 주세요.")
      .max(2000, "자기소개는 2000자 이하로 입력해 주세요."),
    region: z
      .string()
      .trim()
      .min(1, "활동 지역을 입력해 주세요.")
      .max(50, "활동 지역은 50자 이하로 입력해 주세요."),
    career_years: z
      .number()
      .int()
      .min(0)
      .max(50, "경력 연수는 50년 이하로 입력해 주세요.")
      .optional(),
    base_price_min: z
      .number({ required_error: "최소 가격을 입력해 주세요." })
      .int()
      .min(0, "최소 가격은 0원 이상이어야 합니다."),
    base_price_max: z
      .number({ required_error: "최대 가격을 입력해 주세요." })
      .int()
      .min(0, "최대 가격은 0원 이상이어야 합니다."),
    profile_image_url: optionalTrimmedString(2048),
    script_writing_available: z.boolean().optional(),
    rehearsal_available: z.boolean().optional(),
    travel_available: z.boolean().optional(),
  })
  .refine((data) => data.base_price_min <= data.base_price_max, {
    path: ["base_price_max"],
    message: "최대 가격은 최소 가격보다 크거나 같아야 합니다.",
  });

type FormValues = z.infer<typeof schema>;

function RequiredMark() {
  return <span className="ml-0.5 text-destructive">*</span>;
}

export default function FreelancerProfilePage() {
  const queryClient = useQueryClient();
  const [selectedProfileImageFile, setSelectedProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [profileImageError, setProfileImageError] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.freelancerProfile,
    queryFn: () => freelancerApi.getProfile(),
  });

  const profile: FreelancerProfile | undefined = data?.data?.data;

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!profile) return;

    reset({
      display_name: profile.display_name ?? "",
      headline: profile.headline ?? "",
      bio: profile.bio ?? "",
      region: profile.region ?? "",
      career_years: profile.career_years,
      base_price_min: profile.base_price_min,
      base_price_max: profile.base_price_max,
      profile_image_url: profile.profile_image_url ?? "",
      script_writing_available: profile.script_writing_available,
      rehearsal_available: profile.rehearsal_available,
      travel_available: profile.travel_available,
    });

    setProfileImagePreview(profile.profile_image_url ?? "");
    setSelectedProfileImageFile(null);
    setProfileImageError("");
  }, [profile, reset]);

  const isNew = profile?.status === "draft";

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      let profileImageUrl = values.profile_image_url;

      if (selectedProfileImageFile) {
        const uploadRes = await freelancerApi.uploadProfileImage(selectedProfileImageFile);
        profileImageUrl = uploadRes.data.data.url;
      }

      if (!profileImageUrl) {
        setError("profile_image_url", {
          type: "manual",
          message: "프로필 이미지를 업로드해 주세요.",
        });
        throw new Error("프로필 이미지를 업로드해 주세요.");
      }

      const payload = {
        ...values,
        profile_image_url: profileImageUrl,
      };

      return isNew
        ? freelancerApi.submitProfile(payload)
        : freelancerApi.updateProfile(payload);
    },
    onSuccess: () => {
      setSelectedProfileImageFile(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.freelancerProfile });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicFreelancers });
    },
  });

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setProfileImageError("");

    if (!file) {
      setSelectedProfileImageFile(null);
      return;
    }

    if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type)) {
      setSelectedProfileImageFile(null);
      setProfileImageError("프로필 이미지는 JPG 또는 PNG 파일만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      setSelectedProfileImageFile(null);
      setProfileImageError("프로필 이미지는 5MB 이하만 업로드할 수 있습니다.");
      event.target.value = "";
      return;
    }

    setSelectedProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
    setValue("profile_image_url", profile?.profile_image_url ?? "", { shouldDirty: true });
  };

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">내 프로필</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            프로필을 완성하고 등록 신청하세요
          </p>
        </div>
        {profile && <FreelancerStatusBadge status={profile.status} />}
      </div>

      {profile?.status === "pending_review" && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">검수 중입니다</p>
          <p className="mt-0.5">관리자 승인 전까지 공개 목록에 노출되지 않습니다.</p>
        </div>
      )}

      {profile?.status === "rejected" && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">반려되었습니다</p>
          {profile.rejected_reason && <p className="mt-0.5">사유: {profile.rejected_reason}</p>}
        </div>
      )}

      {mutation.isSuccess && (
        <p className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {isNew ? "등록 신청이 완료되었습니다. 관리자 검수 후 승인됩니다." : "프로필이 저장되었습니다."}
        </p>
      )}

      {mutation.isError && (
        <p className="mb-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {mutation.error instanceof Error ? mutation.error.message : "프로필 저장에 실패했습니다."}
        </p>
      )}

      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} noValidate>
        <input type="hidden" {...register("profile_image_url")} />

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">활동명 <RequiredMark /></Label>
              <Input id="display_name" placeholder="MC 홍길동" {...register("display_name")} />
              {errors.display_name && <p className="text-xs text-destructive">{errors.display_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="headline">한 줄 소개 <RequiredMark /></Label>
              <Input id="headline" placeholder="10년 경력의 기업행사 전문 MC" {...register("headline")} />
              {errors.headline && <p className="text-xs text-destructive">{errors.headline.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">자기소개 <RequiredMark /></Label>
              <Textarea id="bio" rows={5} placeholder="경력과 전문성을 소개해 주세요" {...register("bio")} />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="region">활동 지역 <RequiredMark /></Label>
                <Input id="region" placeholder="서울" {...register("region")} />
                {errors.region && <p className="text-xs text-destructive">{errors.region.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="career_years">경력 연수</Label>
                <Input
                  id="career_years"
                  type="number"
                  min={0}
                  max={50}
                  inputMode="numeric"
                  placeholder="선택 입력"
                  {...register("career_years", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
                />
                {errors.career_years && <p className="text-xs text-destructive">{errors.career_years.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_image">프로필 이미지 <RequiredMark /></Label>
              {profileImagePreview && (
                <div className="h-32 w-32 overflow-hidden rounded-xl border border-line bg-muted">
                  <img src={profileImagePreview} alt="프로필 이미지 미리보기" className="h-full w-full object-cover" />
                </div>
              )}
              <Input id="profile_image" type="file" accept="image/jpeg,image/png" onChange={handleProfileImageChange} />
              <p className="text-xs text-muted-foreground">JPG 또는 PNG 파일, 최대 5MB까지 업로드할 수 있습니다.</p>
              {profileImageError && <p className="text-xs text-destructive">{profileImageError}</p>}
              {errors.profile_image_url && <p className="text-xs text-destructive">{errors.profile_image_url.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-base">가격 & 가능 여부</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>최소 가격 (원) <RequiredMark /></Label>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="300000"
                  {...register("base_price_min", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
                />
                {errors.base_price_min && <p className="text-xs text-destructive">{errors.base_price_min.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>최대 가격 (원) <RequiredMark /></Label>
                <Input
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder="1000000"
                  {...register("base_price_max", { setValueAs: (value) => value === "" ? undefined : Number(value) })}
                />
                {errors.base_price_max && <p className="text-xs text-destructive">{errors.base_price_max.message}</p>}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6">
              {[
                { name: "script_writing_available" as const, label: "대본 작성 가능" },
                { name: "rehearsal_available" as const, label: "리허설 가능" },
                { name: "travel_available" as const, label: "출장 가능" },
              ].map(({ name, label }) => (
                <label key={name} className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" {...register(name)} className="rounded" />
                  <span className="text-sm">{label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          className="w-full bg-navy text-white hover:bg-navy-light"
          size="lg"
          disabled={(!isDirty && !isNew && !selectedProfileImageFile) || mutation.isPending}
        >
          {mutation.isPending ? "저장 중..." : isNew ? "등록 신청하기" : "프로필 저장"}
        </Button>
      </form>
    </div>
  );
}
