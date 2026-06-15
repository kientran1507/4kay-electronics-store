"use client";

import Link from "next/link";
import { AssistantAlternative, KioskComparison } from "@/types";
import KioskComparisonPanel from "./KioskComparisonPanel";

const KioskRecommendationPanel = ({
  alternatives,
  comparison,
}: {
  alternatives: AssistantAlternative[];
  comparison?: KioskComparison;
}) => {
  return (
    <div className="space-y-3">
      {alternatives.length > 0 && (
        <div className="mt-3 rounded-lg border border-dashed bg-gray-50 p-4">
          <p className="text-sm font-semibold text-gray-950">Good alternatives</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {alternatives.map((item) => (
              <p key={item.product._id} className="rounded-md bg-white p-3 text-xs text-gray-700">
                <Link href={`/product/${item.product._id}`} className="font-medium text-gray-950 hover:underline">
                  {item.product.name}
                </Link>
                {" - "}
                {item.reason}
              </p>
            ))}
          </div>
        </div>
      )}

      <KioskComparisonPanel comparison={comparison} />
    </div>
  );
};

export default KioskRecommendationPanel;
