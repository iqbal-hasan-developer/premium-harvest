import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold text-[#2E7D32]">৪০৪</p>
      <h1 className="mt-3 text-3xl font-bold text-[#17351a]">পাতাটি খুঁজে পাওয়া যায়নি</h1>
      <p className="mt-3 max-w-md text-neutral-600">
        হয়তো লিংকটি পরিবর্তন হয়েছে অথবা এই পণ্যটি এখন আর নেই।
      </p>
      <ButtonLink href="/" className="mt-6">
        হোমে ফিরে যান
      </ButtonLink>
    </div>
  );
}
