import { logoMap } from "@/lib/logoMap";
import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

type ChatCardProps = {
  business: string;
  customerName: string;
  customerPhone: string;
  contactReason: string;
  isSelected: boolean;
};

export default function ChatCard({
  business,
  customerName,
  customerPhone,
  isSelected,
  contactReason
}: ChatCardProps) {
  const logoSrc = logoMap[business];

  return (
    <Card
      className={`
        bg-white transition-colors
        ${
          isSelected
            ? "border-blue-500 bg-blue-50"
            : "hover:bg-slate-50 cursor-pointer"
        }
      `}
    >
      <CardHeader>
        <div className="flex justify-between items-start gap-1">
          <div className="flex-1">
            <CardTitle className="text-base font-bold md:text-lg mb-2">
              {customerName}
            </CardTitle>
            <CardDescription className="text-xs md:text-sm mb-1">
              <strong className="text-slate-500">Última mensgem: </strong>
              {contactReason}
            </CardDescription>
            <CardDescription className="text-xs md:text-sm">
              <strong className="text-slate-500">Telefone:</strong>{" "}
              {customerPhone}
            </CardDescription>
          </div>

          {logoSrc && (
            <Image
              src={logoSrc}
              alt={`${business} logo`}
              width={48}
              height={48}
              className="rounded-lg shrink-0"
            />
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
