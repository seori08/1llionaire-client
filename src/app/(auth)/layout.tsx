export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      {children}
    </section>
  );
}
